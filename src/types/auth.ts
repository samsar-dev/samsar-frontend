import type { User } from "./user";

export type { User };

export interface TokenPayload {
  exp: number;
  iat: number;
  userId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthError {
  code:
    | "INVALID_CREDENTIALS"
    | "ACCOUNT_DISABLED"
    | "EMAIL_NOT_VERIFIED"
    | "NETWORK_ERROR"
    | "UNKNOWN";
  message: string;
  details?: Record<string, any>;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  error?: AuthError;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (
    email: string,
    password: string,
    name: string,
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    messages: boolean;
    listings: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
  };
  preferences: {
    language: string;
    theme: "light" | "dark" | "system";
    timezone: string;
  };
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  bio?: string;
  profilePicture?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UserActivity {
  lastActive: string;
  ip?: string;
  device?: string;
  location?: string;
}
