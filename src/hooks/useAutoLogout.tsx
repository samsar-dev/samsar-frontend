import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "@/api/auth.api";
import { useAuth } from "./useAuth";

interface UseAutoLogoutOptions {
  autoLogoutTime?: number;
  onWarning?: () => void;
  onLogout?: () => void;
}

const DEFAULT_INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes (refresh before 15-minute session expires)

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

    const warningTime = autoLogoutTime - 1 * 60 * 60 * 1000; // 1 hour before logout

    // Set warning timeout
    if (onWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        onWarning();
      }, warningTime);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        // First try to refresh the token
        await AuthAPI.refreshTokens();
        // Reset the timer
        resetTimer();
      } catch (error) {
        // If refresh fails, proceed with logout
        await logout();
        onLogout?.();
        navigate("/login");
      }
    }, autoLogoutTime);

    // Refresh token periodically
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    refreshIntervalRef.current = setInterval(async () => {
      try {
        await AuthAPI.refreshTokens();
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, [autoLogoutTime, onWarning, onLogout, navigate, logout]);

  // Reset timer on user activity
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Listen for user activity
  useEffect(() => {
    const handleMouseMove = () => handleActivity();
    const handleKeyPress = () => handleActivity();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keypress", handleKeyPress);

    // Initial reset
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [handleActivity, resetTimer]);

  return {};
};
