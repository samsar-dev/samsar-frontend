import type { Listing, ListingFieldSchema } from "@/types/listings";
import { VehicleType, PropertyType } from "@/types/enums";

export { VehicleType, PropertyType };

export const LISTING_TYPES = {
  // Basic CRUD operations
  CREATE_LISTING: "listing/CREATE_LISTING",
  UPDATE_LISTING: "listing/UPDATE_LISTING",
  SET_CURRENT_LISTING: "listing/SET_CURRENT_LISTING",
  SET_FORM_DATA: "listing/SET_FORM_DATA",
  SET_FIELD_VALUE: "listing/SET_FIELD_VALUE",
  VALIDATE_FIELD: "listing/VALIDATE_FIELD",
  SET_STEP: "listing/SET_STEP",

  // Media handling
  ADD_IMAGE: "listing/ADD_IMAGE",
  REMOVE_IMAGE: "listing/REMOVE_IMAGE",

  // State management
  SET_LOADING: "listing/SET_LOADING",
  SET_ERROR: "listing/SET_ERROR",
  RESET_STATE: "listing/RESET_STATE",

  // Schema handling
  SET_SCHEMA: "listing/SET_SCHEMA",
  SET_ACTIVE_SCHEMA: "listing/SET_ACTIVE_SCHEMA",
} as const;

export interface ListingState {
  currentListing: Listing | null;
  formData: Record<string, any>;
  step: number;
  images: (string | File)[];
  deletedImages: string[];
  loading: boolean;
  error: string | null;

  // Schema related
  schema: ListingFieldSchema[];
  activeSchema: ListingFieldSchema[];
  validationErrors: Record<string, string>;
  listingType?: VehicleType | PropertyType | string;
}

export type ListingAction =
  | { type: typeof LISTING_TYPES.CREATE_LISTING; payload: Listing }
  | { type: typeof LISTING_TYPES.UPDATE_LISTING; payload: Listing }
  | { type: typeof LISTING_TYPES.SET_CURRENT_LISTING; payload: Listing | null }
  | { type: typeof LISTING_TYPES.SET_FORM_DATA; payload: Record<string, any> }
  | {
      type: typeof LISTING_TYPES.SET_FIELD_VALUE;
      payload: { field: string; value: any };
    }
  | {
      type: typeof LISTING_TYPES.VALIDATE_FIELD;
      payload: { field: string; error: string | null };
    }
  | { type: typeof LISTING_TYPES.SET_STEP; payload: number }
  | { type: typeof LISTING_TYPES.ADD_IMAGE; payload: string | File }
  | {
      type: typeof LISTING_TYPES.REMOVE_IMAGE;
      payload: { index: number; isUrl: boolean };
    }
  | { type: typeof LISTING_TYPES.SET_LOADING; payload: boolean }
  | { type: typeof LISTING_TYPES.SET_ERROR; payload: string | null }
  | { type: typeof LISTING_TYPES.SET_SCHEMA; payload: ListingFieldSchema[] }
  | {
      type: typeof LISTING_TYPES.SET_ACTIVE_SCHEMA;
      payload: ListingFieldSchema[];
    }
  | { type: typeof LISTING_TYPES.RESET_STATE };
