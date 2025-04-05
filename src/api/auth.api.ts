import apiClient from "./apiClient";
import type {
  AuthResponse,
  AuthUser,
  AuthTokens,
  AuthError,
} from "../types/auth.types";
import TokenManager from "../utils/tokenManager";
import { toast } from "react-toastify";

// Auth API Class
class AuthAPI {
  /**
   * Logs in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Authentication response
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("auth/login", {
        email,
        password,
      });

      if (!response.data) {
        throw new Error("No response data received");
      }

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error);

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
  static async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("auth/register", {
        email,
        password,
        name,
      });

      if (!response.data) {
        throw new Error("No response data received");
      }

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      console.error("Registration error:", error.response?.data || error);

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

      const response = await apiClient.post<AuthResponse>("auth/refresh", {
        refreshToken,
      });

      if (!response.data) {
        throw new Error("No response data received");
      }

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      console.error("Token refresh error:", error.response?.data || error);

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

      return response.data || {
        success: true,
        data: { message: "Logged out successfully" },
      };
    } catch (error: any) {
      console.error("Logout error:", error.response?.data || error);

      // Clear tokens even if the request fails
      TokenManager.clearTokens();

      if (error.response?.data?.error) {
        return error.response.data;
      }

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Failed to logout",
        },
      };
    }
  }

  /**
   * Gets the current user's profile
   * @returns Authentication response
   */
  static async getMe(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>("auth/me");

      if (!response.data) {
        throw new Error("No response data received");
      }

      return response.data;
    } catch (error: any) {
      console.error("Get profile error:", error.response?.data || error);

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
class UserAPI {
  /**
   * Updates user profile
   */
  static async updateProfile(data: FormData): Promise<{ success: boolean; data?: AuthUser; error?: AuthError }> {
    try {
      const response = await apiClient.put<{ success: boolean; data: AuthUser }>("users/profile", data);
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
  static async getProfile(userId: string): Promise<{ success: boolean; data?: AuthUser; error?: AuthError }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: AuthUser }>(`/users/${userId}`);
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
  static async updateSettings(settings: Record<string, any>): Promise<{ success: boolean; data?: AuthUser; error?: AuthError }> {
    try {
      const response = await apiClient.put<{ success: boolean; data: AuthUser }>("users/settings", settings);
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
