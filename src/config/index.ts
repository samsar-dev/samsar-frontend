// Environment detection
const isDevelopment = import.meta.env.MODE === "development";

// API URLs
const API_URL = isDevelopment
  ? "http://localhost:5000/api"
  : import.meta.env.VITE_API_URL_PROD || "https://api.samsar.app/api";

const FALLBACK_API_URL = import.meta.env.VITE_API_URL_FALLBACK || "https://samsar-backend-production.up.railway.app/api";

// Socket URLs
const SOCKET_URL = isDevelopment
  ? "http://localhost:5000"
  : import.meta.env.VITE_SOCKET_URL_PROD || "https://api.samsar.app";

const FALLBACK_SOCKET_URL = import.meta.env.VITE_SOCKET_URL_FALLBACK || "https://samsar-backend-production.up.railway.app";

// Export all endpoints
export const getActiveEndpoints = () => ({
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,
  fallbackApiUrl: FALLBACK_API_URL,
  fallbackSocketUrl: FALLBACK_SOCKET_URL
});

// Export individual constants for backward compatibility
export { 
  API_URL, 
  FALLBACK_API_URL, 
  SOCKET_URL, 
  FALLBACK_SOCKET_URL 
};
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const APP_NAME = import.meta.env.VITE_APP_NAME;
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === "true";

// API endpoints
export const API_ENDPOINTS = {
  listings: `${API_URL}/listings`,
  auth: `${API_URL}/auth`,
  search: `${API_URL}/search`,
  messages: `${API_URL}/messages`,
  notifications: `${API_URL}/notifications`,
  settings: `${API_URL}/settings`,
  reports: `${API_URL}/reports`,
};

export const DEFAULT_SETTINGS = {
  theme: "light",
  language: "en",
  notifications: {
    email: true,
    push: true,
    messages: true,
    marketing: false,
    newListings: true,
    priceDrops: true,
    favorites: true,
  },
  emailNotifications: true,
  pushNotifications: true,
  timezone: "UTC",
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h" as const,
};
