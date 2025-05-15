export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_DISABLED"
  | "EMAIL_NOT_VERIFIED"
  | "VERIFICATION_EXPIRED"
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
  | "SERVER_ERROR"
  | "RATE_LIMIT";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  errors?: any[];
}

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  username: string;
  name?: string;
  profilePicture?: string;
  role: "USER" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
  dateOfBirth?: string;
  street?: string;
  city?: string;

  bio?: string;
  location?: string;
  preferences?: any;

  allowMessaging?: boolean;
  listingNotifications?: boolean;
  messageNotifications?: boolean;
  showEmail?: boolean;
  showOnlineStatus?: boolean;
  showPhoneNumber?: boolean;
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
  retryAfter: Date | null;
}

export interface AuthContextType extends AuthState {
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateAuthUser: (userData: AuthUser) => void;
}
