import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { listingsAPI } from "@/api/listings.api";
import type { Listing } from "@/types/listings";
import MyListingCard from "@/components/listings/details/MyListingCard";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

interface MyListingsProps {
  userId: string;
}

export default function MyListings({ userId }: MyListingsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading, isInitialized } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Memoize the fetchListings function to prevent unnecessary re-renders
  const fetchListings = useCallback(async () => {
    if (!isAuthenticated || !isInitialized) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await listingsAPI.getUserListings({ page, limit });
      console.log('API Response:', response);

      if (response.success && response.data) {
        const listingsData = response.data.listings || [];
        const totalItems = response.data.total || 0;
        
        console.log('Listings Data:', listingsData);
        console.log('Total Items:', totalItems);
        console.log('Current Page:', page);
        console.log('Limit:', limit);
        
        // Only reset listings on first page
        setListings(prev => page === 1 ? listingsData : [...prev, ...listingsData]);
        setTotal(totalItems);
        setHasMore(listingsData.length === limit);
      } else {
        console.error('API Error:', response.error);
        throw new Error(response.error || "Failed to fetch listings");
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
      if (page === 1) {
        setListings([]);
        setHasMore(false);
        setTotal(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, isAuthenticated, isInitialized]);

  // Use a stable reference for the effect
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthLoading && !isAuthenticated) {
      toast.error(t("auth.requiresLogin"));
      navigate("/auth/login", { 
        state: { from: location.pathname + location.search }
      });
    }
  }, [isAuthenticated, isAuthLoading, isInitialized, navigate, t, location]);

  // Fetch listings when dependencies change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = async (listingId: string) => {
    try {
      const response = await listingsAPI.delete(listingId);
      if (response.success) {
        toast.success(t("listings.deleted"));
        // Remove the deleted listing from the current state
        setListings(prev => prev.filter(listing => listing.id !== listingId));
        setTotal(prev => prev - 1);
      } else {
        toast.error(response.error || t("listings.delete_error"));
      }
    } catch (err) {
      console.error("Error deleting listing:", err);
      toast.error(err instanceof Error ? err.message : t("listings.delete_error"));
    }
  };

  // Memoize the render logic to prevent unnecessary re-renders
  const renderContent = useMemo(() => {
    if (isAuthLoading || (isLoading && page === 1)) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spinner />
        </div>
      );
    }

    if (error && page === 1) {
      return (
        <div className="text-center text-red-500 py-4">
          {error}
        </div>
      );
    }

    if (!isLoading && listings.length === 0 && total === 0) {
      console.log('Rendering no listings:', {
        isLoading,
        listingsLength: listings.length,
        total,
        page,
        isAuthenticated,
        isAuthLoading,
        isInitialized
      });
      return (
        <div className="text-center py-4">
          {t("listings.no_listings")}
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <MyListingCard
              key={listing.id}
              listing={listing}
              onDelete={handleDelete}
            />
          ))}
        </div>
        
        {isLoading && page > 1 && (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        )}
        
        {hasMore && !isLoading && (
          <div className="flex justify-center py-4">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
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
    isAuthenticated, 
    isInitialized, 
    t, 
    handleDelete, 
    handleLoadMore, 
    hasMore
  ]);

  return renderContent;
}