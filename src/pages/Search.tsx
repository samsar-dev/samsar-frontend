import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ListingCard from "@/components/listings/details/ListingCard";
import { Listing, ListingCategory } from "@/types";

const Search: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q") || "";

  // Mock data for development
  const mockListings: Listing[] = [
    {
      _id: "1",
      id: "1",
      title: "Tesla Model 3",
      description: "Electric vehicle in excellent condition",
      price: 35000,
      category: ListingCategory.VEHICLES,
      images: ["https://placehold.co/600x400"],
      location: "San Francisco, CA",
      userId: "user1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 150,
      likes: 25,
      saved: false,
      featured: true,
      status: "active",
    },
    {
      _id: "2",
      id: "2",
      title: "Modern Apartment",
      description: "Luxury apartment with great view",
      price: 500000,
      category: ListingCategory.REAL_ESTATE,
      images: ["https://placehold.co/600x400"],
      location: "New York, NY",
      userId: "user2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 300,
      likes: 45,
      saved: false,
      featured: false,
      status: "active",
    },
  ];

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        const filteredListings = mockListings.filter(
          (listing) =>
            listing.title.toLowerCase().includes(query.toLowerCase()) ||
            listing.description.toLowerCase().includes(query.toLowerCase()) ||
            listing.location.toLowerCase().includes(query.toLowerCase()),
        );
        setListings(filteredListings);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {t("search.results_for")} "{query}"
      </h1>

      {listings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            {t("search.no_results")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showSaveButton={true}
              showPrice={true}
              showLocation={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
