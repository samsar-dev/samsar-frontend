import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AuthAPI } from "../api/auth.api";
import { apiClient } from "../api/apiClient";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type {
  AuthContextType,
  AuthError,
  AuthState,
  AuthErrorCode,
  AuthUser,
} from "../types/auth.types";


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
  const [isLoading, setIsLoading] = useState(true);
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
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await AuthAPI.getMe();
      
      if (response?.success && response?.data) {
        // The response.data should be of type AuthUser
        const userData = response.data as AuthUser;
        setState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          retryAfter: null,
        });
      } else {
        // Not authenticated or invalid response
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: response?.error || {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated'
          },
          retryAfter: null,
        });
      }
    } catch (error) {
      // Log error but don't show toast
      console.error("Auth check error:", error);
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        retryAfter: null,
      }));
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Initialize auth state once on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // Clear any existing session
      await AuthAPI.logout();
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
      // Clear any existing session
      await AuthAPI.logout();
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
      setState({
        ...initialState,
        isLoading: false, // explicitly reset loading
      });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateAuthUser,
    isInitialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
