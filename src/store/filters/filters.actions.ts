import { FILTERS_TYPES } from "./filters.types";
import { ListingAction, VehicleType, PropertyType, Condition } from "@/types/enums";

export const setAction = (action: ListingAction | null) => ({
  type: FILTERS_TYPES.SET_ACTION,
  payload: action,
});

export const setVehicleType = (vehicleType: VehicleType | null) => ({
  type: FILTERS_TYPES.SET_VEHICLE_TYPE,
  payload: vehicleType,
});

export const setPropertyType = (propertyType: PropertyType | null) => ({
  type: FILTERS_TYPES.SET_PROPERTY_TYPE,
  payload: propertyType,
});

export const setMake = (make: string | null) => ({
  type: FILTERS_TYPES.SET_MAKE,
  payload: make,
});

export const setModel = (model: string | null) => ({
  type: FILTERS_TYPES.SET_MODEL,
  payload: model,
});

export const setYearRange = (min: number | null, max: number | null) => ({
  type: FILTERS_TYPES.SET_YEAR_RANGE,
  payload: { min, max },
});

export const setPriceRange = (min: number | null, max: number | null) => ({
  type: FILTERS_TYPES.SET_PRICE_RANGE,
  payload: { min, max },
});

export const setLocation = (
  address: string,
  lat: number | null = null,
  lng: number | null = null
) => ({
  type: FILTERS_TYPES.SET_LOCATION,
  payload: { address, lat, lng },
});

export const setRadius = (radius: number | null) => ({
  type: FILTERS_TYPES.SET_RADIUS,
  payload: radius,
});

export const setCondition = (condition: Condition | null) => ({
  type: FILTERS_TYPES.SET_CONDITION,
  payload: condition,
});

export const resetFilters = () => ({
  type: FILTERS_TYPES.RESET_FILTERS,
});

// Thunk action for applying filters
export const applyFilters = () => async (dispatch: any, getState: any) => {
  try {
    // Here you would typically make an API call with the current filters
    const { filters } = getState();
    // TODO: Implement API call to fetch filtered listings
    console.log("Applying filters:", filters);
  } catch (error) {
    console.error("Error applying filters:", error);
  }
};
