import { listingsAPI } from "@/api/listings.api";
import React, { 
  Suspense, 
  lazy, 
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback, 
  memo 
} from "react";
import type { FiltersState } from "@/components/filters/useListingFilters";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

// Icons - Imported directly since they're small
import { MdFilterList } from "react-icons/md";
import { HiSelector, HiCheck } from "react-icons/hi";

// Lazy load other components
const ListingCard = React.memo(lazy(() => import("@/components/listings/details/ListingCard")));
const ListingFilters = lazy(() => 
  import("@/components/filters/ListingFiltersSmart")
    .then(module => ({ default: module.default }))
);

// Memoized lazy components
const SkeletonGrid = lazy(() => import("@/components/common/SkeletonGrid"));

interface SkeletonProps {
  count?: number;
}

const MemoizedSkeleton: React.FC<SkeletonProps> = memo(({ count = 8 }) => (
  <Suspense fallback={<div className="h-[300px] w-full" />}>
    <SkeletonGrid count={count} />
  </Suspense>
));

// Set display name for better debugging
MemoizedSkeleton.displayName = 'MemoizedSkeleton';

const PopularCategories = memo(lazy(() => 
  import("@/components/home/PopularCategories")
));

const FAQ = memo(lazy(() => 
  import("@/components/home/FAQ")
));

const AdvantageCards = memo(lazy(() => 
  import("@/components/home/AdvantageCards")
));

import LazyLoadOnScroll from '@/components/common/LazyLoadOnScroll';

// Types and enums
import {
  ListingCategory,
  VehicleType,
  PropertyType,
} from "@/types/enums";
import type { ExtendedListing } from "@/types/listings";

// Icons for HomeHero
import { FaCar, FaHome } from 'react-icons/fa';

// Inline HomeHero component
interface HomeHeroProps {
  selectedCategory: ListingCategory;
  onCategoryChange: (category: ListingCategory) => void;
}

