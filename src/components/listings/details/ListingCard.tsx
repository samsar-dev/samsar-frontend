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
import { MdFavoriteBorder } from "react-icons/md";
import { listingsAPI } from "@/api/listings.api";
import { useAuth } from "@/hooks";

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
}) => {
  const { t } = useTranslation();
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
    favorites,
  } = listing;

  const user = useAuth().user;

  const firstImage =
    Array.isArray(images) && images.length > 0
      ? typeof images[0] === "string"
        ? images[0]
        : "/placeholder.jpg"
      : "/placeholder.jpg";

  const renderFavoriteButton = async () => {
    await listingsAPI.saveListing({
      userId: user?.id as string,
      listingId: id as string,
    });
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 group"
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
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
              {t(`categories.vehicles.${category.subCategory}`)}
            </span>
            {(listingAction as string) === "rent" && (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                {t("common.forRent")}
              </span>
            )}
          </div>
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
          {
            <div className="absolute bottom-2 right-2 translate-x-28 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  renderFavoriteButton();
                }}
                className="p-2 flex items-center justify-center text-gray-600 dark:text-gray-400 rounded-full dark:border-gray-700 hover:text-blue-700 hover:bg-blue-600/50 hover:border-blue-600/30 dark:hover:border-blue-600/20 dark:hover:text-blue-400 transition-colors duration-300"
              >
                <MdFavoriteBorder className="w-5 h-5" />
              </button>
            </div>
          }
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
