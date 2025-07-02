import { LISTING_TYPES } from "./listing.types";
import { Listing } from "@/types/listings";
import type { AppDispatch } from "../store";
import { validateField as validateFieldUtil } from "@/utils/listingSchemaRedux";
import { VehicleType, PropertyType } from "@/types/enums";

export const setCurrentListing = (listing: Listing | null) => ({
  type: LISTING_TYPES.SET_CURRENT_LISTING,
  payload: listing,
});

export const setFormData = (formData: any) => ({
  type: LISTING_TYPES.SET_FORM_DATA,
  payload: formData,
});

export const setStep = (step: number) => ({
  type: LISTING_TYPES.SET_STEP,
  payload: step,
});

export const addImage = (image: string | File) => ({
  type: LISTING_TYPES.ADD_IMAGE,
  payload: image,
});

export const removeImage = (index: number, isUrl: boolean = false) => ({
  type: LISTING_TYPES.REMOVE_IMAGE,
  payload: { index, isUrl },
});

export const setLoading = (loading: boolean) => ({
  type: LISTING_TYPES.SET_LOADING,
  payload: loading,
});

export const setError = (error: string | null) => ({
  type: LISTING_TYPES.SET_ERROR,
  payload: error,
});

export const resetListingState = () => ({
  type: LISTING_TYPES.RESET_STATE,
});

interface SetFieldValueAction {
  type: typeof LISTING_TYPES.SET_FIELD_VALUE;
  payload: {
    field: string;
    value: any;
  };
}

export const setFieldValue = (field: string, value: any): SetFieldValueAction => ({
  type: LISTING_TYPES.SET_FIELD_VALUE,
  payload: { field, value },
});

interface ValidateFieldAction {
  type: typeof LISTING_TYPES.VALIDATE_FIELD;
  payload: {
    field: string;
    error: string | null;
  };
}

export const validateField = (field: string, value: any, listingType: VehicleType | PropertyType | string): ValidateFieldAction => {
  // Ensure listingType is a valid VehicleType or PropertyType
  const validListingType = typeof listingType === 'string' 
    ? (listingType as VehicleType | PropertyType)
    : listingType;
    
  const error = validateFieldUtil(validListingType, field, value);
  return {
    type: LISTING_TYPES.VALIDATE_FIELD,
    payload: { field, error },
  };
};

// Thunk actions
export const createListing = (formData: FormData) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    // Replace with your actual API call
    // const response = await listingsAPI.create(formData);
    // dispatch(setCurrentListing(response.data));
    console.log('Creating listing with data:', formData);
    return { success: true };
  } catch (error: any) {
    dispatch(setError(error.message));
    return { success: false, error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateListing = (id: string, formData: FormData) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    // Replace with your actual API call
    // const response = await listingsAPI.update(id, formData);
    // dispatch(setCurrentListing(response.data));
    console.log(`Updating listing ${id} with data:`, formData);
    return { success: true };
  } catch (error: any) {
    dispatch(setError(error.message));
    return { success: false, error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchListing = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    // Replace with your actual API call
    // const response = await listingsAPI.getById(id);
    // dispatch(setCurrentListing(response.data));
    console.log('Fetching listing with ID:', id);
    return { success: true };
  } catch (error: any) {
    dispatch(setError(error.message));
    return { success: false, error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};
