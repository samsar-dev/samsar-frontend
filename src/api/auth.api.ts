import apiClient from "./apiClient";
import type {
  AuthResponse,
  AuthError,
  AuthErrorCode,
  AuthUser,
} from "../types/auth.types";

import TokenManager from "../utils/tokenManager";
import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { ACTIVE_API_URL } from "@/config";

const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Authentication API service
 * Handles all authentication-related API requests
 */
class AuthAPI {
  /**
   * Handles request retries with token refresh and rate limiting
   * @param requestFn Function that makes the API request
   * @param retries Number of retries remaining
   * @param delay Delay between retries in milliseconds
   * @param skip429Retry Whether to skip retrying on 429 status
   * @returns Promise with the API response
   */
  protected static async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries = MAX_RETRIES,
    delay = RETRY_DELAY,
    skip429Retry = false
  ): Promise<AxiosResponse<T>> {
    try {
      // Attempt the request
      return await requestFn();
    } catch (error) {
      // Ensure we're dealing with an AxiosError
      if (!(error instanceof AxiosError)) {
        throw error; // Not an Axios error, just rethrow
      }

      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      // Handle 401 Unauthorized with token refresh
      if (status === 401 && retries > 0) {
        try {
          // Try to refresh token
          const refreshResponse = await AuthAPI.refreshTokens();
          if (refreshResponse.success && refreshResponse.data?.tokens) {
            // Set the new tokens
            TokenManager.setTokens(refreshResponse.data.tokens);
            // Retry the original request with new token
            return AuthAPI.retryRequest(
              requestFn,
              retries - 1,
              delay,
              skip429Retry
            );
          }
          // If refresh didn't work but didn't throw, clear auth and throw original error
          TokenManager.clearTokens();
          localStorage.clear();
          Cookies.remove("token");
          throw axiosError;
        } catch (refreshError) {
          // If refresh fails, clear auth state
          TokenManager.clearTokens();
          localStorage.clear();
          Cookies.remove("token");
          throw refreshError; // Throw the refresh error for better debugging
        }
      }

      // Handle rate limiting (429 Too Many Requests)
      if (status === 429) {
        // Skip retry if requested
        if (skip429Retry) {
          throw axiosError;
        }

        // Calculate retry delay based on Retry-After header if available
        let retryAfter = delay;
        const retryAfterHeader = axiosError.response?.headers?.["retry-after"];

        if (retryAfterHeader) {
          // Parse retry-after header (can be seconds or date)
          if (!isNaN(Number(retryAfterHeader))) {
            // If it's a number, interpret as seconds
            retryAfter = parseInt(retryAfterHeader, 10) * 1000;
          } else {
            // If it's a date string, calculate milliseconds until that time
            const retryDate = new Date(retryAfterHeader).getTime();
            retryAfter = Math.max(0, retryDate - Date.now()); // Ensure non-negative
          }
        }

        // Wait for the calculated time before retrying
        await wait(retryAfter);

        // Retry with exponential backoff
        return AuthAPI.retryRequest(
          requestFn,
          retries - 1,
          delay * 2, // Exponential backoff
          skip429Retry
        );
      }

      // For all other errors, just throw
      throw axiosError;
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
      const response = await apiClient.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      console.log(response);

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Login error:", axiosError.response?.data || axiosError);

      if (axiosError.response?.data) {
        return axiosError.response.data as AuthResponse;
      }

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR" as AuthErrorCode,
          message: axiosError.message || "Failed to connect to server",
        },
      };
    }
  }

  /**
   * Registers a new user
   * @param user User's registration data
   * @returns Authentication response
   */
  static async register(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> {
    try {
      const userData = {
        email,
        password,
        name,
        username: email.split("@")[0], // Generate username from email
      };

      const response = await AuthAPI.retryRequest(() =>
        apiClient.post<AuthResponse>("/auth/register", userData, {
          headers: {
            "Content-Type": "application/json",
            requiresAuth: false,
          },
          withCredentials: true,
        })
      );

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Registration error details:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        config: axiosError.config,
        message: axiosError.message,
      });

      if (axiosError.response?.status === 429) {
        return {
          success: false,
          error: {
            code: "RATE_LIMIT" as AuthErrorCode,
            message: "Too many registration attempts. Please try again later.",
          },
        };
      }

      if (axiosError.response?.data) {
        return axiosError.response.data as AuthResponse;
      }

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR" as AuthErrorCode,
          message:
            axiosError instanceof Error
              ? axiosError.message
              : "Failed to connect to server",
        },
      };
    }
  }

  /**
   * Verifies if a token is valid
   * @param token JWT token to verify
   * @returns Promise with success status and optional error
   */
  static async verifyToken(
    token: string
  ): Promise<{ success: boolean; error?: AuthError }> {
    try {
      await apiClient.get("/auth/verify-token", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage =
        (axiosError.response?.data as any)?.message ||
        "Token verification failed";
      return {
        success: false,
        error: {
          code: "TOKEN_EXPIRED" as AuthErrorCode,
          message: errorMessage,
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
      // Get the current refresh token from storage
      const tokens = TokenManager.getTokens();
      if (!tokens?.refreshToken || !tokens?.accessToken || !tokens) {
        TokenManager.clearTokens();
        localStorage.clear();
        Cookies.remove("token");
        return {
          success: false,
          error: {
            code: "NO_REFRESH_TOKEN" as AuthErrorCode,
            message: "No refresh token available",
          },
        };
      }

      // Attempt to refresh with the token
      const response = await apiClient.post<AuthResponse>(
        "/auth/refresh",
        {
          refreshToken: tokens.refreshToken,
        },
        {
          // Don't retry this request if it fails with 401
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        TokenManager.clearTokens();
        localStorage.clear();
        Cookies.remove("token");
        throw Error("Failed to refresh token");
      }

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error) {
      const axiosError = error as Error;
      TokenManager.clearTokens();
      localStorage.clear();
      Cookies.remove("token");
      console.error("Token refresh error:", axiosError);
      return {
        success: false,
        error: {
          code: "REFRESH_FAILED" as AuthErrorCode,
          message: axiosError.message || "Failed to refresh token",
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
      const response = await apiClient.post<AuthResponse>(
        "/auth/logout",
        null,
        {
          withCredentials: true,
        }
      );

      // Clear tokens regardless of response
      TokenManager.clearTokens();
      localStorage.clear();
      Cookies.remove("token");

      return (
        response.data || {
          success: true,
          data: { message: "Logged out successfully" },
        }
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Logout error:", axiosError.response?.data || axiosError);

      // Clear tokens even if the request fails
      TokenManager.clearTokens();
      localStorage.clear();
      Cookies.remove("token");

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
      const response = await AuthAPI.retryRequest(() =>
        apiClient.get<AuthResponse>("/auth/me", {
          withCredentials: true,
        })
      );

      if (!response.data) {
        throw new Error("No response data received");
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        "Get profile error:",
        axiosError.response?.data || axiosError
      );

      // Check if we need to refresh token
      if (axiosError.response?.status === 401) {
        try {
          // Try to refresh tokens
          const refreshResult = await AuthAPI.refreshTokens();
          if (refreshResult.success) {
            // Retry the request
            return await AuthAPI.getMe();
          }

          // If refresh failed, return the error without clearing tokens immediately
          return {
            success: false,
            error: {
              code: "REFRESH_FAILED" as AuthErrorCode,
              message: "Failed to refresh token. Please try again.",
            },
          };
        } catch (refreshError) {
          console.error("Error refreshing tokens during getMe:", refreshError);
          return {
            success: false,
            error: {
              code: "REFRESH_FAILED" as AuthErrorCode,
              message: "Failed to refresh token. Please try again.",
            },
          };
        }
      }

      // Handle non-401 errors
      return {
        success: false,
        error: {
          code:
            ((error as AxiosError).response?.data as any)?.error?.code ||
            ("UNKNOWN_ERROR" as AuthErrorCode),
          message:
            ((error as AxiosError).response?.data as any)?.error?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to get user profile"),
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
   * Requests a verification code for password change
   * @returns Promise with success status
   */
  static async requestPasswordChangeVerification(): Promise<{
    success: boolean;
    message?: string;
    error?: AuthError;
  }> {
    try {
      const response = await apiClient.post(
        "/auth/send-password-change-verification",
        {},
        {
          withCredentials: true,
        }
      );

      return {
        success: true,
        message:
          response.data.message || "Verification code sent to your email",
      };
    } catch (error) {
      console.error("Error requesting password change verification:", error);
      return {
        success: false,
        error: {
          code: "EMAIL_SEND_FAILED" as AuthErrorCode,
          message:
            error instanceof Error
              ? error.message
              : "Failed to send verification email",
        },
      };
    }
  }

  /**
   * Verifies a password change with verification code
   * @param currentPassword Current password
   * @param newPassword New password
   * @param verificationCode Verification code sent to email
   * @returns Promise with success status
   */
  static async changePasswordWithVerification(
    currentPassword: string,
    newPassword: string,
    verificationCode: string
  ): Promise<{ success: boolean; message?: string; error?: AuthError }> {
    try {
      const response = await apiClient.post(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
          verificationCode,
        },
        {
          withCredentials: true,
        }
      );

      return {
        success: true,
        message: response.data.message || "Password changed successfully",
      };
    } catch (error) {
      console.error("Error changing password:", error);
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: {
          code:
            (axiosError.response?.data as any)?.error?.code ||
            ("PASSWORD_CHANGE_FAILED" as AuthErrorCode),
          message:
            (axiosError.response?.data as any)?.error?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to change password"),
        },
      };
    }
  }
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
          { headers: { "Content-Type": undefined }, withCredentials: true }
        )
      );
      console.log("Profile update response:>>>>>>>>>>>>", response);
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
    userId: string,
    token?: string
  ): Promise<{ success: boolean; data?: AuthUser; error?: AuthError }> {
    try {
      // Create a new axios instance for this request to avoid auth headers
      const publicApiClient = axios.create({
        baseURL: ACTIVE_API_URL,
        timeout: 30000, // 30 seconds
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await publicApiClient.get<{
        success: boolean;
        data: AuthUser;
      }>(`/users/public-profile/${userId}`);
      console.log("Public profile response:>>>>>>>>>>>>", response);
      if (typeof response.data === "object") return response.data;

      return {
        success: false,
        error: {
          code: "UNKNOWN",
          message: "Failed to get profile",
        },
      };
    } catch (error: any) {
      console.error("Public profile error:", error.response?.data);
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
