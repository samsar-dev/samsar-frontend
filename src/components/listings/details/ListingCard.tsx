import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PreloadImages from "@/components/media/PreloadImages";
import { Link } from "react-router-dom";
import { FaEdit } from "@react-icons/all-files/fa/FaEdit";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import ImageFallback from "@/components/media/ImageFallback";
import { renderIcon } from "@/components/ui/icons";
import { lazy, Suspense } from "react";
const PriceConverter = lazy(() => import("@/components/common/PriceConverter"));
import { cleanLocationString } from "@/utils/locationUtils";
import type {
  Listing as BaseListing,
  VehicleDetails,
  RealEstateDetails,
} from "@/types/listings";
import { ListingCategory, ListingAction, ListingStatus } from "@/types/enums";

import { MdFavorite } from "@react-icons/all-files/md/MdFavorite";
import { MdFavoriteBorder } from "@react-icons/all-files/md/MdFavoriteBorder";
import { MdLocationOn } from "@react-icons/all-files/md/MdLocationOn";
import { MdRemoveRedEye } from "@react-icons/all-files/md/MdRemoveRedEye";
import { listingsAPI } from "@/api/listings.api";
import { useAuth } from "@/hooks/useAuth";
import {
  useState,
  useEffect,
  useCallback,
  memo
} from "react";
 

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

