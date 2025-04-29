import { AuthTokens } from "../types/auth.types";
import { AuthAPI } from "../api/auth.api";
import { setAuthToken, getAuthToken, clearAuthToken } from "./cookie";

class TokenManager {
  private static refreshTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialize the token manager by checking for existing tokens
   */
  static async initialize(): Promise<void> {
    try {
      const token = getAuthToken();
      if (token) {
        // Schedule token refresh
        this.scheduleTokenRefresh();
      }
    } catch (error) {
      console.error("Error initializing token manager:", error);
      this.clearTokens();
    }
  }

  private static scheduleTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiresIn = payload.exp * 1000 - Date.now() - 60000; // 1 minute before expiry
        if (expiresIn > 0) {
          this.refreshTimeout = setTimeout(() => {
            this.refreshTokens().catch(console.error);
          }, expiresIn);
        } else {
          // Token is already expired or about to expire, refresh now
          this.refreshTokens().catch(console.error);
        }
      } catch (error) {
        console.error("Error scheduling token refresh:", error);
      }
    }
  }

  /**
   * Check if valid tokens exist
   */
  static hasValidTokens(): boolean {
    const token = getAuthToken();
    if (!token) return false;

    try {
      // Check if access token is expired
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 <= Date.now()) {
        // Token is expired, try to refresh
        this.refreshTokens().catch(() => this.clearTokens());
        return false;
      }
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  static setTokens(tokens: AuthTokens): void {
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error("Invalid tokens provided");
    }
    setAuthToken(tokens.accessToken);
    this.scheduleTokenRefresh();
  }

  static getAccessToken(): string | null {
    const token = getAuthToken();
    return token || null;
  }

  static clearTokens(): void {
    clearAuthToken();
  }

  private static async refreshTokens(): Promise<boolean> {
    try {
      const response = await AuthAPI.refreshTokens();
      if (response.success && response.data && response.data.tokens) {
        this.setTokens(response.data.tokens);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing tokens:", error);
      this.clearTokens();
      return false;
    }
  }

  static isAuthenticated(): boolean {
    return this.hasValidTokens();
  }
}

export default TokenManager;
