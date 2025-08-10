import apiClient, { APIPerformanceMonitor, isRateLimited } from "./apiClient";
import type {
  AuthResponse,
  AuthError,
  AuthErrorCode,
  AuthUser,
} from "../types/auth.types";

import type { AxiosResponse } from "axios";
import { AxiosError } from "axios";

// 🔒 Security Configuration for Auth API
const AUTH_SECURITY_CONFIG = {
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
  RATE_LIMIT_COOLDOWN: 30000, // 30 seconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 300000, // 5 minutes
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT: 3600000, // 1 hour
} as const;

// 📊 Performance & Security Tracking
class AuthSecurityMonitor {
  private static readonly CONFIG = {
    MAX_LOGIN_ATTEMPTS: 3,
    LOCKOUT_DURATION: 900000, // 15 minutes
    SUSPICIOUS_ACTIVITY_THRESHOLD: 3,
    RAPID_REQUEST_WINDOW: 30000, // 30 seconds
  } as const;

  private static loginAttempts = new Map<string, {
    count: number;
    lastAttempt: number;
    lockedUntil?: number;
  }>();

  private static suspiciousActivity = new Map<string, {
    rapidRequests: number;
    lastRequest: number;
  }>();

  static recordLoginAttempt(identifier: string, success: boolean): boolean {
    const now = Date.now();
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };

    // Check if still locked out
    if (attempts.lockedUntil && now < attempts.lockedUntil) {
      const remainingTime = Math.ceil((attempts.lockedUntil - now) / 1000);
      console.warn(`🔒 Account locked for ${remainingTime} more seconds`);
      return false;
    }

    // Reset if lockout period has passed
    if (attempts.lockedUntil && now >= attempts.lockedUntil) {
      attempts.count = 0;
      attempts.lockedUntil = undefined;
    }

    if (success) {
      // Reset on successful login
      attempts.count = 0;
      attempts.lockedUntil = undefined;
    } else {
      // Increment failed attempts
      attempts.count++;
      attempts.lastAttempt = now;

      // Lock account if too many attempts
      if (attempts.count >= this.CONFIG.MAX_LOGIN_ATTEMPTS) {
        attempts.lockedUntil = now + this.CONFIG.LOCKOUT_DURATION;
        console.warn(`🚨 Account locked due to ${attempts.count} failed attempts`);
      }
    }

