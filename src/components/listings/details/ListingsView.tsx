import React, { useMemo } from "react";
import { clsx } from "clsx";
import type {
   ListingCategory,
   Listing,
   VehicleDetails,
   RealEstateDetails,
} from "@/types/listings";
import type { BaseComponentProps } from "@/types/common";
import { useListings } from "@/components/listings/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { formatCurrency } from "@/utils/format";
import { useTranslation } from "react-i18next";

export type ListingViewType = "grid" | "list" | "card" | "saved" | "compact";

export interface ListingComponentProps extends BaseComponentProps {
   viewType?: ListingViewType;
   listings: (Listing & {
      vehicleDetails?: VehicleDetails;
      realEstateDetails?: RealEstateDetails;
   })[];
   gridColumns?: 2 | 3 | 4;
   category?: ListingCategory;
   showActions?: boolean;
   showPrice?: boolean;
   showDate?: boolean;
   showLocation?: boolean;
   onEdit?: (listing: Listing) => void;
   onDelete?: (listingId: string) => void;
   onSave?: (listing: Listing) => void;
   onListingClick?: (listing: Listing) => void;
}

export const ListingComponent: React.FC<ListingComponentProps> = ({
   viewType = "grid",
   listings: propListings,
   className,
   gridColumns = 4,
   category,
   showActions = true,
   showPrice = true,
   showDate = true,
   showLocation = true,
   onEdit,
   onDelete,
   onSave,
   onListingClick,
}) => {
   const { t } = useTranslation();
   const { user } = useAuth();
   const { listings: hookListings, loading: isLoading, error } = useListings();
   const { savedListings, addToSaved, removeFromSaved, isSaved } = useSavedListings();

   const listings = useMemo(
      () => propListings || (viewType === "saved" ? savedListings : hookListings),
      [propListings, viewType, savedListings, hookListings]
   );

   const filteredListings = useMemo(
      () =>
         category
            ? listings.filter((listing) => listing.category.mainCategory === category)
            : listings,
      [category, listings]
   );

   const gridStyles = useMemo(() => {
      const baseClass = "grid gap-6";
      const columnClasses = {
         2: "grid-cols-1 sm:grid-cols-2",
         3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
         4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      };
      return clsx(baseClass, columnClasses[gridColumns]);
   }, [gridColumns]);

   const handleSave = (listing: Listing) => {
      const isCurrentlySaved = isSaved(listing.id);
      if (isCurrentlySaved) {
         removeFromSaved(listing.id);
      } else {
         addToSaved(listing);
      }
      onSave?.(listing);
   };

   const handleListingClick = (listing: Listing) => {
      onListingClick?.(listing);
   };

   if (isLoading) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
         </div>
      );
   }

   if (error) {
      return <div className="text-center py-8 text-red-500">{error}</div>;
   }

   if (!filteredListings.length) {
      return (
         <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t("listings.noListingsFound")}
         </div>
      );
   }

   const ListingCard: React.FC<{
      listing: Listing & {
         vehicleDetails?: VehicleDetails;
         realEstateDetails?: RealEstateDetails;
      };
      showSaveButton?: boolean;
      showPrice?: boolean;
      showLocation?: boolean;
   }> = ({ listing, showSaveButton = false, showPrice = true, showLocation = true }) => {
      const renderDetails = () => {
         if (listing.category.mainCategory === "vehicles" && listing.vehicleDetails) {
            const { vehicleDetails } = listing;
            return (
               <div className="space-y-1 text-sm">
                  <p className="font-medium">
                     {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}
                  </p>
                  <div className="text-gray-600 dark:text-gray-400">
                     {vehicleDetails.mileage && (
                        <span className="mr-2">{vehicleDetails.mileage} km</span>
                     )}
                     {vehicleDetails.transmissionType && (
                        <span className="mr-2">
                           {t(`enums.transmission.${vehicleDetails.transmissionType}`)}
                        </span>
                     )}
                     {vehicleDetails.fuelType && (
                        <span>{t(`enums.fuel.${vehicleDetails.fuelType}`)}</span>
                     )}
                  </div>
               </div>
            );
         }

         if (listing.category.mainCategory === "realEstate" && listing.realEstateDetails) {
            const { realEstateDetails } = listing;
            return (
               <div className="space-y-1 text-sm">
                  <p className="font-medium">
                     {t(`enums.propertyType.${realEstateDetails.propertyType}`)}
                  </p>
                  <div className="text-gray-600 dark:text-gray-400">
                     {realEstateDetails.size && (
                        <span className="mr-2">{realEstateDetails.size} m²</span>
                     )}
                     {realEstateDetails.bedrooms && realEstateDetails.bathrooms && (
                        <span>
                           {realEstateDetails.bedrooms} {t("common.beds")} •{" "}
                           {realEstateDetails.bathrooms} {t("common.baths")}
                        </span>
                     )}
                  </div>
               </div>
            );
         }

         return null;
      };

      return (
         <div
            key={listing.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            onClick={() => handleListingClick(listing)}
         >
            {/* Image */}
            <div className="relative aspect-square">
               <img
                  src={listing.images[0] || "/placeholder.jpg"}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                     e.currentTarget.src = "/placeholder.jpg";
                     e.currentTarget.onerror = null;
                  }}
               />
               <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                     {t(`categories.vehicles.${listing.category.subCategory}`)}
                  </span>
                  {listing.listingAction === "rent" && (
                     <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        {t("common.forRent")}
                     </span>
                  )}
               </div>
            </div>

            {/* Content */}
            <div className="p-4">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {listing.title}
               </h3>
               {showPrice && (
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                     {formatCurrency(listing.price)}
                     {listing.listingAction === "rent" && (
                        <span className="text-sm ml-1">/mo</span>
                     )}
                  </p>
               )}
               {renderDetails()}
               {showLocation && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                     {listing.location}
                  </p>
               )}
               {showSaveButton && (
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        handleSave(listing);
                     }}
                     className={clsx(
                        "px-3 py-1 text-sm rounded-md",
                        isSaved(listing.id)
                           ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                           : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                     )}
                  >
                     {isSaved(listing.id) ? t("common.saved") : t("common.save")}
                  </button>
               )}
            </div>
         </div>
      );
   };

   return viewType === "grid" ? (
      <div className={clsx(gridStyles, className)}>
         {filteredListings.map((listing) => (
            <ListingCard
               key={listing.id}
               listing={listing}
               showSaveButton={true}
               showPrice={true}
               showLocation={true}
            />
         ))}
      </div>
   ) : (
      <div className={clsx("space-y-4", className)}>
         {filteredListings.map((listing) => (
            <ListingCard
               key={listing.id}
               listing={listing}
               showSaveButton={true}
               showPrice={true}
               showLocation={true}
            />
         ))}
      </div>
   );
};

export default ListingComponent;
