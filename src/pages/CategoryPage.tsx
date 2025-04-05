import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Listing, ListingCategory } from "@/types";
import ListingCard from "@/components/listings/details/ListingCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { listingsAPI } from "@/api/listings.api";
import { toast } from "react-toastify";

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(
    async (searchQuery?: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = searchQuery
          ? await listingsAPI.search(searchQuery, {
              category: category as ListingCategory,
            })
          : await listingsAPI.getListingsByCategory(
              category as ListingCategory,
            );

        setListings(response.items || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [category],
  );

  const handleEditListing = (listing: Listing) => {
    navigate(`/listings/${listing._id}/edit`);
  };

  const handleDeleteListing = (listingId: string) => {
    toast.info(`Delete functionality coming soon for listing ${listingId}`);
  };

  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "All Categories";

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{categoryName}</h1>
        <SearchBar onSearch={fetchListings} />
      </div>

      {loading ? (
        <div className="text-center py-4">Loading listings...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-4">{error}</div>
      ) : !listings.length ? (
        <div className="text-center py-4">
          <p className="text-gray-600">No listings found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onEdit={handleEditListing}
              onDelete={handleDeleteListing}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
