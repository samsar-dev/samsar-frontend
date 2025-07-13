import { listingsAPI } from "@/api/listings.api";
import ListingCard from "@/components/listings/details/ListingCard";
import ListingFilters from "@/components/filters/ListingFilters";
import SkeletonListingGrid from "@/components/common/SkeletonGrid";
import PreloadImages from "@/components/media/PreloadImages";
import {
  ListingCategory,
  VehicleType,
  PropertyType,
  ListingAction,
} from "@/types/enums";
import { type ExtendedListing } from "@/types/listings";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { MdFilterList } from "react-icons/md";
import { FaCar, FaHome } from "react-icons/fa";
import { Listbox } from "@headlessui/react";
import { HiSelector, HiCheck } from "react-icons/hi";
import ImageFallback from "@/components/media/ImageFallback";


interface ListingParams {
  category?: {
    mainCategory: ListingCategory;
    subCategory?: VehicleType | PropertyType;
  };
  vehicleDetails?: {
    make?: string;
    model?: string;
  };
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit: number;
  page?: number;
  year?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  preview?: boolean;
  forceRefresh?: boolean;
  radius?: number;
  listingAction?: "SALE" | "RENT";
}

interface ListingsState {
  all: ExtendedListing[];
  popular: ExtendedListing[];
  loading: boolean;
  error: string | null;
}

