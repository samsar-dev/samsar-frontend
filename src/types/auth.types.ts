export type AuthErrorCode = 
  | "INVALID_CREDENTIALS" 
  | "ACCOUNT_DISABLED" 
  | "EMAIL_NOT_VERIFIED" 
  | "NETWORK_ERROR" 
  | "UNKNOWN" 
  | "VALIDATION_ERROR"
  | "USER_EXISTS"
  | "REGISTRATION_ERROR"
  | "DATABASE_ERROR"
  | "INVALID_RESPONSE"
  | "TOKEN_EXPIRED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "SERVER_ERROR";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  errors?: any[];
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name?: string;
  profilePicture?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  error?: AuthError;
  data?: {
    user?: AuthUser;
    tokens?: AuthTokens;
    message?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}
