import React, { 
  createContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  useRef 
} from "react";

import { toast } from "sonner";
import { AuthAPI } from "../api/auth.api";
import { getApiMetrics, getCurrentDomainInfo } from "../api/apiClient";

import type {
  AuthContextType,
  AuthError,
  AuthState,
  AuthUser,
} from "../types/auth.types";

import LoadingSpinner from "@/components/common/LoadingSpinner";

// 🔒 Security Configuration for Auth Context
const AUTH_CONTEXT_CONFIG = {
  AUTH_CHECK_INTERVAL: 300000, // 5 minutes
  SESSION_TIMEOUT_WARNING: 300000, // 5 minutes before expiry
  MAX_IDLE_TIME: 1800000, // 30 minutes
  HEARTBEAT_INTERVAL: 60000, // 1 minute
  SECURITY_CHECK_INTERVAL: 180000, // 3 minutes
} as const;

// 📊 Auth Performance Monitor
class AuthPerformanceTracker {
  private static metrics = {
    authChecks: 0,
    successfulAuths: 0,
    failedAuths: 0,
    averageResponseTime: 0,
    lastAuthCheck: 0,
    sessionDuration: 0,
    idleTime: 0,
  };

  private static startTime = Date.now();

  static recordAuthCheck(success: boolean, responseTime: number): void {
    this.metrics.authChecks++;
    this.metrics.lastAuthCheck = Date.now();
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
    
    if (success) {
      this.metrics.successfulAuths++;
      this.metrics.sessionDuration = Date.now() - this.startTime;
    } else {
      this.metrics.failedAuths++;
    }
  }

  static updateIdleTime(idleTime: number): void {
    this.metrics.idleTime = idleTime;
  }

  static getMetrics() {
    return { 
      ...this.metrics,
      successRate: this.metrics.authChecks > 0 
        ? Math.round((this.metrics.successfulAuths / this.metrics.authChecks) * 100) 
        : 0,
      apiMetrics: getApiMetrics(),
      domainInfo: getCurrentDomainInfo(),
    };
  }