    this.loginAttempts.set(identifier, attempts);
    return true;
  }

  static detectSuspiciousActivity(endpoint: string): boolean {
    const now = Date.now();
    const activity = this.suspiciousActivity.get(endpoint) || { rapidRequests: 0, lastRequest: 0 };

    // Check for rapid requests (more than 10 per minute)
    if (now - activity.lastRequest < 6000) { // Less than 6 seconds apart
      activity.rapidRequests++;
      if (activity.rapidRequests > 10) {
        console.warn(`🚨 Suspicious rapid requests detected for ${endpoint}`);
        return true;
      }
    } else {
      activity.rapidRequests = 0;
    }

    activity.lastRequest = now;
    this.suspiciousActivity.set(endpoint, activity);
    return false;
  }

  static getSecurityMetrics() {
    return {
      lockedAccounts: Array.from(this.loginAttempts.entries())
        .filter(([, data]) => data.lockedUntil && Date.now() < data.lockedUntil)
        .length,
      totalAttempts: Array.from(this.loginAttempts.values())
        .reduce((sum, data) => sum + data.count, 0),
      suspiciousEndpoints: Array.from(this.suspiciousActivity.entries())
        .filter(([, data]) => data.rapidRequests > 5)
        .map(([endpoint]) => endpoint),
    };
  }
}

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
    retries = 3,
    delay = 1000,
    skip429Retry = false,
    skip401Retry = false,
  ): Promise<AxiosResponse<T>> {
    // Create request with credentials
    const requestWithCredentials = requestFn;
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
      if (status === 401 && retries > 0 && !skip401Retry) {
        try {
          // Try to refresh the token via backend
          const refreshResponse = await apiClient.post("/auth/refresh");
          if (refreshResponse.data?.success) {
            // Retry the original request
            return AuthAPI.retryRequest(
              requestWithCredentials,
              retries - 1,
              delay,
              skip429Retry,
              true, // Skip 401 retry to prevent infinite loops
            );
          }
          throw axiosError;
        } catch (refreshError) {
          throw refreshError;
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
          skip429Retry,
        );
      }

      // For all other errors, just throw
      throw axiosError;
    }
  }

  /**
   * 🔐 Secure login with enhanced security monitoring
   * @param email User's email
   * @param password User's password
   * @returns Authentication response
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const startTime = Date.now();
    
    try {
      // 🔒 Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < AUTH_SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
        throw new Error(`Password must be at least ${AUTH_SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`);
      }

      // 🚫 Rate limiting check
      if (isRateLimited('/auth/login')) {
        throw new Error('Too many requests. Please try again later.');
      }

      // 🚨 Check for suspicious activity
      if (AuthSecurityMonitor.detectSuspiciousActivity('/auth/login')) {
        await wait(AUTH_SECURITY_CONFIG.RATE_LIMIT_COOLDOWN);
      }

      // 🔒 Check account lockout
      if (!AuthSecurityMonitor.recordLoginAttempt(email, false)) {
        throw new Error('Account temporarily locked due to too many failed attempts');
      }

      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        {
          email: email.toLowerCase().trim(), // Normalize email
          password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            'X-Login-Attempt': Date.now().toString(),
          },
        },
      );

      // 📊 Record successful login performance
      const duration = Date.now() - startTime;
      APIPerformanceMonitor.recordRequest('/auth/login', duration, true);
      
      // 🎉 Record successful login attempt
      AuthSecurityMonitor.recordLoginAttempt(email, true);
      
      console.log("✅ Login successful:", {
        status: response.status,
        duration: `${duration}ms`,
        hasData: !!response.data,
        timestamp: new Date().toISOString(),
      });

      // 🍪 Server returns success with httpOnly cookies
      // Cookie presence cannot be verified from JavaScript (security feature)
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Login error:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        config: axiosError.config,
        headers: axiosError.response?.headers,
        message: axiosError.message,
        request: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          headers: axiosError.config?.headers,
        },
        response: {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
        },
      });

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
    name: string,
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
        }),
      );

      if (response.data.success) {
        // Cookies are handled automatically by the browser
        console.log("Authentication successful");
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
  static async verifyToken(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      await apiClient.get("/auth/verify-token");
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage =
        (axiosError.response?.data as any)?.message ||
        "Authentication verification failed";
      return {
        success: false,
        error: {
          code: "AUTH_ERROR" as AuthErrorCode,
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
      // Refresh tokens
      const response = await apiClient.post<AuthResponse>(
        "/auth/refresh",
        {},
        {
          // Don't retry this request if it fails with 401
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw Error("Failed to refresh token");
      }

      if (response.data.success) {
        // Cookies are handled automatically by the browser
        console.log("Authentication successful");
      }

      return response.data;
    } catch (error) {
      const axiosError = error as Error;
      // Clear session by making a request to the logout endpoint
      await apiClient.post("/auth/logout");
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
      console.log("🚪 Frontend logout - Making logout request");
      const response = await apiClient.post<AuthResponse>(
        "/auth/logout",
        null,
        {
          withCredentials: true,
        },
      );

      console.log("✅ Frontend logout - Logout request successful");
      return (
        response.data || {
          success: true,
          data: { message: "Logged out successfully" },
        }
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        "❌ Frontend logout error:",
        axiosError.response?.data || axiosError,
      );

      // Even if logout API fails, we still consider it successful
      // because the user wants to logout from the frontend
      return {
        success: true, // Always return success for logout
        data: { message: "Logged out successfully" },
      };
    }
  }

  /**
   * Gets the current user's profile using cookie-based authentication
   * @returns Authentication response
   */
  static async getMe(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>("/auth/me", {
        withCredentials: true,
      });

      if (!response.data) {
        throw new Error("No response data received");
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        // For 401, return success false to indicate unauthenticated
        return {
          success: false,
          data: undefined,
        };
      }

      // Only log non-401 errors to avoid console spam
      if (axiosError.response?.status !== 401) {
        console.error("AuthAPI.getMe error:", error);
      }

      // For other errors, return the error details
      return {
        success: false,
        error: {
          code:
            ((error as AxiosError).response?.data as any)?.error?.code ||
            ("NETWORK_ERROR" as AuthErrorCode),
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
  // ... (rest of the code remains the same)
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
        },
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
    verificationCode: string,
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
        },
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
   * Requests a verification code for email change
   * @param newEmail New email address
   * @returns Promise with success status
   */
  static async requestEmailChangeVerification(
    newEmail: string,
  ): Promise<{ success: boolean; message?: string; error?: AuthError }> {
    try {
      const response = await apiClient.post(
        "/auth/send-email-change-verification",
        {
          newEmail,
        },
        {
          withCredentials: true,
        },
      );

      return {
        success: true,
        message: response.data.message || "Verification code sent to new email",
      };
    } catch (error) {
      console.error("Error requesting email change verification:", error);
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: {
          code:
            (axiosError.response?.data as any)?.error?.code ||
            ("EMAIL_CHANGE_REQUEST_FAILED" as AuthErrorCode),
          message:
            (axiosError.response?.data as any)?.error?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to send verification code"),
        },
      };
    }
  }

  /**
   * Changes email with verification code
   * @param verificationCode Verification code sent to new email
   * @returns Promise with success status and new email
   */
  static async changeEmailWithVerification(
    verificationCode: string,
  ): Promise<{ success: boolean; message?: string; newEmail?: string; error?: AuthError }> {
    try {
      const response = await apiClient.post(
        "/auth/change-email-with-verification",
        {
          verificationCode,
        },
        {
          withCredentials: true,
        },
      );

      return {
        success: true,
        message: response.data.message || "Email changed successfully",
        newEmail: response.data.newEmail,
      };
    } catch (error) {
      console.error("Error changing email:", error);
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: {
          code:
            (axiosError.response?.data as any)?.error?.code ||
            ("EMAIL_CHANGE_FAILED" as AuthErrorCode),
          message:
            (axiosError.response?.data as any)?.error?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to change email"),
        },
      };
    }
  }

  /**
   * Updates user profile
   */
  static async updateProfile(
    data: FormData,
  ): Promise<{ success: boolean; data?: AuthUser; error?: AuthError }> {
    try {
      const response = await this.retryRequest(() =>
        apiClient.put<{ success: boolean; data: AuthUser }>(
          "users/profile",
          data,
          // Ensure Content-Type is not set so browser/axios sets multipart/form-data
          { headers: { "Content-Type": undefined }, withCredentials: true },
        ),
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
    token?: string,
  ): Promise<{ success: boolean; data?: AuthUser; error?: AuthError }> {
    try {
      // Use apiClient with custom headers for this request
      const response = await apiClient.get<{
        success: boolean;
        data: AuthUser;
      }>(`/users/public-profile/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
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
    settings: Record<string, any>,
  ): Promise<{ success: boolean; data?: AuthUser; error?: AuthError }> {
    try {
      const response = await this.retryRequest(() =>
        apiClient.put<{ success: boolean; data: AuthUser }>(
          "users/settings",
          settings,
          { withCredentials: true },
        ),
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
