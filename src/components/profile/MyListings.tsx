import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { listingsAPI } from "@/api/listings.api";
import type { Listing, VehicleDetails, RealEstateDetails } from "@/types/listings";
import MyListingCard from "@/components/listings/details/MyListingCard";
import { toast } from "react-toastify";

interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const MyListings: React.FC = () => {
  const { t } = useTranslation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingsAPI.getUserListings({ page });

      if (response.data && response.success) {
        const data = response.data as unknown as ListingsResponse;
        if (data.listings) {
          setListings((prev) =>
            page === 1 ? data.listings : [...prev, ...data.listings],
          );
          setHasMore(data.hasMore);
          setTotal(data.total);
        } else {
          setListings([]);
          setHasMore(false);
          setTotal(0);
        }
      } else {
        throw new Error(response.error || "Failed to fetch listings");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch listings";
      setError(errorMessage);
      toast.error(errorMessage);
      setListings([]);
      setHasMore(false);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const handleDelete = async (listingId: string) => {
    try {
      const response = await listingsAPI.deleteListing(listingId);
      if (response.success) {
        setListings((prev) => prev.filter((listing) => listing.id !== listingId));
        setTotal((prev) => prev - 1);
        toast.success(t("listings.deleted"));
      } else {
        throw new Error(response.error || "Failed to delete listing");
      }
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to delete listing";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && listings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        {error}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        {t("listings.no_listings")}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {t("listings.my_listings")} ({total})
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => {
          const vehicleDetails = listing.details?.vehicles as VehicleDetails | undefined;
          const realEstateDetails = listing.details?.realEstate as RealEstateDetails | undefined;
          
          return (
            <MyListingCard
              key={listing.id}
              listing={{
                ...listing,
                vehicleDetails,
                realEstateDetails,
              }}
              onDelete={handleDelete}
            />
          );
        })}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("common.load_more")}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyListings;
