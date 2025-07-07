// 📁 src/api/apiClient.ts
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import TokenManager from "../utils/tokenManager";
import { getActiveEndpoints, ACTIVE_API_URL } from "../config";

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
  _useFallback?: boolean; // Flag to force fallback URL
}

// API configuration
const getBaseUrl = async (config?: RequestConfig): Promise<string> => {
  // If explicitly requesting fallback, use fallback URL
  if (config?._useFallback) {
    const { apiUrl } = await getActiveEndpoints();
    return apiUrl;
  }

  // For initial requests, use the active URL
  return ACTIVE_API_URL;
};



// Track the current base URL
let currentBaseURL = ACTIVE_API_URL;

// Configure retry settings
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Default headers
const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: ACTIVE_API_URL,
  timeout: 30000, // 30 seconds
  withCredentials: true,
  headers: defaultHeaders,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// Function to update axios instance with new base URL
const updateAxiosInstance = async (config?: RequestConfig) => {
  const newBaseURL = await getBaseUrl(config);
  if (newBaseURL !== currentBaseURL) {
    currentBaseURL = newBaseURL;
    apiClient.defaults.baseURL = newBaseURL;
    console.log('Updated API base URL to:', newBaseURL);
  }
  return apiClient;
};

// Initialize with the correct base URL
updateAxiosInstance().catch(console.error);

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
  async (config: RequestConfig) => {
    try {
      // Ensure we have the latest base URL
      await updateAxiosInstance(config);
      
      // Handle public endpoints (no auth required)
      if (config.headers?.requiresAuth === false) {
        config.headers.Authorization = undefined;
        config.withCredentials = false;
      } else {
        // Add auth header for protected endpoints
        const token = TokenManager.getAccessToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn("No access token available for authenticated request");
        }
        
        // Set withCredentials for protected endpoints
        config.withCredentials = true;
      }

      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
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

    // Handle network errors by trying the fallback
    if (!error.response && originalRequest) {
      if (!originalRequest._retry) {
        console.warn('Network error, trying fallback endpoint...');
        originalRequest._retry = true;
        originalRequest._useFallback = true;
        return apiClient(originalRequest);
      }
      return Promise.reject(error);
    }

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
          console.error("No access token available");
          TokenManager.clearTokens();
          window.location.href = "/login?expired=true";
          return Promise.reject(error);
        }

        // Update the Authorization header with the new token
        originalRequest.headers = originalRequest.headers || {};
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
