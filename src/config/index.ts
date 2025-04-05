// Get API URLs from environment variables
export const API_URL = import.meta.env.VITE_API_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
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
