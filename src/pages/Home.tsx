import { listingsAPI } from "@/api/listings.api";
import React, { Suspense, lazy, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import type { FiltersState } from "@/components/filters/useListingFilters";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Listbox } from "@headlessui/react";

// Icons - Imported directly since they're small
import { MdFilterList } from "react-icons/md";
import { HiSelector, HiCheck } from "react-icons/hi";

// Lazy load only large components
const ListingCard = lazy(() => import("@/components/listings/details/ListingCard"));
const ListingFilters = lazy(() => import("@/components/filters/ListingFiltersSmart"));
const SkeletonListingGrid = lazy(() => import("@/components/common/SkeletonGrid"));
const PreloadImages = lazy(() => import("@/components/media/PreloadImages"));
const HomeHero = lazy(() => import("@/components/home/HomeHero"));
const PopularCategories = lazy(() => import("@/components/home/PopularCategories"));
const FAQ = lazy(() => import("@/components/home/FAQ"));
const AdvantageCards = lazy(() => import("@/components/home/AdvantageCards"));
const ImageFallback = lazy(() => import("@/components/media/ImageFallback"));

// Types and enums
import {
  ListingCategory,
  VehicleType,
  PropertyType,
  ListingAction,
} from "@/types/enums";
import { type ExtendedListing } from "@/types/listings";

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
  original: ExtendedListing[];
  all: ExtendedListing[]; // currently displayed (may be filtered)
  popular: ExtendedListing[];
  loading: boolean;
  error: string | null;
}

