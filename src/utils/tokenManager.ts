import type { AuthTokens, JWTPayload } from "../types/auth.types";
import { AuthAPI } from "../api/auth.api";
import { setAuthToken, getAuthToken, clearAuthToken, setAuthRefreshToken } from "./cookie";
import { setItem, getItem, removeItem } from "./storage";

export class TokenManager {
  private static refreshTimeout: NodeJS.Timeout | null = null;
  private static jwtPayload: JWTPayload | null = null;

  /**
   * Get the current JWT payload
   */
  static getJwtPayload(): JWTPayload | null {
    return TokenManager.jwtPayload;
  }

  /**
   * Initialize the token manager by checking for existing tokens
   */
  public static async initialize(): Promise<boolean> {
    try {
      // Try to get token from cookie first
      const token = getAuthToken();
      console.log("token>>>>>>>>>>>>>>>>>", token);
      if (!token) {
        // Fallback to localStorage
        const storedTokens = getItem("authTokens");
        if (storedTokens) {
          try {
            const tokens = JSON.parse(storedTokens) as AuthTokens;
            this.setTokens(tokens);
            return true;
          } catch (error: unknown) {
            console.error("Error restoring tokens from storage:", error);
            this.clearTokens();
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
      if (
        error instanceof Error &&
        (error.message.includes("token") ||
          error.message.includes("unauthorized"))
      ) {
        await this.clearTokens();
      }
      return false;
    }
  }

  /**
   * Validate token format and check if it's expired
   * This is a client-side check that doesn't require an API call
   */
  static validateTokenFormat(token: string): boolean {
    if (!token) return false;

    // Check if token has the correct format (header.payload.signature)
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid token format");
      return false;
    }

    try {
      // Decode the payload
      const payload = JSON.parse(atob(parts[1]));

      // Check if token has expiration
      if (!payload.exp) {
        console.error("Token missing expiration");
        return false;
      }

      // Check if token is expired
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      if (currentTime >= expirationTime) {
        console.error("Token is expired");
        return false;
      }

      // Store the payload for later use
      this.jwtPayload = {
        id: payload.sub || payload.id,
        email: payload.email,
        username: payload.username,
        role: payload.role as "USER" | "ADMIN",
        exp: payload.exp,
      };

      return true;
    } catch (error) {
      console.error("Error parsing token:", error);
      return false;
    }
  }

  static getTokens(): AuthTokens | null {
    try {
      const storedTokens = localStorage.getItem("authTokens");
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
      if (error instanceof Error && error.message.includes("JSON")) {
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
        const payload = JSON.parse(atob(token.split(".")[1])) as {
          exp: number;
        };
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
    setAuthRefreshToken(tokens.refreshToken);
    // Also store in localStorage as backup
    const tokensString = JSON.stringify(tokens);
    localStorage.setItem("authTokens", tokensString);
    localStorage.setItem("token", tokens.accessToken);
    this.scheduleTokenRefresh();
  }

  static getAccessToken(): string | null {
    const token = getAuthToken();
    return token || null;
  }

  static clearTokens(): void {
    clearAuthToken();
    removeItem("authTokens");
    localStorage.removeItem("token");
    localStorage.removeItem("authTokens");
  }

  static async refreshTokens(): Promise<boolean> {
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
      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("invalid_token"))
      ) {
        this.clearTokens();
      }
      return false;
    }
  }

  /**
   * Validate JWT token format and expiration
   */
  private static validateToken(token: string): boolean {
    try {
      // Check if token has three parts (header.payload.signature)
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("Invalid token format: missing parts");
        return false;
      }

      // Check if token parts are valid base64
      try {
        const payload = JSON.parse(atob(parts[1]));

        // Validate payload structure
        const requiredFields = ["email", "role", "exp"]; // id is optional
        const missingFields = requiredFields.filter((field) => !payload[field]);
        if (missingFields.length > 0) {
          console.error(
            "Missing required fields in token payload:",
            missingFields
          );
          return false;
        }

        // Validate role
        if (!["USER", "ADMIN"].includes(payload.role)) {
          console.error("Invalid role in token");
          return false;
        }

        // Validate expiration
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp <= currentTime) {
          console.error("Token has expired");
          return false;
        }

        // Cache the payload for quick access
        TokenManager.jwtPayload = {
          id: payload.id || payload.email, // Use email as fallback for ID
          email: payload.email,
          username: payload.username || payload.email, // Use email as fallback for username
          role: payload.role as "USER" | "ADMIN",
          exp: payload.exp,
        };

        // Log the payload for debugging
        console.log("Successfully validated token with payload:", {
          id: TokenManager.jwtPayload.id,
          email: TokenManager.jwtPayload.email,
          role: TokenManager.jwtPayload.role,
          exp: new Date(TokenManager.jwtPayload.exp * 1000).toLocaleString(),
        });

        return true;
      } catch (error) {
        console.error("Invalid token format: failed to decode", error);
        return false;
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  }

  /**
   * Public method to handle token refresh with fallback
   */
  public static async refreshTokensWithFallback(): Promise<boolean> {
    try {
      // Try regular refresh first
      const refreshResult = await this.refreshTokens();
      if (refreshResult) {
        return true;
      }

      // If refresh fails and we have a valid token, try getMe as fallback
      const accessToken = this.getAccessToken();
      if (accessToken && this.validateToken(accessToken)) {
        try {
          const response = await AuthAPI.getMe();
          if (response?.success && response?.data?.tokens) {
            await this.setTokens(response.data.tokens);
            return true;
          }
        } catch {
          // Ignore getMe errors, we'll return false below
        }
      }

      return false;
    } catch (error: unknown) {
      console.error("Error refreshing tokens with fallback:", error);
      return false;
    }
  }

  static isAuthenticated(): boolean {
    return this.hasValidTokens();
  }
}

export default TokenManager;
