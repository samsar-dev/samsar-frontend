import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import ListingCard from "@/components/listings/details/ListingCard";
import { Listing, PaginatedListingResponse } from "@/types/listings";
import { listingsAPI } from "@/api/listings.api";
import { toast } from "@/components/common/toast";

interface ListingsCollectionProps {
  type: "favorites" | "saved";
}

export default function ListingsCollection({ type }: ListingsCollectionProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const { savedListings, isLoading: savedListingsLoading } = useSavedListings();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoadingListings(true);
        let listingIds: string[];
        if (type === "favorites") {
          listingIds = favorites;
        } else {
          listingIds = savedListings.map((listing: Listing) => listing.id);
        }
        const response: PaginatedListingResponse =
          await listingsAPI.getListingsByIds(listingIds);
        if (response.data?.items) {
          setListings(response.data.items);
        }
      } catch (error) {
        console.error(`Error fetching ${type} listings:`, error);
        toast({
          title: "Error",
          description: `Failed to fetch ${type} listings`,
          variant: "destructive",
        });
      } finally {
        setLoadingListings(false);
      }
    };

    if (
      (type === "favorites" && favorites.length > 0) ||
      (type === "saved" && savedListings.length > 0)
    ) {
      fetchListings();
    } else {
      setListings([]);
      setLoadingListings(false);
    }
  }, [type, favorites, savedListings]);

  if (favoritesLoading || savedListingsLoading || loadingListings) {
    return <div>Loading...</div>;
  }

  if (listings.length === 0) {
    return (
      <div className="text-center text-gray-500">No {type} listings found</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
