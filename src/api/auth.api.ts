import { API_URL_PROD } from "@/config";
import axios from "axios";
import type { AuthError, AuthResponse, AuthUser } from "../types/auth.types";
import TokenManager from "../utils/tokenManager";
import apiClient from "./apiClient";
import { AuthProvider } from "@/contexts";
import { AuthContext } from "@/contexts/AuthContext";

const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class AuthAPI {
  protected static async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries = MAX_RETRIES,
    delay = RETRY_DELAY,
    skip429Retry = false
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (skip429Retry && error.response?.status === 429) {
        throw error;
      }
      if (error.response?.status === 429) {
        let retryAfter = delay;
        const retryAfterHeader = error.response.headers["retry-after"];
        if (retryAfterHeader) {
          if (!isNaN(Number(retryAfterHeader))) {
            retryAfter = parseInt(retryAfterHeader, 10) * 1000; // seconds to ms
          } else {
            // Try to parse as date
            const retryDate = new Date(retryAfterHeader).getTime();
            retryAfter = retryDate - Date.now();
          }
        }
        await wait(retryAfter);
        return this.retryRequest(
          requestFn,
          retries - 1,
          delay * 2,
          skip429Retry
        );
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
      const response = await this.retryRequest(
        () =>
          apiClient.post<AuthResponse>(
            "/auth/login",
            {
              email,
              password,
            },
            {
              withCredentials: true,
            }
          ),
        MAX_RETRIES,
        RETRY_DELAY,
        true // skip429Retry = true for login
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
   * @param user User's registration data
   * @returns Authentication response
   */
  static async register(user: FormData): Promise<AuthResponse> {
    try {
      const response = await this.retryRequest(() =>
        apiClient.post<AuthResponse>("/auth/register", user, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
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
      const response = await apiClient.post<AuthResponse>(
        "/auth/refresh",
        {},
        {
          withCredentials: true,
        }
      );

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.tokens
      ) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      console.error("Token refresh error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Token refresh failed",
      };
    }
  }

  /**
   * Logs out the current user
   * @returns Authentication response
   */
  static async logout(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("auth/logout", null, {
        withCredentials: true,
      });

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
        apiClient.get<AuthResponse>("auth/me", {
          withCredentials: true,
        })
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
          data,
          // Ensure Content-Type is not set so browser/axios sets multipart/form-data
          data instanceof FormData
            ? { headers: { "Content-Type": undefined }, withCredentials: true }
            : undefined
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
          settings,
          { withCredentials: true }
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
