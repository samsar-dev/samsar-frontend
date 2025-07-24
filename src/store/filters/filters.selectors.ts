import { RootState } from "../store";
import { createSelector } from "@reduxjs/toolkit";

// Select the entire filters state
const selectFiltersState = (state: RootState) => state.filters;

// Individual selectors
export const selectAction = createSelector(
  [selectFiltersState],
  (filters) => filters.action,
);

export const selectVehicleType = createSelector(
  [selectFiltersState],
  (filters) => filters.vehicleType,
);

export const selectPropertyType = createSelector(
  [selectFiltersState],
  (filters) => filters.propertyType,
);

export const selectMake = createSelector(
  [selectFiltersState],
  (filters) => filters.make,
);

export const selectModel = createSelector(
  [selectFiltersState],
  (filters) => filters.model,
);

export const selectYearRange = createSelector(
  [selectFiltersState],
  (filters) => filters.yearRange,
);

export const selectPriceRange = createSelector(
  [selectFiltersState],
  (filters) => filters.priceRange,
);

export const selectLocation = createSelector(
  [selectFiltersState],
  (filters) => filters.location,
);

export const selectRadius = createSelector(
  [selectFiltersState],
  (filters) => filters.radius,
);

export const selectCondition = createSelector(
  [selectFiltersState],
  (filters) => filters.condition,
);

export const selectLoading = createSelector(
  [selectFiltersState],
  (filters) => filters.loading,
);

export const selectError = createSelector(
  [selectFiltersState],
  (filters) => filters.error,
);

// Combined selector for all filters
export const selectAllFilters = createSelector(
  [
    selectAction,
    selectVehicleType,
    selectPropertyType,
    selectMake,
    selectModel,
    selectYearRange,
    selectPriceRange,
    selectLocation,
    selectRadius,
    selectCondition,
  ],
  (
    action,
    vehicleType,
    propertyType,
    make,
    model,
    yearRange,
    priceRange,
    location,
    radius,
    condition,
  ) => ({
    action,
    vehicleType,
    propertyType,
    make,
    model,
    yearRange,
    priceRange,
    location,
    radius,
    condition,
  }),
);

// Export all selectors
export const filtersSelectors = {
  selectAction,
  selectVehicleType,
  selectPropertyType,
  selectMake,
  selectModel,
  selectYearRange,
  selectPriceRange,
  selectLocation,
  selectRadius,
  selectCondition,
  selectLoading,
  selectError,
  selectAllFilters,
};
