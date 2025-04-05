import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "@/api/auth.api";
import { useAuth } from "./useAuth";

interface UseAutoLogoutOptions {
  autoLogoutTime?: number;
  onWarning?: () => void;
  onLogout?: () => void;
}

const DEFAULT_INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useAutoLogout = ({
  autoLogoutTime = DEFAULT_INACTIVITY_TIMEOUT,
  onWarning,
  onLogout,
}: UseAutoLogoutOptions = {}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Reset inactivity timers and refresh token
  const resetTimer = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    const warningTime = autoLogoutTime - 5 * 60 * 1000; // 5 minutes before logout

    // Set warning timeout
    if (onWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        onWarning();
      }, warningTime);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await logout();
        onLogout?.();
        navigate("/login");
      } catch (error) {
        console.error("Failed to logout:", error);
      }
    }, autoLogoutTime);

    // Refresh token to maintain session
    try {
      const response = await AuthAPI.refreshToken();
      if (!response.success && response.error) {
        // Token refresh failed, log out user
        await logout();
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }, [autoLogoutTime, navigate, onWarning, onLogout, logout]);

  useEffect(() => {
    resetTimer();

    const handleActivity = () => resetTimer();
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => document.addEventListener(event, handleActivity));

    // Setup periodic token refresh
    refreshIntervalRef.current = setInterval(async () => {
      try {
        const response = await AuthAPI.refreshToken();
        if (!response.success && response.error) {
          // Token refresh failed, log out user
          await logout();
          navigate("/login");
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      events.forEach((event) =>
        document.removeEventListener(event, handleActivity),
      );
    };
  }, [resetTimer, logout, navigate]);
};
