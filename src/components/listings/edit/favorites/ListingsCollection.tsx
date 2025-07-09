import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import ListingCard from "@/components/listings/details/ListingCard";
import type { Listing } from "@/types/listings";
import { listingsAPI } from "@/api/listings.api";
import { toast } from "@/components/common/toast";

interface ListingsCollectionProps {
  type: "favorites" | "saved";
}

export default function ListingsCollection({ type }: ListingsCollectionProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const {
    savedListings,
    isLoading: savedListingsLoading,
    isSaved,
  } = useSavedListings();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoadingListings(true);
        const listingIds =
          type === "favorites" ? [...favorites] : [...savedListings];

        if (listingIds.length > 0) {
          const response = await listingsAPI.getListingsByIds(listingIds);
          if (response.success && response.data) {
            const listingsData = Array.isArray(response.data)
              ? response.data
              : [response.data];
            // Filter out any null/undefined listings and ensure they match the Listing type
            const validListings = listingsData.filter(
              (listing): listing is Listing => Boolean(listing),
            );
            setListings(validListings);
          }
        } else {
          setListings([]);
        }
      } catch (error) {
        console.error(`Error fetching ${type} listings:`, error);
        toast.error(`Failed to load ${type} listings`);
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
    return (
      <div className="p-4 text-center text-gray-500">Loading {type}...</div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No {type} listings found.{" "}
        {type === "saved"
          ? "Save listings to see them here!"
          : "Add listings to your favorites to see them here!"}
      </div>
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
