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
  // const [refersh]

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
      setState((prev) => ({ ...prev, isLoading: true }));

      // Initialize token manager
      const initialized = await TokenManager.initialize();

      if (!initialized) {
        // Try to refresh tokens before giving up
        const refreshed = await TokenManager.refreshTokensWithFallback();
        if (refreshed) {
          return checkAuth();
        }

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
      console.log("Auth Response >>>>>>>>>>>>>>>>>>>>>", response);
      if (!response?.success || !response?.data) {
        // Try to refresh tokens before failing
        const refreshed = await TokenManager.refreshTokensWithFallback();
        if (refreshed) {
          return checkAuth();
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

      const user = response.data as AuthState["user"];
      console.log("Authenticated user:>>>>>>>>>>>>>>>>>>>>", user);

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
      // Try to refresh tokens before failing
      // const refreshed = await TokenManager.refreshTokensWithFallback();
      // if (refreshed) {
      //   return checkAuth();
      // }

      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: {
          code: "NETWORK_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to authenticate",
        },
      }));
      setIsInitialized(true);
    }
  };

  // Initialize auth state when component mounts
  useEffect(() => {
    console.log("AuthContext mounted, initializing auth state...");
    checkAuth();

    // Add event listener for storage changes to handle login/logout in other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "authTokens") {
        console.log(
          "Auth tokens changed in another tab, refreshing auth state..."
        );
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
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
    email: string,
    password: string,
    name: string
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
