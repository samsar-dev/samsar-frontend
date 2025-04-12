import apiClient from "./apiClient";
import type {
  AuthResponse,
  AuthUser,
  AuthTokens,
  AuthError,
} from "../types/auth.types";
import TokenManager from "../utils/tokenManager";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL_PROD } from "@/config";

const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class AuthAPI {
  protected static async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries = MAX_RETRIES,
    delay = RETRY_DELAY
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (error.response?.status === 429 && retries > 0) {
        const retryAfter =
          parseInt(error.response.headers["retry-after"]) * 1000 || delay;
        await wait(retryAfter);
        return this.retryRequest(requestFn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  /**
   * Logs in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Authentication response
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.retryRequest(() =>
        apiClient.post<AuthResponse>("/auth/login", {
          email,
          password,
        })
      );

      if (!response.data) {
        throw new Error("No response data received");
      }

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error);

      // Handle specific error cases
      if (error.response?.status === 429) {
        return {
          success: false,
          error: {
            code: "RATE_LIMIT",
            message: "Too many login attempts. Please try again later.",
          },
        };
      }

      if (error.response?.status === 401) {
        return {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        };
      }

      if (error.response?.data?.error) {
        return error.response.data;
      }

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Failed to connect to server",
        },
      };
    }
  }

  /**
   * Registers a new user
   * @param email User's email
   * @param password User's password
   * @param name User's name
   * @returns Authentication response
   */
  static async register(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> {
    try {
      const response = await this.retryRequest(() =>
        apiClient.post<AuthResponse>("/auth/register", {
          email,
          password,
          name,
        })
      );

      if (!response.data) {
        throw new Error("No response data received");
      }

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      console.error("Registration error:", error.response?.data || error);

      if (error.response?.status === 429) {
        return {
          success: false,
          error: {
            code: "RATE_LIMIT",
            message: "Too many registration attempts. Please try again later.",
          },
        };
      }

      if (error.response?.data?.error) {
        return error.response.data;
      }

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Failed to connect to server",
        },
      };
    }
  }

  /**
   * Refreshes the authentication tokens
   * @returns Authentication response
   */
  static async refreshTokens(): Promise<AuthResponse> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await this.retryRequest(() =>
        apiClient.post<AuthResponse>("auth/refresh", {
          refreshToken,
        })
      );

      if (!response.data) {
        throw new Error("No response data received");
      }

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      console.error("Token refresh error:", error.response?.data || error);

      if (error.response?.status === 401) {
        // Clear tokens if they're invalid
        TokenManager.clearTokens();
      }

      if (error.response?.data?.error) {
        return error.response.data;
      }

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Failed to refresh authentication",
        },
      };
    }
  }

  /**
   * Logs out the current user
   * @returns Authentication response
   */
  static async logout(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("auth/logout");

      // Clear tokens regardless of response
      TokenManager.clearTokens();

      return (
        response.data || {
          success: true,
          data: { message: "Logged out successfully" },
        }
      );
    } catch (error: any) {
      console.error("Logout error:", error.response?.data || error);

      // Clear tokens even if the request fails
      TokenManager.clearTokens();

      return {
        success: true, // Always return success for logout
        data: { message: "Logged out successfully" },
      };
    }
  }

  /**
   * Gets the current user's profile
   * @returns Authentication response
   */
  static async getMe(): Promise<AuthResponse> {
    try {
      const response = await this.retryRequest(() =>
        apiClient.get<AuthResponse>("auth/me")
      );

      if (!response.data) {
        throw new Error("No response data received");
      }

      return response.data;
    } catch (error: any) {
      console.error("Get profile error:", error.response?.data || error);

      if (error.response?.status === 401) {
        // Token might be expired, try to refresh
        const refreshResponse = await this.refreshTokens();
        if (refreshResponse.success) {
          // Retry the original request
          return this.getMe();
        }
      }

      if (error.response?.data?.error) {
        return error.response.data;
      }

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Failed to get profile",
        },
      };
    }
  }
}

/**
 * Handles user-related API requests
 */
class UserAPI extends AuthAPI {
  /**
   * Updates user profile
   */
  static async updateProfile(
    data: FormData
  ): Promise<{ success: boolean; data?: AuthUser; error?: AuthError }> {
    try {
      const response = await this.retryRequest(() =>
        apiClient.put<{ success: boolean; data: AuthUser }>(
          "users/profile",
          data
        )
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "UNKNOWN",
          message: error.response?.data?.error || "Failed to update profile",
        },
      };
    }
  }

  /**
   * Gets a user's profile
   */
  static async getProfile(
    userId: string
  ): Promise<{ success: boolean; data?: AuthUser; error?: AuthError }> {
    try {
      const response = await axios.get<{ success: boolean; data: AuthUser }>(
        `${API_URL_PROD}/users/public-profile/${userId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "UNKNOWN",
          message: error.response?.data?.error || "Failed to get profile",
        },
      };
    }
  }

  /**
   * Updates user settings
   */
  static async updateSettings(
    settings: Record<string, any>
  ): Promise<{ success: boolean; data?: AuthUser; error?: AuthError }> {
    try {
      const response = await this.retryRequest(() =>
        apiClient.put<{ success: boolean; data: AuthUser }>(
          "users/settings",
          settings
        )
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "UNKNOWN",
          message: error.response?.data?.error || "Failed to update settings",
        },
      };
    }
  }
}

// Export the classes
export { AuthAPI, UserAPI };
