import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { formatCurrency } from "@/utils/format";
import type { Listing, VehicleDetails, RealEstateDetails } from "@/types/listings";
import { ListingCategory } from "@/types/enums";

export interface MyListingCardProps {
  listing: Listing & {
    vehicleDetails?: VehicleDetails;
    realEstateDetails?: RealEstateDetails;
  };
  onDelete?: (id: string) => void;
}

const MyListingCard: React.FC<MyListingCardProps> = ({
  listing,
  onDelete,
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
    realEstateDetails 
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
          <p>{vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}</p>
          {vehicleDetails.mileage && (
            <p>{vehicleDetails.mileage} km</p>
          )}
          {vehicleDetails.transmissionType && vehicleDetails.fuelType && (
            <p>{t(`enums.transmission.${vehicleDetails.transmissionType}`)} • {t(`enums.fuel.${vehicleDetails.fuelType}`)}</p>
          )}
        </div>
      );
    }

    if (category.mainCategory === ListingCategory.REAL_ESTATE && realEstateDetails) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>{t(`enums.propertyType.${realEstateDetails.propertyType}`)}</p>
          {realEstateDetails.size && (
            <p>{realEstateDetails.size} m²</p>
          )}
          {realEstateDetails.bedrooms && realEstateDetails.bathrooms && (
            <p>{realEstateDetails.bedrooms} {t('common.beds')} • {realEstateDetails.bathrooms} {t('common.baths')}</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        {/* Delete button in top right */}
        <button
          onClick={() => {
            if (window.confirm(t('listings.deleteConfirmation'))) {
              onDelete?.(id);
            }
          }}
          className="absolute top-2 right-2 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
          title={t('common.delete')}
        >
          <FaTrash className="w-4 h-4" />
        </button>

        {/* Edit button in top right, next to delete */}
        <Link
          to={`/listings/${id}/edit`}
          className="absolute top-2 right-12 z-10 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
          title={t('common.edit')}
        >
          <FaEdit className="w-4 h-4" />
        </Link>

        {/* Category badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
            {t(`categories.${category.mainCategory}.${category.subCategory}`)}
          </span>
          {listingAction === 'rent' && (
            <span className="ml-1 bg-green-500 text-white px-2 py-1 rounded text-xs">
              {t('common.forRent')}
            </span>
          )}
        </div>

        {/* Image */}
        <Link to={`/listings/${id}`}>
          <div className="aspect-video">
            <img
              src={firstImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/listings/${id}`}>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
            {title}
          </h3>
        </Link>
        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          {formatCurrency(price)}
          {listingAction === 'rent' && <span className="text-sm ml-1">/mo</span>}
        </p>
        {renderDetails()}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {location}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default MyListingCard; 