import Cookies from "js-cookie";
import type { AuthTokens } from "../types/auth.types";

// Standardize token key names across the application
export const ACCESS_TOKEN_KEY = "jwt";
export const REFRESH_TOKEN_KEY = "refresh_token";

// Improved cookie options
const cookieOptions = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // 'lax' works better with redirects while maintaining some security
  path: "/",
  // Don't set domain to allow the cookie to work on all subdomains
};

/**
 * Set a cookie with the given name, value, and options
 */
export const setCookie = (
  name: string,
  value: string,
  options?: Cookies.CookieAttributes,
): void => {
  Cookies.set(name, value, { ...cookieOptions, ...options });
};

/**
 * Get a cookie by name
 */
export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

/**
 * Remove a cookie by name
 */
export const removeCookie = (
  name: string,
  options?: Cookies.CookieAttributes,
): void => {
  Cookies.remove(name, { ...cookieOptions, ...options });
};

/**
 * Set auth token in cookie
 */
export const setAuthToken = (tokens: AuthTokens): void => {
  // Set access token cookie
  setCookie(ACCESS_TOKEN_KEY, tokens.accessToken, {
    expires: 1 / 96, // 15 minutes in days
  });

  // Also store in localStorage as backup
  const tokensString = JSON.stringify({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
  localStorage.setItem("authTokens", tokensString);
};

/**
 * Set refresh token in cookie
 */
export const setAuthRefreshToken = (tokens: AuthTokens): void => {
  // Set refresh token cookie
  setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken, {
    expires: 1 / 96, // 15 minutes in days
  });

  // Also store in localStorage as backup
  const tokensString = JSON.stringify({
    accessToken: tokens.accessToken || "",
    refreshToken: tokens.refreshToken,
  });
  localStorage.setItem("authTokens", tokensString);
};

/**
 * Get auth token from cookie
 */
export function getAuthToken(): string | null {
  // First try to get from cookie
  const token = getCookie(ACCESS_TOKEN_KEY) || null;
  if (token) return token;

  // Fallback to localStorage if cookie is not available
  try {
    const storedTokens = localStorage.getItem("authTokens");
    if (storedTokens) {
      const { accessToken } = JSON.parse(storedTokens);
      if (accessToken) {
        // Try to restore the cookie
        setAuthToken({ accessToken, refreshToken: "" });
        return accessToken;
      }
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
  }

  return null;
}

/**
 * Clear auth token from cookie
 */
export const clearAuthToken = (): void => {
  removeCookie(ACCESS_TOKEN_KEY);
  localStorage.removeItem("authTokens");
};

/**
 * Clear both tokens from cookies
 */
export const clearTokens = (): void => {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
  localStorage.removeItem("authTokens");
};

/**
 * Set both access and refresh tokens
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  setAuthToken({ accessToken, refreshToken });
  setAuthRefreshToken({ accessToken, refreshToken });
};

/**
 * Get refresh token from cookie
 */
export const getRefreshToken = (): string | undefined => {
  return getCookie(REFRESH_TOKEN_KEY);
};

// Export all cookie operations
export default {
  set: setCookie,
  get: getCookie,
  remove: removeCookie,
  setAuthToken,
  getAuthToken,
  setAuthRefreshToken,
  getRefreshToken,
  clearAuthToken,
  clearTokens,
  setTokens,
};
