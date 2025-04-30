import { AuthTokens, JWTPayload } from "../types/auth.types";
import { AuthAPI } from "../api/auth.api";
import { setAuthToken, getAuthToken, getRefreshToken, setTokens as setCookieTokens, clearTokens as clearCookieTokens } from "./cookie";
import { setItem, getItem, removeItem } from "./storage";
import { apiClient } from "../api/apiClient";


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
   * Get the current user role
   */
  static getUserRole(): "USER" | "ADMIN" | null {
    return TokenManager.jwtPayload?.role || null;
  }

  /**
   * Get the current access token from either cookies or localStorage
   */
  static getAccessToken(): string | null {
    // First try to get from cookies
    const token = getAuthToken();
    if (token) {
      return token;
    }

    // If not in cookies, try localStorage
    const storedTokens = getItem('auth-tokens');
    if (storedTokens) {
      try {
        const tokens = JSON.parse(storedTokens) as AuthTokens;
        return tokens.accessToken || null;
      } catch (error) {
        console.error('Error parsing stored tokens:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Get the current tokens from either cookies or localStorage
   */
  static async getTokens(): Promise<AuthTokens | null> {
    try {
      // First try cookies
      const accessToken = getAuthToken();
      const refreshToken = getRefreshToken();
      
      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }

      // If no tokens in cookies, try localStorage
      const tokensString = getItem('auth-tokens');
      if (tokensString) {
        try {
          const tokens = JSON.parse(tokensString) as AuthTokens;
          if (tokens.accessToken && tokens.refreshToken) {
            // Set tokens in cookies for future use
            setCookieTokens(tokens.accessToken, tokens.refreshToken);
            return tokens;
          }
        } catch (error) {
          console.error('Error parsing stored tokens:', error);
          removeItem('auth-tokens');
        }
      }

      // If no tokens found in storage, try to get them from the API
      try {
        const response = await AuthAPI.getMe();
        if (response?.success && response?.data?.tokens) {
          await this.setTokens(response.data.tokens);
          return response.data.tokens;
        }
      } catch (error) {
        console.error('Error getting tokens from API:', error);
      }

      return null;
    } catch (error) {
      console.error("Error getting tokens:", error);
      return null;
    }
  }

  /**
   * Set the access token
   */
  static setAuthToken(token: string): void {
    setAuthToken(token);
  }

  /**
   * Clear all authentication state
   * @deprecated Use clearTokens() instead for more complete cleanup
   */
  static clearAuth(): void {
    // Use clearTokens for consistency
    this.clearTokens();
  }

  /**
   * Initialize the token manager by checking for existing tokens
   */
  /**
   * Validate JWT token format and expiration
   */
  private static validateToken(token: string): boolean {
    try {
      // Check if token has three parts (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid token format: missing parts');
        return false;
      }

      // Check if token parts are valid base64
      try {
        const payload = JSON.parse(atob(parts[1]));
        
        // Validate payload structure
        const requiredFields = ['email', 'role', 'exp']; // id is optional
        const missingFields = requiredFields.filter(field => !payload[field]);
        if (missingFields.length > 0) {
          console.error('Missing required fields in token payload:', missingFields);
          return false;
        }

        // Validate role
        if (!['USER', 'ADMIN'].includes(payload.role)) {
          console.error('Invalid role in token');
          return false;
        }

        // Validate expiration
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp <= currentTime) {
          console.error('Token has expired');
          return false;
        }

        // Cache the payload for quick access
        TokenManager.jwtPayload = {
          id: payload.id || payload.email, // Use email as fallback for ID
          email: payload.email,
          username: payload.username || payload.email, // Use email as fallback for username
          role: payload.role as "USER" | "ADMIN",
          exp: payload.exp
        };

        // Log the payload for debugging
        console.log('Successfully validated token with payload:', {
          id: TokenManager.jwtPayload.id,
          email: TokenManager.jwtPayload.email,
          role: TokenManager.jwtPayload.role,
          exp: new Date(TokenManager.jwtPayload.exp * 1000).toLocaleString()
        });

        return true;
      } catch (error) {
        console.error('Invalid token format: failed to decode', error);
        return false;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
  

  /**
   * Initialize the token manager by checking for existing tokens
   * This is called on application startup to restore authentication state
   */
  private static isInitializing = false;
  private static initializationComplete = false;
  
  public static async initialize(): Promise<boolean> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      // Wait for the ongoing initialization to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.initializationComplete) {
            clearInterval(checkInterval);
            resolve(this.isAuthenticated());
          }
        }, 100);
      });
    }
    
    // Prevent repeated initializations
    if (this.initializationComplete) {
      return this.isAuthenticated();
    }
    
    this.isInitializing = true;
    
    try {
      // First try cookie since it's more secure
      const accessToken = this.getAccessToken();
      const refreshToken = getRefreshToken();
      
      if (accessToken) {
        try {
          // Check if token is valid (not expired)
          const isTokenValid = this.validateToken(accessToken);
          
          if (isTokenValid) {
            // Try to get full user info
            try {
              const response = await AuthAPI.getMe();
              
              if (response?.success) {
                // If we got new tokens, update them
                if (response.data?.tokens) {
                  await this.setTokens(response.data.tokens);
                }
                
                // Schedule token refresh
                this.scheduleTokenRefresh();
                this.initializationComplete = true;
                this.isInitializing = false;
                return true;
              } else {
                // If API verification fails but token is valid, keep using it
                this.initializationComplete = true;
                this.isInitializing = false;
                return true;
              }
            } catch (error) {
              // If we can't get user info but token is valid, keep using it
              this.initializationComplete = true;
              this.isInitializing = false;
              return true;
            }
          } else {
            // Try to refresh tokens if we have a refresh token
            if (refreshToken) {
              try {
                const refreshResponse = await AuthAPI.refreshTokens();
                if (refreshResponse?.success && refreshResponse?.data?.tokens) {
                  await this.setTokens(refreshResponse.data.tokens);
                  this.initializationComplete = true;
                  this.isInitializing = false;
                  return true;
                }
              } catch (refreshError) {
                // If refresh fails but we have a valid token, keep using it
                if (isTokenValid) {
                  this.initializationComplete = true;
                  this.isInitializing = false;
                  return true;
                }
              }
            }
          }
        } catch (error) {
          // If validation fails but we have a token, try to keep using it
          if (accessToken) {
            this.initializationComplete = true;
            this.isInitializing = false;
            return true;
          }
        }
      }

      // If cookie approach failed, try localStorage as backup
      const storedTokens = getItem('auth-tokens');
      if (storedTokens) {
        try {
          const tokens = JSON.parse(storedTokens) as AuthTokens;
          
          // If we have tokens in localStorage but not in cookies, restore them to cookies
          if (tokens.accessToken && (!accessToken || !refreshToken)) {
            await this.setTokens(tokens);
            
            // Verify the restored tokens with the API
            try {
    }
  

  /**
   * Validate token format and check if it's expired
   * This is a client-side check that doesn't require an API call
   */
  static validateTokenFormat(token: string): boolean {
    if (!token) return false;
    
    // Check if token has the correct format (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return false;
    }
    
    try {
      // Decode the payload
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token has expiration
      if (!payload.exp) {
        console.error('Token missing expiration');
        return false;
      }
      
      // Check if token is expired
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      if (currentTime >= expirationTime) {
        console.error('Token is expired');
        return false;
      }
      
      // Store the payload for later use
      this.jwtPayload = {
        id: payload.sub || payload.id,
        email: payload.email,
        username: payload.username,
        role: payload.role as "USER" | "ADMIN",
        exp: payload.exp
      };
      
      return true;
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  }
  
  private static async verifyTokenValidity(token: string): Promise<boolean> {
    try {
      // First check if token is expired or about to expire
      const payload = JSON.parse(atob(token.split(".")[1])) as { exp: number };
      const expiresIn = payload.exp * 1000 - Date.now();
      
      // If token is expired or about to expire
      if (expiresIn < 300000) {
        // Try to get tokens from storage first
        const storedTokens = await this.getTokens();
        if (storedTokens?.refreshToken) {
          const refreshed = await this.refreshTokens();
          return refreshed;
        }
        // If no refresh token, try to get new tokens
        const response = await AuthAPI.getMe();
        if (response?.success && response?.data?.tokens) {
          await this.setTokens(response.data.tokens);
          return true;
        }
        return false;
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
   * Check if valid tokens exist and are not expired
   */
  static hasValidTokens(): boolean {
    // First check cookies
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    // Validate access token
    return this.validateToken(accessToken);
  }

  static setTokens(tokens: AuthTokens): void {
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error("Invalid tokens provided");
    }
    
    try {
      // Store in cookies (both access and refresh tokens)
      setCookieTokens(tokens.accessToken, tokens.refreshToken);
      
      // Also store in localStorage as backup
      const tokensString = JSON.stringify(tokens);
      setItem('auth-tokens', tokensString);
      
      // Parse and store the JWT payload for quick access
      try {
        const payload = JSON.parse(atob(tokens.accessToken.split(".")[1]));
        this.jwtPayload = {
          id: payload.sub || payload.id,
          email: payload.email,
          username: payload.username,
          role: payload.role as "USER" | "ADMIN",
          exp: payload.exp
        };
      } catch (error) {
        console.error('Failed to parse JWT payload:', error);
      }
      
      // Update the token refresh timeout
      this.scheduleTokenRefresh();
      
      // Verify token immediately after setting
      this.verifyTokenValidity(tokens.accessToken).catch(error => {
        console.error('Failed to verify newly set token:', error);
        this.clearTokens();
      });
      
      // Update axios defaults to include credentials
      apiClient.defaults.withCredentials = true;
    } catch (error) {
    }
  }

  /**
   * Clear all authentication state including tokens and JWT payload
   */
  static clearTokens(): void {
    // Use the clearTokens from cookie.ts to clear both access and refresh tokens
    clearCookieTokens();
    // Also clear localStorage
    removeItem('auth-tokens');
    // Clear the JWT payload
    this.jwtPayload = null;
    
    // Clear any scheduled refresh
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  public static async refreshTokens(): Promise<boolean> {
    try {
      const storedTokens = await this.getTokens();
      if (!storedTokens?.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await AuthAPI.refreshTokens();
      if (response?.success && response?.data?.tokens) {
        await this.setTokens(response.data.tokens);
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error("Error refreshing tokens:", error);
      // Only clear tokens for specific error types
      if (error instanceof Error && 
          (error.message.includes('token') || error.message.includes('unauthorized'))) {
        await this.clearTokens();
      }
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
