/**
 * Auth Debugging Utility
 *
 * Debug logging is currently disabled.
 * To enable debugging, uncomment the code in this file.
 */

// Import statements are kept but not used when debugging is disabled

import { AuthAPI as _AuthAPI } from "../api/auth.api";
import { AuthContext } from "../contexts/AuthContext";

/**
 * No-op function - Debug logging is disabled
 */
export function logAuthState(): void {
  if (process.env.NODE_ENV !== "production") {
    // Get the current auth state from the context
    const auth = (AuthContext as any)._currentValue;
    if (auth) {
      console.group("Auth State -", new Date().toISOString());
      console.log("User:", auth.user);
      console.log("Is Authenticated:", auth.isAuthenticated);
      console.log("Is Loading:", auth.isLoading);
      console.log("Error:", auth.error);
      console.log("Is Initialized:", auth.isInitialized);
      console.groupEnd();
    }
  }
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
      try {
        logAuthState();
      } catch (error) {
        console.error("Error in auth state logging:", error);
      }
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
  };
}
