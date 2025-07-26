import React, { memo, useCallback } from "react";
import { ListingFilters as DumbFilters } from "./ListingFilters";
import { useListingFilters, FiltersState } from "./useListingFilters";
import { type ExtendedListing } from "@/types/listings";
import { ListingCategory } from "@/types/enums";

interface ListingFiltersSmartProps {
  loading: boolean;
  listings: ExtendedListing[];
  selectedCategory: ListingCategory;
  cities?: Record<string, string>;
  areas?: Record<string, string>;
  onApply: (filteredListings: ExtendedListing[], filters: FiltersState) => void;
}

/**
 * Thin wrapper that owns filter state through useListingFilters and emits a single
 * `onApply(filters)` callback upwards. This avoids prop-drilling the 20 setters to Home.
 */
const ListingFiltersSmartComponent: React.FC<ListingFiltersSmartProps> = ({
  loading,
  listings,
  selectedCategory,
  cities,
  areas,
  onApply,
}) => {
  const filterHook = useListingFilters({}, {
    listings,
    selectedCategory,
    cities,
    areas,
  });

  // When user hits Search / Apply inside DumbFilters, invoke upstream handler.
  // Automatically apply when filter criteria actually change (prevents infinite render loop)
  const prevFiltersRef = React.useRef<FiltersState | null>(null);
  React.useEffect(() => {
    if (prevFiltersRef.current !== filterHook.filters) {
      prevFiltersRef.current = filterHook.filters;
      onApply(filterHook.filteredListings, filterHook.filters);
    }
    // onApply is stable (from Home useCallback), filteredListings recalculated when filters change
  }, [filterHook.filters, filterHook.filteredListings, onApply]);

  const handleSearch = useCallback(() => {
    onApply(filterHook.filteredListings, filterHook.filters);
  }, [onApply, filterHook.filteredListings, filterHook.filters]);

  return (
    <DumbFilters
      {...filterHook}
      loading={loading}
      onSearch={handleSearch}
      onPriceRangeChange={filterHook.setPriceRange}
      onYearRangeChange={filterHook.setYearRange}
      onRadiusChange={filterHook.setSelectedRadius}
      onLocationChange={(loc) => filterHook.setSelectedLocation(loc.address)}
      priceRange={filterHook.priceRange}
    />
  );
};

export default memo(ListingFiltersSmartComponent);
