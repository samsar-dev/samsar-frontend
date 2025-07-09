import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PreloadImages from "@/components/media/PreloadImages";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import ImageFallback from "@/components/media/ImageFallback";
import { renderIcon } from "@/components/ui/icons";
import { PriceConverter } from "@/components/common/PriceConverter";
import { cleanLocationString } from "@/utils/locationUtils";
import type {
  Listing as BaseListing,
  VehicleDetails,
  RealEstateDetails,
} from "@/types/listings";
import { ListingCategory, ListingAction, ListingStatus } from "@/types/enums";
import { motion } from "framer-motion";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdLocationOn,
  MdOutlineRemoveRedEye,
} from "react-icons/md";
import { listingsAPI } from "@/api/listings.api";
import { useAuth } from "@/hooks";
import { useState, useEffect } from "react";

// Extend the base Listing type to include our custom fields
interface ExtendedListing extends Omit<BaseListing, "latitude" | "longitude"> {
  vehicleDetails?: VehicleDetails;
  realEstateDetails?: RealEstateDetails;
  latitude: number | null;
  longitude: number | null;
  originalPrice?: number;
  views?: number; // Add views field to match the API response
}

export interface ListingCardProps {
  listing: ExtendedListing;
  onDelete?: (id: string) => void;
  editable?: boolean;
  deletable?: boolean;
  showActions?: boolean;
  showSaveButton?: boolean;
  showPrice?: boolean;
  showBadges?: boolean;
  showLocation?: boolean;
  priority?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onDelete,
  editable = false,
  deletable = false,
  showActions = false,
  showSaveButton = false,
  showPrice = false,
  showBadges = true,
  priority = false,
}) => {
  const { t } = useTranslation(["listings", "common", "locations"]);
  const formatViews = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [distance] = useState<number | null>(null); // Distance will be implemented later

  const {
    id,
    title,
    price,
    images = [],
    category,
    location,
    createdAt,
    // Note: listingAction is missing from the API response
    vehicleDetails: directVehicleDetails,
    realEstateDetails: directRealEstateDetails,
    details,
  } = listing;

  // Get the listing action from the API response with type safety
  const getListingAction = (): ListingAction => {
    // Default to SALE if undefined
    if (!listing.listingAction) {
      return ListingAction.SALE;
    }

    // Ensure the action is a valid ListingAction
    return Object.values(ListingAction).includes(
      listing.listingAction as ListingAction,
    )
      ? (listing.listingAction as ListingAction)
      : ListingAction.SALE;
  };

  const listingAction = getListingAction();

  // Instead of excessive debug logging, use optional chaining and proper type safety
  const vehicleDetails =
    directVehicleDetails || details?.vehicles || ({} as VehicleDetails);
  const realEstateDetails =
    directRealEstateDetails || details?.realEstate || ({} as RealEstateDetails);

  // Debugging logs
  if (typeof window !== "undefined") {
    console.log("[ListingCard Debug] Raw listing:", listing);
    console.log("[ListingCard Debug] vehicleDetails:", vehicleDetails);
  }

  // Normalize vehicle details to handle both transmission and transmissionType
  const normalizedVehicleDetails = {
    ...vehicleDetails,
    transmission:
      vehicleDetails.transmission || vehicleDetails.transmissionType || "",
    fuelType: vehicleDetails.fuelType || "",
  };

  // Debugging logs
  if (typeof window !== "undefined") {
    console.log(
      "[ListingCard Debug] normalizedVehicleDetails:",
      normalizedVehicleDetails,
    );
  }

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (id && user) {
        try {
          const response = await listingsAPI
            .getSavedListings()
            .catch((error) => {
              console.error("Error fetching saved listings:", error);
              toast.error("Failed to check favorite status");
              return { success: false, data: [] };
            });
          if (response.success && response.data) {
            // Handle different potential response structures
            const favorites =
              response.data.favorites ||
              response.data.items ||
              (Array.isArray(response.data) ? response.data : []);

            // Check if this listing is among saved listings
            setIsFavorite(
              favorites.some((fav: any) => {
                // Different possible structures to check
                const favId =
                  fav.id || fav.listingId || (fav.item && fav.item.id);
                const itemId = fav.itemId || (fav.item && fav.item.id);
                return favId === id || itemId === id;
              }),
            );
          }
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };
    checkFavoriteStatus();
  }, [id, user]);

  // Get the main image with proper type safety
  const mainImage: string =
    listing?.image ||
    (Array.isArray(images) && images.length > 0 && typeof images[0] === "string"
      ? images[0]
      : "");

  // Ensure id is defined before using it
  const listingId = id || "";

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id || !user) {
      console.error(
        "Cannot save favorite: No listing ID or user not logged in",
      );
      return;
    }

    try {
      if (isFavorite) {
        await listingsAPI.removeFavorite(id);
      } else {
        await listingsAPI.saveListing(id);
      }
      setIsFavorite(!isFavorite);
      // Trigger a refresh of the saved listings context
      if (window.location.pathname === "/saved-listings") {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const renderDetails = (): JSX.Element | null => {
    if (category.mainCategory === ListingCategory.VEHICLES && vehicleDetails) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p className="flex items-center gap-2">
            {renderIcon("FaCalendarAlt", "text-blue-500 mr-1")}{" "}
            {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}
          </p>
          {vehicleDetails.mileage && (
            <p className="flex items-center gap-2">
              {renderIcon("FaTachometerAlt", "text-blue-500 mr-1")}{" "}
              {vehicleDetails.mileage} km
            </p>
          )}
          {vehicleDetails.transmission && (
            <p className="flex items-center gap-2">
              {renderIcon("FaCogs", "text-blue-500 mr-1")}{" "}
              {(() => {
                const transmissionValue =
                  vehicleDetails.transmissionType ||
                  vehicleDetails.transmission;

                if (!transmissionValue) return t("notProvided");

                // Convert to camelCase for the translation key
                let translationKey = transmissionValue.toLowerCase();

                // Handle special cases
                if (
                  transmissionValue === "cvt" ||
                  transmissionValue === "continuously_variable" ||
                  transmissionValue === "continuouslyvariable"
                ) {
                  return "CVT";
                } else if (
                  transmissionValue === "semi_automatic" ||
                  transmissionValue === "semi-automatic"
                ) {
                  translationKey = "semiAutomatic";
                } else if (
                  transmissionValue === "dual_clutch" ||
                  transmissionValue === "dualclutch"
                ) {
                  translationKey = "dualClutch";
                } else if (
                  transmissionValue === "manual" ||
                  transmissionValue === "automatic"
                ) {
                  // These are already in the correct format
                } else {
                  translationKey = transmissionValue;
                }

                // Get the translation from the listings namespace
                return t(`fields.transmissionTypes.${translationKey}`, {
                  defaultValue: transmissionValue,
                });
              })()}
            </p>
          )}
          {vehicleDetails.fuelType && (
            <p className="flex items-center gap-2">
              {renderIcon("FaGasPump", "text-blue-500 mr-1")}{" "}
              {t(`fields.fuelTypes.${vehicleDetails.fuelType}`)}
            </p>
          )}
        </div>
      );
    }

    if (
      category.mainCategory === ListingCategory.REAL_ESTATE &&
      realEstateDetails
    ) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p className="flex items-center gap-2">
            {renderIcon("FaBuilding", "text-green-600 mr-1")}{" "}
            {t(`enums.propertyType.${realEstateDetails.propertyType}`)}
          </p>
          {realEstateDetails.size && (
            <p className="flex items-center gap-2">
              {renderIcon("FaHome", "text-green-600 mr-1")}{" "}
              {realEstateDetails.size} m²
            </p>
          )}
          {typeof realEstateDetails.bedrooms === "number" && (
            <p className="flex items-center gap-2">
              {renderIcon("FaBed", "text-green-600 mr-1")}{" "}
              {realEstateDetails.bedrooms} {t("beds")}
            </p>
          )}
          {typeof realEstateDetails.bathrooms === "number" && (
            <p className="flex items-center gap-2">
              {renderIcon("FaBath", "text-green-600 mr-1")}{" "}
              {realEstateDetails.bathrooms} {t("baths")}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        transition: { duration: 0.3 },
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className="bg-white dark:bg-gray-825 rounded-2xl shadow-sm hover:shadow-xl overflow-hidden group relative transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600"
    >
      {/* Preload the main image for LCP optimization */}
      {mainImage && typeof mainImage === "string" && (
        <PreloadImages
          imageUrls={[mainImage]}
          priority={priority}
          quality={85}
        />
      )}
      <div className="relative h-full">
        <Link to={`/listings/${listingId}`} className="block h-full">
          <div
            className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative group"
            role="img"
            aria-label={
              title ? `${title} - ${t("listingImage")}` : t("listingImage")
            }
          >
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

            {/* Fallback content for when image fails to load */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
              {t("imageUnavailable")}
            </div>

            {/* Main image with smooth loading */}
            <ImageFallback
              src={mainImage}
              alt={
                title ? `${title} - ${t("listingImage")}` : t("listingImage")
              }
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              category={category?.subCategory}
              priority={priority}
              quality={90}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading={priority ? "eager" : "lazy"}
              width={480}
              height={360}
              aria-hidden="false"
            />

            {/* Status badge */}
            <div className="absolute top-3 left-3 z-20 flex flex-col space-y-2">
              {listing.status === ListingStatus.SOLD && (
                <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  {t("status.sold")}
                </span>
              )}
              {listing.status === ListingStatus.RESERVED && (
                <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  {t("status.reserved")}
                </span>
              )}
              {listing.status === ListingStatus.PENDING ||
              listing.status === ListingStatus.PENDING_REVIEW ? (
                <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  {t("status.pending")}
                </span>
              ) : null}
            </div>

            {/* Map has been moved to ListingDetails component */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 z-20 pointer-events-none">
              {showBadges && (
                <div className="flex flex-wrap gap-2">
                  {/* Category badge */}
                  <span
                    className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm pointer-events-auto 
                  hover:bg-white hover:shadow-md transition-all duration-200"
                  >
                    {t(
                      `categories.subcategories.${category.mainCategory.toLowerCase()}.${category.subCategory}`,
                      { defaultValue: category.subCategory },
                    )}
                  </span>

                  {/* Action badge */}
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm pointer-events-auto
                  transition-all duration-200 hover:shadow-md ${
                    listingAction === ListingAction.SALE
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                      : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
                  }`}
                  >
                    {listingAction === ListingAction.SALE
                      ? t("common.forSale")
                      : t("common.forRent")}
                  </span>
                </div>
              )}

              {showSaveButton && user && (
                <div className="ml-auto mt-auto">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFavoriteClick(e);
                    }}
                    className={`p-2 flex items-center justify-center rounded-full transition-all duration-300 transform hover:scale-110 shadow-md pointer-events-auto ${
                      isFavorite
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-white/90 dark:bg-gray-800/90 text-gray-600 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700"
                    }`}
                    aria-label={
                      isFavorite
                        ? t("removeFromFavorites")
                        : t("addToFavorites")
                    }
                  >
                    {isFavorite ? (
                      <MdFavorite className="w-5 h-5" />
                    ) : (
                      <MdFavoriteBorder className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="p-5">
            {/* Title and Price Row */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200">
                <Link
                  to={`/listings/${id}`}
                  className="hover:underline decoration-2 underline-offset-2 decoration-blue-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  aria-label={`${title} - ${t("viewDetails")}`}
                >
                  {title}
                </Link>
              </h2>
              {showPrice && (
                <div className="flex-shrink-0 ml-3">
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                    <PriceConverter
                      price={price}
                      showMonthly={listingAction === ListingAction.RENT}
                      className="font-semibold"
                    />
                  </p>
                  {"originalPrice" in listing &&
                    listing.originalPrice &&
                    listing.originalPrice > price && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-through text-right">
                        <PriceConverter
                          price={listing.originalPrice}
                          className="line-through"
                        />
                      </p>
                    )}
                </div>
              )}
            </div>

            {/* Location, Distance and Date */}
            <div className="flex flex-col space-y-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
              {location && (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <MdLocationOn className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude || ""}${!listing.latitude ? encodeURIComponent(location) : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline hover:text-blue-700 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`${t("viewOnMap")} - ${location}`}
                    >
                      {cleanLocationString(location)}
                    </a>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <MdOutlineRemoveRedEye className="mr-1 text-gray-400" />
                    <span>{formatViews(listing.views)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Info Boxes */}
            {category.mainCategory === ListingCategory.VEHICLES && (
              <div className="space-y-3">
                {vehicleDetails ? (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Mileage box */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {t("listings.fields.mileage")}
                        </span>
                      </div>
                      <div className="mt-1 text-center font-medium text-gray-900 dark:text-white">
                        {vehicleDetails?.mileage ? (
                          `${vehicleDetails.mileage.toLocaleString()} km`
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>

                    {/* Year box */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {t("year")}
                        </span>
                      </div>
                      <div className="mt-1 text-center font-medium text-gray-900 dark:text-white">
                        {vehicleDetails?.year || (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                    {/* Fuel type box */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {t("fields.fuelType")}
                        </span>
                      </div>
                      <div className="mt-1 text-center font-medium text-gray-900 dark:text-white">
                        {vehicleDetails?.fuelType ? (
                          t(`fields.fuelTypes.${vehicleDetails.fuelType}`, {
                            defaultValue: vehicleDetails.fuelType,
                          })
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>

                    {/* Transmission box */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/60 dark:to-gray-800/60 rounded-xl p-3 border border-gray-100/50 dark:border-gray-700/50 transition-colors duration-200">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {t("fields.transmission")}
                        </span>
                      </div>
                      <div className="mt-1 text-center font-medium text-gray-900 dark:text-white">
                        {(() => {
                          const transmissionValue =
                            vehicleDetails?.transmissionType ||
                            vehicleDetails?.transmission;

                          if (!transmissionValue)
                            return <span className="text-gray-400">-</span>;

                          let translationKey = transmissionValue.toLowerCase();

                          // Handle special cases
                          if (
                            [
                              "cvt",
                              "continuously_variable",
                              "continuouslyvariable",
                            ].includes(transmissionValue)
                          ) {
                            return "CVT";
                          } else if (
                            ["semi_automatic", "semi-automatic"].includes(
                              transmissionValue,
                            )
                          ) {
                            translationKey = "semiAutomatic";
                          } else if (
                            ["dual_clutch", "dualclutch"].includes(
                              transmissionValue,
                            )
                          ) {
                            translationKey = "dualClutch";
                          }

                          return t(
                            `fields.transmissionTypes.${translationKey}`,
                            {
                              defaultValue: transmissionValue,
                            },
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic mb-3 text-center py-2">
                    {t("vehicleDetailsNotAvailable")}
                  </div>
                )}
              </div>
            )}

            {category.mainCategory === ListingCategory.REAL_ESTATE &&
              realEstateDetails && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Size box */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {t("fields.size")}
                      </span>
                    </div>
                    <div className="mt-1 text-center font-medium text-gray-900 dark:text-white">
                      {realEstateDetails.size ? (
                        <>{realEstateDetails.size.toLocaleString()} m²</>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                  {/* Bedrooms and Bathrooms */}
                  {category.subCategory?.toLowerCase() === "land" ? (
                    <>
                      {realEstateDetails.bedrooms && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {t("fields.bedrooms")}
                            </span>
                          </div>
                          <div className="mt-1 text-center font-medium text-gray-900 dark:text-white">
                            {realEstateDetails.bedrooms} {t("beds")}
                          </div>
                        </div>
                      )}
                      {realEstateDetails.bathrooms && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {t("fields.bathrooms")}
                            </span>
                          </div>
                          <div className="mt-1 text-center font-medium text-gray-900 dark:text-white">
                            {realEstateDetails.bathrooms} {t("baths")}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {t("fields.bedrooms")}
                          </span>
                        </div>
                        <div className="mt-1 text-center font-medium text-gray-900 dark:text-white">
                          {realEstateDetails.bedrooms ? (
                            <>
                              {realEstateDetails.bedrooms} {t("beds")}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {t("fields.bathrooms")}
                          </span>
                        </div>
                        <div className="mt-1 text-center font-medium text-gray-900 dark:text-white">
                          {realEstateDetails.bathrooms ? (
                            <>
                              {realEstateDetails.bathrooms} {t("baths")}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            {category.mainCategory !== ListingCategory.VEHICLES &&
              category.mainCategory !== ListingCategory.REAL_ESTATE &&
              renderDetails()}
          </div>
        </Link>
      </div>
      {showActions && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-end gap-3">
            {editable && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/listings/${id}/edit`;
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <FaEdit className="w-3.5 h-3.5" />
                {t("edit")}
              </motion.button>
            )}
            {deletable && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (window.confirm(t("deleteConfirmation"))) {
                    onDelete?.(id as string);
                  }
                }}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-red-600 border border-red-200 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-red-400 dark:hover:bg-gray-600"
              >
                <FaTrash className="w-3.5 h-3.5" />
                {t("delete")}
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Footer with action buttons */}
      <div className="px-5 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle share functionality
            }}
            className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label="Share listing"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-2">
            {user?.id === listing.userId && (
              <>
                <Link
                  to={`/listings/edit/${listingId}`}
                  className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Edit listing"
                >
                  <FaEdit className="w-4 h-4" />
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onDelete && id) onDelete(id);
                  }}
                  className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200"
                  aria-label="Delete listing"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-all duration-200 ${
                isFavorite
                  ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40"
                  : "text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <Link
              to={`/listings/${listingId}`}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              {listingAction === ListingAction.SALE
                ? t("common.viewDetails")
                : t("common.inquireNow")}
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ListingCard;
