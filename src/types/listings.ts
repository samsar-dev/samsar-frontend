import {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
} from "./enums";

export interface ListingFieldSchema {
  name: string;
  label: string;
  type: string;
  section: string;
  required?: boolean;
  options?: string[];
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
  favorite?: boolean;
  listingAction?: "sell" | "rent";
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
}

export interface FormState {
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
  images?: File[];
  features?: string[];
  listingAction?: 'sell' | 'rent';
}