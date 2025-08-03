import { listingsAPI } from "@/api/listings.api";
import UnifiedImageGallery from "@/components/listings/images/UnifiedImageGallery";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import type { Listing } from "@/types/listings";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";
import { FaBoxOpen } from "@react-icons/all-files/fa/FaBoxOpen";
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
    // If user isn’t authenticated yet (and we don’t have an explicit userId), skip but stop loader
    if (!isAuthenticated && !userId) {
      setIsLoading(false);
      return;
    }

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

      console.log('🔍 Fetching listings with params:', { page, limit, sortBy });
      const response = await listingsAPI.getUserListings(
        { page, limit, sortBy },
        signal,
      );

      console.log('📡 API Response:', response);
      
      // Cancel if this is not the latest request
      if (activeRequestId.current !== requestId) return;

      if (response.success && response.data) {
        const listingsData = response.data.listings || [];
        const totalItems = response.data.total || 0;

        console.log('✅ Listings fetched successfully:', {
          count: listingsData.length,
          total: totalItems,
          page,
          limit
        });

        // Only reset listings on first page
        setListings((prev) =>
          page === 1 ? listingsData : [...prev, ...listingsData],
        );
        setTotal(totalItems);
        setHasMore(listingsData.length === limit);
        
        // If no listings, stop loading
        if (listingsData.length === 0 && page === 1) {
          setIsLoading(false);
        }
      } else {
        console.log('❌ API Response structure:', response);
        throw new Error(response.error || "Failed to fetch listings");
      }
    } catch (err: any) {
      // Don't handle aborted request errors
      if (err.name === "AbortError") return;

      console.error("❌ Fetch Error:", err);
      setError(err instanceof Error ? err.message : String(err));
      if (page === 1) {
        setListings([]);
        setHasMore(false);
        setTotal(0);
      }
    } finally {
      setIsLoading(false); // Always stop loading
    }
  }, [page, limit, isAuthenticated, sortBy]);

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
    console.log('🔄 MyListings useEffect triggered:', { isAuthenticated, isInitialized, page });
    // Fetch as soon as user is authenticated. If auth still initializing, we'll try again once it's ready.
    if (isAuthenticated) {
      // For initial load, mark as attempted
      if (!hasAttemptedFetch.current) {
        hasAttemptedFetch.current = true;
        console.log('📋 First fetch attempt');
      }
      console.log('🚀 Calling fetchListings...');
      fetchListings();
    } else {
      // If we can’t fetch yet, ensure we don’t show an endless spinner
      setIsLoading(false);
    }

    // Cleanup function to abort any pending requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
   }, [isAuthenticated, page]);

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
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => fetchListings()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t("common.retry")}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {userId ? t("listings.user_listings") : t("listings.my_listings")}
          </h2>
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="newest">{t("sort.newest")}</option>
              <option value="oldest">{t("sort.oldest")}</option>
              <option value="price_low">{t("sort.price_low")}</option>
              <option value="price_high">{t("sort.price_high")}</option>
            </select>
            {!userId && (
              <button
                onClick={handleCreateListing}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaPlus className="mr-2" />
                {t("create_new")}
              </button>
            )}
          </div>
        </div>

        {!isLoading && listings.length === 0 && total === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
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
              {!userId && (
                <button
                  onClick={handleCreateListing}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="mr-2" />
                  {t("create_first")}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id}>
                <UnifiedImageGallery listing={listing} onDelete={handleDelete} isModal={false} />
              </div>
            ))}
          </div>
        )}

        {isLoading && page > 1 && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="flex justify-center py-6">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
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