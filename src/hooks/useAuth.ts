import { useCallback, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import type { AuthContextType } from "../types/auth.types";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function useAuthForm() {
  const { login, register } = useAuth();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        await login(email, password);
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [login],
  );

  const handleSignup = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        await register(email, password, name);
      } catch (error) {
        console.error("Signup failed:", error);
        throw error;
      }
    },
    [register],
  );

  return {
    handleLogin,
    handleSignup,
  };
}
