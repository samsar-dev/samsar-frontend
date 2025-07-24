import {
  ListingAction,
  VehicleType,
  PropertyType,
  Condition,
} from "@/types/enums";

export const FILTERS_TYPES = {
  // Filter actions
  SET_ACTION: "filters/SET_ACTION",
  SET_VEHICLE_TYPE: "filters/SET_VEHICLE_TYPE",
  SET_PROPERTY_TYPE: "filters/SET_PROPERTY_TYPE",
  SET_MAKE: "filters/SET_MAKE",
  SET_MODEL: "filters/SET_MODEL",
  SET_YEAR_RANGE: "filters/SET_YEAR_RANGE",
  SET_PRICE_RANGE: "filters/SET_PRICE_RANGE",
  SET_LOCATION: "filters/SET_LOCATION",
  SET_RADIUS: "filters/SET_RADIUS",
  SET_CONDITION: "filters/SET_CONDITION",
  RESET_FILTERS: "filters/RESET_FILTERS",
} as const;

export interface FiltersState {
  action: ListingAction | null;
  vehicleType: VehicleType | null;
  propertyType: PropertyType | null;
  make: string | null;
  model: string | null;
  yearRange: { min: number | null; max: number | null };
  priceRange: { min: number | null; max: number | null };
  location: {
    address: string;
    lat: number | null;
    lng: number | null;
  } | null;
  radius: number | null;
  condition: Condition | null;
  loading: boolean;
  error: string | null;
}

// Action types
type SetActionAction = {
  type: typeof FILTERS_TYPES.SET_ACTION;
  payload: ListingAction | null;
};

type SetVehicleTypeAction = {
  type: typeof FILTERS_TYPES.SET_VEHICLE_TYPE;
  payload: VehicleType | null;
};

type SetPropertyTypeAction = {
  type: typeof FILTERS_TYPES.SET_PROPERTY_TYPE;
  payload: PropertyType | null;
};

type SetMakeAction = {
  type: typeof FILTERS_TYPES.SET_MAKE;
  payload: string | null;
};

type SetModelAction = {
  type: typeof FILTERS_TYPES.SET_MODEL;
  payload: string | null;
};

type SetYearRangeAction = {
  type: typeof FILTERS_TYPES.SET_YEAR_RANGE;
  payload: { min: number | null; max: number | null };
};

type SetPriceRangeAction = {
  type: typeof FILTERS_TYPES.SET_PRICE_RANGE;
  payload: { min: number | null; max: number | null };
};

type SetLocationAction = {
  type: typeof FILTERS_TYPES.SET_LOCATION;
  payload: { address: string; lat: number | null; lng: number | null } | null;
};

type SetRadiusAction = {
  type: typeof FILTERS_TYPES.SET_RADIUS;
  payload: number | null;
};

type SetConditionAction = {
  type: typeof FILTERS_TYPES.SET_CONDITION;
  payload: Condition | null;
};

type ResetFiltersAction = {
  type: typeof FILTERS_TYPES.RESET_FILTERS;
};

export type FiltersAction =
  | SetActionAction
  | SetVehicleTypeAction
  | SetPropertyTypeAction
  | SetMakeAction
  | SetModelAction
  | SetYearRangeAction
  | SetPriceRangeAction
  | SetLocationAction
  | SetRadiusAction
  | SetConditionAction
  | ResetFiltersAction;
