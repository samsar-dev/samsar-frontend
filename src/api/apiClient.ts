// 📁 src/api/apiClient.ts
import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

// Note: Using relative URLs for proxy compatibility, no config imports needed

// Storage key for persisting the active API URL (kept for backward compatibility)
const API_URL_STORAGE_KEY = "active_api_url";

// For backward compatibility only - will be removed in future
const FALLBACK_API_URL = "/api";

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

// Note: Using fixed relative URLs for proxy compatibility

// Configure retry settings
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Default headers
const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Create axios instance with default config for cookie-based auth
const apiClient: AxiosInstance = axios.create({
  // Always use relative URLs to leverage proxy in both dev and production
  baseURL: "/api",
  timeout: 30000, // 30 seconds
  withCredentials: true,
  headers: {
    ...defaultHeaders,
  },
});

// Function to update axios instance with new base URL
const updateAxiosInstance = (): AxiosInstance => {
  // Always use relative URLs for proxy compatibility
  const effectiveBaseURL = "/api";
  
  if (apiClient.defaults.baseURL !== effectiveBaseURL) {
    apiClient.defaults.baseURL = effectiveBaseURL;
    console.log("API client configured for proxy:", effectiveBaseURL);
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
    // Note: Using relative URLs, no fallback switching needed
    if (false) { // Disabled fallback logic
      console.warn(
        `${isCorsError ? "CORS/Network" : "Primary API"} error, but using proxy...`,
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

      // Using relative URLs - no URL switching needed
      // All requests go through proxy

      // Configure credentials for protected endpoints
      requestConfig.withCredentials = true; // Always send credentials with cookies

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

    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429) {
      console.log("Rate limit hit - waiting before retry");
      // Calculate retry delay based on Retry-After header if available
      let retryAfter = INITIAL_RETRY_DELAY;
      const retryAfterHeader = error.response?.headers?.["retry-after"];

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
      await new Promise((resolve) => setTimeout(resolve, retryAfter));

      // Retry with exponential backoff
      return apiClient.request(error.config);
    }

    // Handle 401 errors on auth endpoints (expected for logged-out users)
    if (error.response?.status === 401) {
      const url = error.config.url || "";
      const isAuthEndpoint =
        url.includes("/auth/me") || url.includes("/auth/profile");

      if (isAuthEndpoint) {
        // Don't log 401 errors for auth check endpoints - this is expected for logged-out users
        return Promise.reject(error);
      }
    }

    // Handle network/CORS errors by trying the fallback
    if (!error.response) {
      console.warn("Network error detected, trying fallback endpoint...");

      // Create a clean config without axios internals
      const fallbackConfig: RequestConfig = {
        url: error.config.url,
        method: error.config.method,
        data: error.config.data,
        params: error.config.params,
        headers: { ...error.config.headers },
        _useFallback: true,
        _retry: false,
        _retryCount: 0,
        withCredentials: true,
        timeout: 30000,
      };

      return apiClient.request(fallbackConfig);
    }

    // For all other errors, just reject
    return Promise.reject(error);
  },
);

export default apiClient;
export { apiClient };
