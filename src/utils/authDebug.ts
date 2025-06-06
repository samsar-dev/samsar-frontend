/**
 * Auth Debugging Utility
 * 
 * Debug logging is currently disabled.
 * To enable debugging, uncomment the code in this file.
 */

// Import statements are kept but not used when debugging is disabled
import TokenManager from "./tokenManager";
import { getAuthToken, getRefreshToken } from "./cookie";
import { getItem } from "./storage";

/**
 * No-op function - Debug logging is disabled
 */
export function logAuthState(): void {
  // Debug logging is disabled
}

/**
 * Add this to your main app component to monitor auth state changes
 */
export function setupAuthDebugger(): (() => void) | undefined {
  if (process.env.NODE_ENV !== "production") {
    // Log initial state
    logAuthState();

    // Setup interval to check auth state every 30 seconds
    const intervalId = setInterval(() => {
      logAuthState();
    }, 30000);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }
  return undefined;
}

// Expose debugging commands to window for console access
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as any).authDebug = {
    logAuthState,
    refreshTokens: TokenManager.refreshTokens.bind(TokenManager),
    clearTokens: TokenManager.clearTokens.bind(TokenManager),
    getAccessToken: TokenManager.getAccessToken.bind(TokenManager),
    initialize: TokenManager.initialize.bind(TokenManager),
  };

  console.info(
    "Auth debugging tools available. Type authDebug.logAuthState() in console to debug.",
  );
}
