import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import ListingCard from "@/components/listings/details/ListingCard";
import SkeletonListingGrid from "@/components/common/SkeletonGrid";
import { ExtendedListing } from "@/types/listings";
import { ListingCategory, PropertyType } from "@/types/enums";
import { listingsAPI } from "@/api/listings.api";
import debounce from 'lodash.debounce';
import { toast } from "react-toastify";
import { SEO } from "@/utils/seo";

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
  const { t } = useTranslation();

  // SEO Meta Tags
  const pageTitle = t("real_estate.meta_title", "العقارات - سمسار");
  const pageDescription = t(
    "real_estate.meta_description",
    "أضخم منصة عقارية في سوريا تقدم أفضل العروض العقارية المميزة. تصفح الآف العقارات المعروضة للبيع وللايجار في مختلف المدن السورية. نوفر لك شقق سكنية، فلل فاخرة، شقق فندقية، محلات تجارية، مكاتب إدارية، أراضي سكنية، مزارع، وعقارات استثمارية. خدمة مجانية لعرض العقارات مع وصف تفصيلي، صور عالية الجودة، وخرائط الموقع. نوفر لك أدوات متقدمة للبحث والتصفية حسب المساحة، السعر، الموقع، والمواصفات. ابدأ رحلتك الآن للعثور على عقارك المثالي!",
  );
  const pageKeywords = t(
    "real_estate.meta_keywords",
    "عقارات للبيع, شقق للايجار, فلل فاخرة, محلات تجارية, مكاتب إدارية, أراضي سكنية, عقارات دمشق, عقارات حلب, عقارات حمص, عقارات اللاذقية, عقارات طرطوس, شقق فندقية, شقق مفروشة, عقارات استثمارية, تمليك, إيجار شهري, إيجار سنوي, عقارات سوريا, سمسار عقارات, مشاريع سكنية",
  );

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
          ...(filters.propertyType && {
            subCategory: filters.propertyType as PropertyType,
          }),
        },
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        location: filters.location || undefined,
      };
      const response = await listingsAPI.getAll(
        params,
        abortControllerRef.current.signal,
      );

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
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
      />
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
