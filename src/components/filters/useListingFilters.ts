import { useState, useMemo, useCallback } from "react";
import type { ListingAction } from "@/types/enums";
import { ListingCategory } from "@/types/enums";
import { type ExtendedListing } from "@/types/listings";

export interface PriceRange {
  min: number | "";
  max: number | "";
}

export interface FiltersState {
  selectedAction: ListingAction | null;
  selectedMake: string | null;
  selectedModel: string | null;
  selectedYear: number | null;
  selectedMileage: number | null;
  selectedLocation: string | null;
  selectedSubcategory: string | null;
  priceRange: PriceRange;
  // optional vehicle-specific / real-estate-specific extras
  selectedRadius?: number | null;
  selectedBuiltYear?: number | null;
  yearRange?: PriceRange;
}

interface UseListingFiltersProps {
  listings?: ExtendedListing[];
  selectedCategory?: ListingCategory;
  cities?: Record<string, string>;
  areas?: Record<string, string>;
}

/**
 * Centralised hook that owns ALL filter state and logic for listings pages.
 * Handles both filter state management and actual filtering of listings.
 * Keeping this logic in one place avoids prop-drilling and reduces Home.tsx complexity.
 */
export const useListingFilters = (
  initial: Partial<FiltersState> = {},
  options: UseListingFiltersProps = {},
) => {
  /* ---------- primitive pieces of state ---------- */
  const [selectedAction, setSelectedAction] = useState<ListingAction | null>(
    initial.selectedAction ?? null,
  );
  const [selectedMake, setSelectedMake] = useState<string | null>(
    initial.selectedMake ?? null,
  );
  const [selectedModel, setSelectedModel] = useState<string | null>(
    initial.selectedModel ?? null,
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(
    initial.selectedYear ?? null,
  );
  const [selectedMileage, setSelectedMileage] = useState<number | null>(
    initial.selectedMileage ?? null,
  );
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    initial.selectedLocation ?? null,
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    initial.selectedSubcategory ?? null,
  );
  const [priceRange, setPriceRange] = useState<PriceRange>(
    initial.priceRange ?? { min: "", max: "" },
  );
  const [selectedRadius, setSelectedRadius] = useState<number | null>(
    initial.selectedRadius ?? null,
  );
  const [selectedBuiltYear, setSelectedBuiltYear] = useState<number | null>(
    initial.selectedBuiltYear ?? null,
  );
  const [yearRange, setYearRange] = useState<PriceRange>(
    initial.yearRange ?? { min: "", max: "" },
  );

  /* ---------- derived helpers ---------- */
  const filters: FiltersState = useMemo(
    () => ({
      selectedAction,
      selectedMake,
      selectedModel,
      selectedYear,
      selectedMileage,
      selectedLocation,
      selectedSubcategory,
      priceRange,
      selectedRadius,
      selectedBuiltYear,
      yearRange,
    }),
    [
      selectedAction,
      selectedMake,
      selectedModel,
      selectedYear,
      selectedMileage,
      selectedLocation,
      selectedSubcategory,
      priceRange,
      selectedRadius,
      selectedBuiltYear,
      yearRange,
    ],
  );

  const clearFilters = useCallback(() => {
    setSelectedAction(null);
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedYear(null);
    setSelectedMileage(null);
    setSelectedLocation(null);
    setSelectedSubcategory(null);
    setPriceRange({ min: "", max: "" });
    setSelectedRadius(null);
    setSelectedBuiltYear(null);
    setYearRange({ min: "", max: "" });
  }, []);

  // Apply filters to listings
  const filteredListings = useMemo(() => {
    if (!options.listings || options.listings.length === 0) {
      return [];
    }

    return options.listings.filter((listing) => {
      // Action filter (buy/sell/rent)
      if (selectedAction && listing.listingAction !== selectedAction) {
        return false;
      }

      // Category-specific filtering
      if (options.selectedCategory === ListingCategory.VEHICLES) {
        // Vehicle filtering
        if (selectedYear && listing.details?.vehicles?.year) {
          if (parseInt(listing.details.year) !== selectedYear) {
            return false;
          }
        }
        if (selectedSubcategory) {
          const listingSubCat =
            listing.category?.subCategory ||
            listing.details?.vehicles?.vehicleType;
          if (listingSubCat !== selectedSubcategory) {
            return false;
          }
        }
        if (selectedMake && listing.details?.vehicles?.make) {
          if (listing.details.make !== selectedMake) return false;
        }
        if (selectedModel && listing.details?.vehicles?.model) {
          if (listing.details.model !== selectedModel) return false;
        }
        if (selectedMileage && listing.details?.vehicles?.mileage) {
          const mileageValue =
            typeof listing.details.mileage === "string"
              ? parseInt(listing.details.mileage)
              : listing.details.mileage;
          if (mileageValue > selectedMileage) {
            return false;
          }
        }
      }

      // Price range filter
      if (priceRange.min !== "" || priceRange.max !== "") {
        const price = listing.price || 0;
        if (priceRange.min !== "" && price < Number(String(priceRange.min))) {
          return false;
        }
        if (priceRange.max !== "" && price > Number(String(priceRange.max))) {
          return false;
        }
      }

      // Location filter
      if (selectedLocation && selectedLocation.trim() !== "") {
        const listingLocation = listing.location || "";
        const searchLocation = selectedLocation.toLowerCase();

        // Check if location matches
        const locationMatches = listingLocation
          .toLowerCase()
          .includes(searchLocation);

        // Check city/area translations if available
        let translationMatches = false;
        if (options.cities && options.areas) {
          const cityMatches = Object.values(options.cities).some((city) =>
            city.toLowerCase().includes(searchLocation),
          );
          const areaMatches = Object.values(options.areas).some((area) =>
            area.toLowerCase().includes(searchLocation),
          );
          translationMatches = cityMatches || areaMatches;
        }

        if (!locationMatches && !translationMatches) {
          return false;
        }
      }

      return true;
    });
  }, [
    options.listings,
    options.selectedCategory,
    selectedAction,
    selectedSubcategory,
    selectedMake,
    selectedModel,
    selectedYear,
    selectedLocation,
    selectedRadius,
    priceRange,
    options.cities,
    options.areas,
    selectedMileage,
    yearRange,
  ]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedAction !== null ||
      selectedMake !== null ||
      selectedModel !== null ||
      selectedYear !== null ||
      selectedMileage !== null ||
      selectedLocation !== null ||
      selectedSubcategory !== null ||
      priceRange.min !== "" ||
      priceRange.max !== "" ||
      selectedRadius !== null ||
      selectedBuiltYear !== null ||
      yearRange.min !== "" ||
      yearRange.max !== ""
    );
  }, [
    selectedAction,
    selectedMake,
    selectedModel,
    selectedYear,
    selectedMileage,
    selectedLocation,
    selectedSubcategory,
    priceRange,
    selectedRadius,
    selectedBuiltYear,
    yearRange,
  ]);

  return {
    /* state */
    selectedAction,
    selectedMake,
    selectedModel,
    selectedYear,
    selectedMileage,
    selectedLocation,
    selectedSubcategory,
    priceRange,
    selectedRadius,
    selectedBuiltYear,
    yearRange,

    /* setters - pass directly to ListingFilters */
    setSelectedAction,
    setSelectedMake,
    setSelectedModel,
    setSelectedYear,
    setSelectedMileage,
    setSelectedLocation,
    setSelectedSubcategory,
    setPriceRange: (range: PriceRange) => setPriceRange(range),
    setSelectedRadius,
    setSelectedBuiltYear,
    setYearRange: (range: PriceRange) => setYearRange(range),

    /* helpers */
    clearFilters,
    filters, // consolidated object
    filteredListings, // filtered results
    hasActiveFilters, // boolean indicating if any filters are active
  } as const;
};
