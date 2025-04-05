import { useState, useEffect, useCallback } from "react";
import { listingsAPI } from "@/api/listings.api";
import type { Listing, ListingParams } from "@/types/listings";
import { toast } from "react-hot-toast";

interface UseListingsResult {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  setParams: (params: ListingParams) => void;
  handleSave: (listingId: string) => Promise<void>;
  handleUnsave: (listingId: string) => Promise<void>;
  handleDelete: (listingId: string) => Promise<void>;
}

export const useListings = (initialParams?: ListingParams) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [params, setParams] = useState<ListingParams>(initialParams || {});

  const fetchListings = useCallback(
    async (newParams?: ListingParams) => {
      try {
        setLoading(true);
        setError(null);

        const response = await listingsAPI.getAll({
          ...params,
          ...newParams,
          page,
        });

        if (response.data) {
          const newListings = response.data.listings;
          setListings((prev) =>
            page === 1 ? newListings : [...prev, ...newListings],
          );
          setHasMore(
            newListings.length > 0 && response.data.total > listings.length,
          );
          setPage(response.data.page);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch listings";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [page, params, listings.length],
  );

  const handleSave = async (listingId: string) => {
    try {
      await listingsAPI.saveListing(listingId);
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId ? { ...listing, favorite: true } : listing,
        ),
      );
      toast.success("Listing saved successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save listing";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleUnsave = async (listingId: string) => {
    try {
      await listingsAPI.unsaveListing(listingId);
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId ? { ...listing, favorite: false } : listing,
        ),
      );
      toast.success("Listing removed from saved");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove listing";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      await listingsAPI.deleteListing(listingId);
      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
      toast.success("Listing deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete listing";
      toast.error(errorMessage);
      throw error;
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

  return {
    listings,
    loading,
    error,
    hasMore,
    loadMore,
    setParams,
    handleSave,
    handleUnsave,
    handleDelete,
  };
};
