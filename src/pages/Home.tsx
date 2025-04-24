import { listingsAPI } from "@/api/listings.api";
import ListingCard from "@/components/listings/details/ListingCard";
import ListingFilters from "@/components/filters/ListingFilters";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ListingCategory, VehicleType, PropertyType } from "@/types/enums";
import {
  type ExtendedListing
} from "@/types/listings";
import { serverStatus } from "@/utils/serverStatus";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdFilterList } from "react-icons/md";
import { FaCar, FaHome } from "react-icons/fa";
import { toast } from "react-toastify";
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
  sortOrder?: 'asc' | 'desc';
  limit: number;
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
  const [sortBy, setSortBy] = useState<string>("newestFirst");
  const { t, i18n } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory>(ListingCategory.VEHICLES);
  const [selectedPrice, setSelectedPrice] = useState<string>("");
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
  const [selectedAction, setSelectedAction] = useState<"SELL" | "RENT" | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedBuiltYear, setSelectedBuiltYear] = useState<string | null>(null);
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
          sortedListings.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
          break;
        case "locationDesc":
          sortedListings.sort((a, b) => (b.location || '').localeCompare(a.location || ''));
          break;
        case "newestFirst":
        default:
          sortedListings.sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
      }

      // Apply filters
      let filteredListings = sortedListings.filter(listing => {
        if (selectedCategory === ListingCategory.VEHICLES) {
          // Vehicle filtering
          if (selectedYear && listing.details?.vehicles?.year) {
            if (parseInt(listing.details.vehicles.year) !== parseInt(selectedYear)) return false;
          }
          if (selectedSubcategory && listing.details?.vehicles?.vehicleType) {
            if (listing.details.vehicles.vehicleType !== selectedSubcategory) return false;
          }
          if (selectedMake && listing.details?.vehicles?.make) {
            if (listing.details.vehicles.make !== selectedMake) return false;
          }
          if (selectedModel && listing.details?.vehicles?.model) {
            if (listing.details.vehicles.model !== selectedModel) return false;
          }
          if (selectedPrice && listing.price) {
            if (listing.price.toString() !== selectedPrice) return false;
          }
        } else if (selectedCategory === ListingCategory.REAL_ESTATE) {
          // Real estate filtering
          if (selectedSubcategory && listing.details?.realEstate?.propertyType) {
            if (listing.details.realEstate.propertyType !== selectedSubcategory) return false;
          }
          if (selectedLocation && listing.location) {
            if (listing.location.toLowerCase() !== selectedLocation.toLowerCase()) return false;
          }
          if (selectedBuiltYear && listing.details?.realEstate?.yearBuilt) {
            // Built year filter: "2023 and newer", "2010 and newer", "Before 2000"
            const builtYear = Number(listing.details.realEstate.yearBuilt);
            const filterYear = parseInt(selectedBuiltYear);
            if (selectedBuiltYear === '2000') {
              // Before 2000
              if (builtYear >= 2000) return false;
            } else if (!isNaN(filterYear)) {
              // e.g. 2023 and newer, 2010 and newer
              if (builtYear < filterYear) return false;
            }
          }
        }
        return true;
      });

      setListings(prev => ({
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
      setListings(prev => ({ ...prev, loading: true }));
      
      // Only create new abort controller if we need to abort the current request
      if (abortControllerRef.current.signal.aborted) {
        abortControllerRef.current = new AbortController();
      }

      const params: ListingParams = {
        category: {
          mainCategory: selectedCategory,
          ...(selectedSubcategory && { subCategory: selectedSubcategory as VehicleType | PropertyType }),
        },
        ...(selectedMake && { make: selectedMake }),
        ...(selectedModel && { model: selectedModel }),
        ...(selectedYear && { year: Number(selectedYear) }), // Convert string year to number
        sortBy,
        sortOrder: sortBy === "priceAsc" || sortBy === "locationAsc" ? "asc" : "desc",
        limit: 10,
        preview: true,
      };

      const response = await listingsAPI.getAll(params, abortControllerRef.current.signal);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch listings");
      }

      if (!response.data.listings) {
        throw new Error(response.error || "Failed to fetch listings");
      }

      // Cache the results
      listingsCache.current[selectedCategory] = response.data.listings;

      setListings(prev => ({
        ...prev,
        all: response.data.listings,
        loading: false,
      }));
    } catch (error) {
      if (error instanceof Error && (error.name === "AbortError" || error.message.includes("aborted"))) {
        return;
      }
      console.error("Error fetching listings:", error);
      setListings(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to fetch listings",
        loading: false,
      }));
    }
  }, [selectedCategory, selectedSubcategory, selectedMake, selectedModel, selectedYear, sortBy, isInitialLoad, isServerOnline, t]);

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
      const matchesCategory = listing.category.mainCategory === selectedCategory;
      const matchesAction = selectedAction ? listing.listingAction?.toString() === selectedAction : true;
      const matchesSubcategory = selectedSubcategory ? listing.category.subCategory === selectedSubcategory : true;
      const matchesMake = selectedMake ? listing.details.vehicles?.make === selectedMake : true;
      const matchesModel = selectedModel ? listing.details.vehicles?.model === selectedModel : true;
      const matchesYear = selectedYear ? listing.details.vehicles?.year?.toString() === selectedYear : true;
      const matchesPrice = selectedPrice ? listing.price?.toString() === selectedPrice : true;
      
      return matchesCategory && matchesAction && matchesSubcategory && matchesMake && matchesModel && matchesYear && matchesPrice;
    });
    setIsFiltering(false);
    return filtered;
  }, [listings.all, selectedCategory, selectedAction, selectedSubcategory, selectedMake, selectedModel, selectedYear, selectedPrice]);

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
    [isServerOnline, t, fetchListings]
  );

  useEffect(() => {
    const subcategories = Array.from(
      new Set(
        listings.all
          .filter((l) => l.category.mainCategory === selectedCategory)
          .map((l) => l.category.subCategory)
      )
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

  // Debug logging for i18n
  console.log('i18n instance:', i18n);
  console.log('Current Language:', i18n.language);
  console.log('Namespaces:', i18n.options.ns);

  // Define sort options with translation
  // Log the translations loaded for sortOptions
console.log('Loaded sortOptions translations:', t('sortOptions', { returnObjects: true }));

const sortOptions = [
  {
    value: "newestFirst",
    label: t("common.sortOptions.newestFirst") !== "common.sortOptions.newestFirst" ? t("common.sortOptions.newestFirst") : (() => { console.warn('Missing translation: common.sortOptions.newestFirst'); return "Newest First"; })()
  },
  {
    value: "priceAsc",
    label: t("common.sortOptions.priceAsc") !== "common.sortOptions.priceAsc" ? t("common.sortOptions.priceAsc") : (() => { console.warn('Missing translation: common.sortOptions.priceAsc'); return "Price: Low to High"; })()
  },
  {
    value: "priceDesc",
    label: t("common.sortOptions.priceDesc") !== "common.sortOptions.priceDesc" ? t("common.sortOptions.priceDesc") : (() => { console.warn('Missing translation: common.sortOptions.priceDesc'); return "Price: High to Low"; })()
  },
  {
    value: "locationAsc",
    label: t("common.sortOptions.locationAsc") !== "common.sortOptions.locationAsc" ? t("common.sortOptions.locationAsc") : (() => { console.warn('Missing translation: common.sortOptions.locationAsc'); return "Location: A to Z"; })()
  },
  {
    value: "locationDesc",
    label: t("common.sortOptions.locationDesc") !== "common.sortOptions.locationDesc" ? t("common.sortOptions.locationDesc") : (() => { console.warn('Missing translation: common.sortOptions.locationDesc'); return "Location: Z to A"; })()
  },
];

  // Debug logging
  console.log('Sort Options Translations:', {
    newestFirst: t("common.sortOptions.newestFirst"),
    priceAsc: t("common.sortOptions.priceAsc"),
    priceDesc: t("common.sortOptions.priceDesc"),
    locationAsc: t("common.sortOptions.locationAsc"),
    locationDesc: t("common.sortOptions.locationDesc"),
  });

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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 px-2 sm:px-0 mt-4 mb-6">
          <button 
            onClick={toggleFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto self-start"
          >
            <MdFilterList className="w-5 h-5" />
            <span className="text-sm">{t("common.Filters")}</span>
          </button>

          {/* Sort By - Always Visible */}
          <div className="relative inline-block text-left w-52">
            <Listbox value={sortBy} onChange={setSortBy}>
              <div className="relative">
                <Listbox.Button className="w-full flex justify-between items-center px-4 py-2 text-sm text-gray-700 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {sortOptions.find(opt => opt.value === sortBy)?.label || t("common.filters.sort_by")}
                  <HiSelector className="w-5 h-5 text-gray-400" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-[70] mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg focus:outline-none text-sm">
                  {sortOptions.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      value={option.value}
                      className={({ active, selected }) =>
                        `cursor-pointer select-none px-4 py-2 ${
                          active ? "bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-white" : "text-gray-700 dark:text-white"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span className="flex items-center justify-between">
                          {option.label}
                          {selected && <HiCheck className="w-4 h-4 text-blue-500 dark:text-white" />}
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
  }, [listings, isServerOnline, t, fetchListings, filteredListings, isFilterOpen, isFiltering, selectedAction, selectedSubcategory, selectedMake, selectedModel, allSubcategories]);

  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-transparent">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 sm:py-10 md:py-12 min-h-[20vh] sm:min-h-[22vh] lg:min-h-[25vh]">


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">
              {t("home.find_perfect")}{" "}
              {selectedCategory === ListingCategory.VEHICLES
                ? t("home.vehicle")
                : t("home.property")}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-8">
              {selectedCategory === ListingCategory.VEHICLES
                ? t("home.discover_vehicle")
                : t("home.discover_property")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <button
                onClick={() => handleCategoryChange(ListingCategory.VEHICLES)}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                  selectedCategory === ListingCategory.VEHICLES
                    ? "bg-white text-blue-600"
                    : "bg-blue-700 text-white hover:bg-blue-600"
                }`}
              >
                <FaCar className="mr-2" />
                {t("navigation.vehicles")}
              </button>
              <button
                onClick={() =>
                  handleCategoryChange(ListingCategory.REAL_ESTATE)
                }
                className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                  selectedCategory === ListingCategory.REAL_ESTATE
                    ? "bg-white text-blue-600"
                    : "bg-blue-700 text-white hover:bg-blue-600"
                }`}
              >
                <FaHome className="mr-2" />
                {t("navigation.real_estate")}
              </button>
            </div>
            
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderContent()}
      </div>
    </div>
  );
};

export default Home;