import { AuthTokens } from "../types/auth.types";
import { AuthAPI } from "../api/auth.api";
import apiClient from "../api/apiClient";

class TokenManager {
  private static TOKEN_STORAGE_KEY = "auth_tokens";
  private static refreshPromise: Promise<void> | null = null;

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
        }
      }
    } catch (error) {
      console.error('Error initializing token manager:', error);
      this.clearTokens();
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
      return !!tokens.accessToken && !!tokens.refreshToken;
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
  }

  static setupAuthHeader(token: string | null): void {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshTokens(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise.then(() => true);
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          this.clearTokens();
          return false;
        }

        const response = await AuthAPI.refresh(refreshToken);
        if (!response.success || !response.data?.tokens) {
          this.clearTokens();
          return false;
        }

        this.setTokens(response.data.tokens);
        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearTokens();
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise.then(() => true);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default TokenManager;
