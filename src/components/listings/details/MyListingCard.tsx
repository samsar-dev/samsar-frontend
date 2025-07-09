import PreloadImages from "@/components/media/PreloadImages";
import { ListingCategory } from "@/types/enums";
import ImageFallback from "@/components/media/ImageFallback";
import type {
  Listing,
  RealEstateDetails,
  VehicleDetails,
} from "@/types/listings";
import { useTranslation } from "react-i18next";
import { PriceConverter } from "@/components/common/PriceConverter";
import { FaEdit, FaMapMarkerAlt, FaTrash, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";

export interface MyListingCardProps {
  listing: Listing & {
    vehicleDetails?: VehicleDetails;
    realEstateDetails?: RealEstateDetails;
  };
  onDelete?: (id: string) => void;
}

const MyListingCard = ({ listing, onDelete }: MyListingCardProps) => {
  const mainImage = listing?.images?.[0];
  const { t } = useTranslation();

  const formatViews = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };
  const {
    id,
    title,
    price,
    images = [],
    category,
    location,
    createdAt,
    vehicleDetails,
    realEstateDetails,
  } = listing;

  const firstImage =
    Array.isArray(images) && images.length > 0
      ? typeof images[0] === "string"
        ? images[0]
        : ""
      : "";

  const renderVehicleDetails = () => {
    if (category.mainCategory === ListingCategory.VEHICLES && vehicleDetails) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          {/* Essential Details */}
          <div>
            <p className="font-medium">
              {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {vehicleDetails.mileage && <p>{vehicleDetails.mileage} km</p>}
              {vehicleDetails.transmissionType && (
                <p>{t(`${vehicleDetails.transmissionType}`)}</p>
              )}
              {vehicleDetails.fuelType && (
                <p>{t(`${vehicleDetails.fuelType}`)}</p>
              )}
            </div>
          </div>

          {/* Advanced Details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {vehicleDetails.engine && <p>{vehicleDetails.engine}</p>}
            {vehicleDetails.color && (
              <p>
                {t("listings.color")}: {vehicleDetails.color}
              </p>
            )}
            {vehicleDetails.condition && (
              <p>
                {t("listings.condition")}: {vehicleDetails.condition}
              </p>
            )}
            {vehicleDetails.warranty !== undefined && (
              <p>
                {t("listings.warranty")}: {vehicleDetails.warranty}{" "}
                {t("listings.months")}
              </p>
            )}
            {vehicleDetails.serviceHistory && (
              <p>
                {t("listings.serviceHistory")}: {vehicleDetails.serviceHistory}
              </p>
            )}
            {vehicleDetails.previousOwners !== undefined && (
              <p>
                {t("listings.previousOwners")}: {vehicleDetails.previousOwners}
              </p>
            )}
            {vehicleDetails.registrationStatus && (
              <p>
                {t("listings.fields.registrationStatus")}:{" "}
                {vehicleDetails.registrationStatus}
              </p>
            )}
          </div>

          {/* Features */}
          {vehicleDetails.features &&
            Object.values(vehicleDetails.features).filter(Boolean).length >
              0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(vehicleDetails.features)
                  .filter(([_, value]) => value === true)
                  .slice(0, 3)
                  .map(([feature], index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                {Object.values(vehicleDetails.features).filter(Boolean).length >
                  3 && (
                  <span className="text-xs text-gray-500">
                    +
                    {Object.values(vehicleDetails.features).filter(Boolean)
                      .length - 3}{" "}
                    more
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
    if (
      category.mainCategory === ListingCategory.REAL_ESTATE &&
      realEstateDetails
    ) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          {/* Essential Details */}
          <div>
            <p className="font-medium">
              {t(`${realEstateDetails.propertyType}`)}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {realEstateDetails.size && <p>{realEstateDetails.size} m²</p>}
              {realEstateDetails.bedrooms && realEstateDetails.bathrooms && (
                <p>
                  {realEstateDetails.bedrooms} {t("common.beds")} •{" "}
                  {realEstateDetails.bathrooms} {t("common.baths")}
                </p>
              )}
            </div>
          </div>

          {/* Advanced Details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {realEstateDetails.yearBuilt && (
              <p>
                {t("listings.yearBuilt")}: {realEstateDetails.yearBuilt}
              </p>
            )}
            {realEstateDetails.condition && (
              <p>
                {t("listings.condition")}:{" "}
                {t(
                  `listings.conditions.${realEstateDetails.condition.toLowerCase()}`,
                )}
              </p>
            )}
          </div>

          {/* Features */}
          {realEstateDetails.features &&
            realEstateDetails.features.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {realEstateDetails.features
                  .slice(0, 3)
                  .map((feature, index) => (
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
      {mainImage && typeof mainImage === "string" && (
        <PreloadImages imageUrls={[mainImage]} />
      )}
      <Link
        to={`/listings/${id}`}
        className="block h-full transition-transform duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:shadow-gray-800"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <ImageFallback
            src={firstImage}
            alt={title}
            className="w-full h-[200px] object-cover rounded-lg"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 truncate">{title}</h3>
          <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
            <PriceConverter price={price} />
          </p>

          {/* Location and Views */}
          <div className="flex items-center justify-between mb-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-1" />
              <span className="truncate max-w-[180px]">{location}</span>
            </div>
            {listing.views !== undefined && (
              <div className="flex items-center text-xs text-gray-500">
                <FaEye className="mr-1" />
                <span>{formatViews(listing.views)}</span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-3">
            {listing?.vehicleDetails?.features &&
              Object.entries(listing.vehicleDetails.features)
                .filter(([_, value]) => value === true)
                .map(([feature]) => (
                  <span
                    key={feature}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {feature.split(/(?=[A-Z])/).join(" ")}
                  </span>
                ))}
          </div>
        </div>
      </Link>
      <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
        {createdAt ? new Date(createdAt).toLocaleDateString() : ""}
      </p>
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/listings/${id}/edit`;
          }}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
          title={t("common.edit")}
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm(t("listings.deleteConfirmation"))) {
              onDelete?.(id as string);
            }
          }}
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
          title={t("common.delete")}
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MyListingCard;
