import Cookies from "js-cookie";
import TokenManager from "./tokenManager";
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
 * Set auth token in cookie
 */
export const setAuthToken = (token: string): void => {
  // Set access token cookie
  Cookies.set(ACCESS_TOKEN_KEY, token, {
    ...cookieOptions,
    expires: 1 / 96, // 15 minutes in days
  });

  // Update TokenManager with the token
  const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
  TokenManager.setTokens({
    accessToken: token,
    refreshToken: refreshToken || ""
  } as AuthTokens);
};

/**
 * Set refresh token in cookie
 */
export const setAuthRefreshToken = (token: string): void => {
  // Set refresh token cookie
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    ...cookieOptions,
    expires: 1 / 96, // 15 minutes in days
  });

  // Update TokenManager with the token
  const accessToken = Cookies.get(ACCESS_TOKEN_KEY);
  TokenManager.setTokens({
    accessToken: accessToken || "",
    refreshToken: token
  } as AuthTokens);
};

/**
 * Get auth token from cookie
 */
export const getAuthToken = (): string | null => {
  const token = Cookies.get(ACCESS_TOKEN_KEY);
  if (token) {
    // Update TokenManager with the token
    const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
    TokenManager.setTokens({
      accessToken: token,
      refreshToken: refreshToken || ""
    } as AuthTokens);
  }
  return token;
};

/**
 * Clear auth token from cookie
 */
export const clearAuthToken = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  // Don't call TokenManager.clearTokens() here to avoid circular dependency
};

/**
 * Clear both tokens from cookies
 */
export const clearTokens = (): void => {
  clearAuthToken();
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
};

/**
 * Set both access and refresh tokens
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  // Set access token
  setAuthToken(accessToken);

  // Set refresh token (expires in 7 days)
  setAuthRefreshToken(refreshToken);
};

/**
 * Get refresh token from cookie
 */
export const getRefreshToken = (): string | undefined => {
  return (
    Cookies.get(REFRESH_TOKEN_KEY) ??
    JSON.parse(localStorage.getItem("authTokens") || "{}")?.refreshToken
  );
};