const Home: React.FC = () => {
  const { t, i18n } = useTranslation([
    "common",
    "filters",
    "home",
    "locations",
  ]);

  // SEO Meta Tags
  const pageTitle = t(
    "meta_title",
    "سمسار | سوق السيارات والعقارات الأول في سوريا",
  );
  const pageKeywords = t(
    "meta_keywords",
    "عقارات سوريا, سيارات للبيع, شقق للايجار, فلل فاخرة, أراضي سكنية, محلات تجارية, سوق السيارات, سوق العقارات, عقارات دمشق, عقارات حلب, سيارات مستعملة, شقق للبيع, شقق مفروشة, مكاتب إدارية, شقق فندقية, دراجات نارية, شاحنات, باصات, قطع غيار, سمسار",
  );

  // Get city and area translations for filtering
  const cities = t("locations:cities", {
    returnObjects: true,
    defaultValue: {},
  }) as Record<string, string>;
  const areas = t("locations:areas", {
    returnObjects: true,
    defaultValue: {},
  }) as Record<string, string[]>;

  // Track first visible listing for LCP optimization
  const [firstVisibleListing, setFirstVisibleListing] =
    useState<ExtendedListing | null>(null);
  const [sortBy, setSortBy] = useState<string>("newestFirst");
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory>(
    ListingCategory.VEHICLES,
  );
  // Price range state
  const [priceRange, setPriceRange] = useState<{
    min: number | "";
    max: number | "";
  }>({ min: "", max: "" });
  // Year range state
  const [yearRange, setYearRange] = useState<{
    min: number | "";
    max: number | "";
  }>({ min: "", max: "" });
  // Selected price for filtering (single price filter)
  const [selectedPrice] = useState<string>("");
  const [listings, setListings] = useState<ListingsState>({
    all: [],
    popular: [],
    loading: true,
    error: null,
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  // Removed unused filter visibility state
  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    // Listen for cache-cleared events from the API
    const handleCacheCleared = () => {
      console.log("Cache cleared event received, forcing refresh");
      // Clear the local cache
      listingsCache.current = {};
      // Force a refresh of the listings
      setForceRefresh((prev) => !prev);
    };

    window.addEventListener("listings-cache-cleared", handleCacheCleared);

    return () => {
      abortControllerRef.current.abort();
      window.removeEventListener("listings-cache-cleared", handleCacheCleared);
    };
  }, []);

  // Update first visible listing when listings change and preload critical images
  useEffect(() => {
    if (listings.all.length > 0) {
      const firstListing = listings.all[0];
      setFirstVisibleListing(firstListing);

      // Preload first few images for better LCP
      const criticalImages = listings.all
        .slice(0, 4)
        .map((listing) => listing.images?.[0])
        .filter(Boolean) as string[];

      if (criticalImages.length > 0) {
        // Preload the first image with high priority for LCP
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = criticalImages[0];
        link.fetchPriority = "high";
        document.head.appendChild(link);
      }
    }
  }, [listings.all]);

  // Filter states
  const [selectedAction, setSelectedAction] = useState<ListingAction | null>(
    null,
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  // Mileage filter state
  const [selectedMileage, setSelectedMileage] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [selectedBuiltYear, setSelectedBuiltYear] = useState<number | null>(
    null,
  );
  const [allSubcategories, setAllSubcategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const toggleFilters = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
  }, []);

  // Cache for storing initial listings data
  const listingsCache = useRef<{
    [key in ListingCategory]?: ExtendedListing[];
  }>({});

  const fetchListings = useCallback(async () => {
    // If we have cached data for this category and it's not initial load or force refresh, use it
    if (
      !isInitialLoad &&
      !forceRefresh &&
      listingsCache.current[selectedCategory]
    ) {
      let sortedListings = [...(listingsCache.current[selectedCategory] || [])];

      // Client-side sorting for additional options
      switch (sortBy) {
        case "priceAsc":
          sortedListings.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case "priceDesc":
          sortedListings.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case "locationAsc":
          sortedListings.sort((a, b) =>
            (a.location || "").localeCompare(b.location || ""),
          );
          break;
        case "locationDesc":
          sortedListings.sort((a, b) =>
            (b.location || "").localeCompare(a.location || ""),
          );
          break;
        case "newestFirst":
        default:
          sortedListings.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime(),
          );
      }

      // Apply filters
      let filteredListings = sortedListings.filter((listing) => {
        if (selectedCategory === ListingCategory.VEHICLES) {
          // Vehicle filtering
          if (selectedYear && listing.details?.vehicles?.year) {
            if (parseInt(listing.details.vehicles.year) !== selectedYear) {
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
            if (listing.details.vehicles.make !== selectedMake) return false;
          }
          if (selectedModel && listing.details?.vehicles?.model) {
            if (listing.details.vehicles.model !== selectedModel) return false;
          }
          if (selectedPrice && listing.price) {
            // Compare numeric values for price filtering
            const listingPrice =
              typeof listing.price === "number"
                ? listing.price
                : Number(listing.price);
            const filterPrice = Number(selectedPrice);
            if (
              isNaN(listingPrice) ||
              isNaN(filterPrice) ||
              listingPrice !== filterPrice
            ) {
              return false;
            }
          }

          // Apply mileage filter for vehicles
          if (selectedMileage !== null && selectedMileage !== undefined) {
            const vehicleMileage = listing.details?.vehicles?.mileage;
            console.log(
              "Mileage filter - Listing ID:",
              listing.id,
              "Mileage value:",
              vehicleMileage,
              "Type:",
              typeof vehicleMileage,
            );

            if (vehicleMileage !== null && vehicleMileage !== undefined) {
              try {
                // Convert to number if it's a string
                let mileageValue: number;
                if (typeof vehicleMileage === "string") {
                  // Extract numbers from string (handles formats like '100,000 km' or '100k')
                  const numericValue = vehicleMileage.replace(/[^0-9.]/g, "");
                  mileageValue = parseFloat(numericValue);
                } else {
                  // It's already a number
                  mileageValue = Number(vehicleMileage);
                }

                console.log(
                  "Processed mileage:",
                  mileageValue,
                  "Selected max:",
                  selectedMileage,
                );

                // Only filter if we have a valid number
                if (!isNaN(mileageValue) && mileageValue > selectedMileage) {
                  console.log("Filtering out - mileage too high");
                  return false;
                }
              } catch (error) {
                console.warn(
                  "Error processing mileage:",
                  error,
                  "for listing:",
                  listing.id,
                );
                // If there's an error parsing, don't filter out the listing
              }
            } else {
              console.log("No mileage data for listing, keeping it");
            }
          }
        } else if (selectedCategory === ListingCategory.REAL_ESTATE) {
          // Real estate filtering
          if (
            selectedSubcategory &&
            listing.details?.realEstate?.propertyType
          ) {
            if (listing.details.realEstate.propertyType !== selectedSubcategory)
              return false;
          }
          if (selectedLocation && listing.location) {
            if (
              listing.location.toLowerCase() !== selectedLocation.toLowerCase()
            )
              return false;
          }
          if (selectedBuiltYear && listing.details?.realEstate?.yearBuilt) {
            // Built year filter: "2023 and newer", "2010 and newer", "Before 2000"
            const builtYear = Number(listing.details.realEstate.yearBuilt);
            if (selectedBuiltYear === 2000) {
              // Before 2000
              if (builtYear >= 2000) return false;
            } else if (selectedBuiltYear) {
              // e.g. 2023 and newer, 2010 and newer
              if (builtYear < selectedBuiltYear) return false;
            }
          }
        }
        return true;
      });

      setListings((prev) => ({
        ...prev,
        all: filteredListings,
        loading: false,
      }));
      return;
    }

    try {
      setListings((prev) => ({ ...prev, loading: true }));

      // Only create new abort controller if we need to abort the current request
      if (abortControllerRef.current.signal.aborted) {
        abortControllerRef.current = new AbortController();
      }

      const buildQueryParams = (): ListingParams => {
        const params: ListingParams = {
          limit: 12,
          page: 1,
          sortBy: sortBy === "newestFirst" ? "createdAt" : "price",
          sortOrder: sortBy === "priceDesc" ? "desc" : "asc",
        };

        if (selectedAction) {
          params.listingAction = selectedAction as "SALE" | "RENT";
        }

        if (selectedCategory === ListingCategory.VEHICLES) {
          params.category = {
            mainCategory: ListingCategory.VEHICLES,
            subCategory: (selectedSubcategory as VehicleType) || undefined,
          };

          // Initialize vehicleDetails with make, model, and mileage if any are selected
          if (selectedMake || selectedModel || selectedMileage) {
            params.vehicleDetails = {
              ...(selectedMake && { make: selectedMake }),
              ...(selectedModel && { model: selectedModel }),
              ...(selectedMileage && { mileage: selectedMileage.toString() }),
            };
          }

          if (selectedYear) {
            params.year = selectedYear;
          }
        }

        if (selectedLocation) {
          params.location = selectedLocation;
        }

        // Add sorting
        if (sortBy === "newestFirst") {
          params.sortBy = "createdAt";
          params.sortOrder = "desc";
        } else if (sortBy === "priceLowToHigh") {
          params.sortBy = "price";
          params.sortOrder = "asc";
        } else if (sortBy === "priceHighToLow") {
          params.sortBy = "price";
          params.sortOrder = "desc";
        }

        return params;
      };

      const response = await listingsAPI.getAll(
        buildQueryParams(),
        abortControllerRef.current.signal,
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch listings");
      }

      const responseData = response.data; // Assign to a const to avoid null check warnings
      if (!responseData.listings) {
        throw new Error(response.error || "Failed to fetch listings");
      }

      // Cache the results
      listingsCache.current[selectedCategory] = responseData.listings;

      setListings((prev) => ({
        ...prev,
        all: responseData.listings,
        loading: false,
      }));
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.name === "CanceledError" ||
          error.message === "Request canceled")
      ) {
        // Clear error state for canceled requests
        setListings((prev) => ({
          ...prev,
          error: null,
          loading: false,
        }));
        return;
      }

      // Log and show error for actual errors
      console.error("Error fetching listings:", error);
      setListings((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to fetch listings",
        loading: false,
      }));
    }
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedMake,
    selectedModel,
    selectedYear,
    selectedLocation,
    sortBy,
    isInitialLoad,
    t,
  ]);

  // Effect for fetching listings - on category change, initial load, or force refresh
  useEffect(() => {
    fetchListings();
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
    // Reset force refresh after it's been used
    if (forceRefresh) {
      setForceRefresh(false);
    }
    return () => {
      // No need to abort here, it's handled in the fetchListings function
    };
  }, [fetchListings, isInitialLoad, forceRefresh]);

  // Memoized filtered listings
  const filteredListings = useMemo(() => {
    if (!listings.all.length) return [];

    return listings.all.filter((listing) => {
      // Category filter
      const matchesCategory =
        !selectedCategory || listing.category.mainCategory === selectedCategory;

      // Action filter
      const matchesAction =
        !selectedAction || listing.listingAction === selectedAction;

      // Subcategory filter
      const matchesSubcategory =
        !selectedSubcategory ||
        listing.category.subCategory === selectedSubcategory;

      // Make filter
      const matchesMake =
        !selectedMake ||
        (listing.details?.vehicles?.make || "").toLowerCase() ===
          selectedMake.toLowerCase();

      // Model filter
      const matchesModel =
        !selectedModel ||
        (listing.details?.vehicles?.model || "").toLowerCase() ===
          selectedModel.toLowerCase();

      // Year filter
      const listingYear = listing.details?.vehicles?.year
        ? parseInt(listing.details.vehicles.year.toString(), 10)
        : new Date(listing.createdAt || "").getFullYear();

      // Check if year is within selected range
      const matchesYearRange =
        (yearRange.min === "" || listingYear >= (yearRange.min as number)) &&
        (yearRange.max === "" || listingYear <= (yearRange.max as number));

      // For backward compatibility with single year filter
      const matchesSingleYear =
        !selectedYear || listingYear >= (selectedYear || 0);

      const matchesYear = matchesYearRange && matchesSingleYear;

      // Mileage filter
      let matchesMileage = true;
      if (selectedMileage && selectedCategory === ListingCategory.VEHICLES) {
        const listingMileage = listing.details?.vehicles?.mileage
          ? typeof listing.details.vehicles.mileage === "string"
            ? parseInt(
                listing.details.vehicles.mileage.replace(/[^0-9.]/g, ""),
                10,
              )
            : listing.details.vehicles.mileage
          : 0;
        matchesMileage = listingMileage <= selectedMileage;
      }

      // Price filter
      const listingPrice =
        typeof listing.price === "string"
          ? parseFloat(listing.price)
          : listing.price || 0;
      const matchesMinPrice =
        priceRange.min === "" || listingPrice >= (priceRange.min as number);
      const matchesMaxPrice =
        priceRange.max === "" || listingPrice <= (priceRange.max as number);
      const matchesPrice = matchesMinPrice && matchesMaxPrice;

      // Location filter
      let matchesLocation = true;
      if (selectedLocation) {
        // Find the correct case-insensitive city key
        const cityKey = Object.keys(cities).find(
          (key) => key.toLowerCase() === selectedLocation.toLowerCase(),
        );

        if (cityKey) {
          if (selectedRadius !== null) {
            // If radius is selected, include nearby areas
            const currentCityAreas = areas[cityKey] || [];
            const allAreasToMatch = [cities[cityKey], ...currentCityAreas];

            matchesLocation = allAreasToMatch.some(
              (area) =>
                area &&
                listing.location?.toLowerCase().includes(area.toLowerCase()),
            );
          } else {
            // Exact match if no radius is selected
            const cityName = cities[cityKey];
            matchesLocation =
              listing.location
                ?.toLowerCase()
                .includes(cityName.toLowerCase()) || false;
          }
        } else {
          // If city key not found, no match
          matchesLocation = false;
        }
      }

      return (
        matchesCategory &&
        matchesAction &&
        matchesSubcategory &&
        matchesMake &&
        matchesModel &&
        matchesYear &&
        matchesMileage &&
        matchesPrice &&
        matchesLocation
      );
    });
  }, [
    listings.all,
    selectedCategory,
    selectedAction,
    selectedSubcategory,
    selectedMake,
    selectedModel,
    selectedYear,
    selectedPrice,
    selectedLocation,
    selectedRadius,
    priceRange,
    cities,
    areas,
    selectedMileage,
    yearRange,
  ]);

  // Handle filtering state with ref to prevent infinite loop
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [filteredListings]);

  // Handle category change
  const handleCategoryChange = useCallback((category: ListingCategory) => {
    localStorage.setItem("selectedCategory", category);
    setSelectedCategory(category);
  }, []);

  // Search functionality removed as it's not currently used

  useEffect(() => {
    const subcategories = Array.from(
      new Set(
        listings.all
          .filter((l) => l.category.mainCategory === selectedCategory)
          .map((l) => l.category.subCategory),
      ),
    );
    setAllSubcategories(subcategories);
  }, [listings.all, selectedCategory]);

  // Location and radius changes are handled directly by setSelectedLocation and setSelectedRadius

  // Debug logging for i18n
  console.log("i18n instance:", i18n);
  console.log("Current Language:", i18n.language);
  console.log("Namespaces:", i18n.options.ns);

  // Define sort options with translations from the filters namespace
  const sortOptions = [
    {
      value: "newestFirst",
      label: t("sorting.newest", { ns: "filters" }),
    },
    {
      value: "priceAsc",
      label: t("sorting.price_asc", { ns: "filters" }),
    },
    {
      value: "priceDesc",
      label: t("sorting.price_desc", { ns: "filters" }),
    },
    {
      value: "locationAsc",
      label: t("sorting.location_asc", { ns: "filters" }),
    },
    {
      value: "locationDesc",
      label: t("sorting.location_desc", { ns: "filters" }),
    },
  ];

  // Debug logging sort options

  const renderContent = useCallback(() => {
    if (listings.loading) {
      return (
        <div>
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-600 mb-6">
            {t("home:loading_listings", "جاري تحميل العروض...")}
          </h2>
          <SkeletonListingGrid />
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-row justify-between items-center gap-2 px-2 sm:px-0 mt-4 mb-6 w-full">
          <button
            onClick={toggleFilters}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-auto"
          >
            {t("Filters", "الفلاتر")}
            <MdFilterList className="w-5 h-5" />
            <span className="text-sm">{t("Filters", "الفلاتر")}</span>
          </button>

          {/* Sort By - Always Visible */}
          <div className="relative inline-block text-left w-auto max-w-[160px] sm:w-52">
            <Listbox value={sortBy} onChange={setSortBy}>
              <div className="relative">
                <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 text-sm text-gray-700 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className="truncate">
                    {sortOptions.find((opt) => opt.value === sortBy)?.label ||
                      t("sorting.sort_by", "فرز حسب")}
                  </span>
                  <HiSelector className="w-5 h-5 ml-1 flex-shrink-0 text-gray-400" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-[70] mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg focus:outline-none text-sm">
                  {sortOptions.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      value={option.value}
                      className={({ active }) =>
                        `cursor-pointer select-none px-4 py-2 ${
                          active
                            ? "bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-white"
                            : "text-gray-700 dark:text-white"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span className="flex items-center justify-between">
                          {option.label}
                          {selected && (
                            <HiCheck className="w-4 h-4 text-blue-500 dark:text-white" />
                          )}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>

        {isFilterOpen && (
          <ListingFilters
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            selectedMake={selectedMake}
            setSelectedMake={setSelectedMake}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMileage={selectedMileage}
            setSelectedMileage={setSelectedMileage}
            setSelectedLocation={setSelectedLocation}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            selectedRadius={selectedRadius}
            setSelectedRadius={setSelectedRadius}
            selectedBuiltYear={selectedBuiltYear}
            setSelectedBuiltYear={setSelectedBuiltYear}
            loading={listings.loading}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            yearRange={yearRange}
            onYearRangeChange={setYearRange}
            onLocationChange={(location) => {
              setSelectedLocation(location.address);
            }}
            onRadiusChange={(radius) => {
              setSelectedRadius(radius);
            }}
            onSearch={fetchListings}
          />
        )}

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" itemScope itemType="https://schema.org/ItemList">
          {filteredListings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showActions={false}
              showSaveButton={true}
              showPrice={true}
              showLocation={true}
              showBadges={true}
              priority={index < 2} // Prioritize first two listings for LCP
            />
          ))}
          {listings.all.length === 0 && listings.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400"
            >
              {listings.error && (
                <div className="text-red-500 whitespace-pre-wrap">
                  {typeof listings.error === "string"
                    ? listings.error
                    : "Failed to fetch listings"}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchListings}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("common.try_again", "جرب مرة أخرى")}
              </motion.button>
            </motion.div>
          )}
        </div>

        {listings.popular.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t("home.trending_now", "الأكثر رواجاً")}
            </h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {listings.popular.map((listing, index) => (
                <div itemScope itemType="https://schema.org/Product" itemProp="itemListElement">
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    showActions={false}
                    showSaveButton={true}
                    showPrice={true}
                    showLocation={true}
                    showBadges={true}
                    priority={index === 0} // Prioritize only the first popular listing
                  />
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </>
    );
  }, [
    listings,
    t,
    fetchListings,
    filteredListings,
    isFilterOpen,
    isFiltering,
    selectedAction,
    selectedSubcategory,
    selectedMake,
    selectedModel,
    allSubcategories,
  ]);

  // Generate dynamic title and description based on category
  const getPageMetadata = () => {
    if (selectedCategory === ListingCategory.VEHICLES) {
      return {
        title: t("home:meta.vehicles.title", "أفضل السيارات للبيع في سوريا | سمسار"),
        description: t(
          "home:meta.vehicles.description",
          "تصفح أحدث إعلانات السيارات المستعملة والجديدة في سوريا. سيارات للبيع من مالكين مباشرة أو معارض موثوقة. أسعار تنافسية وضمان الجودة"
        ),
      };
    } else {
      return {
        title: t("home:meta.properties.title", "أفضل العقارات للبيع في سوريا | سمسار"),
        description: t(
          "home:meta.properties.description",
          "تصفح أفضل العروض العقارية في سوريا. شقق، فلل، محلات تجارية، وأراضي للبيع أو الإيجار. أسعار منافسة ومواقع مميزة"
        ),
      };
    }
  };

  const { title, description } = getPageMetadata();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://samsar.app${window.location.pathname}`} />
        
        {/* Twitter */}
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        {/* Canonical URL - Always use non-www version */}
        <link 
          rel="canonical" 
          href={`https://samsar.app${window.location.pathname}${window.location.search}`} 
        />
        
        {/* Alternate Language Versions */}
        <link rel="alternate" hrefLang="ar" href="https://samsar.app/ar" />
        <link rel="alternate" hrefLang="en" href="https://samsar.app/en" />
        <link rel="alternate" hrefLang="x-default" href="https://samsar.app/" />
        
        {/* Ensure search engines know about our preferred domain */}
        <link rel="preconnect" href="https://samsar.app" />
        <meta name="hostname" content="samsar.app" />
      </Helmet>

      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "سمسار",
            "url": "https://samsar.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://samsar.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "inLanguage": "ar_AR",
            "description": "منصة سمسار الرائدة في بيع وشراء السيارات والعقارات في سوريا. تصفح الآلاف من إعلانات السيارات المستعملة، الشقق، الفلل، الأراضي والمزيد في جميع أنحاء سوريا"
          })
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Samsar",
            "image": "https://samsar.sa/logo.png",
            "@id": "",
            "url": window.location.origin,
            "telephone": "+963 11 123 4567",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Damascus, Syria",
              "addressLocality": "Damascus",
              "addressRegion": "Damascus",
              "postalCode": "",
              "addressCountry": "SY"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 33.5138,
              "longitude": 36.2765
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
              ],
              "opens": "09:00",
              "closes": "18:00"
            },
            "sameAs": [
              "https://www.facebook.com/samsarsyria",
              "https://www.instagram.com/samsarsyria",
              "https://twitter.com/samsarsyria"
            ]
          })
        }}
      />
      <link rel="preconnect" href="/" crossOrigin="anonymous" />
      <link rel="preload" href="/waves-light.svg" as="image" crossOrigin="anonymous" />
      
      {/* Canonical URL */}
      <link 
        rel="canonical" 
        href={`${window.location.origin}${i18n.language === 'ar' ? '/ar' : '/en'}`} 
      />
      
      {/* Hreflang for Arabic and English versions */}
      <link 
        rel="alternate" 
        hrefLang="ar" 
        href={`${window.location.origin}/ar`} 
      />
      <link 
        rel="alternate" 
        hrefLang="en" 
        href={`${window.location.origin}/en`} 
      />
      <link 
        rel="alternate" 
        hrefLang="x-default" 
        href={window.location.origin} 
      />
      
      {/* Preload first listing image if it exists */}
      {firstVisibleListing?.images?.[0] && (
        <PreloadImages imageUrls={[String(firstVisibleListing.images[0])]} />
      )}

      {/* Header */}
      <header className="relative bg-blue-800/90 backdrop-blur-sm text-white py-10 sm:py-14 md:py-20 transition-all duration-500">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5 pointer-events-none">
          <img 
            src="/waves-light.svg" 
            alt="" 
            className="w-full h-full object-cover" 
            aria-hidden="true" 
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" id="main-heading">
            {selectedCategory === ListingCategory.VEHICLES 
              ? t("home:vehicle_section.title", "أفضل السيارات")
              : t("home:property_section.title", "أفضل العقارات")}
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-blue-100/90 max-w-3xl mx-auto">
            {selectedCategory === ListingCategory.VEHICLES
              ? t("home:vehicle_section.subtitle", "اكتشف أحدث السيارات الموثقة")
              : t("home:property_section.subtitle", "اكتشف أفضل العقارات الموثقة")}
          </p>

          {/* Category Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory(ListingCategory.VEHICLES)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === ListingCategory.VEHICLES
                  ? "bg-white text-blue-900 shadow-lg"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaCar />
                {t("home:vehicle_section.title")}
              </div>
            </button>
            <button
              onClick={() => setSelectedCategory(ListingCategory.REAL_ESTATE)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === ListingCategory.REAL_ESTATE
                  ? "bg-white text-blue-900 shadow-lg"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaHome />
                {t("home:property_section.title")}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section aria-labelledby="featured-listings-heading">
          <h2 id="featured-listings-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t("home:featured_listings", "تصفح أحدث العروض المميزة")}
          </h2>
          {renderContent()}
        </section>
        
     
        
        {/* Popular Categories Section with Images */}
        <section className="mt-16 bg-gray-50 dark:bg-gray-900 py-12 px-4">
          <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
  <span className="hidden" aria-hidden="true">تصفح الفئات الأكثر طلباً</span>
  <span>{t("home:popular_categories", "تصفح الفئات الأكثر طلباً")}</span>
