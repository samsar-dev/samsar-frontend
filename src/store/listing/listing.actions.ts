import { LISTING_TYPES } from "./listing.types";
import { Listing } from "@/types/listings";
import type { AppDispatch } from "../store";

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
