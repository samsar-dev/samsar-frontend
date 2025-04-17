import { listingsAPI } from "@/api/listings.api";
import ListingCard from "@/components/listings/details/ListingCard";
import ListingFilters from "@/components/filters/ListingFilters";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { SearchBar } from "@/components/ui/SearchBar";
import { ListingCategory, VehicleType, PropertyType } from "@/types/enums";
import { type ExtendedListing } from "@/types/listings";
import { serverStatus } from "@/utils/serverStatus";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCar, FaHome } from "react-icons/fa";
import { toast } from "react-toastify";
import { MdFilterList } from "react-icons/md";
import { HiOutlineFilter } from "react-icons/hi";
import { Listbox } from "@headlessui/react";
import { HiSelector, HiCheck } from "react-icons/hi";

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
  limit?: number;
  page?: number;
  year?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  preview?: boolean;
  forceRefresh?: boolean;
}

interface ListingsState {
  all: ExtendedListing[];
  popular: ExtendedListing[];
  loading: boolean;
  error: string | null;
}

const Home: React.FC = () => {
  // ...existing code...
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory>(
    (localStorage.getItem("selectedCategory") as ListingCategory) ||
      ListingCategory.VEHICLES,
  );
  const [listings, setListings] = useState<ListingsState>({
    all: [],
    popular: [],
    loading: true,
    error: null,
  });
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  // Filter states
  const [selectedAction, setSelectedAction] = useState<"SELL" | "RENT" | null>(
    null,
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedBuiltYear, setSelectedBuiltYear] = useState<string | null>(
    null,
  );
  const [allSubcategories, setAllSubcategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Cache for storing initial listings data
  const listingsCache = useRef<{
    [key in ListingCategory]?: ExtendedListing[];
  }>({});

  const fetchListings = useCallback(async () => {
    // If we have cached data for this category and it's not initial load, use it
    if (!isInitialLoad && listingsCache.current[selectedCategory]) {
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
        case "createdAt":
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
            if (
              parseInt(listing.details.vehicles.year) !== parseInt(selectedYear)
            )
              return false;
          }
          if (selectedSubcategory && listing.details?.vehicles?.vehicleType) {
            if (listing.details.vehicles.vehicleType !== selectedSubcategory)
              return false;
          }
          if (selectedMake && listing.details?.vehicles?.make) {
            if (listing.details.vehicles.make !== selectedMake) return false;
          }
          if (selectedModel && listing.details?.vehicles?.model) {
            if (listing.details.vehicles.model !== selectedModel) return false;
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
          if (selectedBuiltYear && listing.details?.realEstate?.yearBuilt) {
            // Built year filter: "2023 and newer", "2010 and newer", "Before 2000"
            const builtYear = parseInt(listing.details.realEstate.yearBuilt);
            const filterYear = parseInt(selectedBuiltYear);
            if (selectedBuiltYear === "2000") {
              // Before 2000
              if (builtYear >= 2000) return false;
            } else if (!isNaN(filterYear)) {
              // e.g. 2023 and newer, 2010 and newer
              if (builtYear < filterYear) return false;
            }
          }
        }
        // Location filter for both categories
        if (selectedLocation && listing.location) {
          // Accept both uppercase and lowercase for legacy data
          const listingLocUpper = listing.location.toUpperCase();
          const selectedLocUpper = selectedLocation.toUpperCase();
          const listingLocLower = listing.location.toLowerCase();
          const selectedLocLower = selectedLocation.toLowerCase();
          if (
            listingLocUpper !== selectedLocUpper &&
            listingLocLower !== selectedLocLower
          )
            return false;
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

    if (!isServerOnline) {
      setListings((prev) => ({
        ...prev,
        loading: false,
        error: t("errors.server_offline"),
      }));
      return;
    }

    try {
      setListings((prev) => ({ ...prev, loading: true }));

      // Only create new abort controller if we need to abort the current request
      if (abortControllerRef.current.signal.aborted) {
        abortControllerRef.current = new AbortController();
      }

      const params: ListingParams = {
        category: {
          mainCategory: selectedCategory,
          ...(selectedSubcategory && {
            subCategory: selectedSubcategory as VehicleType | PropertyType,
          }),
        },
        ...(selectedMake && { make: selectedMake }),
        ...(selectedModel && { model: selectedModel }),
        ...(selectedYear && { year: parseInt(selectedYear) }), // Convert string year to number
        ...(selectedLocation && { location: selectedLocation }),
        ...(selectedBuiltYear && { builtYear: parseInt(selectedBuiltYear) }),
        sortBy,
        sortOrder:
          sortBy === "priceAsc" || sortBy === "locationAsc" ? "asc" : "desc",
      };

      const response = await listingsAPI.getAll(
        params,
        abortControllerRef.current.signal,
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch listings");
      }

      // Cache the results
      listingsCache.current[selectedCategory] = response.data.listings;

      setListings((prev) => ({
        ...prev,
        all: response.data.listings,
        loading: false,
      }));
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.message.includes("aborted"))
      ) {
        return;
      }
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
    selectedBuiltYear,
    sortBy,
    isInitialLoad,
    isServerOnline,
    t,
  ]);

  // Single effect for fetching listings - only on category change or initial load
  useEffect(() => {
    if (isServerOnline) {
      fetchListings();
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }

    return () => {
      // No need to abort here, it's handled in the fetchListings function
    };
  }, [isServerOnline, selectedCategory, fetchListings, isInitialLoad]);

  // Memoized filtered listings
  const filteredListings = useMemo(() => {
    setIsFiltering(true);
    const filtered = listings?.all?.filter((listing) => {
      const matchesCategory =
        listing.category.mainCategory === selectedCategory;
      const matchesAction = selectedAction
        ? listing.listingAction === selectedAction
        : true;
      const matchesSubcategory = selectedSubcategory
        ? listing.category.subCategory === selectedSubcategory
        : true;

      // Vehicle-specific filters
      const matchesMake = selectedMake
        ? listing.details.vehicles?.make === selectedMake
        : true;
      const matchesModel = selectedModel
        ? listing.details.vehicles?.model === selectedModel
        : true;
      const matchesYear = selectedYear
        ? listing.details.vehicles?.year === parseInt(selectedYear)
        : true;

      // Real estate-specific filters
      const matchesLocation = selectedLocation
        ? listing.location.toLowerCase() === selectedLocation.toLowerCase()
        : true;
      const matchesBuiltYear = selectedBuiltYear
        ? listing.details.realEstate?.yearBuilt === selectedBuiltYear
        : true;

      return (
        matchesCategory &&
        matchesAction &&
        matchesSubcategory &&
        ((selectedCategory === ListingCategory.VEHICLES &&
          matchesMake &&
          matchesModel &&
          matchesYear) ||
          (selectedCategory === ListingCategory.REAL_ESTATE &&
            matchesLocation &&
            matchesBuiltYear))
      );
    });
    setIsFiltering(false);
    return filtered;
  }, [
    listings.all,
    selectedCategory,
    selectedAction,
    selectedSubcategory,
    selectedMake,
    selectedModel,
    selectedYear,
  ]);

  // Handle category change
  const handleCategoryChange = useCallback((category: ListingCategory) => {
    localStorage.setItem("selectedCategory", category);
    setSelectedCategory(category);
  }, []);

  // Handle server status changes
  useEffect(() => {
    const unsubscribe = serverStatus.subscribe(setIsServerOnline);
    return () => unsubscribe();
  }, []);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!isServerOnline) {
        toast.error(t("errors.server_offline"));
        return;
      }

      if (!query.trim()) {
        await fetchListings();
        return;
      }

      try {
        setListings((prev) => ({ ...prev, loading: true }));
        const searchResults = await listingsAPI.search(query);

        setListings({
          all: searchResults.data?.listings || [],
          popular: [],
          loading: false,
          error: null,
        });
      } catch (error) {
        setListings((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : t("errors.search_failed"),
        }));
      }
    },
    [isServerOnline, t, fetchListings],
  );

  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 500),
    [handleSearch],
  );

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

  // Reset filters when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedLocation(null);
    setSelectedBuiltYear(null);
  }, [selectedCategory]);

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Define sort options with translation
  const sortOptions = [
    { value: "createdAt", label: t("newest") },
    { value: "priceAsc", label: t("price low high") },
    { value: "priceDesc", label: t("price high low") },
    { value: "locationAsc", label: t("location_a_z") },
    { value: "locationDesc", label: t("location_z_a") },
  ];

  const renderContent = useCallback(() => {
    if (listings.loading) {
      return (
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2 sm:px-0 mt-4 mb-6">
          <button
            onClick={toggleFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <MdFilterList className="w-5 h-5" />
            <span className="text-sm">{t("Filters")}</span>
          </button>

          {/* Sort By - Always Visible */}
          <div className="relative inline-block text-left w-52 z-[999]">
            <Listbox value={sortBy} onChange={setSortBy}>
              <div className="relative">
                <Listbox.Button className="w-full flex justify-between items-center px-4 py-2 text-sm text-gray-700 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label ||
                    t("filters.sort_by")}
                  <HiSelector className="w-5 h-5 text-gray-400" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg focus:outline-none text-sm">
                  {sortOptions.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      value={option.value}
                      className={({ active, selected }) =>
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
          <div className="relative z-50 overflow-visible mb-6">
            <ListingFilters
              selectedCategory={selectedCategory}
              selectedAction={selectedAction}
              setSelectedAction={setSelectedAction}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              allSubcategories={allSubcategories}
              selectedMake={selectedMake}
              setSelectedMake={setSelectedMake}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedBuiltYear={selectedBuiltYear}
              setSelectedBuiltYear={setSelectedBuiltYear}
              isLoading={listings.loading}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showActions={false}
              showSaveButton={true}
              showPrice={true}
              showLocation={true}
              showBadges={true}
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
                    : t("errors.fetch_failed")}
                </div>
              )}
              {isServerOnline && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchListings}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("common.try_again")}
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>

        {listings.popular.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t("home.trending_now")}
            </h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {listings.popular.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showActions={false}
                  showSaveButton={true}
                  showPrice={true}
                  showLocation={true}
                  showBadges={true}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </>
    );
  }, [
    listings,
    isServerOnline,
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent">
  <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 sm:py-8 md:py-10">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
        {t("home.find_perfect")}{" "}
        {selectedCategory === ListingCategory.VEHICLES
          ? t("home.vehicle")
          : t("home.property")}
      </h1>
      <p className="text-base sm:text-lg text-blue-100 mb-5">
        {selectedCategory === ListingCategory.VEHICLES
          ? t("home.discover_vehicle")
          : t("home.discover_property")}
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-5">
        <button
          onClick={() => handleCategoryChange(ListingCategory.VEHICLES)}
          className={`flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === ListingCategory.VEHICLES
              ? "bg-white text-blue-700 shadow"
              : "bg-blue-700 text-white hover:bg-blue-600"
          }`}
        >
          <FaCar className="mr-2" />
          {t("navigation.vehicles")}
        </button>
        <button
          onClick={() => handleCategoryChange(ListingCategory.REAL_ESTATE)}
          className={`flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === ListingCategory.REAL_ESTATE
              ? "bg-white text-blue-700 shadow"
              : "bg-blue-700 text-white hover:bg-blue-600"
          }`}
        >
          <FaHome className="mr-2" />
          {t("navigation.real_estate")}
        </button>
      </div>

      <div className="px-2 sm:px-4">
        <SearchBar onSearch={debouncedSearch} className="w-full max-w-3xl mx-auto" />
      </div>
    </div>
  </div>
  
  
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {renderContent()}
      </div>
    </div>
  );
};
  
export default Home;
