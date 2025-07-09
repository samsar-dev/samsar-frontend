// 📁 src/api/apiClient.ts
import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import TokenManager from "../utils/tokenManager";
import { API_URL as ACTIVE_API_URL } from "../config";

// Fallback API URL from environment variables
const FALLBACK_API_URL =
  import.meta.env.VITE_API_URL_FALLBACK ||
  "https://samsar-backend-production.up.railway.app";

// Storage key for persisting the active API URL
const API_URL_STORAGE_KEY = "active_api_url";

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

// Extended request config with our custom properties
export interface RequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  requiresAuth?: boolean;
  _useFallback?: boolean;
  _isFallback?: boolean;
}

// Get the active base URL with fallback support
const getBaseUrl = (config?: RequestConfig): string => {
  // If explicitly requesting fallback, use fallback URL
  if (config?._useFallback) {
    localStorage.setItem(API_URL_STORAGE_KEY, FALLBACK_API_URL);
    return FALLBACK_API_URL;
  }

  // Check localStorage for a previously used URL
  const savedUrl = localStorage.getItem(API_URL_STORAGE_KEY);
  if (savedUrl) {
    return savedUrl;
  }

  // Default to the primary URL
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
const updateAxiosInstance = (config?: RequestConfig): AxiosInstance => {
  const newBaseURL = getBaseUrl(config);
  if (newBaseURL !== currentBaseURL) {
    currentBaseURL = newBaseURL;
    apiClient.defaults.baseURL = newBaseURL;
    console.log("Updated API base URL to:", newBaseURL);
  }
  return apiClient;
};

// Initialize with the correct base URL
try {
  updateAxiosInstance();
} catch (error) {
  console.error("Failed to initialize API client:", error);
}

// Add retry interceptor with fallback support
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // If there's no config, we can't retry
    if (!error.config) {
      return Promise.reject(error);
    }

    const config = error.config as RequestConfig;

    // Check if this is a CORS error or network error
    const isNetworkError = !error.response;
    const isCorsError =
      isNetworkError ||
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Failed to fetch");

    // If we're already using the fallback or this is a non-retryable error, reject immediately
    if (
      config._useFallback ||
      (error.response && error.response.status < 500 && !isCorsError)
    ) {
      return Promise.reject(error);
    }

    // Initialize or increment retry count
    const retryCount = (config._retryCount || 0) + 1;

    // If we haven't exceeded max retries
    if (retryCount <= MAX_RETRIES) {
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, retryCount - 1) * INITIAL_RETRY_DELAY;
      console.warn(
        `Request failed, retrying (${retryCount}/${MAX_RETRIES}) in ${delay}ms...`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Update retry count and retry the request
      const retryConfig: RequestConfig = {
        ...config,
        _retry: true,
        _retryCount: retryCount,
      };

      return apiClient.request(retryConfig);
    }

    // If we've exhausted retries or got a CORS error, try the fallback URL if available
    if (
      FALLBACK_API_URL &&
      (currentBaseURL === ACTIVE_API_URL || isCorsError)
    ) {
      console.warn(
        `${isCorsError ? "CORS/Network" : "Primary API"} error, switching to fallback...`,
      );

      // Create a clean config without axios internals that might cause issues
      const fallbackConfig: RequestConfig = {
        url: config.url,
        method: config.method,
        data: config.data,
        params: config.params,
        headers: { ...config.headers },
        _useFallback: true,
        _retry: false,
        _retryCount: 0,
        // Don't copy axios internals
        transformRequest: undefined,
        transformResponse: undefined,
        adapter: undefined,
        timeout: 30000,
        withCredentials: true,
      };

      return apiClient.request(fallbackConfig);
    }

    console.error(
      `Max retries (${MAX_RETRIES}) exceeded for request to ${config.url}`,
    );
    return Promise.reject(error);
  },
);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    try {
      // Cast to our extended config type
      const requestConfig = config as RequestConfig;

      // Determine if we should use the fallback URL
      const shouldUseFallback =
        requestConfig._useFallback || currentBaseURL === FALLBACK_API_URL;

      // Update the base URL if needed
      if (shouldUseFallback && currentBaseURL !== FALLBACK_API_URL) {
        currentBaseURL = FALLBACK_API_URL;
        apiClient.defaults.baseURL = FALLBACK_API_URL;
        localStorage.setItem(API_URL_STORAGE_KEY, FALLBACK_API_URL);
        console.log("Switched to fallback API URL:", FALLBACK_API_URL);
      } else if (!shouldUseFallback && currentBaseURL !== ACTIVE_API_URL) {
        currentBaseURL = ACTIVE_API_URL;
        apiClient.defaults.baseURL = ACTIVE_API_URL;
        localStorage.setItem(API_URL_STORAGE_KEY, ACTIVE_API_URL);
        console.log("Using primary API URL:", ACTIVE_API_URL);
      }

      // Handle public endpoints (no auth required)
      const isPublicEndpoint =
        requestConfig.headers?.requiresAuth === false ||
        requestConfig.requiresAuth === false;

      if (isPublicEndpoint) {
        requestConfig.headers = requestConfig.headers || {};
        requestConfig.headers.Authorization = undefined;
        requestConfig.withCredentials = false;
      } else {
        // Add auth header for protected endpoints
        const token = TokenManager.getAccessToken();
        if (token) {
          requestConfig.headers = requestConfig.headers || {};
          requestConfig.headers.Authorization = `Bearer ${token}`;
          requestConfig.withCredentials = true;
        } else if (requestConfig.requiresAuth !== false) {
          console.warn("No access token available for authenticated request");
        }
      }

      // Ensure we have proper headers
      requestConfig.headers = {
        ...requestConfig.headers,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      return requestConfig as InternalAxiosRequestConfig;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor for authentication and error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIResponse>) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RequestConfig;

    // Check if this is a CORS error or network error
    const isNetworkError = !error.response;
    const isCorsError =
      isNetworkError ||
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Failed to fetch");

    // Handle network/CORS errors by trying the fallback
    if ((isNetworkError || isCorsError) && !originalRequest._useFallback) {
      console.warn("Network/CORS error detected, trying fallback endpoint...");

      // Create a clean config without axios internals
      const fallbackConfig: RequestConfig = {
        url: originalRequest.url,
        method: originalRequest.method,
        data: originalRequest.data,
        params: originalRequest.params,
        headers: { ...originalRequest.headers },
        _useFallback: true,
        _retry: false,
        _retryCount: 0,
        withCredentials: true,
        timeout: 30000,
      };

      return apiClient.request(fallbackConfig);
    }

    // Only process 401 errors for authenticated requests that haven't been retried
    if (
      error.response?.status === 401 &&
      originalRequest.requiresAuth !== false &&
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
        const retryConfig: RequestConfig = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };

        // Retry the original request with the new token
        return apiClient.request(retryConfig);
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        TokenManager.clearTokens();
        window.location.href = "/login?expired=true";
        return Promise.reject(refreshError);
      }
    }

    // For public endpoints or other errors, just reject
    return Promise.reject(error);
  },
);

export default apiClient;
export { apiClient };