const Home: React.FC = () => {
  // ... existing code ...

  // Use Suspense and lazy for ListingFilters with proper typing
  const LazyListingFilters = React.memo((props: React.ComponentProps<typeof ListingFilters>) => (
    <Suspense fallback={<div className="p-8 text-center">Loading filters…</div>}>
      <ListingFilters {...props} />
    </Suspense>
  ));
  LazyListingFilters.displayName = 'LazyListingFilters';

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
  }) as Record<string, string>;

  // Track first visible listing for LCP optimization
  const [firstVisibleListing, setFirstVisibleListing] =
    useState<ExtendedListing | null>(null);
  const [sortBy, setSortBy] = useState<string>("newestFirst");
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory>(
    ListingCategory.VEHICLES,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [listings, setListings] = useState<ListingsState>({
    original: [],
    all: [],
    popular: [],
    loading: true,
    error: null,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(false);
  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    // Listen for cache-cleared events from the API
    const handleCacheCleared = () => {
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

  // Cache for storing initial listings data
  const listingsCache = useRef<{
    [key in ListingCategory]?: ExtendedListing[];
  }>({});

  const toggleFilters = useCallback(() => {
    setIsFilterOpen(prev => !prev);
  }, []);

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

      // No filtering here - filtering is now handled by ListingFiltersSmart
      setListings((prev) => ({
        ...prev,
        all: sortedListings,
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

        // Basic category filter only
        if (selectedCategory === ListingCategory.VEHICLES) {
          params.category = {
            mainCategory: ListingCategory.VEHICLES,
          };
        } else if (selectedCategory === ListingCategory.REAL_ESTATE) {
          params.category = {
            mainCategory: ListingCategory.REAL_ESTATE,
          };
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
        original: responseData.listings,
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





  // Handle category change
  const handleCategoryChange = useCallback((category: ListingCategory) => {
    localStorage.setItem("selectedCategory", category);
    setSelectedCategory(category);
  }, []);

  // Handle filtered results from ListingFiltersSmart (always defined at top level to avoid hook order errors)
  const handleFilterApply = useCallback(
    (filtered: ExtendedListing[], filters: FiltersState) => {
      setListings((prev) => ({
        ...prev,
        all: filtered,
        loading: false,
      }));
    },
    [],
  );

  // Debug logging for i18n

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
        <div className="flex flex-row justify-between items-center gap-2 px-0 sm:px-2 mt-4 mb-6 w-full">
          <button
            onClick={toggleFilters}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-auto"
          >
            {t("Filters", "الفلاتر")}
            <MdFilterList className="w-5 h-5" />
            <span className="text-sm">{t("Filters", "الفلاتر")}</span>
          </button>

          {/* Sort By - Always Visible */}
          <div className="relative inline-block text-left w-auto max-w-[180px] sm:w-52">
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
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ListingFilters
              loading={listings.loading}
              listings={listings.original}
              selectedCategory={selectedCategory}
              cities={cities}
              areas={areas}
              onApply={handleFilterApply}
            />
          </motion.div>
        )}

        <div
          className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          {listings.loading && <SkeletonListingGrid count={8} />}
          {listings.all.map((listing, index) => (
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
          {listings.all.length === 0 && !listings.loading && (
            <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
              {t("filters.no_results", "No listings found")}
            </div>
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
                <div
                  itemScope
                  itemType="https://schema.org/Product"
                  itemProp="itemListElement"
                >
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
    isFilterOpen,
  ]);

  // Generate dynamic title and description based on category
  const getPageMetadata = () => {
    if (selectedCategory === ListingCategory.VEHICLES) {
      return {
        title: t(
          "home:meta.vehicles.title",
          "أفضل السيارات للبيع في سوريا | سمسار",
        ),
        description: t(
          "home:meta.vehicles.description",
          "تصفح أحدث إعلانات السيارات المستعملة والجديدة في سوريا. سيارات للبيع من مالكين مباشرة أو معارض موثوقة. أسعار تنافسية وضمان الجودة",
        ),
      };
    } else {
      return {
        title: t(
          "home:meta.properties.title",
          "أفضل العقارات للبيع في سوريا | سمسار",
        ),
        description: t(
          "home:meta.properties.description",
          "تصفح أفضل العروض العقارية في سوريا. شقق، فلل، محلات تجارية، وأراضي للبيع أو الإيجار. أسعار منافسة ومواقع مميزة",
        ),
      };
    }
  };

  const { title, description } = getPageMetadata();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>
          {t("meta_title", "سوق السيارات والعقارات الأول في سوريا")}
        </title>
        <meta
          name="description"
          content={t(
            "meta_description",
            "سوق السيارات والعقارات الأول في سوريا - تصفح أحدث الإعلانات للسيارات، الشقق، الفلل، الأراضي والمزيد. أسعار تنافسية وضمان الجودة.",
          )}
        />
        <meta
          name="keywords"
          content={t(
            "meta_keywords",
            "سيارات للبيع، عقارات للبيع، سمسار، سوريا، سيارات مستعملة، عقارات جديدة، أسعار تنافسية، ضمان الجودة",
          )}
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta
          property="og:title"
          content={t("meta_title", "سوق السيارات والعقارات الأول في سوريا")}
        />
        <meta
          property="og:description"
          content={t(
            "meta_description",
            "سوق السيارات والعقارات الأول في سوريا - تصفح أحدث الإعلانات للسيارات، الشقق، الفلل، الأراضي والمزيد. أسعار تنافسية وضمان الجودة.",
          )}
        />
        <meta
          property="og:image"
          content="https://pub-363346cde076465bb0bb5ca74ae5d4f9.r2.dev/og-image.jpg"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta
          name="twitter:title"
          content={t("meta_title", "سوق السيارات والعقارات الأول في سوريا")}
        />
        <meta
          name="twitter:description"
          content={t(
            "meta_description",
            "سوق السيارات والعقارات الأول في سوريا - تصفح أحدث الإعلانات للسيارات، الشقق، الفلل، الأراضي والمزيد. أسعار تنافسية وضمان الجودة.",
          )}
        />
      </Helmet>

      <Suspense fallback={<div className="h-[500px] bg-gray-100 dark:bg-gray-800 animate-pulse"></div>}>
        <HomeHero selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </Suspense>

      {/* Main Content */}
      <main className="w-full py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rtl:direction-rtl">
          {/* Featured Listings Section */}
          <section
            aria-labelledby="featured-listings-heading"
            className="w-full mb-16"
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                id="featured-listings-heading"
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {t("home:featured_listings", "أحدث العروض المميزة")}
              </h2>
              <div className="flex space-x-2 rtl:space-x-reverse"></div>
            </div>

            {renderContent()}
          </section>
        </div>
      </main>

      {/* Popular Categories Section */}
      <div>
        <Suspense fallback={<div className="h-[400px] flex items-center justify-center">Loading categories...</div>}>
          <PopularCategories />
        </Suspense>

        {/* Structured Data for SEO */}
        <div className="hidden">
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: [
                {
                  "@type": "CategoryCode",
                  position: 1,
                  name: t("categories.cars", "سيارات"),
                  url:
                    window.location.origin +
                    "/listings?category=vehicles&subCategory=CAR",
                },
                {
                  "@type": "CategoryCode",
                  position: 2,
                  name: t("categories.real_estate", "عقارات"),
                  url:
                    window.location.origin + "/listings?category=real_estate",
                },
                {
                  "@type": "CategoryCode",
                  position: 3,
                  name: t("categories.motorcycles", "دراجات نارية"),
                  url:
                    window.location.origin +
                    "/listings?category=vehicles&subCategory=MOTORCYCLE",
                },
                {
                  "@type": "CategoryCode",
                  position: 4,
                  name: t("categories.commercial", "تجاري"),
                  url:
                    window.location.origin +
                    "/listings?category=real_estate&subCategory=COMMERCIAL",
                },
              ],
            })}
          </script>
        </div>
      </div>

      {/* Samsar Advantage Section */}
      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center">Loading features...</div>}>
        <AdvantageCards />
      </Suspense>
    </div>
  );
};

export default Home;
