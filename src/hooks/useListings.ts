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
      const response = await listingsAPI.getAll({});
      // The response data is directly available in response.data
      if (response.data) {
        // Check if the response has a data property (common pattern)
        const listingsData = response.data.data || response.data;
        setListings(Array.isArray(listingsData) ? listingsData : []);
      } else {
        throw new Error("No data received from the server");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch listings";
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
