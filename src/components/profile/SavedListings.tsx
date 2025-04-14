import { listingsAPI } from "@/api/listings.api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ListingAction, ListingCategory } from "@/types/enums";
import type { Listing, ListingDetails } from "@/types/listings";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsSend } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
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

const SavedListings: React.FC = () => {
  const { t } = useTranslation();
  const [listings, setListings] = useState<ExtendedListing[]>([]);
  console.log("Listings:", listings);
  const [loading, setLoading] = useState(true);

  const getCategoryLabel = (category: {
    mainCategory: ListingCategory;
    subCategory: string;
  }) => {
    switch (category.mainCategory) {
      case ListingCategory.VEHICLES:
        return t("navigation.vehicles");
      case ListingCategory.REAL_ESTATE:
        return t("navigation.real_estate");
      default:
        return category.subCategory;
    }
  };

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getAll({
        limit: 50,
        page: 1,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch listings");
      }

      const transformedListings = (response.data?.listings || []).map(
        (listing) => ({
          ...listing,
          images: listing.images
            .map((img: any) => {
              if (typeof img === "string") return img;
              if (img instanceof File) return URL.createObjectURL(img);
              return img.url || "";
            })
            .filter(Boolean)
            .map(String),
        })
      ) as ExtendedListing[];

      setListings(transformedListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.fetch_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchListings();
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex justify-center items-center">
        <LoadingSpinner size="lg" />
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
          <div className="">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {t("Saved Listings")}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t("View and manage the listings you've saved for later")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {listings.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.08, ease: "easeOut" }}
                className="group bg-white/80 dark:bg-gray-800 flex items-end justify-between rounded overflow-hidden border border-gray-200 dark:border-gray-700 dark:hover:shadow hover:shadow-sm transition-all duration-100"
              >
                <div className="flex">
                  <div className="relative overflow-visible">
                    <div className="absolute top-2 left-2 z-40">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-sm border opacity-0 group-hover:opacity-100 transition-all duration-150 ${
                          item.listingAction.toLocaleLowerCase() ===
                          ListingAction.SELL.toLocaleLowerCase()
                            ? "bg-blue-600/90 text-white border-blue-700"
                            : "bg-green-600/90 text-white border-emerald-700"
                        }`}
                      >
                        {item.listingAction.toLocaleLowerCase() ===
                        ListingAction.SELL.toLocaleLowerCase()
                          ? t("Sell")
                          : t("Rent")}
                      </span>
                    </div>
                    <div className="w-36 h-36 bg-gray-100 dark:bg-gray-700">
                      {item.images && item.images.length > 0 && (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="inset-0 w-full h-full object-cover bg-white dark:bg-gray-800 bg-cover rounded-sm"
                        />
                      )}
                    </div>
                  </div>
                  <div className="pt-4 pl-4 flex justify-between flex-col">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                          {item.seller?.profilePicture ? (
                            <img
                              src={item.seller.profilePicture}
                              alt={item.seller.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400 text-sm text-center w-full">
                              {item.seller?.username
                                .charAt(0)
                                .toLocaleUpperCase()}
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
                <div className=" h-full flex translate-x-28 border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                  <button className="p-2 mx-2 my-1 flex items-center justify-center text-gray-600 dark:text-gray-400 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:text-blue-700 hover:bg-blue-600/50 hover:border-blue-600/30 dark:hover:border-blue-600/20 dark:hover:text-blue-400 transition-colors duration-300">
                    <BsSend className="w-5 h-5 " />
                  </button>
                  <button className="p-2 mx-2 my-1 flex items-center justify-center text-gray-600 dark:text-gray-400 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:text-red-700 hover:bg-red-600/50 hover:border-red-600/30 dark:hover:border-red-600/20 dark:hover:text-red-400 transition-colors duration-300">
                    <MdDelete className="w-5 h-5 " />
                  </button>
                </div>
              </motion.div>
            ))}
            {listings.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                {t("profile.no_saved_listings")}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SavedListings;
