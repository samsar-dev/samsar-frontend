import { AuthAPI } from "@/api/auth.api";

/**
 * Utility to delay execution
 */
const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class SecureAuth {
  private static refreshPromise: Promise<boolean> | null = null;
  private static authCheckPromise: Promise<boolean> | null = null;

  /**
   * Check if session is valid by calling backend
   */
  static async isAuthenticated(): Promise<boolean> {
    if (this.authCheckPromise) return this.authCheckPromise;

    this.authCheckPromise = (async () => {
      try {
        // Check if we have a session cookie
        const cookies = document.cookie;
        if (!cookies.includes("session=")) {
          return false;
        }

        // Try to restore session
        const response = await AuthAPI.getMe();
        return response.success && !!response.data?.user;
      } catch (err) {
        console.error("isAuthenticated error:", err);
        return false;
      } finally {
        this.authCheckPromise = null;
      }
    })();

    return this.authCheckPromise;
  }

  /**
   * Logout the user and optionally redirect
   */
  static async logout(redirectToLogin = true): Promise<void> {
    try {
      const isLoggedIn = await this.isAuthenticated();
      if (isLoggedIn) {
        await AuthAPI.logout(); // Backend clears cookies
      }
    } catch (e) {
      console.warn("Logout failed:", e);
    } finally {
      if (redirectToLogin) {
        window.location.href = "/login";
      }
    }
  }

  /**
   * Trigger refresh token flow
   */
  static async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const res = await AuthAPI.refreshTokens();
        return !!res?.success;
      } catch (e) {
        console.error("refreshToken error:", e);
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Restore session by triggering refresh if necessary
   */
  static async tryRestoreSession(skipInitialCheck = false): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    if (!skipInitialCheck) {
      try {
        const valid = await this.isAuthenticated();
        if (valid) return true;
      } catch (err) {
        console.warn("Initial session check failed, attempting refresh...");
      }
    }

    this.refreshPromise = (async () => {
      try {
        const res = await AuthAPI.refreshTokens();
        if (res?.success) {
          const valid = await this.isAuthenticated();
          return valid;
        }
        return false;
      } catch (e) {
        console.error("tryRestoreSession error:", e);
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    const success = await this.refreshPromise;
    if (!success) await this.logout(false);
    return success;
  }

  /**
   * Wrap any API call with auto session refresh logic
   */
  static async withAuth<T>(fn: () => Promise<T>): Promise<T | null> {
    const restored = await this.tryRestoreSession();
    if (!restored) {
      await this.logout();
      return null;
    }

    try {
      return await fn();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          try {
            return await fn(); // Retry
          } catch (retryErr) {
            console.error("Retry after refresh failed:", retryErr);
          }
        }
      }

      await this.logout();
      return null;
    }
  }
}
