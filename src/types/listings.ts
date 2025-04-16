import type {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
  ListingAction,
} from "./enums";

export enum ListingStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  SOLD = "SOLD",
  DELETED = "DELETED"
}

export interface ListingFieldSchema {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' | 'colorpicker' | 'multiselect' | 'toggle';
  section: string;
  required: boolean;
  options?: string[];
  validate?: (value: any) => string | null;
  featureCategory?: 'entertainment' | 'lighting' | 'cameras' | 'safety' | 'climate';
}

export interface VehicleDetails {
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  brakeType: string;
  engineSize: string;
  color: string;
  condition: Condition;
  features: string[];
  // Required fields for bus
  seatingCapacity?: number;
  // Required fields for van
  vanType?: string;
  cargoVolume?: number;
  payloadCapacity?: number;
  // Additional fields
  interiorColor?: string;
  engine?: string;
  horsepower?: number;
  torque?: number;
  previousOwners?: number;
  registrationStatus?: string;
  serviceHistory?: string;
  warranty?: string;
  // Van-specific optional fields
  roofHeight?: string;
  loadingFeatures?: string[];
  refrigeration?: boolean;
  temperatureRange?: string;
  interiorHeight?: string;
  interiorLength?: string;
  drivingAssistance?: string[];
  // Tractor-specific fields
  attachments?: string[];
  fuelTankCapacity?: string;
  tires?: string;
  implementType?: string;
  width?: number;
  weight?: number;
  maxLoadCapacity?: number;
  wheelbase?: number;
  turningRadius?: number;
  powerTakeOff?: boolean;
  frontLoader?: boolean;
  rearLoader?: boolean;
  hydraulicSystem?: string;
  fuelEfficiency?: string;

  // New fields
  drivetrain?: string;
  seatingMaterial?: string;
  seatHeating?: string;
  seatVentilation?: string;
  sunroof?: string;
  airbags?: string;
  parkingSensors?: string;
  backupCamera?: string;
}

export interface TractorDetails extends VehicleDetails {
  horsepower: number;
  attachments: string[];
  fuelTankCapacity: string;
  tires: string;
  features: string[];
  // Required base fields
  vehicleType: VehicleType.TRACTOR;
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  brakeType: string;
  engineSize: string;
  color: string;
  condition: Condition;
  // Optional fields
  interiorColor?: string;
  engine?: string;
  warranty?: string;
  serviceHistory?: string;
  previousOwners?: number;
  registrationStatus?: string;
}

export interface RealEstateDetails {
  propertyType: PropertyType;
  size?: string;
  yearBuilt?: string;
  bedrooms?: string;
  bathrooms?: string;
  condition?: Condition;
  features?: string[];
  
  // Apartment fields
  floor?: string;
  totalFloors?: string;
  parking?: string;
  elevator?: boolean;
  balcony?: boolean;
  storage?: boolean;
  heating?: string;
  cooling?: string;
  furnished?: boolean;
  petsAllowed?: boolean;
  leaseDuration?: string;
  monthlyRent?: string;
  
  // Land fields
  zoning?: string;
  utilitiesAvailable?: string[];
  accessRoad?: string;
  parcelNumber?: string;
  fenced?: boolean;
  topography?: string;
  waterFeatures?: boolean;
  buildable?: boolean;
  environmentalRestrictions?: boolean;
  soilType?: string;
}

export interface ListingDetails {
  vehicles?: VehicleDetails | TractorDetails;
  realEstate?: RealEstateDetails;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Category {
  mainCategory: ListingCategory;
  subCategory: string;
}

export interface Listing {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  location: string;
  images: Array<string | File>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  userId?: string;
  details: ListingDetails;
  listingAction?: ListingAction;
  status?: ListingStatus;
  seller?: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
}

export interface ListingUpdateInput {
  title: string;
  description: string;
  price: number;
  location: string;
  category: Category;
  details?: {
    vehicles?: Record<string, any>;
    realEstate?: Record<string, any>;
  };
  status?: ListingStatus;
}

export interface ListingResponse {
  success: boolean;
  data?: Listing;
  message?: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
}

export interface UserListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Base form state with all fields optional for form handling
export interface BaseFormState {
  title?: string;
  description?: string;
  price?: number | string;
  location?: string;
  category?: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  details?: {
    vehicles?: VehicleDetails;
    realEstate?: RealEstateDetails;
  };
  images?: Array<string | File>;
  features?: string[];
  listingAction?: ListingAction;
}

// Complete form state with required fields for final submission
export interface FormState
  extends Required<Omit<BaseFormState, "features" | "listingAction">> {
  features?: string[];
  listingAction?: ListingAction;
}

export type CategoryFilter = "ALL" | "VEHICLES" | "REAL_ESTATE";

export interface ListingParams {
  category: {
    mainCategory: ListingCategory;
    subCategory?: string;
  };
  vehicleDetails?: {
    make?: string;
    model?: string;
  };
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  preview?: boolean;
  forceRefresh?: string;
}

// Extended listing interface to include savedBy
export interface ExtendedListing extends Listing {
  savedBy?: Array<{ id: string }>;
}
