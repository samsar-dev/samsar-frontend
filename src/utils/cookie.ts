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
export const setAuthToken = (tokens: AuthTokens): void => {
  // Set access token cookie
  Cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
    ...cookieOptions,
    expires: 1 / 96, // 15 minutes in days
  });

  // Update TokenManager with the token
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
  Cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
    ...cookieOptions,
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
export const getAuthToken = (): string | null => {
  // let token: string | null | undefined = Cookies.get(ACCESS_TOKEN_KEY);
  // if (!token) token = localStorage.getItem("token");
  // if (!token) {
  //   console.error("No auth token found");
  //   clearTokens();
  //   return null;
  // }
  // // Update TokenManager with the token
  // const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
  // TokenManager.setTokens({
  //   accessToken: token,
  //   refreshToken: refreshToken || "",
  // } as AuthTokens);
  // return token;
  return (
    Cookies.get(ACCESS_TOKEN_KEY) ??
    JSON.parse(localStorage.getItem("authTokens") || "{}")?.accessToken
  );
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
  setAuthToken({ accessToken, refreshToken });

  // Set refresh token (expires in 7 days)
  setAuthRefreshToken({ accessToken, refreshToken });
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
