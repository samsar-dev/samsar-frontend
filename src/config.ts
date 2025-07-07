// Environment
export const IS_PRODUCTION = import.meta.env.VITE_ENV === 'production';

// API Configuration - Development
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Production API Endpoints
export const API_URL_PRIMARY = import.meta.env.VITE_API_URL_PROD || "https://api.samsar.app/api";
export const SOCKET_URL_PRIMARY = import.meta.env.VITE_SOCKET_URL_PROD || "https://api.samsar.app";

// Fallback API Endpoints (Railway)
export const API_URL_FALLBACK = import.meta.env.VITE_API_URL_FALLBACK || "https://samsar-backend-production.up.railway.app/api";
export const SOCKET_URL_FALLBACK = import.meta.env.VITE_SOCKET_URL_FALLBACK || "https://samsar-backend-production.up.railway.app";

/**
 * Check if primary API endpoint is available
 */
const checkPrimaryApiHealth = async (): Promise<boolean> => {
  if (!IS_PRODUCTION) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    
    const response = await fetch(`${API_URL_PRIMARY}/health`, {
      signal: controller.signal,
      method: 'HEAD'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('Primary API endpoint is not available, falling back to backup');
    return false;
  }
};

// Determine which API endpoints to use
export const getActiveEndpoints = async () => {
  if (!IS_PRODUCTION) {
    return {
      apiUrl: API_URL,
      socketUrl: SOCKET_URL,
      isFallback: false
    };
  }

  const isPrimaryAvailable = await checkPrimaryApiHealth();
  
  return {
    apiUrl: isPrimaryAvailable ? API_URL_PRIMARY : API_URL_FALLBACK,
    socketUrl: isPrimaryAvailable ? SOCKET_URL_PRIMARY : SOCKET_URL_FALLBACK,
    isFallback: !isPrimaryAvailable
  };
};

// For synchronous usage (initial load, will default to primary)
export const ACTIVE_API_URL = IS_PRODUCTION ? API_URL_PRIMARY : API_URL;
export const ACTIVE_SOCKET_URL = IS_PRODUCTION ? SOCKET_URL_PRIMARY : SOCKET_URL;

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
