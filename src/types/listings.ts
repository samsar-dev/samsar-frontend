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
  DELETED = "DELETED",
}

interface FeatureItem {
  name: string;
  label: string;
  type: "toggle" | "checkbox";
}

interface FeatureGroup {
  label: string;
  features: FeatureItem[];
}

interface FeatureGroups {
  [key: string]: FeatureGroup;
}

export interface ListingFieldSchema {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "select"
    | "textarea"
    | "checkbox"
    | "date"
    | "colorpicker"
    | "multiselect"
    | "toggle"
    | "featureGroup";
  section: string;
  required: boolean;
  options?: string[];
  validate?: (value: any) => string | null;
  featureGroups?: FeatureGroups;
  featureCategory?:
    | "entertainment"
    | "lighting"
    | "cameras"
    | "safety"
    | "climate";
}

export interface BaseVehicleDetails {
  make: string;
  model: string;
  year: number;
  mileage?: number;
  fuelType?: FuelType;
  transmissionType?: TransmissionType;
  color?: string;
  interiorColor?: string;
  condition?: Condition;
  features?: string[];
  engineNumber?: string;
  vin?: string;
  engineSize?: number;
  previousOwners?: number;
  serviceHistory?: string;
  accidentFree?: boolean;
  importStatus?: string;
  registrationExpiry?: string;
  warranty?: string;
  insuranceType?: string;
  upholsteryMaterial?: string;
  tireCondition?: string;
}

export interface CarDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.CAR;
}

export interface MotorcycleDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.MOTORCYCLE;
}

export interface TruckDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.TRUCK;
  cargoCapacity?: number;
}

export interface VanDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.VAN;
  cargoVolume?: number;
}

export interface BusDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.BUS;
  seatingCapacity?: number;
}

export interface TractorDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.TRACTOR;
  powerOutput?: number;
}

export type VehicleDetails = 
  | CarDetails 
  | MotorcycleDetails 
  | TruckDetails 
  | VanDetails 
  | BusDetails 
  | TractorDetails;

export interface BasePropertyDetails {
  size?: number;
  yearBuilt?: number;
  condition?: Condition;
  features?: string[];
  furnished?: boolean;
  utilities?: boolean;
}

export interface HouseDetails extends BasePropertyDetails {
  propertyType: PropertyType.HOUSE;
  bedrooms: number;
  bathrooms: number;
  floors?: number;
  parkingSpaces?: number;
  garage?: boolean;
  garden?: boolean;
  petsAllowed?: boolean;
}

export interface ApartmentDetails extends BasePropertyDetails {
  propertyType: PropertyType.APARTMENT;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  parkingSpaces?: number;
  elevator?: boolean;
  balcony?: boolean;
  storage?: boolean;
  petsAllowed?: boolean;
}

export interface LandDetails extends BasePropertyDetails {
  propertyType: PropertyType.LAND;
  zoning?: string;
  utilities?: boolean;
  roadAccess?: boolean;
  buildable?: boolean;
  fenced?: boolean;
  waterFeatures?: boolean;
  soilType?: string;
}

export type RealEstateDetails = 
  | HouseDetails 
  | ApartmentDetails 
  | LandDetails;

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
  sortOrder?: "asc" | "desc";
  preview?: boolean;
  forceRefresh?: string;
}

// Extended listing interface to include savedBy
export interface ExtendedListing extends Listing {
  savedBy?: Array<{ id: string }>;
}
