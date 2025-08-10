// 📁 src/api/apiClient.ts
import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosError,
  InternalAxiosRequestConfig 
} from "axios";

// 🔒 Security Configuration
const SECURITY_CONFIG = {
  MAX_REQUEST_SIZE: 50 * 1024 * 1024, // 50MB
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 100,
  CSP_NONCE: crypto.randomUUID?.() || Math.random().toString(36),
} as const;

// 📊 Performance Monitoring
class APIPerformanceMonitor {
  private static metrics = new Map<string, {
    count: number;
    totalTime: number;
    errors: number;
    lastCall: number;
  }>();

  private static requestQueue = new Map<string, number>();

  static recordRequest(endpoint: string, duration: number, success: boolean): void {
    const key = endpoint.split('?')[0]; // Remove query params for grouping
    const current = this.metrics.get(key) || { count: 0, totalTime: 0, errors: 0, lastCall: 0 };
    
    current.count++;
    current.totalTime += duration;
    current.lastCall = Date.now();
    if (!success) current.errors++;
    
    this.metrics.set(key, current);
  }

  static getMetrics() {
    const result: Record<string, any> = {};
    this.metrics.forEach((value, key) => {
      result[key] = {
        ...value,
        avgTime: value.count > 0 ? Math.round(value.totalTime / value.count) : 0,
        errorRate: value.count > 0 ? Math.round((value.errors / value.count) * 100) : 0,
      };
    });
    return result;
  }

  static checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    // Clean old entries
    this.requestQueue.forEach((timestamp, key) => {
      if (timestamp < windowStart) {
        this.requestQueue.delete(key);
      }
    });

    // Count requests in current window
    const requestsInWindow = Array.from(this.requestQueue.values())
      .filter(timestamp => timestamp >= windowStart).length;

    if (requestsInWindow >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      console.warn(`🚫 Rate limit exceeded for ${endpoint}`);
      return false;
    }

    this.requestQueue.set(`${endpoint}-${now}`, now);
    return true;
  }
}

// 🌐 Smart Domain Detection with Security
const getDomainInfo = () => {
  if (typeof window === 'undefined') {
    return { domain: 'server', isSecure: true, apiUrl: '/api' };
  }

  const { hostname, protocol, port } = window.location;
  const isSecure = protocol === 'https:' || hostname === 'localhost';
  const isProduction = hostname.includes('vercel.app') || hostname === 'samsar.app';
  
  // Security check: Ensure we're on expected domains
  const allowedDomains = ['localhost', 'samsar.app', 'samsar-frontend.vercel.app'];
  const isDomainAllowed = allowedDomains.some(allowed => 
    hostname === allowed || hostname.endsWith('.vercel.app')
  );

  if (!isDomainAllowed && isProduction) {
    console.warn('⚠️ Unexpected domain detected:', hostname);
  }

  return {
    domain: hostname,
    port,
    isSecure,
    isProduction,
    isDomainAllowed,
    apiUrl: '/api', // Always use proxy
  };
};

const domainInfo = getDomainInfo();
console.log('🔐 Secure API Configuration:', {
  ...domainInfo,
  cspNonce: SECURITY_CONFIG.CSP_NONCE,
  timestamp: new Date().toISOString(),
});

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

// 🔧 Extended request config with security and performance properties
export interface RequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  _startTime?: number;
  requiresAuth?: boolean;
  _useFallback?: boolean;
  _isFallback?: boolean;
  _requestId?: string;
  _priority?: 'low' | 'normal' | 'high';
}

// Note: Using fixed relative URLs for proxy compatibility

