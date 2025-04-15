import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { formatCurrency } from "@/utils/format";
import type {
  Listing,
  VehicleDetails,
  RealEstateDetails,
} from "@/types/listings";
import { ListingCategory } from "@/types/enums";
import { motion } from "framer-motion";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { listingsAPI } from "@/api/listings.api";
import { useAuth } from "@/hooks";
import { useState, useEffect } from "react";

export interface ListingCardProps {
  listing: Listing & {
    vehicleDetails?: VehicleDetails;
    realEstateDetails?: RealEstateDetails;
  };
  onDelete?: (id: string) => void;
  editable?: boolean;
  deletable?: boolean;
  showActions?: boolean;
  showSaveButton?: boolean;
  showPrice?: boolean;
  showLocation?: boolean;
  showDate?: boolean;
  showBadges?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onDelete,
  editable = false,
  deletable = false,
  showActions = false,
  showSaveButton = false,
  showPrice = false,
  showLocation = false,
  showDate = false,
  showBadges = true,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    id,
    title,
    price,
    images = [],
    category,
    location,
    createdAt,
    listingAction,
    vehicleDetails,
    realEstateDetails,
  } = listing;

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (id && user) {
        try {
          const response = await listingsAPI.getSavedListings();
          if (response.success && response.data) {
            // Handle different potential response structures
            const favorites = response.data.favorites || 
                            response.data.items || 
                            (Array.isArray(response.data) ? response.data : []);
            
            // Check if this listing is among saved listings
            setIsFavorite(favorites.some((fav: any) => {
              // Different possible structures to check
              const favId = fav.id || fav.listingId || (fav.item && fav.item.id);
              const itemId = fav.itemId || (fav.item && fav.item.id);
              return favId === id || itemId === id;
            }));
          }
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };
    checkFavoriteStatus();
  }, [id, user]);

  const firstImage =
    Array.isArray(images) && images.length > 0
      ? typeof images[0] === "string"
        ? images[0]
        : "/placeholder.jpg"
      : "/placeholder.jpg";

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id || !user) {
      console.error('Cannot save favorite: No listing ID or user not logged in');
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
      if (window.location.pathname === '/saved-listings') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderDetails = () => {
    if (category.mainCategory === ListingCategory.VEHICLES && vehicleDetails) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>
            {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}
          </p>
          {vehicleDetails.mileage && <p>{vehicleDetails.mileage} km</p>}
          {vehicleDetails.transmission && vehicleDetails.fuelType && (
            <p>
              {t(`enums.transmission.${vehicleDetails.transmission}`)} •{" "}
              {t(`enums.fuel.${vehicleDetails.fuelType}`)}
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
          <p>{t(`enums.propertyType.${realEstateDetails.propertyType}`)}</p>
          {realEstateDetails.size && <p>{realEstateDetails.size} m²</p>}
          {realEstateDetails.bedrooms && realEstateDetails.bathrooms && (
            <p>
              {realEstateDetails.bedrooms} {t("common.beds")} •{" "}
              {realEstateDetails.bathrooms} {t("common.baths")}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 group relative"
    >
      <Link to={`/listings/${id}`} className="block">
        <div className="relative pt-[75%] overflow-hidden">
          <img
            src={firstImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-contain bg-white dark:bg-gray-800 bg-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
              e.currentTarget.onerror = null;
            }}
          />
          {showBadges && (
  <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
      {category.subCategory.replace(/_/g, ' ').toLowerCase().replace(/(^\w|\s\w)/g, c => c.toUpperCase())}
    </span>
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        listingAction === "SELL"
          ? "bg-blue-600 text-white"
          : "bg-green-600 text-white"
      }`}
    >
      {listingAction === "SELL" ? t("forSale") : t("forRent")}
    </span>
  </div>
)}


          {showSaveButton && user && (
            <div className="absolute top-2 right-2">
              <button
                onClick={handleFavoriteClick}
                className={`p-2 flex items-center justify-center rounded-full transition-colors duration-300 ${
                  isFavorite 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "bg-white text-gray-600 hover:text-blue-500 hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {isFavorite ? (
                  <MdFavorite className="w-6 h-6" />
                ) : (
                  <MdFavoriteBorder className="w-6 h-6" />
                )}
              </button>
            </div>
          )}
        </div>
        <div className="relative p-4">
          <h3 className="text-lg font-semibold mb-2 pr-8 truncate">{title}</h3>
          {showPrice && (
            <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
              {formatCurrency(price)}
              {(listingAction as string) === "rent" && (
                <span className="text-sm ml-1">/mo</span>
              )}
            </p>
          )}
          {renderDetails()}
          {showLocation && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{location}</p>
          )}
          {showDate && (
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              {new Date(createdAt as string).toLocaleDateString()}
            </p>
          )}
        </div>
      </Link>
      {showActions && (
        <div className="flex justify-end gap-2 p-4 pt-0">
          {editable && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/listings/${id}/edit`;
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1"
            >
              <FaEdit className="w-4 h-4" />
              {t("common.edit")}
            </button>
          )}
          {deletable && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.confirm(t("listings.deleteConfirmation"))) {
                  onDelete?.(id as string);
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-1"
            >
              <FaTrash className="w-4 h-4" />
              {t("common.delete")}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ListingCard;
