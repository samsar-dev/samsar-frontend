import { useState, useEffect } from "react";
import { listingsAPI } from "@/api/listings.api";
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

  const refresh = async (params?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listingsAPI.getAll(params);
      if (response.data) {
        setListings(response.data.listings || []);
      } else {
        throw new Error("No data received from the server");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch listings";
      setError(errorMessage);
      console.error("Error fetching listings:", err);
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
