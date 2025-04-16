import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Listing, ListingCategory } from "@/types";
import ListingCard from "@/components/listings/details/ListingCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { listingsAPI } from "@/api/listings.api";
import { toast } from "react-toastify";
import { Spinner } from "@/components/ui/Spinner";
import type {
  FixedSizeGrid as Grid,
  GridChildComponentProps,
} from "react-window";

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchListings = useCallback(
    async (searchQuery?: string, page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = searchQuery
          ? await listingsAPI.search(searchQuery, {
              category: category as ListingCategory,
              page,
              limit: 10, // Reduced page size
            })
          : await listingsAPI.getListings({
              category: category as ListingCategory,
              page,
              limit: 10,
            });

        if (response.success) {
          if (page === 1) {
            setListings(response.data.items);
          } else {
            setListings((prev) => [...prev, ...response.data.items]);
          }
          setHasMore(response.data.items.length > 0);
        } else {
          setError(response.error || "Failed to fetch listings");
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError("Failed to fetch listings");
      } finally {
        setLoading(false);
      }
    },
    [category],
  );

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const handleEditListing = (listing: Listing) => {
    navigate(`/listings/${listing._id}/edit`);
  };

  const handleDeleteListing = (listingId: string) => {
    toast.info(`Delete functionality coming soon for listing ${listingId}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  useEffect(() => {
    fetchListings(searchQuery, page);
  }, [fetchListings, searchQuery, page]);

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <SearchBar onSearch={handleSearch} />
      <Grid
        columnCount={Math.floor(window.innerWidth / 300)}
        columnWidth={300}
        height={800}
        rowCount={Math.ceil(
          listings.length / Math.floor(window.innerWidth / 300),
        )}
        rowHeight={400}
        width={window.innerWidth - 32}
        itemData={listings}
      >
        {({ columnIndex, rowIndex, style }: GridChildComponentProps) => (
          <ListingCard
            listing={
              listings[
                rowIndex * Math.floor(window.innerWidth / 300) + columnIndex
              ]
            }
            style={style}
            onEdit={handleEditListing}
            onDelete={handleDeleteListing}
          />
        )}
      </Grid>
      {!loading && hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load More
          </button>
        </div>
      )}

      {loading && page > 1 && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
