import type { RootState } from "../store";

export const selectCurrentListing = (state: RootState) => state.listing.currentListing;
export const selectFormData = (state: RootState) => state.listing.formData;
export const selectStep = (state: RootState) => state.listing.step;
export const selectImages = (state: RootState) => state.listing.images;
export const selectDeletedImages = (state: RootState) => state.listing.deletedImages;
export const selectLoading = (state: RootState) => state.listing.loading;
export const selectError = (state: RootState) => state.listing.error;