</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category 1 - Cars */}
              <div className="group relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
                <div className="relative h-48">
                  <ImageFallback
                    src="https://pub-363346cde076465bb0bb5ca74ae5d4f9.r2.dev/bmw-8327255_1920.jpg?width=800&quality=75"
                    alt={t("home:categories.cars", "سيارات")}
                    className="w-full h-full object-cover"
                    width={800}
                    height={600}
                    loading="lazy"
                    fallbackText={t("home:categories.cars", "سيارات")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold">
                    <span className="hidden" aria-hidden="true">سيارات</span>
                    <span>{t("home:categories.cars", "سيارات")}</span>
                  </h3>
                  <p className="text-sm opacity-90">
                    <span className="hidden" aria-hidden="true">أحدث الموديلات والماركات</span>
                    <span>{t("home:categories.cars_desc", "أحدث الموديلات والماركات")}</span>
                  </p>
                </div>
                <a 
                  href="/listings?category=vehicles&subCategory=CAR" 
                  className="absolute inset-0 z-10" 
                  aria-label={t("home:categories.browse_cars", "تصفح السيارات")} 
                />
              </div>
              
              {/* Category 2 - Real Estate */}
              <div className="group relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
                <div className="relative h-48">
                  <ImageFallback
                    src="https://pub-363346cde076465bb0bb5ca74ae5d4f9.r2.dev/building-8078604_1920.jpg?width=800&quality=75"
                    alt={t("home:categories.real_estate", "عقارات")}
                    className="w-full h-full object-cover"
                    width={800}
                    height={600}
                    loading="lazy"
                    fallbackText={t("home:categories.real_estate", "عقارات")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold">
                    <span className="hidden" aria-hidden="true">عقارات</span>
                    <span>{t("home:categories.real_estate", "عقارات")}</span>
                  </h3>
                  <p className="text-sm opacity-90">
                    <span className="hidden" aria-hidden="true">شقق، فلل، محلات تجارية</span>
                    <span>{t("home:categories.real_estate_desc", "شقق، فلل، محلات تجارية")}</span>
                  </p>
                </div>
                <a href="/listings?category=real_estate" className="absolute inset-0 z-10" aria-label="{t('browse_real_estate', 'تصفح العقارات')}" />
              </div>
              
              {/* Category 3 - Motorcycles */}
              <div className="group relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
                <div className="relative h-48">
                  <ImageFallback
                    src="https://pub-363346cde076465bb0bb5ca74ae5d4f9.r2.dev/motorcycle.png?width=800&quality=75&format=webp"
                    alt={t("home:categories.motorcycles", "دراجات نارية")}
                    className="w-full h-full object-cover"
                    width={800}
                    height={600}
                    loading="lazy"
                    fallbackText={t("home:categories.motorcycles", "دراجات نارية")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold">
                    <span className="hidden" aria-hidden="true">دراجات نارية</span>
                    <span>{t("home:categories.motorcycles", "دراجات نارية")}</span>
                  </h3>
                  <p className="text-sm opacity-90">
                    <span className="hidden" aria-hidden="true">أحدث الموديلات بأسعار منافسة</span>
                    <span>{t("home:categories.motorcycles_desc", "أحدث الموديلات بأسعار منافسة")}</span>
                  </p>
                </div>
                <a href="/listings?category=vehicles&subCategory=MOTORCYCLE" className="absolute inset-0 z-10" aria-label="{t('browse_motorcycles', 'تصفح الدراجات النارية')}" />
              </div>
              
              {/* Category 4 - Commercial */}
              <div className="group relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
                <div className="relative h-48">
                  <ImageFallback
                    src="https://pub-363346cde076465bb0bb5ca74ae5d4f9.r2.dev/office-1094826_1920.jpg?width=800&quality=75"
                    alt={t("home:categories.commercial", "تجاري")}
                    className="w-full h-full object-cover"
                    width={800}
                    height={600}
                    loading="lazy"
                    fallbackText={t("home:categories.commercial", "تجاري")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold">
                    <span className="hidden" aria-hidden="true">تجاري</span>
                    <span>{t("home:categories.commercial", "تجاري")}</span>
                  </h3>
                  <p className="text-sm opacity-90">
                    <span className="hidden" aria-hidden="true">محلات ومكاتب تجارية</span>
                    <span>{t("home:categories.commercial_desc", "محلات ومكاتب تجارية")}</span>
                  </p>
                </div>
                <a href="/listings?category=real_estate&subCategory=COMMERCIAL" className="absolute inset-0 z-10" aria-label="{t('browse_commercial', 'تصفح العقارات التجارية')}" />
              </div>
            </div>
            
            {/* Structured Data for SEO */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": [
                  {
                    "@type": "CategoryCode",
                    "position": 1,
                    "name": t("categories.cars", "سيارات"),
                    "url": window.location.origin + "/listings?category=vehicles&subCategory=CAR"
                  },
                  {
                    "@type": "CategoryCode",
                    "position": 2,
                    "name": t("categories.real_estate", "عقارات"),
                    "url": window.location.origin + "/listings?category=real_estate"
                  },
                  {
                    "@type": "CategoryCode",
                    "position": 3,
                    "name": t("categories.motorcycles", "دراجات نارية"),
                    "url": window.location.origin + "/listings?category=vehicles&subCategory=MOTORCYCLE"
                  },
                  {
                    "@type": "CategoryCode",
                    "position": 4,
                    "name": t("categories.commercial", "تجاري"),
                    "url": window.location.origin + "/listings?category=real_estate&subCategory=COMMERCIAL"
                  }
                ]
              })}
            </script>
          </div>
        </section>
           {/* Additional SEO Content */}
           <section className="mt-16 max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
              <span className="hidden" aria-hidden="true">منصة سمسار - الوجهة الأولى للعقارات والمركبات في سوريا</span>
                    {t("home:about_section_title", "منصة سمسار - الوجهة الأولى للعقارات والمركبات في سوريا")}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                  <span className="hidden" aria-hidden="true">تأسست منصة سمسار بهدف توفير تجربة فريدة للعملاء الباحثين عن أفضل العروض العقارية والمركبات في سوريا. نفتخر بتقديم خدمة متكاملة تشمل كل ما تحتاجه للعثور على العقار أو السيارة المثالية التي تناسب احتياجاتك وميزانيتك.</span>
                  {t("home:about_section_text_1", "تأسست منصة سمسار بهدف توفير تجربة فريدة للعملاء الباحثين عن أفضل العروض العقارية والمركبات في سوريا. نفتخر بتقديم خدمة متكاملة تشمل كل ما تحتاجه للعثور على العقار أو السيارة المثالية التي تناسب احتياجاتك وميزانيتك.")}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                  <span className="hidden" aria-hidden="true">بفضل فريقنا من الخبراء والمختصين، نضمن لك الحصول على معلومات دقيقة وموثوقة عن كل عرض، مع صور عالية الجودة ووصف تفصيلي شامل. نسعى دائماً لتقديم أحدث العروض وأفضلها في السوق السوري.</span>
                  <span>{t("home:about_section_text_2", "بفضل فريقنا من الخبراء والمختصين، نضمن لك الحصول على معلومات دقيقة وموثوقة عن كل عرض، مع صور عالية الجودة ووصف تفصيلي شامل. نسعى دائماً لتقديم أحدث العروض وأفضلها في السوق السوري.")}</span>
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  <span className="hidden" aria-hidden="true">لماذا تختار منصة سمسار؟</span>
                  <span>{t("home:why_choose_us", "لماذا تختار منصة سمسار؟")}</span>
                </h3>
                <ul className="space-y-3 mt-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t("home:features.thousands_listings", "آلاف العروض المميزة من العقارات والمركبات")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t("home:features.competitive_prices", "أسعار تنافسية تناسب جميع الميزانيات")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t("home:features.user_friendly", "واجهة سهلة الاستخدام مع خيارات بحث متقدمة")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t("home:features.support", "خدمة عملاء على مدار الساعة")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t("home:features.free_evaluation", "تقييم مجاني للعقارات والمركبات")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                <span className="hidden" aria-hidden="true">خدماتنا الإضافية</span>
                <span>{t("home:our_services", "خدماتنا الإضافية")}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">
                    <span className="hidden" aria-hidden="true">تقييم عقاري</span>
                    <span>{t("home:service_1", "تقييم عقاري")}</span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="hidden" aria-hidden="true">تقييم دقيق للعقارات</span>
                    <span>{t("home:service_1_desc", "تقييم دقيق للعقارات")}</span>
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-300">
                    <span className="hidden" aria-hidden="true">تسويق عقاري</span>
                    <span>{t("home:service_2", "تسويق عقاري")}</span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="hidden" aria-hidden="true">تسويق متكامل للعقارات</span>
                    <span>{t("home:service_2_desc", "تسويق متكامل للعقارات")}</span>
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 dark:text-purple-300">
                    <span className="hidden" aria-hidden="true">خدمات قانونية</span>
                    <span>{t("home:service_3", "خدمات قانونية")}</span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="hidden" aria-hidden="true">استشارات قانونية متخصصة</span>
                    <span>{t("home:service_3_desc", "استشارات قانونية متخصصة")}</span>
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                    <span className="hidden" aria-hidden="true">خدمات التمويل</span>
                    <span>{t("home:service_4", "خدمات التمويل")}</span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="hidden" aria-hidden="true">حلول تمويلية ميسرة</span>
                    <span>{t("home:service_4_desc", "حلول تمويلية ميسرة")}</span>
                  </p>
                </div>
              </div>
              
              
             
            </div>
          </div>
        </section>

        {/* Samsar Advantage Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                <span className="hidden" aria-hidden="true">ميزات سمسار الفريدة</span>
                {t("home:advantage.title", "ميزات سمسار الفريدة")}
              </h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                <span className="hidden" aria-hidden="true">اكتشف لماذا يختار آلاف العملاء منصة سمسار</span>
                {t("home:advantage.subtitle", "اكتشف لماذا يختار آلاف العملاء منصة سمسار")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Interactive Cards */}
              <div className="space-y-6">
                {[
                  {
                    icon: "🔍",
                    title: "home:advantage.real_time.title",
                    titleAr: "عروض حصرية",
                    description: "home:advantage.real_time.description",
                    descriptionAr: "وصول حصري لأحدث العروض قبل غيرك مع تحديثات فورية",
                    color: "from-blue-500 to-indigo-600"
                  },
                  {
                    icon: "🛡️",
                    title: "home:advantage.verified.title",
                    titleAr: "عروض موثقة",
                    description: "home:advantage.verified.description",
                    descriptionAr: "جميع الإعلانات خاضعة للتدقيق والتحقق من صحتها",
                    color: "from-green-500 to-emerald-600"
                  },
                  {
                    icon: "🚀",
                    title: "home:advantage.fast.title",
                    titleAr: "تجربة سلسة",
                    description: "home:advantage.fast.description",
                    descriptionAr: "تصفح سريع وسهل مع واجهة بسيطة وبديهية",
                    color: "from-purple-500 to-fuchsia-600"
                  }
                ].map((item, index) => (
                  <div key={index} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300`}></div>
                    <div className="relative flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-2xl">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          <span className="hidden" aria-hidden="true">{item.titleAr}</span>
                          {t(item.title, item.titleAr)}
                        </h3>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">
                          <span className="hidden" aria-hidden="true">{item.descriptionAr}</span>
                          {t(item.description, item.descriptionAr)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column - FAQ */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  <span className="hidden" aria-hidden="true">أسئلة شائعة</span>
                  {t("home:faq.title", "أسئلة شائعة")}
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      question: "home:faq.how_to_list",
                      questionAr: "كيف يمكنني إضافة إعلان على سمسار؟",
                      answer: "home:faq.how_to_list_answer",
                      answerAr: "انقر على زر 'أضف إعلان' في الأعلى، املأ التفاصيل المطلوبة، وأضف الصور ثم انشر إعلانك. سنقوم بمراجعته والتأكيد خلال 24 ساعة.",
                      answerFallback: "انقر على زر 'أضف إعلان' في الأعلى، املأ التفاصيل المطلوبة، وأضف الصور ثم انشر إعلانك. سنقوم بمراجعته والتأكيد خلال 24 ساعة."
                    },
                    {
                      question: "home:faq.payment_methods",
                      questionAr: "ما هي طرق الدفع المتاحة؟",
                      answer: "home:faq.payment_methods_answer",
                      answerAr: "نقبل الدفع عبر البطاقات البنكية، المحافظ الإلكترونية، والتحويلات البنكية. جميع المعاملات مؤمنة بنسبة 100%.",
                      answerFallback: "نقبل الدفع عبر البطاقات البنكية، المحافظ الإلكترونية، والتحويلات البنكية. جميع المعاملات مؤمنة بنسبة 100%."
                    },
                    {
                      question: "home:faq.verification",
                      questionAr: "كيف يتم التحقق من صحة الإعلانات؟",
                      answer: "home:faq.verification_answer",
                      answerAr: "يخضع كل إعلان لمراجعة من قبل فريقنا للتأكد من دقة المعلومات والتأكد من هوية المعلن.",
                      answerFallback: "يخضع كل إعلان لمراجعة من قبل فريقنا للتأكد من دقة المعلومات والتأكد من هوية المعلن."
                    },
                    {
                      question: "home:faq.contact_support",
                      questionAr: "كيف يمكنني التواصل مع خدمة العملاء؟",
                      answer: "home:faq.contact_support_answer",
                      answerAr: "يمكنك التواصل معنا عبر الدردشة المباشرة، البريد الإلكتروني، أو الاتصال بنا على الرقم 123456789. نحن متواجدون على مدار الساعة.",
                      answerFallback: "يمكنك التواصل معنا عبر الدردشة المباشرة، البريد الإلكتروني، أو الاتصال بنا على الرقم 123456789. نحن متواجدون على مدار الساعة."
                    }
                  ].map((item, index) => (
                    <details key={index} className="group border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                      <summary className="flex justify-between items-center font-medium text-gray-900 dark:text-white cursor-pointer list-none">
                        <span>
                          <span className="hidden" aria-hidden="true">{item.questionAr}</span>
                          {t(item.question, item.questionAr)}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </summary>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        <span className="hidden" aria-hidden="true">{item.answerAr}</span>
                        {t(item.answer, item.answerAr)}
                      </p>
                    </details>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                    <span className="hidden" aria-hidden="true">هل تحتاج إلى مساعدة؟</span>
                    <span>{t("home:help.title", "هل تحتاج إلى مساعدة؟")}</span>
                  </h4>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    <span className="hidden" aria-hidden="true">فريق الدعم لدينا متاح على مدار الساعة للإجابة على استفساراتك.</span>
                    <span>{t("home:help.description", "فريق الدعم لدينا متاح على مدار الساعة للإجابة على استفساراتك.")}</span>
                  </p>
                  <button className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="hidden" aria-hidden="true">تواصل مع الدعم</span>
                    <span>{t("home:help.contact_button", "تواصل مع الدعم")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
