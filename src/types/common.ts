// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: ValidationError[];
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T> = {
  [K in keyof T]-?: unknown extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Makes all properties in T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Makes all properties in T required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// Form Types
export type FormErrors = {
  [key: string]: string;
};

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};

// Timer Types
export type Timeout = ReturnType<typeof setTimeout>;
export type Interval = ReturnType<typeof setInterval>;

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message?: string;
  timestamp?: string;
  status?: number;
}

// Common UI Types
export interface Dimensions {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

// Common Function Types
export type VoidFunction = () => void;
export type AsyncVoidFunction = () => Promise<void>;
export type ErrorHandler = (error: Error) => void;

// User Types
export interface BaseUser {
  _id: string;
  email: string;
  username: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export type { User } from "./user";

// Settings Types
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  messages: boolean;
  listings: boolean;
  system: boolean;
  desktop: boolean;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private";
  showEmail: boolean;
  showPhone: boolean;
  showOnlineStatus: boolean;
  allowMessagesFrom: "everyone" | "following" | "none";
}

export interface PreferenceSettings {
  language: string;
  theme: "light" | "dark";
  currency: string;
}

export interface AppSettingsData {
  security: SecuritySettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  preferences: PreferenceSettings;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: BaseUser[];
  lastMessage: Message;
  unreadCount: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// Search Types
export interface SearchFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

// Socket Types
import { SocketEvent } from "./enums";

export interface SocketResponse {
  event: SocketEvent;
  data: unknown;
  error?: string;
}

// Listing Types
import type { ReactNode } from "react";

// Route-related types
export interface RouteConfig {
  path: string;
  element: ReactNode;
  protected?: boolean;
  layout?: "default" | "auth" | "minimal";
}

// Theme types aligned with Tailwind
export type ThemeMode = "light" | "dark" | "system";
export type ColorScheme = "blue" | "green" | "purple" | "orange";

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "date"
    | "time"
    | "datetime-local"
    | "month"
    | "week"
    | "color";
  placeholder?: string;
  value?: string | number | boolean;
  defaultValue?: string | number | boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  accept?: string;
  multiple?: boolean;
  options?: SelectOption[];
  validation?: {
    required?: boolean | string;
    pattern?: {
      value: RegExp;
      message: string;
    };
    min?: {
      value: number;
      message: string;
    };
    max?: {
      value: number;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
    validate?: (value: any) => boolean | string;
  };
}

// Image types
export interface ImageFile {
  file: File;
  preview: string;
  uploading?: boolean;
  error?: string;
}

// Location types
export interface Location {
  city: string;
  state?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// ---- pagination.ts ----
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  totalItems: number;
  page: number;
  limit: number;
  hasMore: boolean;
  success?: boolean;
  error?: string | null;
  message?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export interface InfiniteScrollProps<T> {
  data: T[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  loadingComponent?: React.ReactNode;
  className?: string;
}

export interface ComponentData {
  id: string;
  name: string;
  type: string;
  props?: Record<string, any>;
  children?: ComponentData[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    version?: string;
  };
}
