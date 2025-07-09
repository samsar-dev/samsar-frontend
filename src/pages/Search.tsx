import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ListingCard from "@/components/listings/details/ListingCard";
import SkeletonListingGrid from "@/components/common/SkeletonGrid";
import { Listing } from "@/types/listings";
import { listingsAPI } from "@/api/listings.api";
import { ListingCategory, VehicleType, PropertyType } from "@/types/enums";

const Search: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get query from search params
  const query = searchParams.get("q") || "";

  const fetchListings = useCallback(async () => {
    console.log("fetchListings called with query:", query);
    setLoading(true);
    setError(null);

    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");

    // Clean up URL if no search query
    if (!query) {
      if (category || subcategory) {
        setSearchParams({});
      }
      setListings([]);
      setLoading(false);
      return;
    }

    // Create a params object that matches the API requirements
    const params: any = {
      limit: 10,
      page: 1,
      search: query,
    };

    // Only add category if present
    if (category) {
      params.category = {
        mainCategory: category as ListingCategory,
      };

      // Add subcategory if present
      if (subcategory) {
        params.category.subCategory = subcategory as VehicleType | PropertyType;
      }
    }

    try {
      console.log(
        "Search component - Searching with query:",
        query,
        "and params:",
        params,
      );
      const response = await listingsAPI.search(query, params);
      console.log("Search component - Response received:", response);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch listings");
      }

      // Handle different response formats
      const listingsData = response.data?.listings || response.data || [];

      // Ensure we have an array of listings
      const normalizedListings = Array.isArray(listingsData)
        ? listingsData
        : Array.isArray(response.data)
          ? response.data
          : [];

      console.log(
        "Search component - Normalized listings:",
        normalizedListings.length > 0
          ? `Found ${normalizedListings.length} listings`
          : "No listings found",
      );

      if (normalizedListings.length > 0) {
        console.log("Search component - First listing:", normalizedListings[0]);
      }

      if (normalizedListings.length === 0) {
        setError("No listings found matching your search");
        setListings([]);

        // If no results, try manually filtering all listings as fallback
        try {
          console.log(
            "Search component - No results from API, trying to fetch all listings",
          );
          const allResponse = await listingsAPI.getAll({ limit: 100 });

          if (
            allResponse.success &&
            allResponse.data &&
            allResponse.data.listings &&
            allResponse.data.listings.length > 0
          ) {
            const allListings = allResponse.data.listings;
            console.log(
              `Search component - Got ${allListings.length} total listings, filtering client-side`,
            );

            // Filter listings by search term - case insensitive
            const lowerQuery = query.toLowerCase();
            const matchedListings = allListings.filter((listing) => {
              const searchFields = [
                listing.title,
                listing.description,
                listing.details?.vehicles?.make,
                listing.details?.vehicles?.model,
                listing.location,
              ]
                .filter(Boolean)
                .map((field) => field?.toLowerCase());

              return searchFields.some((field) => field?.includes(lowerQuery));
            });

            if (matchedListings.length > 0) {
              console.log(
                `Search component - Found ${matchedListings.length} listings by client-side filtering`,
              );
              setListings(matchedListings);
              setError(null);
              setLoading(false);
              return;
            }
          }
        } catch (fallbackError) {
          console.error("Error in fallback search:", fallbackError);
        }
      } else {
        setListings(normalizedListings);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [query, searchParams, setSearchParams]);

  // Use a single effect for search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        fetchListings();
      } else {
        setListings([]);
        setError(null);
      }
    }, 300); // Debounce search requests

    return () => clearTimeout(timer);
  }, [query, fetchListings]);

  return (
    <div className="container mx-auto px-4 py-8">
      {searchParams.get("q") && (
        <h1 className="text-2xl font-bold mb-6">
          {t("search.results_for")} "{searchParams.get("q")}"
        </h1>
      )}

      {loading ? (
        <SkeletonListingGrid />
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : !query ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            {t("search.enter_query")}
          </p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            {t("search.no_results")}
          </p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Search;
