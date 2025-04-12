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
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: Category;
  subCategory: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  listingAction: ListingAction | null;
  status: ListingStatus | null;
  details?: ListingDetails;
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
  items: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
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
  listingAction?: "sell" | "rent";
}

// Complete form state with required fields for final submission
export interface FormState
  extends Required<Omit<BaseFormState, "features" | "listingAction">> {
  features?: string[];
  listingAction?: "sell" | "rent";
}
