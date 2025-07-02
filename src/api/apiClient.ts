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
  _retryCount?: number;
  requiresAuth?: boolean;
}

// API configuration
// Ensure we don't have duplicate /api in the URL path
const getBaseUrl = () => {
  let url =
    import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PROD
      : import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Normalize the URL to ensure it doesn't have a trailing slash
  url = url.endsWith("/") ? url.slice(0, -1) : url;

  // Add /api only if it's not already there
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }

  return url;
};

const baseURL = getBaseUrl();
console.log("API Base URL:", baseURL); // For debugging

// Configure retry settings
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export const apiConfig = {
  baseURL,
  timeout: 30000, // Increased timeout to 30 seconds
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Add explicit CORS settings
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(apiConfig);

// Add retry interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RequestConfig;
    
    // Don't retry if there's no config or it's not a network/5xx error
    if (!config || (error.response && error.response.status < 500)) {
      return Promise.reject(error);
    }

    // Initialize or increment retry count
    const retryCount = (config._retryCount || 0) + 1;
    
    // If we haven't exceeded max retries
    if (retryCount <= MAX_RETRIES) {
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, retryCount - 1) * INITIAL_RETRY_DELAY;
      console.warn(`Request failed, retrying (${retryCount}/${MAX_RETRIES}) in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Update retry count and retry the request
      const retryConfig: RequestConfig = {
        ...config,
        _retry: true
      };
      retryConfig._retryCount = retryCount;
      
      return apiClient(retryConfig);
    }
    
    console.error(`Max retries (${MAX_RETRIES}) exceeded for request to ${config.url}`);
    return Promise.reject(error);
  }
);

// Request interceptor
apiClient.interceptors.request.use(
  (config: RequestConfig) => {
    // Handle public endpoints (no auth required)
    if (config.headers?.requiresAuth === false) {
      config.headers.Authorization = undefined;
      config.withCredentials = false;
    } else {
      // Add auth header for protected endpoints
      const token = TokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("No access token available for authenticated request");
      }

      // Set withCredentials for protected endpoints
      config.withCredentials = true;
    }

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
