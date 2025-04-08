// 📁 src/api/apiClient.ts
import axios, { type AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
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
}

// API configuration
const baseURL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', baseURL); // For debugging

export const apiConfig = {
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(apiConfig);

// Request interceptor
apiClient.interceptors.request.use(
  (config: RequestConfig) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<APIResponse>) => {
    const originalRequest = error.config as RequestConfig;
    if (!originalRequest) {
      console.error('No config in error object');
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshed = await TokenManager.refreshTokens();
        if (refreshed) {
          // Update the authorization header
          const newToken = TokenManager.getAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // If refresh failed, clear tokens and reject
      TokenManager.clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject({
        ...error,
        response: {
          data: {
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: 'Failed to connect to server',
            },
          },
        },
      });
    }

    // Handle other errors
    const errorResponse = error.response.data;
    if (errorResponse?.error?.message) {
      toast.error(errorResponse.error.message);
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
