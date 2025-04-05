import { useState, useEffect } from "react";
import { listingsAPI } from "@/api";
import type { Listing } from "@/types/listings";

export interface UseListingsResult {
  listings: Listing[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useListings(): UseListingsResult {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listingsAPI.getListings();
      if (response.success && response.data?.items) {
        setListings(response.data.items);
      } else {
        throw new Error(response.message || "Failed to fetch listings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    listings,
    isLoading,
    error,
    refresh,
  };
}
