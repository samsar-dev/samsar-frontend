import type { RootState } from "../store";
import type { Listing } from "@/types/listings";

// Select the entire listing details state
const selectListingDetailsState = (state: RootState) => state.listingDetails;

// Select the listing object
export const selectListing = (state: RootState): Listing | null =>
  selectListingDetailsState(state).listing;

// Select loading state
export const selectLoading = (state: RootState): boolean =>
  selectListingDetailsState(state).loading;

// Select error message
export const selectError = (state: RootState): string | null =>
  selectListingDetailsState(state).error;

// Select message form visibility
export const selectShowMessageForm = (state: RootState): boolean =>
  selectListingDetailsState(state).showMessageForm;

// Select current message content
export const selectMessage = (state: RootState): string =>
  selectListingDetailsState(state).message;

// Select current message type
export const selectMessageType = (
  state: RootState,
): "question" | "offer" | "meeting" =>
  selectListingDetailsState(state).messageType;

// Select message success state
export const selectMessageSuccess = (state: RootState): boolean =>
  selectListingDetailsState(state).messageSuccess;

// Export all selectors
export const listingDetailsSelectors = {
  selectListing,
  selectLoading,
  selectError,
  selectShowMessageForm,
  selectMessage,
  selectMessageType,
  selectMessageSuccess,
};
