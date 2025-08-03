import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button2";
import type { AuthError } from "@/types/auth.types";

interface AuthFormProps {
  type: "login" | "signup";
  onSuccess?: () => void;
}

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess }) => {
  const isLogin = type === "login";
  const { login, register, error: authError, clearError } = useAuth();

  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (authError) clearError();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await register(formData.email, formData.password, formData.name);
        onSuccess?.();
      }
    } catch (error) {
      const err = error as Error | AuthError;
      console.error(`Failed to ${type}:`, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {authError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{authError.message}</div>
        </div>
      )}

      {!isLogin && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={formData.name}
            onChange={handleChange}
            minLength={2}
          />
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={type === "login" ? "current-password" : "new-password"}
          className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={formData.password}
          onChange={handleChange}
          minLength={8}
        />
      </div>

      {!isLogin && (
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength={8}
          />
        </div>
      )}

      <Button type="submit" fullWidth isLoading={isLoading}>
        {isLogin ? "Sign In" : "Create Account"}
      </Button>
    </form>
  );
};
