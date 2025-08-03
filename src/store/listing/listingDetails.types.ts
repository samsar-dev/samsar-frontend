import type { Listing } from "@/types/listings";

export const LISTING_DETAILS_TYPES = {
  // Basic operations
  FETCH_LISTING_DETAILS: "listingDetails/FETCH_LISTING_DETAILS",
  SET_LISTING_DETAILS: "listingDetails/SET_LISTING_DETAILS",
  SET_LOADING: "listingDetails/SET_LOADING",
  SET_ERROR: "listingDetails/SET_ERROR",
  RESET_STATE: "listingDetails/RESET_STATE",

  // Message handling
  SEND_MESSAGE: "listingDetails/SEND_MESSAGE",
  SET_MESSAGE_FORM_VISIBILITY: "listingDetails/SET_MESSAGE_FORM_VISIBILITY",
  SET_MESSAGE: "listingDetails/SET_MESSAGE",
  SET_MESSAGE_TYPE: "listingDetails/SET_MESSAGE_TYPE",
  SET_MESSAGE_SUCCESS: "listingDetails/SET_MESSAGE_SUCCESS",
} as const;

export type ListingDetailsState = {
  listing: Listing | null;
  loading: boolean;
  error: string | null;

  // Message form state
  showMessageForm: boolean;
  message: string;
  messageType: "question" | "offer" | "meeting";
  messageSuccess: boolean;
};

export type SetListingDetailsAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_LISTING_DETAILS;
  payload: Listing | null;
};

export type SetLoadingAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_LOADING;
  payload: boolean;
};

export type SetErrorAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_ERROR;
  payload: string | null;
};

export type SetMessageFormVisibilityAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_MESSAGE_FORM_VISIBILITY;
  payload: boolean;
};

export type SetMessageAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_MESSAGE;
  payload: string;
};

export type SetMessageTypeAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_MESSAGE_TYPE;
  payload: "question" | "offer" | "meeting";
};

export type SetMessageSuccessAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_MESSAGE_SUCCESS;
  payload: boolean;
};

export type ResetStateAction = {
  type: typeof LISTING_DETAILS_TYPES.RESET_STATE;
};

export type ListingDetailsAction =
  | SetListingDetailsAction
  | SetLoadingAction
  | SetErrorAction
  | SetMessageFormVisibilityAction
  | SetMessageAction
  | SetMessageTypeAction
  | SetMessageSuccessAction
  | ResetStateAction;