const ListingCardComponent: React.FC<ListingCardProps> = ({
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
  const formatViews = useCallback((count?: number) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }, []);

  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const {
    id,
    title,
    price,
    images = [],
    category,
    location,
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
              {t(`fields.fuelType.${vehicleDetails.fuelType}`)}
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

  // Generate structured data for the listing
  const generateStructuredData = () => {
    const baseUrl = window.location.origin;
    const listingUrl = `${baseUrl}/listings/${listingId}`;
    const imageUrl = mainImage || "";
    const price = typeof listing.price === "number" ? listing.price : 0;
    const priceCurrency = "SYP"; // Syrian Pound

    const structuredData: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: title || "",
      description: t("listingDescription", {
        category: category.subCategory,
        make: vehicleDetails?.make || "",
        model: vehicleDetails?.model || "",
        year: vehicleDetails?.year || "",
        location: location || "",
      }),
      image: imageUrl,
      url: listingUrl,
      offers: {
        "@type": "Offer",
        url: listingUrl,
        priceCurrency: priceCurrency,
        price: price,
        availability:
          listing.status === ListingStatus.ACTIVE
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/UsedCondition",
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      brand:
        category.mainCategory === ListingCategory.VEHICLES
          ? {
              "@type": "Brand",
              name: vehicleDetails?.make || "",
            }
          : undefined,
      itemCondition: "https://schema.org/UsedCondition",
      additionalProperty: [],
    };

    // Add vehicle-specific properties
    if (category.mainCategory === ListingCategory.VEHICLES && vehicleDetails) {
      structuredData.additionalProperty = [
        {
          "@type": "PropertyValue",
          name: "mileage",
          value: vehicleDetails.mileage ? `${vehicleDetails.mileage} km` : "",
          valueReference: "QuantitativeValue",
        },
        {
          "@type": "PropertyValue",
          name: "year",
          value: vehicleDetails.year || "",
          valueReference: "QuantitativeValue",
        },
        {
          "@type": "PropertyValue",
          name: "transmission",
          value:
            vehicleDetails.transmission ||
            vehicleDetails.transmissionType ||
            "",
        },
        {
          "@type": "PropertyValue",
          name: "fuelType",
          value: vehicleDetails.fuelType || "",
        },
      ];
    }

    // Add real estate specific properties
    if (
      category.mainCategory === ListingCategory.REAL_ESTATE &&
      realEstateDetails
    ) {
      structuredData.additionalProperty = [
        {
          "@type": "PropertyValue",
          name: "propertyType",
          value: realEstateDetails.propertyType || "",
        },
        {
          "@type": "PropertyValue",
          name: "size",
          value: realEstateDetails.size ? `${realEstateDetails.size} m²` : "",
          valueReference: "QuantitativeValue",
        },
        ...(realEstateDetails.bedrooms
          ? [
              {
                "@type": "PropertyValue",
                name: "bedrooms",
                value: realEstateDetails.bedrooms.toString(),
                valueReference: "QuantitativeValue",
              },
            ]
          : []),
        ...(realEstateDetails.bathrooms
          ? [
              {
                "@type": "PropertyValue",
                name: "bathrooms",
                value: realEstateDetails.bathrooms.toString(),
                valueReference: "QuantitativeValue",
              },
            ]
          : []),
      ];
    }

    return structuredData;
  };

  const structuredData = generateStructuredData();

  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      className="w-full bg-white dark:bg-gray-900 rounded-none sm:rounded-2xl shadow-sm hover:shadow-xl dark:shadow-lg dark:shadow-black/30 overflow-hidden group relative transition-all duration-300 border-0 sm:border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 animate-fadeIn"
    >
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="relative h-full">
        <Link to={`/listings/${listingId}`} className="block h-full">
          <div
            className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800/80 flex items-center justify-center relative group"
            role="img"
            aria-label={
              title ? `${title} - ${t("listingImage")}` : t("listingImage")
            }
          >
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

            {/* Preload the main image for LCP optimization */}
            {mainImage && typeof mainImage === "string" && (
              <PreloadImages imageUrls={[mainImage]} />
            )}

            {/* Fallback content for when image fails to load */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800/90 text-gray-900 dark:text-gray-200 text-base font-medium p-4">
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
              role="img"
              aria-label={
                title ? `${title} - ${t("listingImage")}` : t("listingImage")
              }
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
            <div className="absolute inset-0 flex flex-col justify-between p-3 z-20 pointer-events-none">
              {showBadges && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {/* Category badge */}
                  <span
                    className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-white text-sm font-semibold px-5 py-3 rounded-full shadow-sm pointer-events-auto
                  hover:bg-white dark:hover:bg-gray-800/90 hover:shadow-md transition-all duration-200 min-w-[120px] inline-flex items-center justify-center h-[44px] border border-gray-100 dark:border-gray-700"
                    role="button"
                    tabIndex={0}
                    aria-label={t("category", category?.subCategory)}
                  >
                    {t(
                      `categories.subcategories.${category.mainCategory.toLowerCase()}.${category.subCategory}`,
                      { defaultValue: category.subCategory },
                    )}
                  </span>

                  {/* Action badge */}
                  <span
                    className={`text-sm font-semibold px-5 py-3 rounded-full shadow-sm pointer-events-auto
                  transition-all duration-200 hover:shadow-md min-h-[44px] inline-flex items-center ${
                    listingAction === ListingAction.SALE
                      ? "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white"
                      : "bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white"
                  }`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${listingAction === ListingAction.SALE ? t("common.forSale") : t("common.forRent")}`}
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
                    className={`p-3 flex items-center justify-center rounded-full transition-all duration-300 transform hover:scale-110 shadow-md pointer-events-auto w-11 h-11 ${
                      isFavorite
                        ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                        : "bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 hover:bg-white dark:hover:bg-gray-700/80"
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
              <h2
                itemProp="name"
                className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200"
              >
                <div
                  className="hover:underline decoration-2 underline-offset-2 decoration-blue-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded cursor-pointer"
                  aria-label={`${title} - ${t("viewDetails")}`}
                >
                  <span itemProp="name">{title}</span>
                </div>
              </h2>
              {showPrice && (
                <div className="flex-shrink-0 ml-3">
                  <div
                    itemProp="offers"
                    itemScope
                    itemType="https://schema.org/Offer"
                    className="text-xl font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap"
                  >
                    <meta itemProp="price" content={price?.toString() || "0"} />
                    <meta itemProp="priceCurrency" content="SYP" />
                    <meta
                      itemProp="availability"
                      content={
                        listing.status === ListingStatus.ACTIVE
                          ? "https://schema.org/InStock"
                          : "https://schema.org/OutOfStock"
                      }
                    />
                    <Suspense fallback={<div className="font-semibold">Loading price...</div>}>
                      <PriceConverter
                        price={price}
                        showMonthly={listingAction === ListingAction.RENT}
                        className="font-semibold"
                      />
                    </Suspense>
                  </div>
                  {"originalPrice" in listing &&
                    listing.originalPrice &&
                    listing.originalPrice > price && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-through text-right">
                        <Suspense fallback={<div className="line-through">Loading price...</div>}>
                          <PriceConverter
                            price={listing.originalPrice}
                            className="line-through"
                          />
                        </Suspense>
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
                    <MdLocationOn className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const query =
                          listing.latitude && listing.longitude
                            ? `${listing.latitude},${listing.longitude}`
                            : encodeURIComponent(location || "");
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${query}`,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }}
                      className="truncate text-left text-gray-700 dark:text-gray-300 hover:underline hover:text-blue-800 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded px-2 py-1.5 -mx-1 text-[15px] font-medium"
                      aria-label={`${t("viewOnMap")} - ${location}`}
                    >
                      {cleanLocationString(location)}
                    </button>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <MdRemoveRedEye className="mr-1 text-gray-400" />
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
                    <div className="bg-gray-50 dark:bg-gray-800/90 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
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
                    <div className="bg-gray-50 dark:bg-gray-800/90 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
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
                    <div className="bg-gray-50 dark:bg-gray-800/90 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
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
                          {t("fields.transmissionType")}
                        </span>
                      </div>
                      <div className="mt-1 text-center font-medium text-gray-900 dark:text-white">
                        {(() => {
                          const transmissionValue =
                            vehicleDetails?.transmissionType ||
                            vehicleDetails?.transmission;

                          if (!transmissionValue)
                            return <span className="text-gray-400">-</span>;

                          // Normalize the transmission value to match our translation keys
                          let translationKey = '';
                          
                          // Convert to lowercase and remove special characters for easier matching
                          const normalizedValue = transmissionValue.toLowerCase().replace(/[^a-z0-9]/g, '');
                          
                          // Map all possible variations to our translation keys
                          if (['cvt', 'continuouslyvariable', 'continuously_variable'].includes(normalizedValue)) {
                            translationKey = 'CVT';
                          } else if (['semimanual', 'semiautomatic', 'semi_automatic', 'semi-automatic'].includes(normalizedValue)) {
                            translationKey = 'SEMI_AUTOMATIC';
                          } else if (['dualclutch', 'dual_clutch', 'dualgrip'].includes(normalizedValue)) {
                            translationKey = 'DUAL_CLUTCH';
                          } else if (['automatic', 'auto', 'اتوماتيك'].includes(normalizedValue)) {
                            translationKey = 'AUTOMATIC';
                          } else if (['manual', 'stick', 'عادي'].includes(normalizedValue)) {
                            translationKey = 'MANUAL';
                          } else {
                            // If we don't recognize the value, use it as-is
                            translationKey = transmissionValue.toUpperCase();
                          }
                          
                          // Try to get the translation from the options namespace first
                          let translated = t(`options:transmission.${translationKey}`, {
                            // Fallback to common namespace if not found in options
                            defaultValue: t(`common:fields.transmissionTypes.${translationKey}`, {
                              // Fallback to listings namespace if not found in common
                              defaultValue: t(`fields.transmissionTypes.${translationKey}`, {
                                // If still not found, format the key nicely
                                defaultValue: translationKey
                                  .toLowerCase()
                                  .replace(/([a-z])([A-Z])/g, '$1 $2')
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (char) => char.toUpperCase())
                              })
                            })
                          });
                          
                          // If we still don't have a translation, format the original value nicely
                          if (!translated || translated.startsWith('options:') || 
                              translated.startsWith('common:') || 
                              translated.startsWith('fields.')) {
                            return transmissionValue
                              .toLowerCase()
                              .replace(/([a-z])([A-Z])/g, '$1 $2')
                              .replace(/[_-]/g, ' ')
                              .replace(/\b\w/g, (char) => char.toUpperCase())
                              .trim();
                          }
                          
                          return translated;
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
                  <div className="bg-gray-50 dark:bg-gray-800/90 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
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
                        <div className="bg-gray-50 dark:bg-gray-800/90 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
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
                        <div className="bg-gray-50 dark:bg-gray-800/90 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
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
                      <div className="bg-gray-50 dark:bg-gray-800/90 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
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
                      <div className="bg-gray-50 dark:bg-gray-800/90 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
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
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3 bg-white/80 dark:bg-gray-900/95">
          <div className="flex justify-end gap-3">
            {editable && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/listings/${id}/edit`;
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 transform transition-transform duration-200"
              >
                <FaEdit className="w-3.5 h-3.5" />
                {t("edit")}
              </button>
            )}
            {deletable && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (window.confirm(t("deleteConfirmation"))) {
                    onDelete?.(id as string);
                  }
                }}
                className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 transform transition-transform duration-200"
              >
                <FaTrash className="w-3.5 h-3.5" />
                {t("delete")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer with action buttons */}
      <div className="px-5 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
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
                  className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200 bg-white/80 dark:bg-gray-800/90 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/80"
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
                  className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/80"
                  aria-label="Delete listing"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={handleFavoriteClick}
              className={`p-3 rounded-full transition-all duration-200 min-w-[50px] min-h-[50px] ${
                isFavorite
                  ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40"
                  : "text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 bg-white/80 dark:bg-gray-800/80"
              }`}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              role="button"
              tabIndex={0}
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-base font-medium rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md min-w-[120px]"
              onClick={(e) => e.stopPropagation()}
              aria-label={t("common.viewDetails")}
              role="link"
              tabIndex={0}
            >
              {listingAction === ListingAction.SALE
                ? t("common.viewDetails")
                : t("common.inquireNow")}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ListingCard = memo(
  ListingCardComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.listing.id === nextProps.listing.id &&
      prevProps.priority === nextProps.priority &&
      prevProps.showActions === nextProps.showActions &&
      prevProps.showSaveButton === nextProps.showSaveButton &&
      prevProps.showPrice === nextProps.showPrice &&
      prevProps.showBadges === nextProps.showBadges &&
      prevProps.editable === nextProps.editable &&
      prevProps.deletable === nextProps.deletable
    );
  },
);

export default ListingCard;
