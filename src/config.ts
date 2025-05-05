// API Configuration
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Production URLs
export const API_URL_PROD = import.meta.env.VITE_API_URL_PROD;
export const SOCKET_URL_PROD = import.meta.env.VITE_SOCKET_URL_PROD;

// Environment
export const IS_PRODUCTION = import.meta.env.VITE_ENV;

// Use production URLs in production
export const ACTIVE_API_URL =
  IS_PRODUCTION === "production" ? API_URL_PROD : API_URL;
export const ACTIVE_SOCKET_URL =
  IS_PRODUCTION === "production" ? SOCKET_URL_PROD : SOCKET_URL;
console.log("API Base URL:", ACTIVE_API_URL);
console.log("Socket Base URL:", ACTIVE_SOCKET_URL);

// Default UI Settings
export const DEFAULT_SETTINGS = {
  fontSize: "medium",
  reducedMotion: false,
  highContrast: false,
  enableAnimations: true,
  sidebarCollapsed: false,
  denseMode: false,
  enableSoundEffects: false,
  toastPosition: "top-right",
  theme: "light",
};
