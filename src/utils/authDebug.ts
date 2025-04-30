/**
 * Auth Debugging Utility
 * 
 * This file provides debugging tools to help troubleshoot authentication issues.
 * It can be imported and used in development to trace token handling.
 */

import TokenManager from './tokenManager';
import { getAuthToken, getRefreshToken } from './cookie';
import { getItem } from './storage';

/**
 * Logs the current authentication state to the console
 */
export function logAuthState(): void {
  console.group('🔐 Auth State Debug');
  
  // Check cookies
  const cookieAccessToken = getAuthToken();
  const cookieRefreshToken = getRefreshToken();
  
  console.log('Cookie Access Token:', cookieAccessToken ? 
    `${cookieAccessToken.substring(0, 10)}...${cookieAccessToken.substring(cookieAccessToken.length - 5)}` : 
    'None');
  console.log('Cookie Refresh Token:', cookieRefreshToken ? 
    `${cookieRefreshToken.substring(0, 10)}...${cookieRefreshToken.substring(cookieRefreshToken.length - 5)}` : 
    'None');
  
  // Check localStorage
  const storedTokens = getItem('auth-tokens');
  let localStorageTokens = null;
  
  if (storedTokens) {
    try {
      localStorageTokens = JSON.parse(storedTokens);
      console.log('LocalStorage Access Token:', localStorageTokens.accessToken ? 
        `${localStorageTokens.accessToken.substring(0, 10)}...${localStorageTokens.accessToken.substring(localStorageTokens.accessToken.length - 5)}` : 
        'None');
      console.log('LocalStorage Refresh Token:', localStorageTokens.refreshToken ? 
        `${localStorageTokens.refreshToken.substring(0, 10)}...${localStorageTokens.refreshToken.substring(localStorageTokens.refreshToken.length - 5)}` : 
        'None');
    } catch (e) {
      console.error('Error parsing localStorage tokens:', e);
      console.log('LocalStorage Tokens: Invalid format');
    }
  } else {
    console.log('LocalStorage Tokens: None');
  }
  
  // Check TokenManager state
  console.log('TokenManager.isAuthenticated():', TokenManager.isAuthenticated());
  console.log('TokenManager.jwtPayload:', TokenManager.getJwtPayload());
  
  // Check token validity
  const accessToken = TokenManager.getAccessToken();
  if (accessToken) {
    try {
      const isValid = TokenManager.validateTokenFormat(accessToken);
      console.log('Token valid format:', isValid);
      
      // Parse and check expiration
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const expiresAt = new Date(payload.exp * 1000);
        const timeLeft = expiresAt.getTime() - Date.now();
        
        console.log('Token expires at:', expiresAt.toLocaleString());
        console.log('Time until expiry:', Math.floor(timeLeft / 1000 / 60), 'minutes,', 
          Math.floor((timeLeft / 1000) % 60), 'seconds');
      }
    } catch (e) {
      console.error('Error checking token validity:', e);
    }
  }
  
  console.groupEnd();
}

/**
 * Add this to your main app component to monitor auth state changes
 */
export function setupAuthDebugger(): (() => void) | undefined {
  if (process.env.NODE_ENV !== 'production') {
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
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as any).authDebug = {
    logAuthState,
    refreshTokens: TokenManager.refreshTokens.bind(TokenManager),
    clearTokens: TokenManager.clearTokens.bind(TokenManager),
    getAccessToken: TokenManager.getAccessToken.bind(TokenManager),
    initialize: TokenManager.initialize.bind(TokenManager)
  };
  
  console.info('Auth debugging tools available. Type authDebug.logAuthState() in console to debug.');
}
