// ==========================================================================
// SINGLE SOURCE OF TRUTH FOR API & SOCKET CONFIGURATION
// ==========================================================================

// Environment Detection
export const IS_PRODUCTION = import.meta.env.VITE_ENV === "production";

// Development Endpoints (with clear localhost defaults)
const DEV_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DEV_SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "ws://localhost:5000";

// Production Endpoints - Use relative URLs to leverage Vercel proxy
// This makes requests same-origin and avoids Chrome's strict cookie policies
const PROD_API_URL = "/api"; // Relative URL - proxied by Vercel to Railway
const PROD_SOCKET_URL = import.meta.env.VITE_SOCKET_URL_PROD || "wss://samsar.app";

// Final, active URLs to be used by the application
export const ACTIVE_API_URL = IS_PRODUCTION ? PROD_API_URL : DEV_API_URL;
export const ACTIVE_SOCKET_URL = IS_PRODUCTION
  ? PROD_SOCKET_URL
  : DEV_SOCKET_URL;

// Log configuration
if (IS_PRODUCTION) {
  console.log("✅ Production config loaded (using Vercel proxy):");
  console.log(`   - API URL: ${ACTIVE_API_URL} (proxied to Railway)`);
  console.log(`   - Socket URL: ${ACTIVE_SOCKET_URL}`);
  console.log(`   - Same-origin requests: ✅ (Chrome-compatible)`);
} else {
  console.log("✅ Development config loaded:");
  console.log(`   - API URL: ${ACTIVE_API_URL}`);
  console.log(`   - Socket URL: ${ACTIVE_SOCKET_URL}`);
}

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const APP_NAME = import.meta.env.VITE_APP_NAME || "Samsar";
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === "false";

// Socket.IO Configuration
export const SOCKET_CONFIG = {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 5000,
};

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
