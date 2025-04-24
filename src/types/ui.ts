// ---- components.ts ----
import type { ReactNode, ButtonHTMLAttributes } from "react";
import type { Listing } from "./listings";
import type { User } from "./user";

// Common component props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Button component props
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    BaseProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

// Form field props
export interface FormFieldProps {
  label?: string;
  name: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "tel"
    | "textarea"
    | "select";
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{
    value: string | number;
    label: string;
  }>;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  autoFocus?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

// Listing component props
export interface ListingComponentProps extends BaseProps {
  listing: Listing;
  onEdit?: (listing: Listing) => void;
  onDelete?: (listingId: string) => void;
  showActions?: boolean;
}

// Category related props
export interface CategorySelectorProps extends BaseProps {
  selectedCategory?: string;
  onSelect: (category: string) => void;
}

// Search related props
export interface SearchBarProps extends BaseProps {
  onSearch: (query: string, category?: string, subcategory?: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  category?: string;
  subcategory?: string;
}

// Navigation props
export interface NavLinkProps extends BaseProps {
  to: string;
  icon?: ReactNode;
  active?: boolean;
}

// Modal props
export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

// Profile related props
export interface ProfileCardProps extends BaseProps {
  user: User;
  isEditable?: boolean;
  onEdit?: () => void;
}

// Loading states
export interface LoadingSpinnerProps extends BaseProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export interface ComponentData {
  id: string;
  name: string;
  type: string;
  props?: Record<string, unknown>;
}

export interface UIComponents {
  Button: {
    variant: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size: "sm" | "md" | "lg";
    disabled?: boolean;
  };
  SearchBar: {
    placeholder?: string;
    onSearch: (query: string) => void;
  };
  Modal: {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
  };
}

export type Theme = "light" | "dark";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface UIPreferences {
  fontSize: "small" | "medium" | "large";
  reducedMotion: boolean;
  highContrast: boolean;
  enableAnimations: boolean;
  sidebarCollapsed: boolean;
  denseMode: boolean;
  enableSoundEffects: boolean;
}

export interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  isMobile: boolean;
  isLoading: boolean;
  toastPosition: ToastPosition;
  preferences: UIPreferences;
}

export interface UIContextType extends UIState {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  updatePreferences: (preferences: Partial<UIPreferences>) => void;
  setToastPosition: (position: ToastPosition) => void;
  resetPreferences: () => void;
}

export interface CategoryToggleProps {
  selected: string;
  onChange: (id: string) => void;
  categories: Array<{
    id: string;
    label: string;
    icon: ReactNode;
  }>;
}

export interface ErrorInfo {
  componentStack: string;
}

export interface SearchBarProps {
  onSearch: (query: string, category?: string, subcategory?: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  category?: string;
  subcategory?: string;
}

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  className?: string;
}
