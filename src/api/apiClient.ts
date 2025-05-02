// 📁 src/api/apiClient.ts
import axios, {
  type AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import TokenManager from "../utils/tokenManager";

// Define API response type
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    errors?: any[];
  };
}

export interface RequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  requiresAuth?: boolean;
}

// API configuration
const baseURL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL || "http://localhost:5000/api";

console.log("API Base URL:", baseURL); // For debugging

export const apiConfig = {
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(apiConfig);

// Request interceptor
apiClient.interceptors.request.use(
  (config: RequestConfig) => {
    // Only add auth header if the request requires authentication
    if (config.headers?.requiresAuth !== false) {
      const token = TokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("No access token available for authenticated request");
      }
    }

    // Always ensure withCredentials is set for cross-origin requests
    // This ensures cookies are sent with the request
    config.withCredentials = true;

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIResponse>) => {
    const originalRequest = error.config as RequestConfig;

    // Only refresh/redirect for protected endpoints
    if (
      originalRequest?.headers?.requiresAuth !== false && // Default to true if not specified
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      console.log("Unauthorized request detected, attempting token refresh...");
      originalRequest._retry = true;

      try {
        const newToken = TokenManager.getAccessToken();
        if (!newToken) {
          console.error("No access token after successful refresh");
          // Something went wrong with token storage
          TokenManager.clearTokens();
          window.location.href = "/login?expired=true";
          return Promise.reject(error);
        }

        // Update the Authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry the original request with the new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        TokenManager.clearTokens();
        window.location.href = "/login?expired=true";
        return Promise.reject(refreshError);
      }
    }

    // For public endpoints or other errors, just reject
    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
