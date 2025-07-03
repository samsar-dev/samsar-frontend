import { LISTING_TYPES, ListingState, ListingAction } from "./listingEdit.types";

const initialState: ListingState = {
  currentListing: null,
  loading: false,
  error: null,
  formData: {},
  step: 0,
  images: [],
  deletedImages: [],
  schema: [],
  activeSchema: [],
  validationErrors: {},
};

export const listingReducer = (
  state = initialState,
  action: ListingAction
): ListingState => {
  switch (action.type) {
    case LISTING_TYPES.SET_CURRENT_LISTING:
      return {
        ...state,
        currentListing: action.payload,
      };

    case LISTING_TYPES.SET_FORM_DATA:
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };

    case LISTING_TYPES.SET_STEP:
      return {
        ...state,
        step: action.payload,
      };

    case LISTING_TYPES.ADD_IMAGE:
      return {
        ...state,
        images: [...state.images, action.payload],
      };

    case LISTING_TYPES.REMOVE_IMAGE: {
      const { index, isUrl } = action.payload;
      const newImages = [...state.images];
      const removedImage = newImages.splice(index, 1)[0];
      
      return {
        ...state,
        images: newImages,
        deletedImages: isUrl ? [...state.deletedImages, removedImage as string] : state.deletedImages,
      };
    }

    case LISTING_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case LISTING_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case LISTING_TYPES.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};
