import type {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
  ListingAction,
  ListingStatus,
} from "./enums";

export interface ListingFieldSchema {
  name: string;
  label: string;
  type: string;
  section: string;
  required?: boolean;
  options?: string[];
  dependsOn?: string;
  validate?: (value: any) => string | null;
}

export interface VehicleDetails {
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  color: string;
  condition: Condition;
  features: string[];
  // Additional fields
  interiorColor?: string;
  engine?: string;
  horsepower?: number;
  torque?: number;
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
}

export interface ListingDetails {
  vehicles?: VehicleDetails;
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
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: Category;
  images: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  listingAction: ListingAction;
  status: ListingStatus;
  details?: {
    vehicles?: Record<string, any>;
    realEstate?: Record<string, any>;
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
  success: boolean;
  data?: Listing[];
  message?: string;
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
  listingAction?: "sell" | "rent";
}

// Complete form state with required fields for final submission
export interface FormState
  extends Required<Omit<BaseFormState, "features" | "listingAction">> {
  features?: string[];
  listingAction?: "sell" | "rent";
}