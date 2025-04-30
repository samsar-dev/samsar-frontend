import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AuthAPI } from "../api/auth.api";
import type {
  AuthContextType,
  AuthError,
  AuthState,
} from "../types/auth.types";
import TokenManager from "../utils/tokenManager";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  retryAfter: null,
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

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

  const checkAuth = async () => {
    try {
      // Initialize token manager first
      const initialized = await TokenManager.initialize();
      if (!initialized) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
        }));
        setIsInitialized(true);
        return;
      }

      // Try to get user info
      const response = await AuthAPI.getMe();

      if (!response?.success || !response?.data) {
        // Only clear tokens if we're sure the error is auth-related
        if (response?.error?.code === 'UNAUTHORIZED' || response?.error?.code === 'TOKEN_EXPIRED') {
          TokenManager.clearTokens();
        }
        setState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: response?.error || null,
        }));
        setIsInitialized(true);
        return;
      }

      const { user } = response.data as { user: AuthState["user"] };

      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        retryAfter: null,
      }));
      setIsInitialized(true);
    } catch (error) {
      console.error("Auth check error:", error);
      // Only clear tokens for specific error types
      if (error instanceof Error && 
          (error.message.includes('token') || error.message.includes('unauthorized'))) {
        TokenManager.clearTokens();
      }
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Failed to authenticate",
        },
      }));
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if we're still in rate limit cooldown
      if (state.retryAfter && state.retryAfter > new Date()) {
        const secondsLeft = Math.ceil(
          (state.retryAfter.getTime() - Date.now()) / 1000
        );
        toast.error(`Please wait ${secondsLeft} seconds before trying again`);
        return false;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await AuthAPI.login(email, password);

      if (!response?.success) {
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

      // Store tokens
      TokenManager.setTokens(tokens);

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
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      // Check if we're still in rate limit cooldown
      if (state.retryAfter && state.retryAfter > new Date()) {
        const secondsLeft = Math.ceil(
          (state.retryAfter.getTime() - Date.now()) / 1000
        );
        toast.error(`Please wait ${secondsLeft} seconds before trying again`);
        return false;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      const response = await AuthAPI.register(formData);

      if (!response?.success) {
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

      // Store tokens
      TokenManager.setTokens(tokens);

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
      await AuthAPI.logout();
    } catch (error) {
      console.error("Logout API failed:", error); // Log or handle if needed
    } finally {
      TokenManager.clearTokens();
      setState({
        ...initialState,
        isLoading: false, // explicitly reset loading
      });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateAuthUser,
    isInitialized,
  };

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
