import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthAPI } from "../api/auth.api";

import type {
  AuthContextType,
  AuthError,
  AuthState,
  AuthErrorCode,
  AuthUser,
} from "../types/auth.types";

import LoadingSpinner from "@/components/common/LoadingSpinner";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  retryAfter: null,
  isInitialized: false,
};

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);
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
    if (isCheckingAuth || hasCheckedAuth || !isInitialized) {
      return;
    }

    try {
      setIsCheckingAuth(true);
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await AuthAPI.getMe();

      if (response?.success && response?.data) {
        // User is authenticated
        const userData = response.data as AuthUser;
        console.log("✅ User authenticated:", userData.name);
        setState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          retryAfter: null,
          isInitialized: true,
        });
      } else {
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
      console.error("❌ Unexpected auth check error:", error);
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
    }
  }, [isCheckingAuth, hasCheckedAuth, isInitialized]);

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
      console.log("🚪 Starting logout process...");
      // Show loading state
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      await AuthAPI.logout();
      setState({ ...initialState, isInitialized: true });
      window.location.href = '/';
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      setState(prev => ({ ...prev, isLoading: false, error: { code: 'UNAUTHORIZED', message: 'Logout failed' } }));
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateAuthUser,
    checkAuth,
    isInitialized,
  };

  // Initialize auth state once on mount
  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {state.isLoading && !isInitialized ? (
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