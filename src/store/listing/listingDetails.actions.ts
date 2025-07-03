import { listingsAPI } from "@/api/listings.api";
import { AppDispatch } from "../store";
import { Listing } from "@/types/listings";

// Action Types
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

// Action Type Definitions
type SetListingDetailsAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_LISTING_DETAILS;
  payload: Listing | null;
};

type SetLoadingAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_LOADING;
  payload: boolean;
};

type SetErrorAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_ERROR;
  payload: string | null;
};

type SetMessageFormVisibilityAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_MESSAGE_FORM_VISIBILITY;
  payload: boolean;
};

type SetMessageAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_MESSAGE;
  payload: string;
};

type SetMessageTypeAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_MESSAGE_TYPE;
  payload: 'question' | 'offer' | 'meeting';
};

type SetMessageSuccessAction = {
  type: typeof LISTING_DETAILS_TYPES.SET_MESSAGE_SUCCESS;
  payload: boolean;
};

type ResetStateAction = {
  type: typeof LISTING_DETAILS_TYPES.RESET_STATE;
};

// Action Types Union
export type ListingDetailsAction =
  | SetListingDetailsAction
  | SetLoadingAction
  | SetErrorAction
  | SetMessageFormVisibilityAction
  | SetMessageAction
  | SetMessageTypeAction
  | SetMessageSuccessAction
  | ResetStateAction;

// Thunk Actions
export const fetchListingDetails = (id: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: LISTING_DETAILS_TYPES.SET_LOADING, payload: true });
      dispatch({ type: LISTING_DETAILS_TYPES.SET_ERROR, payload: null });

      // Fetch the listing using getById which matches the original component's behavior
      const response = await listingsAPI.getById(id);
      const listing = response.success ? response.data : null;
      
      if (listing) {
        dispatch({
          type: LISTING_DETAILS_TYPES.SET_LISTING_DETAILS,
          payload: listing,
        });
      } else {
        throw new Error('Listing not found');
      }
      
      return listing;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch listing details';
      dispatch({ type: LISTING_DETAILS_TYPES.SET_ERROR, payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: LISTING_DETAILS_TYPES.SET_LOADING, payload: false });
    }
  };
};

export const sendMessage = (_listingId: string, _message: string, _messageType: 'question' | 'offer' | 'meeting') => {
  // The actual implementation would use these parameters when the API is ready
  return async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: LISTING_DETAILS_TYPES.SET_LOADING, payload: true });
      
      // Replace with actual API call when available
      // Implementation example when API is ready:
      // await messagesAPI.sendMessage({ 
      //   listingId, 
      //   message, 
      //   type: messageType 
      // });
      
      dispatch({
        type: LISTING_DETAILS_TYPES.SET_MESSAGE_SUCCESS,
        payload: true,
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        dispatch({
          type: LISTING_DETAILS_TYPES.SET_MESSAGE_SUCCESS,
          payload: false,
        });
      }, 3000);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      dispatch({ type: LISTING_DETAILS_TYPES.SET_ERROR, payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: LISTING_DETAILS_TYPES.SET_LOADING, payload: false });
    }
  };
};

// Action Creators
export const setMessageFormVisibility = (isVisible: boolean) => ({
  type: LISTING_DETAILS_TYPES.SET_MESSAGE_FORM_VISIBILITY,
  payload: isVisible,
});

export const setMessage = (message: string) => ({
  type: LISTING_DETAILS_TYPES.SET_MESSAGE,
  payload: message,
});

export const setMessageType = (messageType: 'question' | 'offer' | 'meeting') => ({
  type: LISTING_DETAILS_TYPES.SET_MESSAGE_TYPE,
  payload: messageType,
});

export const resetListingDetailsState = () => ({
  type: LISTING_DETAILS_TYPES.RESET_STATE,
});

// Action types are already exported above
