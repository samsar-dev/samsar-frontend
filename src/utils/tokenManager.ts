import { AuthTokens } from "../types/auth.types";
import { AuthAPI } from "../api/auth.api";
import apiClient from "../api/apiClient";

class TokenManager {
  private static TOKEN_STORAGE_KEY = "auth_tokens";
  private static refreshPromise: Promise<boolean> | null = null;
  private static refreshTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialize the token manager by checking for existing tokens
   */
  static async initialize(): Promise<void> {
    try {
      const tokensRaw = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (tokensRaw) {
        const tokens = JSON.parse(tokensRaw);
        if (tokens.accessToken && tokens.refreshToken) {
          this.setupAuthHeader(tokens.accessToken);
          // Schedule token refresh
          this.scheduleTokenRefresh();
        }
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

    // Refresh 1 minute before token expires
    const token = this.getAccessToken();
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
    const tokensRaw = localStorage.getItem(this.TOKEN_STORAGE_KEY);
    if (!tokensRaw) return false;

    try {
      const tokens = JSON.parse(tokensRaw);
      if (!tokens.accessToken || !tokens.refreshToken) return false;

      // Check if access token is expired
      const payload = JSON.parse(atob(tokens.accessToken.split(".")[1]));
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
    localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    this.setupAuthHeader(tokens.accessToken);
    this.scheduleTokenRefresh();
  }

  static getAccessToken(): string | null {
    const tokensRaw = localStorage.getItem(this.TOKEN_STORAGE_KEY);
    if (!tokensRaw) return null;

    try {
      const tokens = JSON.parse(tokensRaw);
      return tokens.accessToken || null;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  static getRefreshToken(): string | null {
    const tokensRaw = localStorage.getItem(this.TOKEN_STORAGE_KEY);
    if (!tokensRaw) return null;

    try {
      const tokens = JSON.parse(tokensRaw);
      return tokens.refreshToken || null;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    this.setupAuthHeader(null);
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  static setupAuthHeader(token: string | null): void {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshTokens(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          this.clearTokens();
          return false;
        }

        const response = await AuthAPI.refreshTokens();
        if (!response.success || !response.data?.tokens) {
          this.clearTokens();
          return false;
        }

        this.setTokens(response.data.tokens);
        return true;
      } catch (error) {
        console.error("Token refresh failed:", error);
        this.clearTokens();
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  static isAuthenticated(): boolean {
    return this.hasValidTokens();
  }

  static needsRefresh(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Refresh if token expires in less than 5 minutes
      return payload.exp * 1000 - Date.now() < 300000;
    } catch {
      return false;
    }
  }
}

export default TokenManager;
