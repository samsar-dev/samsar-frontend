import { listingsAPI } from "@/api/listings.api";
import MyListingCard from "@/components/listings/details/MyListingCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import type { Listing } from "@/types/listings";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPlus, FaBoxOpen, FaSort } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface MyListingsProps {
  userId?: string;
}

export default function MyListings({ userId }: MyListingsProps) {
  const { t } = useTranslation("listings");
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isInitialized,
  } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>("newest");
  const limit = 10;

  // Track if we've already attempted to fetch listings
  const hasAttemptedFetch = useRef(false);

  // Reference to store abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep track of active request ID
  const activeRequestId = useRef<number | null>(null);

  // Memoize the fetchListings function to prevent unnecessary re-renders
  const fetchListings = useCallback(async () => {
    if (!isInitialized) return;
    if (!isAuthenticated && !userId) return;

    try {
      // Create a unique request ID to track the latest request
      const requestId = Date.now();
      activeRequestId.current = requestId;

      // Abort previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const signal = controller.signal;

      setIsLoading(true);
      setError(null);

      const response = await listingsAPI.getUserListings(
        { page, limit, sortBy },
        signal,
      );

      // Cancel if this is not the latest request
      if (activeRequestId.current !== requestId) return;

      if (response.success && response.data) {
        const listingsData = response.data.listings || [];
        const totalItems = response.data.total || 0;

        // Only reset listings on first page
        setListings((prev) =>
          page === 1 ? listingsData : [...prev, ...listingsData],
        );
        setTotal(totalItems);
        setHasMore(listingsData.length === limit);
      } else {
        throw new Error(response.error || "Failed to fetch listings");
      }
    } catch (err: any) {
      // Don't handle aborted request errors
      if (err.name === "AbortError") return;

      console.error("Fetch Error:", err);
      setError(err instanceof Error ? err.message : null);
      if (page === 1) {
        setListings([]);
        setHasMore(false);
        setTotal(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, isAuthenticated, isInitialized, sortBy]);

  // Use a stable reference for the effect
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, hasMore]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthLoading && !isAuthenticated) {
      toast.error(t("auth.requiresLogin"));
      navigate("/auth/login", {
        state: { from: location.pathname + location.search },
      });
    }
  }, [isAuthenticated, isAuthLoading, isInitialized, navigate, t, location]);

  // Single effect to handle all fetching of listings
  useEffect(() => {
    // Only fetch if authenticated and initialized
    if (isAuthenticated && isInitialized) {
      // For initial load, mark as attempted
      if (!hasAttemptedFetch.current) {
        hasAttemptedFetch.current = true;
      }
      // Only fetch if it's the first page (initial load) or beyond (pagination)
      if (page === 1 || hasAttemptedFetch.current) {
        fetchListings();
      }
    }

    // Cleanup function to abort any pending requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isAuthenticated, isInitialized, page, fetchListings]);

  const handleDelete = async (listingId: string) => {
    try {
      const response = await listingsAPI.delete(listingId);
      if (response.success) {
        toast.success(t("deleted"));
        // Remove the deleted listing from the current state
        setListings((prev) =>
          prev.filter((listing) => listing.id !== listingId),
        );
        setTotal((prev) => prev - 1);
      } else {
        toast.error(response.error || t("delete_error"));
      }
    } catch (err) {
      console.error("Error deleting listing:", err);
      toast.error(err instanceof Error ? err.message : t("delete_error"));
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1); // Reset to first page when changing sort
  };

  const handleCreateListing = () => {
    navigate("/listings/create");
  };

  // Memoize the render logic to prevent unnecessary re-renders
  const renderContent = useMemo(() => {
    if (isAuthLoading || (isLoading && page === 1)) {
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error && page === 1) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center text-red-600 dark:text-red-400">
          <p className="text-lg font-medium">{t("common.error_occurred")}</p>
          <p className="mt-2">{error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t("my_listings")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("total_listings", { count: total })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">{t("sort.newest")}</option>
                <option value="oldest">{t("sort.oldest")}</option>
                <option value="price_high">{t("sort.price_high")}</option>
                <option value="price_low">{t("sort.price_low")}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <FaSort size={14} />
              </div>
            </div>

            <button
              onClick={handleCreateListing}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <FaPlus className="mr-2" />
              {t("create_new")}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {!isLoading && listings.length === 0 && total === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full">
                  <FaBoxOpen className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t("no_listings")}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  {t("no_listings_description")}
                </p>
                <button
                  onClick={handleCreateListing}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaPlus className="mr-2 -ml-1" />
                  {t("create_first")}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MyListingCard listing={listing} onDelete={handleDelete} />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {isLoading && page > 1 && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="flex justify-center py-6">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {t("common.load_more")}
            </button>
          </div>
        )}
      </div>
    );
  }, [
    isAuthLoading,
    isLoading,
    page,
    error,
    listings,
    total,
    t,
    handleDelete,
    handleLoadMore,
    hasMore,
    sortBy,
    handleCreateListing,
  ]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      {renderContent}
    </div>
  );
}
