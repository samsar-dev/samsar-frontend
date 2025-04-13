import { useEffect, useState, useCallback, useMemo } from "react";
import { FaCar, FaHome } from "react-icons/fa";
import {
  type Listing,
  type ListingsResponse,
  ListingStatus,
  type ListingParams,
} from "@/types/listings";
import { ListingCategory, VehicleType, PropertyType } from "@/types/enums";
import ListingCard from "@/components/listings/details/ListingCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { listingsAPI } from "@/api/listings.api";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { serverStatus } from "@/utils/serverStatus";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { link } from "fs";

interface ListingsState {
  all: Listing[];
  popular: Listing[];
  loading: boolean;
  error: string | null;
}

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory>(
    (localStorage.getItem("selectedCategory") as ListingCategory) ||
      ListingCategory.VEHICLES
  );
  const [listings, setListings] = useState<ListingsState>({
    all: [],
    popular: [],
    loading: true,
    error: null,
  });
  console.log("listings", listings);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Memoize the server status subscription
  useEffect(() => {
    const unsubscribe = serverStatus.subscribe(setIsServerOnline);
    return () => unsubscribe();
  }, [isServerOnline]);

  const fetchListings = useCallback(async () => {
    if (!isServerOnline) {
      setListings((prev) => ({
        ...prev,
        loading: false,
        error: t("errors.server_offline"),
      }));
      return;
    }

    if (!hasAttemptedFetch) {
      setHasAttemptedFetch(true);
    }

    try {
      setListings((prev) => ({ ...prev, loading: true }));
      const allListingsParams: ListingParams = {
        category: {
          mainCategory: selectedCategory as ListingCategory,
          ...(selectedCategory === ListingCategory.VEHICLES && {
            subCategory: VehicleType.CAR,
          }),
          ...(selectedCategory === ListingCategory.REAL_ESTATE && {
            subCategory: PropertyType.HOUSE,
          }),
        },
        limit: 8,
        page: 1,
      };

      const popularListingsParams: ListingParams = {
        ...allListingsParams,
        sortBy: "favorites",
        sortOrder: "desc",
        limit: 4,
      };

      const [allListingsResponse, popularListingsResponse] = await Promise.all([
        listingsAPI.getAll(allListingsParams),
        listingsAPI.getAll(popularListingsParams),
      ]);

      if (!allListingsResponse.success || !popularListingsResponse.success) {
        throw new Error(
          allListingsResponse.error ||
            popularListingsResponse.error ||
            "Failed to fetch listings"
        );
      }

      const transformListing = (listing: Listing): Listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: {
          mainCategory: listing.category.mainCategory,
          subCategory: listing.category.subCategory,
        },
        location: listing.location,
        images: listing.images.map((img: any) => img.url || img),
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        userId: listing.userId,
        details: listing.details || {},
        listingAction: listing.listingAction,
        status: listing.status,
      });

      setListings({
        all: (allListingsResponse.data?.listings || []).map(transformListing),
        popular: (popularListingsResponse.data?.listings || []).map(
          transformListing
        ),
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching listings:", error);
      setListings((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : t("errors.fetch_failed"),
      }));
      toast.error(
        error instanceof Error ? error.message : t("errors.fetch_failed")
      );
    }
  }, [selectedCategory, isServerOnline, t, hasAttemptedFetch]);

  const handleCategoryChange = useCallback((category: ListingCategory) => {
    setSelectedCategory(category);
    localStorage.setItem("selectedCategory", category);
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

  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 500),
    [handleSearch]
  );

  // Fetch listings when category changes
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings: Listing[] = listings?.all?.filter(
    (listing) => listing.category.mainCategory === selectedCategory
  );

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const renderContent = useCallback(() => {
    if (listings.loading && !hasAttemptedFetch) {
      return (
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showActions={false}
              showSaveButton={false}
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
                  showSaveButton={false}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </>
    );
  }, [listings, hasAttemptedFetch, isServerOnline, t, fetchListings]);

  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
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
            <SearchBar onSearch={debouncedSearch} className="mt-4" />
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
