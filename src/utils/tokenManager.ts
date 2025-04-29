import { AuthTokens } from "../types/auth.types";
import { AuthAPI } from "../api/auth.api";
import { setAuthToken, getAuthToken, clearAuthToken } from "./cookie";
import { setItem, getItem, removeItem } from "./storage";

export class TokenManager {
  private static refreshTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialize the token manager by checking for existing tokens
   */
  public static async initialize(): Promise<boolean> {
    try {
      // Try to get token from cookie first
      const token = getAuthToken();
      if (!token) {
        // Fallback to localStorage
        const storedTokens = getItem('auth-tokens');
        if (storedTokens) {
          try {
            const tokens = JSON.parse(storedTokens) as AuthTokens;
            await this.setTokens(tokens);
            return true;
          } catch (error: unknown) {
            console.error("Error restoring tokens from storage:", error);
            await this.clearTokens();
            return false;
          }
        }
        // If no tokens found in either place, clear everything
        await this.clearTokens();
        return false;
      }

      // If we have a token from cookie, verify it's valid
      const isValid = await this.verifyTokenValidity(token);
      if (!isValid) {
        // If token is invalid, try to refresh it
        const refreshed = await this.refreshTokens();
        if (!refreshed) {
          await this.clearTokens();
          return false;
        }
        return true;
      }

      // Token is valid, schedule refresh
      this.scheduleTokenRefresh();
      return true;
    } catch (error: unknown) {
      console.error("Error initializing token manager:", error);
      // Don't clear tokens on network errors
      if (error instanceof Error && 
          (error.message.includes('token') || error.message.includes('unauthorized'))) {
        await this.clearTokens();
      }
      return false;
    }
  }

  static getTokens(): AuthTokens | null {
    try {
      const storedTokens = getItem('auth-tokens');
      if (!storedTokens) return null;
      return JSON.parse(storedTokens) as AuthTokens;
    } catch (error) {
      console.error("Error getting tokens:", error);
      return null;
    }
  }

  private static async verifyTokenValidity(token: string): Promise<boolean> {
    try {
      // First check if token is expired or about to expire
      const payload = JSON.parse(atob(token.split(".")[1])) as { exp: number };
      const expiresIn = payload.exp * 1000 - Date.now();
      
      // If token expires in less than 5 minutes, try to refresh instead of failing
      if (expiresIn < 300000) {
        const refreshed = await this.refreshTokens();
        return refreshed;
      }

      // Only make API call if token is not near expiration
      const response = await AuthAPI.verifyToken(token);
      return response.success;
    } catch (error: unknown) {
      console.error("Error verifying token:", error);
      // Don't consider parse errors as invalid tokens
      if (error instanceof Error && error.message.includes('JSON')) {
        return true;
      }
      return false;
    }
  }

  private static scheduleTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1])) as { exp: number };
        const expiresIn = payload.exp * 1000 - Date.now();
        // Refresh 5 minutes before expiry instead of 1 minute
        const refreshTime = Math.max(0, expiresIn - 300000);
        
        if (refreshTime <= 0) {
          // Token is already close to expiry, refresh now
          this.refreshTokens().catch(console.error);
        } else {
          this.refreshTimeout = setTimeout(() => {
            this.refreshTokens().catch(console.error);
          }, refreshTime);
        }
      } catch (error: unknown) {
        console.error("Error scheduling token refresh:", error);
        // Try to refresh now if we can't parse the token
        this.refreshTokens().catch(console.error);
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
    // Store in cookie
    setAuthToken(tokens.accessToken);
    // Also store in localStorage as backup
    const tokensString = JSON.stringify(tokens);
    setItem('auth-tokens', tokensString);
    this.scheduleTokenRefresh();
  }

  static getAccessToken(): string | null {
    const token = getAuthToken();
    return token || null;
  }

  static clearTokens(): void {
    clearAuthToken();
    removeItem('auth-tokens');
  }

  public static async refreshTokens(): Promise<boolean> {
    try {
      const response = await AuthAPI.refreshTokens();
      if (response.success && response.data && response.data.tokens) {
        this.setTokens(response.data.tokens);
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error("Error refreshing tokens:", error);
      // Only clear tokens if we're sure refresh failed
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('invalid_token'))) {
        this.clearTokens();
      }
      return false;
    }
  }

  static isAuthenticated(): boolean {
    return this.hasValidTokens();
  }
}

export default TokenManager;
