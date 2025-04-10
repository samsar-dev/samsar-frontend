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

  const renderVehicleDetails = () => {
    if (category.mainCategory === ListingCategory.VEHICLES && vehicleDetails) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          {/* Essential Details */}
          <div>
            <p className="font-medium">{vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {vehicleDetails.mileage && (
                <p>{vehicleDetails.mileage} km</p>
              )}
              {vehicleDetails.transmissionType && (
                <p>{t(`enums.transmission.${vehicleDetails.transmissionType}`)}</p>
              )}
              {vehicleDetails.fuelType && (
                <p>{t(`enums.fuel.${vehicleDetails.fuelType}`)}</p>
              )}
            </div>
          </div>

          {/* Advanced Details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {vehicleDetails.engine && (
              <p>{vehicleDetails.engine}</p>
            )}
            {vehicleDetails.color && (
              <p>{t("listings.color")}: {vehicleDetails.color}</p>
            )}
            {vehicleDetails.condition && (
              <p>{t("listings.condition")}: {vehicleDetails.condition}</p>
            )}
            {vehicleDetails.warranty !== undefined && (
              <p>{t("listings.warranty")}: {vehicleDetails.warranty} {t("listings.months")}</p>
            )}
            {vehicleDetails.serviceHistory && (
              <p>{t("listings.serviceHistory")}: {vehicleDetails.serviceHistory}</p>
            )}
            {vehicleDetails.previousOwners !== undefined && (
              <p>{t("listings.previousOwners")}: {vehicleDetails.previousOwners}</p>
            )}
            {vehicleDetails.registrationStatus && (
              <p>{t("listings.registrationStatus")}: {vehicleDetails.registrationStatus}</p>
            )}
          </div>

          {/* Features */}
          {vehicleDetails.features && vehicleDetails.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {vehicleDetails.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                >
                  {feature}
                </span>
              ))}
              {vehicleDetails.features.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{vehicleDetails.features.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderRealEstateDetails = () => {
    if (category.mainCategory === ListingCategory.REAL_ESTATE && realEstateDetails) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          {/* Essential Details */}
          <div>
            <p className="font-medium">{t(`enums.propertyType.${realEstateDetails.propertyType}`)}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {realEstateDetails.size && (
                <p>{realEstateDetails.size} m²</p>
              )}
              {realEstateDetails.bedrooms && realEstateDetails.bathrooms && (
                <p>{realEstateDetails.bedrooms} {t('common.beds')} • {realEstateDetails.bathrooms} {t('common.baths')}</p>
              )}
            </div>
          </div>

          {/* Advanced Details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {realEstateDetails.yearBuilt && (
              <p>{t("listings.yearBuilt")}: {realEstateDetails.yearBuilt}</p>
            )}
            {realEstateDetails.condition && (
              <p>{t("listings.condition")}: {t(`listings.conditions.${realEstateDetails.condition.toLowerCase()}`)}</p>
            )}
          </div>

          {/* Features */}
          {realEstateDetails.features && realEstateDetails.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {realEstateDetails.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                >
                  {feature}
                </span>
              ))}
              {realEstateDetails.features.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{realEstateDetails.features.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderDetails = () => {
    if (category.mainCategory === ListingCategory.VEHICLES) {
      return renderVehicleDetails();
    } else if (category.mainCategory === ListingCategory.REAL_ESTATE) {
      return renderRealEstateDetails();
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 relative">
      <Link to={`/listings/${id}`} className="block">
        <div className="relative aspect-video">
          <img
            src={firstImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
              {t(`categories.${category.mainCategory}.${category.subCategory}`)}
            </span>
            {listingAction === 'rent' && (
              <span className="ml-1 bg-green-500 text-white px-2 py-1 rounded text-xs">
                {t('common.forRent')}
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 truncate">{title}</h3>
          <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
            {formatCurrency(price)}
            {listingAction === 'rent' && <span className="text-sm ml-1">/mo</span>}
          </p>
          {renderDetails()}
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {location}
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </Link>
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/listings/${id}/edit`;
          }}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
          title={t('common.edit')}
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm(t('listings.deleteConfirmation'))) {
              onDelete?.(id);
            }
          }}
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
          title={t('common.delete')}
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MyListingCard; 