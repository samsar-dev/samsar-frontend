// 🌟 Listing Categories
export enum ListingCategory {
  VEHICLES = "vehicles",
  REAL_ESTATE = "realEstate",
}

// 🌟 Vehicle Types
export enum VehicleType {
  CARS = "CARS",
  MOTORCYCLES = "MOTORCYCLES",
}

// 🌟 Property Types
export enum PropertyType {
  HOUSE = "HOUSE",
  APARTMENT = "APARTMENT",
  CONDO = "CONDO",
  LAND = "LAND",
  COMMERCIAL = "COMMERCIAL",
  OTHER = "OTHER",
}

// 🌟 Vehicle Details
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

// 🌟 Settings Related Enums
export enum LanguageCode {
  EN = "en",
  ES = "es",
  FR = "fr",
  DE = "de",
  AR = "ar",
}

export enum ThemeType {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

// 🌟 UI Related Types
export type ThemeMode = "light" | "dark" | "system";
export type ColorScheme = "blue" | "green" | "purple" | "orange";

// 🌟 Listing Status
export enum ListingStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SOLD = "sold",
  RENTED = "rented",
  PENDING = "pending",
  RESERVED = "reserved",
  PENDING_REVIEW = "pending_review",
}

// 🌟 Listing Action Types
export enum ListingAction {
  SALE = "SALE",
  RENT = "RENT",
}

// 🌟 Report System Enums
export enum ReportType {
  USER = "user",
  LISTING = "listing",
  MESSAGE = "message",
  COMMENT = "comment",
}

export enum ReportStatus {
  PENDING = "pending",
  INVESTIGATING = "investigating",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export enum ReportReason {
  SPAM = "spam",
  INAPPROPRIATE = "inappropriate",
  MISLEADING = "misleading",
  OFFENSIVE = "offensive",
  HARASSMENT = "harassment",
  OTHER = "other",
}

// 🌟 Form State
export interface FormState {
  price?: number | string;
  // Add properties as needed
}

export enum SocketEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  CONNECT_ERROR = "connect_error",
  MESSAGE = "message",
  ERROR = "error",
  NOTIFICATION_NEW = "notification:new",
  MESSAGE_NEW = "message:new",
  MESSAGE_READ = "message:read",
  MESSAGE_SEND = "message:send",
  NOTIFICATION_READ = "notification:read",
  JOIN = "join",
  LEAVE = "leave",
}
