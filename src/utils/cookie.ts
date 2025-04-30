import Cookies from "js-cookie";

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
  // Set access token Cokie not working
  // Access token expires in 15 minutes
  Cookies.set(ACCESS_TOKEN_KEY, token, {
    ...cookieOptions,
    expires: 1 / 96, // 15 minutes in days
  });
};
export const setAuthRefreshToken = (token: string): void => {
  // Set access token Cokie not working
  // Access token expires in 15 minutes
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    ...cookieOptions,
    expires: 1 / 96, // 15 minutes in days
  });
};

/**
 * Get auth token from cookie
 */
export const getAuthToken = (): string | null | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY)
    ? Cookies.get(ACCESS_TOKEN_KEY)
    : localStorage.getItem("token");
};

/**
 * Clear auth token from cookie
 */
export const clearAuthToken = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
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

/**
 * Clear both tokens from cookies
 */
export const clearTokens = (): void => {
  clearAuthToken();
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
};
