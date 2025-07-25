import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import SkeletonListingGrid from "@/components/common/SkeletonGrid";
import ListingFilters from "@/components/filters/ListingFilters";
import ListingCard from "@/components/listings/details/ListingCard";
import { ExtendedListing } from "@/types/listings";
import { ListingAction, ListingCategory, VehicleType } from "@/types/enums";
import { listingsAPI } from "@/api/listings.api";
import debounce from 'lodash.debounce';
import { toast } from "react-toastify";
import { SEO } from "@/utils/seo";

interface ListingsState {
  all: ExtendedListing[];
  loading: boolean;
  error: string | null;
}

const VehiclesPage: React.FC = () => {
  const { t } = useTranslation();

  // SEO Meta Tags
  const pageTitle = t("vehicles.meta_title", "المركبات - سمسار");
  const pageDescription = t(
    "vehicles.meta_description",
    "أكبر سوق لبيع وشراء السيارات والمركبات في سوريا. تصفح آلاف السيارات الجديدة والمستعملة من مختلف الماركات والموديلات. لدينا تشكيلة واسعة تشمل: سيارات سيدان، دفع رباعي، سيارات عائلية، سيارات رياضية، دراجات نارية، شاحنات، باصات، وقطع غيار. خدمة مجانية لبيع وشراء المركبات مع إمكانية المقارنة بين العروض والاتصال بالبائع مباشرة. أسعار تنافسية وضمان حقيقي. ابدأ بحثك الآن عن سيارتك المثالية!",
  );
  const pageKeywords = t(
    "vehicles.meta_keywords",
    "سيارات للبيع, سيارات مستعملة, سيارات جديدة, معارض سيارات, سيارات بالتقسيط, دراجات نارية, شاحنات, باصات, قطع غيار سيارات, بيع سيارات, شراء سيارات, سوق السيارات, اسعار السيارات, سيارات مضمونة, سمسار سيارات, سيارات سوريا, مركبات للايجار",
  );

  const [listings, setListings] = useState<ListingsState>({
    all: [],
    loading: true,
    error: null,
  });

  // Filter states
  const [selectedAction, setSelectedAction] = useState<ListingAction | null>(
    null,
  );
  const [selectedVehicleType, setSelectedVehicleType] =
    useState<VehicleType | null>(null);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMileage, setSelectedMileage] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(50);
  const [selectedBuiltYear] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<{
    min: number | "";
    max: number | "";
  }>({
    min: "",
    max: "",
  });
  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  const fetchVehicleListings = useCallback(async () => {
    try {
      setListings((prev) => ({ ...prev, loading: true, error: null }));

      const params: any = {
        category: {
          mainCategory: ListingCategory.VEHICLES,
          ...(selectedVehicleType && { subCategory: selectedVehicleType }),
        },
        listingAction: selectedAction || undefined,
        ...(selectedYear && { year: selectedYear }),
        ...(priceRange.min && { minPrice: Number(priceRange.min) }),
        ...(priceRange.max && { maxPrice: Number(priceRange.max) }),
        ...(selectedMake && { make: selectedMake }),
        ...(selectedModel && { model: selectedModel }),
      };

      if (selectedLocation) {
        params.location = selectedLocation;
        if (selectedRadius) {
          params.radius = selectedRadius;
        }
      }

      if (selectedBuiltYear) {
        params.vehicleDetails = {
          ...params.vehicleDetails,
          year: selectedBuiltYear,
        };
      }

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
        throw new Error(response.error || "Failed to fetch vehicle listings");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const errorMessage = "Failed to load vehicle listings";
      setListings((prev) => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
      console.error(err);
    }
  }, [
    selectedAction,
    selectedVehicleType,
    selectedMake,
    selectedModel,
    selectedYear,
    selectedLocation,
    selectedRadius,
    priceRange,
    selectedBuiltYear,
  ]);

  // Debounced filter update
  const debouncedFetch = useMemo(
    () => debounce(fetchVehicleListings, 500),
    [fetchVehicleListings],
  );

  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  // No default vehicle type - show all vehicle types by default

  // Handle subcategory change
  const handleSubcategoryChange = useCallback((subcategory: string | null) => {
    setSelectedVehicleType(subcategory as VehicleType | null);
  }, []);

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
            Vehicle Listings
          </h1>
          <ListingFilters
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            selectedSubcategory={selectedVehicleType}
            setSelectedSubcategory={handleSubcategoryChange}
            selectedMake={selectedMake}
            setSelectedMake={setSelectedMake}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMileage={selectedMileage}
            setSelectedMileage={setSelectedMileage}
            setSelectedLocation={setSelectedLocation}
            selectedRadius={selectedRadius}
            setSelectedRadius={setSelectedRadius}
            loading={listings.loading}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            onLocationChange={(location) => {
              setSelectedLocation(location.address);
            }}
            onSearch={fetchVehicleListings}
          />
        </div>

        {listings.loading ? (
          <SkeletonListingGrid />
        ) : listings.error ? (
          <div className="text-center text-red-500 py-8">{listings.error}</div>
        ) : listings.all.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No vehicle listings found
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

export default VehiclesPage;
