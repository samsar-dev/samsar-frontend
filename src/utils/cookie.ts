/**
 * Cookie utilities for session-based authentication
 *
 * This app uses HTTP-only cookies set by the backend for authentication.
 * The frontend doesn't manage JWT tokens directly - all auth is handled via cookies.
 *
 * Session cookies:
 * - session_token: Access token (15 minutes)
 * - refresh_token: Refresh token (7 days)
 */

// Session cookie names (must match backend)
export const SESSION_COOKIE_NAME = "session_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

/**
 * Check if user appears to be logged in based on session cookies
 * Note: This is a basic check - actual auth status is determined by backend
 */
export const hasSessionCookie = (): boolean => {
  // Check if session cookie exists in document.cookie
  const cookies = document.cookie;
  return (
    cookies.includes(`${SESSION_COOKIE_NAME}=`) ||
    cookies.includes(`${REFRESH_COOKIE_NAME}=`)
  );
};

/**
 * Get a specific cookie value by name
 * Used for reading non-httpOnly cookies if needed
 */
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    return cookieValue || null;
  }
  return null;
};

/**
 * Store login timestamp for session persistence tracking
 * This helps determine if user should stay logged in across browser sessions
 */
export const setLoginTimestamp = (): void => {
  const timestamp = new Date().getTime();
  localStorage.setItem("login_timestamp", timestamp.toString());
};

/**
 * Get login timestamp
 */
export const getLoginTimestamp = (): number | null => {
  const timestamp = localStorage.getItem("login_timestamp");
  return timestamp ? parseInt(timestamp, 10) : null;
};

/**
 * Clear login timestamp (on logout)
 */
export const clearLoginTimestamp = (): void => {
  localStorage.removeItem("login_timestamp");
};

/**
 * Check if the login session should persist based on timestamp
 * This helps maintain login state across browser restarts
 */
export const shouldPersistLogin = (): boolean => {
  const loginTime = getLoginTimestamp();
  if (!loginTime) return false;

  // Consider login valid for 7 days (same as refresh token)
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const now = new Date().getTime();

  return now - loginTime < SEVEN_DAYS;
};

/**
 * Store user preferences that should persist across sessions
 */
export const setUserPreference = (key: string, value: any): void => {
  try {
    localStorage.setItem(`user_pref_${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn("Failed to store user preference:", error);
  }
};

/**
 * Get user preference
 */
export const getUserPreference = (
  key: string,
  defaultValue: any = null,
): any => {
  try {
    const stored = localStorage.getItem(`user_pref_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn("Failed to get user preference:", error);
    return defaultValue;
  }
};

/**
 * Clear all user preferences (on logout)
 */
export const clearUserPreferences = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith("user_pref_")) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Clear all auth-related data from localStorage
 * Note: HTTP-only cookies are cleared by the backend
 */
export const clearAuthData = (): void => {
  clearLoginTimestamp();
  clearUserPreferences();

  // Clear any other auth-related localStorage items
  localStorage.removeItem("authTokens"); // Legacy cleanup
  localStorage.removeItem("user_data"); // Legacy cleanup
};

/**
 * Check if we're in a secure context (HTTPS or localhost)
 * Useful for determining cookie security settings
 */
export const isSecureContext = (): boolean => {
  return location.protocol === "https:" || location.hostname === "localhost";
};

/**
 * Get session info for debugging
 */
export const getSessionInfo = () => {
  return {
    hasSessionCookie: hasSessionCookie(),
    loginTimestamp: getLoginTimestamp(),
    shouldPersist: shouldPersistLogin(),
    isSecure: isSecureContext(),
    cookies: document.cookie
      .split(";")
      .map((c) => c.trim())
      .filter(
        (c) =>
          c.includes(SESSION_COOKIE_NAME) || c.includes(REFRESH_COOKIE_NAME),
      ),
  };
};
