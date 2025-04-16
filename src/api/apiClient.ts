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

interface RequestConfig extends InternalAxiosRequestConfig {
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
    if (config.requiresAuth !== false) {
      const token = TokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIResponse>) => {
    const originalRequest = error.config as RequestConfig;
    // Only refresh/redirect for protected endpoints
    if (
      originalRequest?.requiresAuth &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshed = await TokenManager.refreshTokens();
        if (refreshed) {
          const newToken = TokenManager.getAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        TokenManager.clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
      TokenManager.clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }
    // For public endpoints or other errors, just reject
    return Promise.reject(error);
  },
);

export default apiClient;
export { apiClient };
