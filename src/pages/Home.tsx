import { listingsAPI } from "@/api/listings.api";
import ListingCard from "@/components/listings/details/ListingCard";
import ListingFilters from "@/components/filters/ListingFilters";
import SkeletonListingGrid from "@/components/common/SkeletonGrid";
import PreloadImages from "@/components/media/PreloadImages";
import { ListingCategory, VehicleType, PropertyType, ListingAction } from "@/types/enums";
import { type ExtendedListing } from "@/types/listings";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdFilterList } from "react-icons/md";
import { FaCar, FaHome } from "react-icons/fa";
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
    ListingCategory.VEHICLES
  );
  // Price range state
  const [priceRange, setPriceRange] = useState<{ min: number | ''; max: number | '' }>({ min: '', max: '' });
  // Year range state
  const [yearRange, setYearRange] = useState<{ min: number | ''; max: number | '' }>({ min: '', max: '' });
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
  const [selectedAction, setSelectedAction] = useState<ListingAction | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  // Mileage filter state
  const [selectedMileage, setSelectedMileage] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [selectedBuiltYear, setSelectedBuiltYear] = useState<number | null>(null);
  const [allSubcategories, setAllSubcategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const toggleFilters = useCallback(() => {
    setIsFilterOpen(prev => !prev);
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
            (a.location || "").localeCompare(b.location || "")
          );
          break;
        case "locationDesc":
          sortedListings.sort((a, b) =>
            (b.location || "").localeCompare(a.location || "")
          );
          break;
        case "newestFirst":
        default:
          sortedListings.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
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
            const listingSubCat = listing.category?.subCategory || listing.details?.vehicles?.vehicleType;
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
            const listingPrice = typeof listing.price === 'number' ? listing.price : Number(listing.price);
            const filterPrice = Number(selectedPrice);
            if (isNaN(listingPrice) || isNaN(filterPrice) || listingPrice !== filterPrice) {
              return false;
            }
          }
          
          // Apply mileage filter for vehicles
          if (selectedMileage !== null && selectedMileage !== undefined) {
            const vehicleMileage = listing.details?.vehicles?.mileage;
            console.log('Mileage filter - Listing ID:', listing.id, 'Mileage value:', vehicleMileage, 'Type:', typeof vehicleMileage);
            
            if (vehicleMileage !== null && vehicleMileage !== undefined) {
              try {
                // Convert to number if it's a string
                let mileageValue: number;
                if (typeof vehicleMileage === 'string') {
                  // Extract numbers from string (handles formats like '100,000 km' or '100k')
                  const numericValue = vehicleMileage.replace(/[^0-9.]/g, '');
                  mileageValue = parseFloat(numericValue);
                } else {
                  // It's already a number
                  mileageValue = Number(vehicleMileage);
                }
                
                console.log('Processed mileage:', mileageValue, 'Selected max:', selectedMileage);
                
                // Only filter if we have a valid number
                if (!isNaN(mileageValue) && mileageValue > selectedMileage) {
                  console.log('Filtering out - mileage too high');
                  return false;
                }
              } catch (error) {
                console.warn('Error processing mileage:', error, 'for listing:', listing.id);
                // If there's an error parsing, don't filter out the listing
              }
            } else {
              console.log('No mileage data for listing, keeping it');
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
          sortBy: sortBy === 'newestFirst' ? 'createdAt' : 'price',
          sortOrder: sortBy === 'priceDesc' ? 'desc' : 'asc',
        };

        if (selectedAction) {
          params.listingAction = selectedAction as 'SALE' | 'RENT';
        }

        if (selectedCategory === ListingCategory.VEHICLES) {
          params.category = {
            mainCategory: ListingCategory.VEHICLES,
            subCategory: selectedSubcategory as VehicleType || undefined,
          };

          // Initialize vehicleDetails with make, model, and mileage if any are selected
          if (selectedMake || selectedModel || selectedMileage) {
            params.vehicleDetails = {
              ...(selectedMake && { make: selectedMake }),
              ...(selectedModel && { model: selectedModel }),
              ...(selectedMileage && { mileage: selectedMileage.toString() })
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
        abortControllerRef.current.signal
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
      const listingYear = listing.details?.vehicles?.year ? 
        parseInt(listing.details.vehicles.year.toString(), 10) : 
        new Date(listing.createdAt || '').getFullYear();
        
      // Check if year is within selected range
      const matchesYearRange = 
        (yearRange.min === '' || listingYear >= (yearRange.min as number)) &&
        (yearRange.max === '' || listingYear <= (yearRange.max as number));
        
      // For backward compatibility with single year filter
      const matchesSingleYear = !selectedYear || listingYear >= (selectedYear || 0);
      
      const matchesYear = matchesYearRange && matchesSingleYear;

      // Mileage filter
      let matchesMileage = true;
      if (selectedMileage && selectedCategory === ListingCategory.VEHICLES) {
        const listingMileage = listing.details?.vehicles?.mileage ? 
          (typeof listing.details.vehicles.mileage === 'string' ? 
            parseInt(listing.details.vehicles.mileage.replace(/[^0-9.]/g, ''), 10) : 
            listing.details.vehicles.mileage) : 0;
        matchesMileage = listingMileage <= selectedMileage;
      }

      // Price filter
      const listingPrice = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price || 0;
      const matchesMinPrice = priceRange.min === '' || listingPrice >= (priceRange.min as number);
      const matchesMaxPrice = priceRange.max === '' || listingPrice <= (priceRange.max as number);
      const matchesPrice = matchesMinPrice && matchesMaxPrice;

      // Location filter
      let matchesLocation = true;
      if (selectedLocation) {
        // Find the correct case-insensitive city key
        const cityKey = Object.keys(cities).find(
          (key) => key.toLowerCase() === selectedLocation.toLowerCase()
        );

        if (cityKey) {
          if (selectedRadius !== null) {
            // If radius is selected, include nearby areas
            const currentCityAreas = areas[cityKey] || [];
            const allAreasToMatch = [cities[cityKey], ...currentCityAreas];

            matchesLocation = allAreasToMatch.some(
              (area) =>
                area &&
                listing.location?.toLowerCase().includes(area.toLowerCase())
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
          .map((l) => l.category.subCategory)
      )
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
      return <SkeletonListingGrid />;
    }

    return (
      <>
        <div className="flex flex-row justify-between items-center gap-2 px-2 sm:px-0 mt-4 mb-6 w-full">
          <button
            onClick={toggleFilters}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-auto"
          >
            <MdFilterList className="w-5 h-5" />
            <span className="text-sm">{t("Filters")}</span>
          </button>

          {/* Sort By - Always Visible */}
          <div className="relative inline-block text-left w-auto max-w-[160px] sm:w-52">
            <Listbox value={sortBy} onChange={setSortBy}>
              <div className="relative">
                <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 text-sm text-gray-700 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className="truncate">
                    {sortOptions.find((opt) => opt.value === sortBy)?.label ||
                      "Sort by"}
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
            selectedLocation={selectedLocation}
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

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                Try Again
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
              Trending Now
            </h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {listings.popular.map((listing, index) => (
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

  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
      {/* Preload for LCP Optimization */}
      <link 
        rel="preload" 
        href="/waves-light.svg" 
        as="image" 
        type="image/svg+xml"
        fetchPriority="high"
      />
      {firstVisibleListing?.images?.[0] && (
        <PreloadImages imageUrls={[String(firstVisibleListing.images[0])]} />
      )}

      {/* Header */}
      <header className="relative bg-blue-800/90 backdrop-blur-sm text-white py-10 sm:py-14 md:py-20 transition-all duration-500">
        {/* Optional Decorative Background Pattern */}
        <div className="absolute inset-0 bg-[url('/waves-light.svg')] bg-cover bg-center bg-no-repeat opacity-5 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="lcp-text">
            {t("home.find_perfect")}{" "}
            <span className="inline-block">
              {selectedCategory === ListingCategory.VEHICLES
                ? t("home.vehicle")
                : t("home.property")}
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-blue-100/90">
            {selectedCategory === ListingCategory.VEHICLES
              ? t("find_dream_vehicle", { ns: "home" })
              : t("discover_property", { ns: "home" })}
          </p>

          {/* Category Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => handleCategoryChange(ListingCategory.VEHICLES)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-200 shadow-sm ${
                selectedCategory === ListingCategory.VEHICLES
                  ? "bg-white text-blue-600"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              }`}
            >
              <FaCar className="text-lg" />
              {t("vehicles", { ns: "home" })}
            </button>

            <button
              onClick={() => handleCategoryChange(ListingCategory.REAL_ESTATE)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-200 shadow-sm ${
                selectedCategory === ListingCategory.REAL_ESTATE
                  ? "bg-white text-blue-600"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              }`}
            >
              <FaHome className="text-lg" />
              {t("real_estate", { ns: "home" })}
            </button>
          </div>
        </div>
      </header>

      {/* Listings Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderContent()}
      </main>
    </div>
  );
};

export default Home;
