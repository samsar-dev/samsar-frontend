import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Listing, VehicleDetails, RealEstateDetails } from "@/types";
import { ListingAction } from "@/types";
import { formatCurrency } from "@/utils/format";
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
    <Link to={`/listings/${id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative aspect-video">
          <img
            src={firstImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          {deletable && id && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete?.(id);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              title={t("common.delete")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <div className="absolute top-2 left-2">
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
              {t(`categories.${category.mainCategory}.${category.subCategory}`)}
            </span>
            {listingAction === ListingAction.RENT && (
              <span className="ml-1 bg-green-500 text-white px-2 py-1 rounded text-xs">
                {t('common.forRent')}
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 truncate">{title}</h3>
          {showPrice && (
            <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
              {formatCurrency(price)}
              {listingAction === ListingAction.RENT && <span className="text-sm ml-1">/mo</span>}
            </p>
          )}
          {renderDetails()}
          {showLocation && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {location}
            </p>
          )}
          {showDate && (
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          )}
          {showActions && (
            <div className="flex justify-between items-center mt-4">
              {showSaveButton && (
                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              {editable && id && (
                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path
                      fillRule="evenodd"
                      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