const HomeHero: React.FC<HomeHeroProps> = memo(({ selectedCategory, onCategoryChange }) => {
  const { t } = useTranslation(['home']);

  return (
    <>
      {/* Ultra-minimal Critical CSS for Mobile LCP - Reduced Size */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-container{background:linear-gradient(135deg,#667eea,#764ba2);min-height:35vh;display:flex;align-items:center;justify-content:center;width:100%;direction:rtl;padding:2rem 0}
          .hero-content{text-align:center;color:white;padding:1rem}
          .hero-title{font-size:clamp(1.5rem,6vw,2rem);font-weight:700;margin:0 0 .5rem;line-height:1.2}
          .hero-subtitle{font-size:clamp(.875rem,3vw,1.125rem);opacity:.9;margin:0 0 1rem;line-height:1.4}
          .hero-buttons{display:flex;gap:.5rem;justify-content:center;flex-direction:column;align-items:center}
          .hero-button{padding:.5rem 1.25rem;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:white;border-radius:20px;font-weight:600;font-size:.8rem;cursor:pointer;width:100%;max-width:160px}
          .hero-button-active{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.5)}
          @media(min-width:768px){.hero-container{min-height:40vh}.hero-title{font-size:clamp(1.75rem,4vw,2.5rem)}.hero-buttons{flex-direction:row;gap:1rem}}
        `
      }} />
      
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            {t('home:hero.title')}
          </h1>
          <p className="hero-subtitle">
            {t('home:hero.subtitle')}
          </p>
          <div className="hero-buttons">
            <button
              onClick={() => onCategoryChange(ListingCategory.VEHICLES)}
              className={`hero-button ${
                selectedCategory === ListingCategory.VEHICLES
                  ? 'hero-button-active'
                  : ''
              }`}
            >
              <FaCar />
              {t('home:vehicle_section.title')}
            </button>
            <button
              onClick={() => onCategoryChange(ListingCategory.REAL_ESTATE)}
              className={`hero-button ${
                selectedCategory === ListingCategory.REAL_ESTATE
                  ? 'hero-button-active'
                  : ''
              }`}
            >
              <FaHome />
              {t('home:property_section.title')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

HomeHero.displayName = 'HomeHero';

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

  // Memoized ListingFilters with proper typing
  const LazyListingFilters = useMemo(() => 
    memo((props: React.ComponentProps<typeof ListingFilters>) => (
      <Suspense fallback={<div className="p-8 text-center">Loading filters…</div>}>
        <ListingFilters {...props} />
      </Suspense>
    )),
    []
  );
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

  // Update first visible listing when listings change
  useEffect(() => {
    if (listings.all.length > 0) {
      const firstListing = listings.all[0];
      setFirstVisibleListing(firstListing);
      
      // Let browser handle image preloading for non-critical images
    }
  }, [listings.all]);

  // Cache for storing initial listings data with LRU-like behavior
  const listingsCache = useRef<{
    [key in ListingCategory]?: {
      data: ExtendedListing[];
      timestamp: number;
    };
  }>({});
  
  // Cache TTL (5 minutes)
  const CACHE_TTL = 5 * 60 * 1000;

  const toggleFilters = useCallback(() => {
    setIsFilterOpen(prev => !prev);
  }, []);

  const fetchListings = useCallback(async () => {
    // Check cache validity before using
    const cachedData = listingsCache.current[selectedCategory];
    const isCacheValid = cachedData && 
                         (Date.now() - cachedData.timestamp) < CACHE_TTL &&
                         !isInitialLoad && 
                         !forceRefresh;

    if (isCacheValid) {
      const sortedListings = [...cachedData.data];
      
      // Memoize sort function
      const sortFunctions = {
        priceAsc: (a: ExtendedListing, b: ExtendedListing) => (a.price || 0) - (b.price || 0),
        priceDesc: (a: ExtendedListing, b: ExtendedListing) => (b.price || 0) - (a.price || 0),
        locationAsc: (a: ExtendedListing, b: ExtendedListing) => 
          (a.location || "").localeCompare(b.location || ""),
        locationDesc: (a: ExtendedListing, b: ExtendedListing) => 
          (b.location || "").localeCompare(a.location || ""),
        newestFirst: (a: ExtendedListing, b: ExtendedListing) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      };

      // Apply sorting
      const sortFn = sortFunctions[sortBy as keyof typeof sortFunctions] || sortFunctions.newestFirst;
      sortedListings.sort(sortFn);

      setListings(prev => ({
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

      // Cache the results with timestamp
      listingsCache.current[selectedCategory] = {
        data: responseData.listings,
        timestamp: Date.now()
      };

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

  // Memoize sort options to prevent unnecessary re-renders
  const sortOptions = useMemo(() => [
    { value: "newestFirst", label: t("sorting.newest", { ns: "filters" }) },
    { value: "priceAsc", label: t("sorting.price_asc", { ns: "filters" }) },
    { value: "priceDesc", label: t("sorting.price_desc", { ns: "filters" }) },
    { value: "locationAsc", label: t("sorting.location_asc", { ns: "filters" }) },
    { value: "locationDesc", label: t("sorting.location_desc", { ns: "filters" }) },
  ] as const, [t]);

  // Debug logging sort options

  const renderContent = useCallback(() => {
    if (listings.loading) {
      return (
        <div>
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-600 mb-6">
            {t("home:loading_listings", "جاري تحميل العروض...")}
          </h2>
          <Suspense fallback={<div className="h-[300px] w-full" />}>
            <MemoizedSkeleton />
          </Suspense>
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

          {/* Sort By - Simple HTML Select */}
          <div className="relative inline-block text-left w-auto max-w-[180px] sm:w-52">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-700 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isFilterOpen && (
          <div className="overflow-hidden">
            <ListingFilters
              loading={listings.loading}
              listings={listings.original}
              selectedCategory={selectedCategory}
              cities={cities}
              areas={areas}
              onApply={handleFilterApply}
            />
          </div>
        )}

        <div
          className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          {listings.loading && <MemoizedSkeleton count={8} />}
          {listings.all.map((listing, index) => (
            <Suspense key={listing.id} fallback={<div className="h-[300px] w-full" />}>
              <ListingCard
                listing={listing}
                showActions={false}
                showSaveButton={true}
                showPrice={true}
                showLocation={true}
                showBadges={true}
                priority={index < 4} // Prioritize first four listings for LCP
              />
            </Suspense>
          ))}
          {listings.all.length === 0 && listings.error && (
            <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
              {listings.error && (
                <div className="text-red-500 whitespace-pre-wrap">
                  {typeof listings.error === "string"
                    ? listings.error
                    : "Failed to fetch listings"}
                </div>
              )}
              <button
                onClick={fetchListings}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("common.try_again", "جرب مرة أخرى")}
              </button>
            </div>
          )}
          {listings.all.length === 0 && !listings.loading && (
            <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
              {t("filters.no_results", "No listings found")}
            </div>
          )}
        </div>

        {listings.popular.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t("home.trending_now", "الأكثر رواجاً")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.popular.map((listing, index) => (
                <div
                  key={listing.id}
                  itemScope
                  itemType="https://schema.org/Product"
                  itemProp="itemListElement"
                >
                  <ListingCard
                    listing={listing}
                    showActions={false}
                    showSaveButton={true}
                    showPrice={true}
                    showLocation={true}
                    showBadges={true}
                    priority={index < 4} // Prioritize first four popular listings for LCP
                  />
                </div>
              ))}
            </div>
          </div>
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
  // Memoize page metadata to prevent unnecessary re-renders
  const { title, description } = useMemo(() => {
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
  }, [selectedCategory, t]);

  const metaDescription = t(
    "meta_description",
    "منصة سمسار الرائدة في بيع وشراء السيارات والعقارات في سوريا. تصفح الآلاف من إعلانات السيارات المستعملة، الشقق، الفلل، الأراضي والمزيد في جميع أنحاء سوريا"
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>
          {t("meta_title", "سوق السيارات والعقارات الأول في سوريا")}
        </title>
        <meta name="description" content={metaDescription} />
        
        {/* Canonical and hreflang */}
        <link rel="canonical" href={window.location.href} />
        <link rel="alternate" hrefLang="ar" href={`https://samsar.app${i18n.language === 'ar' ? '/ar' : ''}/`} />
        <link rel="alternate" hrefLang="x-default" href="https://samsar.app/" />

        {/* Open Graph - covers Facebook and most social platforms */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={t("meta_title", "سوق السيارات والعقارات الأول في سوريا")} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content="https://pub-363346cde076465bb0bb5ca74ae5d4f9.r2.dev/og-image.jpg" />
        <meta property="og:locale" content="ar_AR" />
        <meta property="og:site_name" content="سمسار" />

        {/* Twitter Card - minimal and essential */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@samsar_sy" />
      </Helmet>

      {/* Inline HomeHero component - no suspense for critical hero */}
      <HomeHero selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

      {/* Main Content */}
      <main className="w-full py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rtl:direction-rtl">
          {/* SEO-Optimized H1 - Visible heading for better SEO */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t("home:seo_title", "سيارات للبيع في سوريا | عقارات للبيع والايجار | منصة سمسار")}
          </h1>
          <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-12 text-center">
            {t("home:seo_description", "اكتشف أفضل العروض على سيارات وعقارات في سوريا")}
          </h2>
          <p className="sr-only">
            {t("home:seo_description", "أكبر سوق إلكتروني متخصص في بيع وشراء السيارات المستعملة والجديدة، الشقق، الفلل، الأراضي، والمحلات التجارية في جميع أنحاء سوريا. أسعار منافسة وضمان الجودة")}
          </p>

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

          {/* Popular Categories Section */}
          <section aria-labelledby="popular-categories-heading" className="w-full mb-16">
            <h2 id="popular-categories-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {t("home:popular_categories", "الفئات الأكثر شعبية")}
            </h2>
            <LazyLoadOnScroll fallback={<div className="h-[400px] w-full" />}>
              <PopularCategories />
            </LazyLoadOnScroll>
          </section>

          {/* Advantage Cards Section */}
          <section aria-labelledby="advantage-cards-heading" className="w-full mb-16">
            <h2 id="advantage-cards-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {t("home:advantages_title", "لماذا تختار سمسار؟")}
            </h2>
            <LazyLoadOnScroll fallback={<div className="h-[300px] w-full" />}>
              <AdvantageCards />
            </LazyLoadOnScroll>
          </section>

          {/* FAQ Section */}
          <section aria-labelledby="faq-heading" className="w-full mb-16">
            <h2 id="faq-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {t("home:faq_title", "الأسئلة الشائعة")}
            </h2>
            <LazyLoadOnScroll fallback={<div className="h-[300px] w-full" />}>
              <FAQ />
            </LazyLoadOnScroll>
          </section>
        </div>
      </main>

      {/* Structured Data for SEO */}
      <div className="hidden">
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "سمسار",
            alternateName: "Samsar",
            url: "https://samsar.app",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://samsar.app/listings?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            inLanguage: ["ar", "en"],
            areaServed: {
              "@type": "Country",
              name: "Syria"
            },
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
  );
};

export default Home;
