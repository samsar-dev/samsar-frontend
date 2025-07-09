import { LISTING_DETAILS_TYPES } from "./listingDetails.types";
import {
  ListingDetailsState,
  ListingDetailsAction,
} from "./listingDetails.types";

const initialState: ListingDetailsState = {
  listing: null,
  loading: false,
  error: null,
  showMessageForm: false,
  message: "",
  messageType: "question",
  messageSuccess: false,
};

export const listingDetailsReducer = (
  state = initialState,
  action: ListingDetailsAction,
): ListingDetailsState => {
  switch (action.type) {
    case LISTING_DETAILS_TYPES.SET_LISTING_DETAILS:
      return {
        ...state,
        listing: action.payload,
        error: null,
      };

    case LISTING_DETAILS_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case LISTING_DETAILS_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case LISTING_DETAILS_TYPES.SET_MESSAGE_FORM_VISIBILITY:
      return {
        ...state,
        showMessageForm: action.payload,
        // Reset message success when opening/closing form
        messageSuccess: action.payload ? state.messageSuccess : false,
      };

    case LISTING_DETAILS_TYPES.SET_MESSAGE:
      return {
        ...state,
        message: action.payload,
      };

    case LISTING_DETAILS_TYPES.SET_MESSAGE_TYPE:
      return {
        ...state,
        messageType: action.payload,
      };

    case LISTING_DETAILS_TYPES.SET_MESSAGE_SUCCESS:
      return {
        ...state,
        messageSuccess: action.payload,
        // Reset form on success
        ...(action.payload === true && {
          message: "",
          showMessageForm: false,
        }),
      };

    case LISTING_DETAILS_TYPES.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

export default listingDetailsReducer;