// 🔧 Default headers for all requests
const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Create axios instance with default config for cookie-based auth
const apiClient: AxiosInstance = axios.create({
  // Use domain-aware API URL for robust cross-deployment support
  baseURL: domainInfo.apiUrl,
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

// 🛡️ Enhanced Response Interceptor with Security & Performance
apiClient.interceptors.response.use(
  (response) => {
    // 📊 Record successful request metrics
    const config = response.config as RequestConfig;
    if (config._startTime) {
      const duration = Date.now() - config._startTime;
      APIPerformanceMonitor.recordRequest(config.url || '', duration, true);
    }

    // 🔒 Security headers validation
    const securityHeaders = {
      'x-content-type-options': response.headers['x-content-type-options'],
      'x-frame-options': response.headers['x-frame-options'],
      'x-xss-protection': response.headers['x-xss-protection'],
    };

    if (domainInfo.isProduction && !securityHeaders['x-content-type-options']) {
      console.warn('⚠️ Missing security header: X-Content-Type-Options');
    }

    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RequestConfig;
    if (!config) return Promise.reject(error);

    // 📊 Record failed request metrics
    if (config._startTime) {
      const duration = Date.now() - config._startTime;
      APIPerformanceMonitor.recordRequest(config.url || '', duration, false);
    }

    // 🔒 Security: Detect potential attacks
    const suspiciousPatterns = [
      /script/i, /javascript/i, /vbscript/i, /onload/i, /onerror/i
    ];
    
    const requestData = JSON.stringify(config.data || '');
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      pattern.test(requestData)
    );

    if (hasSuspiciousContent) {
      console.error('🚨 Suspicious content detected in request');
      return Promise.reject(new Error('Request blocked for security reasons'));
    }

    // Initialize retry count
    config._retryCount = config._retryCount || 0;

    // 🔄 Smart Retry Logic
    const isRetryableStatus = [
      429, // Rate limit
      502, 503, 504, // Server errors
      408, // Timeout
    ].includes(error.response?.status || 0);

    const isNetworkError = [
      'ECONNABORTED', 'NETWORK_ERROR', 'TIMEOUT'
    ].includes(error.code || '');

    const shouldRetry = 
      config._retryCount < SECURITY_CONFIG.MAX_RETRIES &&
      !config._retry &&
      (isRetryableStatus || isNetworkError || !error.response);

    if (shouldRetry) {
      config._retryCount++;
      config._retry = true;

      // 📈 Exponential backoff with jitter
      const baseDelay = SECURITY_CONFIG.RETRY_DELAY;
      const exponentialDelay = baseDelay * Math.pow(2, config._retryCount - 1);
      const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
      const delay = Math.min(exponentialDelay + jitter, 10000); // Cap at 10s

      console.log(
        `🔄 Smart retry (${config._retryCount}/${SECURITY_CONFIG.MAX_RETRIES}) in ${Math.round(delay)}ms`,
      );

      await new Promise(resolve => setTimeout(resolve, delay));

      // Create clean retry config
      const retryConfig: RequestConfig = {
        ...config,
        _retry: false,
        _startTime: Date.now(), // Reset timer for retry
      };

      return apiClient.request(retryConfig);
    }

    // 🚨 Enhanced Error Logging
    const errorContext = {
      url: config.url,
      method: config.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      retryCount: config._retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    console.error('🚨 API Request Failed:', errorContext);

    // 📊 Log performance metrics for debugging
    if (config._retryCount >= SECURITY_CONFIG.MAX_RETRIES) {
      console.warn('📊 Performance Metrics:', APIPerformanceMonitor.getMetrics());
    }

    return Promise.reject(error);
  },
);

// 🔐 Enhanced Request Interceptor with Security & Performance
apiClient.interceptors.request.use(
  (config) => {
    try {
      const requestConfig = config as RequestConfig;
      const requestId = crypto.randomUUID?.() || Math.random().toString(36);
      
      // 📊 Performance tracking
      requestConfig._startTime = Date.now();
      requestConfig._requestId = requestId;
      
      // 🚫 Rate limiting check
      if (!APIPerformanceMonitor.checkRateLimit(config.url || '')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // 🔒 Security headers
      const securityHeaders: Record<string, string> = {
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Version': '1.0.0',
        'X-Request-ID': requestId,
        'X-CSP-Nonce': SECURITY_CONFIG.CSP_NONCE,
      };

      // 🌐 Domain-specific security
      if (domainInfo.isProduction) {
        securityHeaders['X-Forwarded-Proto'] = 'https';
      }

      // 🔐 Always use credentials for cookie-based auth
      requestConfig.withCredentials = true;
      
      // 📎 Merge security headers
      requestConfig.headers = {
        ...requestConfig.headers,
        ...securityHeaders,
      };

      // 🔒 Content validation for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
        const contentLength = JSON.stringify(config.data || '').length;
        if (contentLength > SECURITY_CONFIG.MAX_REQUEST_SIZE) {
          throw new Error(`Request too large: ${contentLength} bytes exceeds ${SECURITY_CONFIG.MAX_REQUEST_SIZE} bytes`);
        }
      }

      // 📊 Debug logging in development
      if (!domainInfo.isProduction) {
        console.log(`🚀 API Request [${requestId.slice(0, 8)}]:`, {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasData: !!config.data,
          timestamp: new Date().toISOString(),
        });
      }

      return requestConfig as InternalAxiosRequestConfig;
    } catch (error) {
      console.error('🚨 Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Note: Enhanced response interceptor is already configured above

// 📦 Export enhanced API client and utilities
export default apiClient;
export { APIPerformanceMonitor, SECURITY_CONFIG, domainInfo };

// 🔧 Utility functions for external use
export const getApiMetrics = () => APIPerformanceMonitor.getMetrics();
export const isRateLimited = (endpoint: string) => !APIPerformanceMonitor.checkRateLimit(endpoint);
export const getSecurityConfig = () => ({ ...SECURITY_CONFIG });
export const getCurrentDomainInfo = () => ({ ...domainInfo });
export { apiClient };
