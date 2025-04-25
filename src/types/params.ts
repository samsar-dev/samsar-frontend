import {
  ListingCategory,
  VehicleType,
  PropertyType,
  ListingStatus,
} from "./enums";

export interface ListingParams {
  category?: {
    mainCategory?: ListingCategory;
    subCategory?: VehicleType | PropertyType;
  };
  vehicleDetails?: {
    make?: string;
    model?: string;
  };
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  preview?: boolean; // Add preview flag to get minimal listing data
  search?: string;
  userId?: string;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  listingAction?: "SELL" | "RENT";
  forceRefresh?: boolean;
}