  static reset(): void {
    this.metrics = {
      authChecks: 0,
      successfulAuths: 0,
      failedAuths: 0,
      averageResponseTime: 0,
      lastAuthCheck: 0,
      sessionDuration: 0,
      idleTime: 0,
    };
    this.startTime = Date.now();
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  retryAfter: null,
  isInitialized: false,
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // 🔒 Security and Performance Refs
  const lastActivityRef = useRef<number>(Date.now());
  const authCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const securityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const isIdleRef = useRef<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null, retryAfter: null }));
  };

  const updateAuthUser = (userData: AuthState["user"]) => {
    setState((prev) => ({
      ...prev,
      user: userData,
      error: null,
      retryAfter: null,
    }));
  };

  const handleAuthError = (error: AuthError | null) => {
    if (error?.code === "RATE_LIMIT") {
      toast.error(error.message);
      setState((prev) => ({
        ...prev,
        error,
        retryAfter: new Date(Date.now() + 30000),
      }));
    } else if (error) {
      toast.error(error.message);
      setState((prev) => ({ ...prev, error }));
    }
  };

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth || hasCheckedAuth) {
      console.log(
        "⏭️ Skipping auth check - already checking or already checked",
      );
      return;
    }

    const startTime = Date.now();
    let authSuccess = false;

    try {
      console.log("🔍 Starting auth check...");
      setIsCheckingAuth(true);
      setState((prev) => ({ ...prev, isLoading: true }));
      
      // Update activity on auth check
      updateActivity();

      const response = await AuthAPI.getMe();
      const responseTime = Date.now() - startTime;
      console.log("📡 Auth check response:", response, `(${responseTime}ms)`);

      if (response?.success && response?.data) {
        // User is authenticated
        authSuccess = true;
        const userData = response.data as AuthUser;
        console.log("✅ User authenticated:", userData.name);
        
        // Record successful auth check
        AuthPerformanceTracker.recordAuthCheck(true, responseTime);
        
        setState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          retryAfter: null,
          isInitialized: true,
        });
      } else {
        console.log("❌ User not authenticated - response:", response);
        
        // Record failed auth check
        AuthPerformanceTracker.recordAuthCheck(false, responseTime);
        
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          retryAfter: null,
          isInitialized: true,
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error("❌ Unexpected auth check error:", error, `(${responseTime}ms)`);
      
      // Record failed auth check
      AuthPerformanceTracker.recordAuthCheck(false, responseTime);
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Failed to verify authentication",
        },
        retryAfter: null,
        isInitialized: true,
      });
    } finally {
      setIsCheckingAuth(false);
      setHasCheckedAuth(true);
      
      // Log final auth check result
      const totalTime = Date.now() - startTime;
      console.log(`📈 Auth check completed in ${totalTime}ms - Success: ${authSuccess}`);
    }
  }, [isCheckingAuth, hasCheckedAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if we're still in rate limit cooldown
      if (state.retryAfter && state.retryAfter > new Date()) {
        const secondsLeft = Math.ceil(
          (state.retryAfter.getTime() - Date.now()) / 1000,
        );
        toast.error(`Please wait ${secondsLeft} seconds before trying again`);
        return false;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await AuthAPI.login(email, password);

      if (!response?.success) {
        // Special handling for email verification errors
        if (
          response?.error?.code === "EMAIL_NOT_VERIFIED" ||
          response?.error?.code === "VERIFICATION_EXPIRED"
        ) {
          // Don't handle this error here, let the component handle it for redirection
          throw { response: { data: { error: response.error } } };
        }

        handleAuthError(response?.error || null);
        return false;
      }

      console.log("Login UserData >>>>>>>>>>>>>>>>>>>>>", response.data);

      const { user, tokens } = response.data as {
        user: AuthState["user"];
        tokens: any;
      };
      if (!user || !tokens) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: {
            code: "INVALID_RESPONSE",
            message: "Invalid response from server",
          },
        }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        retryAfter: null,
      }));
      return true;
    } catch (error) {
      // Clear any existing session, but don't let it block error reporting
      try {
        await AuthAPI.logout();
      } catch (logoutError) {
        console.error("Failed to clear session during login error:", logoutError);
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Login failed",
        },
      }));
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    try {
      // Check if we're still in rate limit cooldown
      if (state.retryAfter && state.retryAfter > new Date()) {
        const secondsLeft = Math.ceil(
          (state.retryAfter.getTime() - Date.now()) / 1000,
        );
        toast.error(`Please wait ${secondsLeft} seconds before trying again`);
        return false;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Call the API with the parameters directly
      const response = await AuthAPI.register(email, password, name);

      if (!response?.success) {
        // Special handling for email verification errors
        if (
          response?.error?.code === "EMAIL_NOT_VERIFIED" ||
          response?.error?.code === "VERIFICATION_EXPIRED"
        ) {
          // Don't handle this error here, let the component handle it for redirection
          throw { response: { data: { error: response.error } } };
        }

        handleAuthError(response?.error || null);
        return false;
      }

      const { user, tokens } = response.data as {
        user: AuthState["user"];
        tokens: any;
      };
      if (!user || !tokens) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: {
            code: "INVALID_RESPONSE",
            message: "Invalid response from server",
          },
        }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        retryAfter: null,
      }));
      return true;
    } catch (error) {
      // Clear any existing session, but don't let it block error reporting
      try {
        await AuthAPI.logout();
      } catch (logoutError) {
        console.error("Failed to clear session during registration error:", logoutError);
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: {
          code: "REGISTRATION_ERROR",
          message:
            error instanceof Error ? error.message : "Registration failed",
        },
      }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("🚪 Starting logout process...");
      // Show loading state
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      await AuthAPI.logout();
      setState({ ...initialState, isInitialized: true });
      window.location.href = "/";
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: { code: "UNAUTHORIZED", message: "Logout failed" },
      }));
    }
  };

  // 🔒 Security Monitoring Functions
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    isIdleRef.current = false;
    AuthPerformanceTracker.updateIdleTime(0);
  }, []);

  const checkIdleStatus = useCallback(() => {
    const now = Date.now();
    const idleTime = now - lastActivityRef.current;
    
    if (idleTime > AUTH_CONTEXT_CONFIG.MAX_IDLE_TIME && !isIdleRef.current) {
      isIdleRef.current = true;
      console.log('⚠️ User has been idle for too long, logging out for security');
      logout();
      toast.warning('You have been logged out due to inactivity');
    }
    
    AuthPerformanceTracker.updateIdleTime(idleTime);
  }, [logout]);

  const performSecurityCheck = useCallback(async () => {
    try {
      const metrics = AuthPerformanceTracker.getMetrics();
      console.log('📊 Auth Performance Metrics:', metrics);
      
      // Check for suspicious activity patterns
      if (metrics.failedAuths > 5 && metrics.successRate < 50) {
        console.warn('⚠️ Suspicious authentication activity detected');
        toast.warning('Multiple authentication failures detected. Please verify your account security.');
      }
      
      // Check API performance
      if (metrics.averageResponseTime > 5000) {
        console.warn('⚠️ Slow API response times detected');
      }
      
    } catch (error) {
      console.error('❌ Security check failed:', error);
    }
  }, []);

  const value: AuthContextType = useMemo(() => ({ 
    ...state,
    login,
    register,
    logout,
    clearError,
    updateAuthUser,
    checkAuth,
    isInitialized: !isInitializing,
  }), [state, login, register, logout, clearError, updateAuthUser, checkAuth, isInitializing]);

  // Initialize auth state once on mount
  useEffect(() => {
    console.log("🔄 AuthContext useEffect triggered", {
      hasCheckedAuth,
      isInitializing,
      isCheckingAuth,
    });
    if (!hasCheckedAuth && !isCheckingAuth) {
      console.log("🚀 Running initial auth check...");
      checkAuth().finally(() => {
        setIsInitializing(false);
      });
    } else {
      console.log("⏭️ Skipping auth check:", {
        hasCheckedAuth,
        isCheckingAuth,
      });
      setIsInitializing(false);
    }
  }, [hasCheckedAuth, checkAuth, isCheckingAuth]);

  // 🔒 Security Monitoring Effects
  useEffect(() => {
    // Set up activity listeners
    const handleActivity = () => updateActivity();
    
    // Listen for user activity
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    
    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [updateActivity]);

  // Set up periodic security checks
  useEffect(() => {
    if (!state.isAuthenticated) {
      return undefined; // No cleanup needed when not authenticated
    }

    // Idle check interval
    const idleCheckInterval = setInterval(checkIdleStatus, 60000); // Check every minute
    
    // Security check interval
    securityCheckIntervalRef.current = setInterval(
      performSecurityCheck, 
      AUTH_CONTEXT_CONFIG.SECURITY_CHECK_INTERVAL
    );
    
    // Auth check interval
    authCheckIntervalRef.current = setInterval(
      checkAuth, 
      AUTH_CONTEXT_CONFIG.AUTH_CHECK_INTERVAL
    );
    
    // Heartbeat interval
    heartbeatIntervalRef.current = setInterval(() => {
      console.log('💓 Auth heartbeat - session active');
    }, AUTH_CONTEXT_CONFIG.HEARTBEAT_INTERVAL);
    
    return () => {
      clearInterval(idleCheckInterval);
      if (securityCheckIntervalRef.current) {
        clearInterval(securityCheckIntervalRef.current);
      }
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [state.isAuthenticated, checkIdleStatus, performSecurityCheck, checkAuth]);

  // Reset performance tracker on logout
  useEffect(() => {
    if (!state.isAuthenticated) {
      AuthPerformanceTracker.reset();
      sessionStartRef.current = Date.now();
    }
  }, [state.isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {state.isLoading && isInitializing ? (
        <div
          className="flex h-screen w-full items-center justify-center bg-gray-50"
          role="status"
          aria-live="polite"
        >
          <LoadingSpinner
            size="lg"
            label="Initializing authentication..."
            ariaLive="polite"
            ariaAtomic={true}
          />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};