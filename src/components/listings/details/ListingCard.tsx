import React from "react";
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
  } = listing;

  const firstImage =
    Array.isArray(images) && images.length > 0
      ? typeof images[0] === "string"
        ? images[0]
        : "/placeholder.jpg"
      : "/placeholder.jpg";

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
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
              {t(`${listing?.subCategory}`)}
            </span>
            {listingAction === "rent" && (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                {t(`${listing?.listingAction}`)}
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 truncate">{title}</h3>
          {showPrice && (
            <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
              {formatCurrency(price)}
              {listingAction === "rent" && (
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
              {new Date(createdAt).toLocaleDateString()}
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
                  onDelete?.(id);
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
    </div>
  );
};

export default ListingCard;
