import React, { useState, useEffect, useCallback, useRef } from "react";
import ListingCard from "@/components/listings/details/ListingCard";
import SkeletonListingGrid from "@/components/common/SkeletonGrid";
import { ExtendedListing } from "@/types/listings";
import { ListingCategory, PropertyType } from "@/types/enums";
import { listingsAPI } from "@/api/listings.api";
import { debounce } from "lodash-es";
import { toast } from "react-toastify";

interface ListingsState {
  all: ExtendedListing[];
  loading: boolean;
  error: string | null;
}

interface RealEstateFilterState {
  propertyType: string | null;
  listingAction: string | null;
  minPrice: string;
  maxPrice: string;
  minSize: string;
  maxSize: string;
  bedrooms: string;
  bathrooms: string;
  condition: string | null;
  location: string;
}

interface RealEstateFilterProps {
  filters: RealEstateFilterState;
  onFilterChange: (updates: Partial<RealEstateFilterState>) => void;
}

const RealEstateFilter: React.FC<RealEstateFilterProps> = () => {
  // Filter UI implementation will go here
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filter inputs will be added here */}
      </div>
    </div>
  );
};

const RealEstatePage: React.FC = () => {
  const [listings, setListings] = useState<ListingsState>({
    all: [],
    loading: true,
    error: null,
  });
  const [filters, setFilters] = useState<RealEstateFilterState>({
    propertyType: null,
    listingAction: null,
    minPrice: "",
    maxPrice: "",
    minSize: "",
    maxSize: "",
    bedrooms: "",
    bathrooms: "",
    condition: null,
    location: "",
  });
  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  const fetchRealEstateListings = useCallback(async () => {
    try {
      setListings((prev) => ({ ...prev, loading: true, error: null }));
      const params: Record<string, any> = {
        category: {
          mainCategory: ListingCategory.REAL_ESTATE,
          ...(filters.propertyType && { subCategory: filters.propertyType as PropertyType }),
        },
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        location: filters.location || undefined,
      };
      const response = await listingsAPI.getAll(params, abortControllerRef.current.signal);

      if (response.success && response.data?.listings) {
        setListings((prev) => ({
          ...prev,
          all: response.data?.listings ?? [],
          loading: false,
        }));
      } else {
        throw new Error(
          response.error || "Failed to fetch real estate listings",
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const errorMessage = "Failed to load real estate listings";
      setListings((prev) => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
      console.error(err);
    }
  }, [filters]);

  // Debounced filter update
  const debouncedFetch = debounce(fetchRealEstateListings, 500);

  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const handleFilterChange = (updates: Partial<RealEstateFilterState>) => {
    setFilters((prev: RealEstateFilterState) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Real Estate Listings
          </h1>
          <RealEstateFilter
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {listings.loading ? (
          <SkeletonListingGrid />
        ) : listings.error ? (
          <div className="text-center text-red-500 py-8">{listings.error}</div>
        ) : listings.all.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No real estate listings found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.all.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showPrice={true}
                showLocation={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealEstatePage;
