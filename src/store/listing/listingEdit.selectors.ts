import type { RootState } from "../store";

// Selectors for listing edit slice
export const selectCurrentListing = (state: RootState) => state.listingEdit.currentListing;
export const selectFormData = (state: RootState) => state.listingEdit.formData;
export const selectStep = (state: RootState) => state.listingEdit.step;
export const selectImages = (state: RootState) => state.listingEdit.images;
export const selectDeletedImages = (state: RootState) => state.listingEdit.deletedImages;
export const selectLoading = (state: RootState) => state.listingEdit.loading;
export const selectError = (state: RootState) => state.listingEdit.error;

// Selectors for listing details slice
export const selectListingDetails = (state: RootState) => state.listingDetails.listing;
export const selectDetailsLoading = (state: RootState) => state.listingDetails.loading;
export const selectDetailsError = (state: RootState) => state.listingDetails.error;
