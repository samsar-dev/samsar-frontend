// 🌟 Listing Categories
export enum ListingCategory {
  VEHICLES = "vehicles",
  REAL_ESTATE = "realEstate",
}

// 🌟 Vehicle Types
export enum VehicleType {
  CAR = 'CAR',
  TRUCK = 'TRUCK',
  MOTORCYCLE = 'MOTORCYCLE',
  RV = 'RV',
  BOAT = 'BOAT',
  BUS = 'BUS',
  VAN = 'VAN',
  TRACTOR = 'TRACTOR',
  CONSTRUCTION = 'CONSTRUCTION',
  OTHER = 'OTHER',
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
  SEMI_AUTOMATIC = "semiAutomatic",
  CONTINUOUSLY_VARIABLE = "continuouslyVariable",
  DUAL_CLUTCH = "dualClutch",
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

export enum ListingAction {
  SELL = "sell",
  RENT = "rent",
}
