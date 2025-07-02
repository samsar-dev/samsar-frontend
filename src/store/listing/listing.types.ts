import { Listing } from "@/types/listings";

export enum VehicleType {
  CAR = "car",
  TRUCK = "truck",
  MOTORCYCLE = "motorcycle",
  BUS = "bus",
  VAN = "van",
  TRACTOR = "tractor",
  CONSTRUCTION = "construction",
  OTHER = "other"
}

export interface ListingState {
  currentListing: Listing | null;
  loading: boolean;
  error: string | null;
  formData: any;
  step: number;
  images: (string | File)[];
  deletedImages: string[];
}

export const LISTING_TYPES = {
  CREATE_LISTING: "listing/CREATE_LISTING",
  UPDATE_LISTING: "listing/UPDATE_LISTING",
  SET_CURRENT_LISTING: "listing/SET_CURRENT_LISTING",
  SET_FORM_DATA: "listing/SET_FORM_DATA",
  SET_STEP: "listing/SET_STEP",
  ADD_IMAGE: "listing/ADD_IMAGE",
  REMOVE_IMAGE: "listing/REMOVE_IMAGE",
  SET_LOADING: "listing/SET_LOADING",
  SET_ERROR: "listing/SET_ERROR",
  RESET_STATE: "listing/RESET_STATE",
} as const;

type ListingTypes = typeof LISTING_TYPES[keyof typeof LISTING_TYPES];

export interface ListingAction {
  type: ListingTypes;
  payload?: any;
}
