// 📁 /types/index.ts

// 🌟 Base Types
export type {
  APIResponse,
  PaginatedData,
  FilterParams,
  PaginationParams,
  SearchParams,
} from "./api";

// 🌟 Common Types
export type {
  ComponentData,
  SelectOption,
  ThemeMode,
  ColorScheme,
  LoadingState,
  VoidFunction,
  AsyncVoidFunction,
  ErrorHandler,
  DeepPartial,
  DeepRequired,
} from "./common";

// 🌟 Listing Types
export enum ListingCategory {
  VEHICLES = "VEHICLES",
  REAL_ESTATE = "REAL_ESTATE",
}

export enum VehicleType {
  CARS = "CARS",
  MOTORCYCLES = "MOTORCYCLES",
}

export enum PropertyType {
  HOUSE = "HOUSE",
  APARTMENT = "APARTMENT",
  CONDO = "CONDO",
  LAND = "LAND",
  COMMERCIAL = "COMMERCIAL",
  OTHER = "OTHER",
}

export enum FuelType {
  GASOLINE = "gasoline",
  DIESEL = "diesel",
  ELECTRIC = "electric",
  HYBRID = "hybrid",
  PLUGIN_HYBRID = "pluginHybrid",
  LPG = "lpg",
  CNG = "cng",
  OTHER = "other",
}

export enum TransmissionType {
  AUTOMATIC = "automatic",
  MANUAL = "manual",
  OTHER = "other",
}

export enum Condition {
  NEW = "new",
  LIKE_NEW = "likeNew",
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  SALVAGE = "salvage",
}

export enum ListingAction {
  SALE = "sale",
  RENT = "rent",
}

export enum ListingStatus {
  ACTIVE = "ACTIVE",
  SOLD = "SOLD",
  RENTED = "RENTED",
  EXPIRED = "EXPIRED",
  ARCHIVED = "ARCHIVED",
}

export interface VehicleDetails {
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: string;
  mileage?: string;
  fuelType?: FuelType;
  transmissionType?: TransmissionType;
  color?: string;
  condition?: Condition;
  features?: string[];
  bodyType?: string;
  bodyStyle?: string; // Alias for bodyType for backward compatibility
}

export interface RealEstateDetails {
  propertyType: PropertyType;
  size: string;
  yearBuilt?: string;
  bedrooms: string;
  bathrooms: string;
  condition?: Condition;
  features?: string[];
}

export interface ListingDetails {
  vehicles?: VehicleDetails;
  realEstate?: RealEstateDetails;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  location: string;
  condition?: Condition;
  listingAction: ListingAction;
  status: ListingStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  details: ListingDetails;
}

export interface FormState {
  title: string;
  description: string;
  price: number | string;
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  location: string;
  images: Array<string | File>;
  details: ListingDetails;
  features?: string[];
  listingAction: ListingAction;
  condition?: Condition;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
}

// 🌟 Message Types
export type {
  Message,
  MessageInput,
  Conversation,
  ConversationCreateInput,
} from "./messaging";

// 🌟 Socket Types
export type {
  SocketEventType,
  SocketMessage,
  SocketEventData,
  UseSocketOptions,
  SocketContextData,
} from "./socket";

// 🌟 UI Types
export type { ToastPosition, UIPreferences, UIContextType, Theme } from "./ui";

// 🌟 User Types
export type { User, UserProfile, UserUpdateInput } from "./user";

// 🌟 Settings Types
export type { Settings, SettingsUpdate } from "./settings";

// 🌟 Auth Types
export type { AuthError, AuthState, AuthContextType } from "./auth";

// Export all enums
export {
  LanguageCode,
  ThemeType,
  ReportType,
  ReportStatus,
  ReportReason,
} from "./enums";
