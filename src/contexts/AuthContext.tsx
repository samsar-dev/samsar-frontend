import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI } from '../api/auth.api';
import TokenManager from '../utils/tokenManager';
import type { AuthState, AuthContextType } from '../types/auth.types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const checkAuth = async () => {
    try {
      // Initialize token manager first
      await TokenManager.initialize();

      if (!TokenManager.hasValidTokens()) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null
        }));
        return;
      }

      const response = await AuthAPI.getMe();
      
      // Early return if response is invalid
      if (!response?.success || !response?.data) {
        TokenManager.clearTokens();
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        }));
        return;
      }

      // Type assertion to ensure response.data.user exists
      const { user } = response.data as { user: AuthState['user'] };
      
      if (!user) {
        TokenManager.clearTokens();
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: {
            code: "INVALID_RESPONSE",
            message: "Invalid user data received"
          }
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      TokenManager.clearTokens();
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Failed to authenticate"
        }
      }));
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await AuthAPI.login(email, password);

      if (!response?.success) {
        throw new Error(response?.error?.message || "Login failed");
      }

      const { user, tokens } = response.data as { user: AuthState['user'], tokens: any };
      if (!user || !tokens) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: {
            code: "INVALID_RESPONSE",
            message: "Invalid response from server"
          }
        }));
        return false;
      }

      // Store tokens
      TokenManager.setTokens(tokens);

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Login failed"
        }
      }));
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await AuthAPI.register(username, email, password);

      if (!response?.success) {
        throw new Error(response?.error?.message || "Registration failed");
      }

      const { user, tokens } = response.data as { user: AuthState['user'], tokens: any };
      if (!user || !tokens) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: {
            code: "INVALID_RESPONSE",
            message: "Invalid response from server"
          }
        }));
        return false;
      }

      // Store tokens
      TokenManager.setTokens(tokens);

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: {
          code: "REGISTRATION_ERROR",
          message: error instanceof Error ? error.message : "Registration failed"
        }
      }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await AuthAPI.logout();
    TokenManager.clearTokens();
    setState(initialState);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
