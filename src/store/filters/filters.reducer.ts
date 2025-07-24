import { FILTERS_TYPES } from "./filters.types";
import type { FiltersState, FiltersAction } from "./filters.types";

const initialState: FiltersState = {
  action: null,
  vehicleType: null,
  propertyType: null,
  make: null,
  model: null,
  yearRange: { min: null, max: null },
  priceRange: { min: null, max: null },
  location: null,
  radius: null,
  condition: null,
  loading: false,
  error: null,
};

export const filtersReducer = (
  state = initialState,
  action: FiltersAction,
): FiltersState => {
  switch (action.type) {
    case FILTERS_TYPES.SET_ACTION:
      return {
        ...state,
        action: action.payload,
      };

    case FILTERS_TYPES.SET_VEHICLE_TYPE:
      return {
        ...state,
        vehicleType: action.payload,
        // Reset dependent fields when vehicle type changes
        make: null,
        model: null,
      };

    case FILTERS_TYPES.SET_PROPERTY_TYPE:
      return {
        ...state,
        propertyType: action.payload,
      };

    case FILTERS_TYPES.SET_MAKE:
      return {
        ...state,
        make: action.payload,
        // Reset model when make changes
        model: null,
      };

    case FILTERS_TYPES.SET_MODEL:
      return {
        ...state,
        model: action.payload,
      };

    case FILTERS_TYPES.SET_YEAR_RANGE:
      return {
        ...state,
        yearRange: action.payload,
      };

    case FILTERS_TYPES.SET_PRICE_RANGE:
      return {
        ...state,
        priceRange: action.payload,
      };

    case FILTERS_TYPES.SET_LOCATION:
      return {
        ...state,
        location: action.payload,
      };

    case FILTERS_TYPES.SET_RADIUS:
      return {
        ...state,
        radius: action.payload,
      };

    case FILTERS_TYPES.SET_CONDITION:
      return {
        ...state,
        condition: action.payload,
      };

    case FILTERS_TYPES.RESET_FILTERS:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export default filtersReducer;
