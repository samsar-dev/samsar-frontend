import { listingsAPI } from "@/api/listings.api";
import ImageFallback from "@/components/common/ImageFallback";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { ListingAction } from "@/types/enums";
import type { Listing, ListingDetails } from "@/types/listings";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsSend } from "react-icons/bs";
import { MdDelete, MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { toast } from "react-toastify";

interface ExtendedListing extends Omit<Listing, "details"> {
  seller?: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
  details: ListingDetails & {
    area?: number;
  };
}

const SavedListings = () => {
  const { t } = useTranslation();
  const [listings, setListings] = useState<ExtendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const handleRemoveFavorite = async (listingId: string) => {
    try {
      const response = await listingsAPI.removeFavorite(listingId);
      if (response.success) {
        setListings((prev) => prev.filter((l) => l.id !== listingId));
        toast.success(t("Removed from saved listings"));
      } else {
        toast.error(response.error || t("Failed to remove favorite"));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("Failed to remove favorite")
      );
    }
  };

  const fetchListings = useCallback(async () => {
    if (!user) {
      console.warn("No user logged in");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching favorites for user:", user.id);

      const response = await listingsAPI.getFavorites();
      console.log("Favorites API Response:", response);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch listings");
      }

      // More robust data extraction
      const favoriteItems =
        response.data?.items || response.data?.favorites || response.data || [];

      console.log("Favorite Items:", favoriteItems);

      const transformedListings = favoriteItems.map((listing: any) => {
        // Handle different possible listing structures
        const processedListing = listing.item || listing;

        return {
          ...processedListing,
          images: (processedListing.images || [])
            .map((img: any) => {
              if (typeof img === "string") return img;
              if (img instanceof File) return URL.createObjectURL(img);
              return img.url || img || "";
            })
            .filter(Boolean)
            .map(String),
        };
      }) as ExtendedListing[];

      console.log("Transformed Listings:", transformedListings);

      setListings(transformedListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.fetch_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex flex-col justify-center items-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t("Please log in to view your saved listings")}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-transparent py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <MdFavorite className="text-red-500 w-6 h-6" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {t("Saved Listings")}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("Easily access and manage all the listings you love.")}
          </p>

          <div className="flex flex-col gap-4">
            {listings.length > 0 ? (
              listings.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.08, ease: "easeOut" }}
                  className="group bg-white/80 dark:bg-gray-800 flex items-end justify-between rounded overflow-hidden border border-gray-200 dark:border-gray-700 dark:hover:shadow hover:shadow-sm transition-all duration-100"
                >
                  <div className="flex w-full">
                    <div className="relative overflow-visible w-36 h-36 flex-shrink-0">
                      <div className="absolute top-2 left-2 z-40">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-sm border opacity-0 group-hover:opacity-100 transition-all duration-150 ${
                            item.listingAction?.toLocaleLowerCase() ===
                            ListingAction.SALE.toLocaleLowerCase()
                              ? "bg-blue-600/90 text-white border-blue-700"
                              : "bg-green-600/90 text-white border-emerald-700"
                          }`}
                        >
                          {item.listingAction?.toLocaleLowerCase() ===
                          ListingAction.SALE.toLocaleLowerCase()
                            ? t("Sell")
                            : t("Rent")}
                        </span>
                      </div>
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0] as string}
                            alt={item.title}
                            className="inset-0 w-full h-full object-cover bg-white dark:bg-gray-800 bg-cover rounded-sm"
                            onError={() => {
                              // Error handling is now managed by ImageFallback
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {t("No Image")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 pl-4 flex justify-between flex-col flex-grow">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                            {item.seller?.profilePicture ? (
                              <img
                                src={item.seller.profilePicture}
                                alt={item.seller.username}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/default-avatar.png";
                                  e.currentTarget.onerror = null;
                                }}
                              />
                            ) : (
                              <div className="text-gray-400 text-sm text-center w-full">
                                {item.seller?.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.seller?.username || t("UserName")}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="mr-2">{item.location}</span>
                          {"area" in item.details && (
                            <span>• {item.details.area} sq.m.</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            ${item.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-full flex translate-x-28 border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    <button
                      className="p-2 mx-2 my-1 flex items-center justify-center text-gray-600 dark:text-gray-400 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:text-blue-700 hover:bg-blue-600/50 hover:border-blue-600/30 dark:hover:border-blue-600/20 dark:hover:text-blue-400 transition-colors duration-300"
                      onClick={() => {
                        /* TODO: Implement share functionality */
                      }}
                    >
                      <BsSend className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 mx-2 my-1 flex items-center justify-center text-gray-600 dark:text-gray-400 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:text-red-700 hover:bg-red-600/50 hover:border-red-600/30 dark:hover:border-red-600/20 dark:hover:text-red-400 transition-colors duration-300"
                      onClick={() => handleRemoveFavorite(item.id as string)}
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400">
                <MdFavoriteBorder className="mx-auto text-5xl text-red-400 mb-4" />
                <p className="text-lg font-semibold">
                  {t("No saved listings yet")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t(
                    "Browse listings and tap the heart to save your favorites."
                  )}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SavedListings;
