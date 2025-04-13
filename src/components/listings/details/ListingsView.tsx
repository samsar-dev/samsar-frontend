import React, { useMemo } from "react";
import { clsx } from "clsx";
import type {
   ListingCategory,
   ListingWithRelations,
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
   listings: (ListingWithRelations & {
      vehicleDetails?: VehicleDetails;
      realEstateDetails?: RealEstateDetails;
   })[];
   gridColumns?: 2 | 3 | 4;
   category?: ListingCategory;
   showActions?: boolean;
   showPrice?: boolean;
   showDate?: boolean;
   showLocation?: boolean;
   onEdit?: (listing: ListingWithRelations) => void;
   onDelete?: (listingId: string) => void;
   onSave?: (listing: ListingWithRelations) => void;
   onListingClick?: (listing: ListingWithRelations) => void;
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
   const { listings: hookListings, isLoading, error } = useListings();
   const { savedListings, addToSaved, removeFromSaved, isSaved } =
      useSavedListings();

   const listings = useMemo(
      () =>
         propListings || (viewType === "saved" ? savedListings : hookListings),
      [propListings, viewType, savedListings, hookListings]
   );

   const filteredListings = useMemo(
      () =>
         category
            ? listings.filter((listing) => listing.mainCategory === category)
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

   const handleSave = (listing: ListingWithRelations) => {
      const isCurrentlySaved = isSaved(listing.id);
      if (isCurrentlySaved) {
         removeFromSaved(listing.id);
      } else {
         addToSaved(listing);
      }
      onSave?.(listing);
   };

   const handleListingClick = (listing: ListingWithRelations) => {
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
      listing: ListingWithRelations & {
         vehicleDetails?: VehicleDetails;
         realEstateDetails?: RealEstateDetails;
      };
   }> = ({ listing }) => {
      const renderDetails = () => {
         if (listing.mainCategory === "VEHICLES" && listing.vehicleDetails) {
            const { vehicleDetails } = listing;
            return (
               <div className="space-y-1 text-sm">
                  <p className="font-medium">
                     {vehicleDetails.year} {vehicleDetails.make}{" "}
                     {vehicleDetails.model}
                  </p>
                  <div className="text-gray-600 dark:text-gray-400">
                     {vehicleDetails.mileage && (
                        <span className="mr-2">
                           {vehicleDetails.mileage} km
                        </span>
                     )}
                     {vehicleDetails.transmissionType && (
                        <span className="mr-2">
                           {t(
                              `enums.transmission.${vehicleDetails.transmissionType}`
                           )}
                        </span>
                     )}
                     {vehicleDetails.fuelType && (
                        <span>
                           {t(`enums.fuel.${vehicleDetails.fuelType}`)}
                        </span>
                     )}
                  </div>
               </div>
            );
         }

         if (
            listing.mainCategory === "REAL_ESTATE" &&
            listing.realEstateDetails
         ) {
            const { realEstateDetails } = listing;
            return (
               <div className="space-y-1 text-sm">
                  <p className="font-medium">
                     {t(`enums.propertyType.${realEstateDetails.propertyType}`)}
                  </p>
                  <div className="text-gray-600 dark:text-gray-400">
                     {realEstateDetails.size && (
                        <span className="mr-2">
                           {realEstateDetails.size} m²
                        </span>
                     )}
                     {realEstateDetails.bedrooms &&
                        realEstateDetails.bathrooms && (
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
                     {t(`categories.vehicles.${listing.subCategory}`)}
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
               {showDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                     {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
               )}

               {/* Actions */}
               {showActions && (
                  <div className="mt-4 flex justify-end space-x-2">
                     {onEdit && user?.id === listing.userId && (
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              onEdit(listing);
                           }}
                           className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                        >
                           {t("common.edit")}
                        </button>
                     )}
                     {onDelete && user?.id === listing.userId && (
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              onDelete(listing.id);
                           }}
                           className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        >
                           {t("common.delete")}
                        </button>
                     )}
                     {onSave && (
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
                           {isSaved(listing.id)
                              ? t("common.saved")
                              : t("common.save")}
                        </button>
                     )}
                  </div>
               )}
            </div>
         </div>
      );
   };

   return viewType === "grid" ? (
      <div className={clsx(gridStyles, className)}>
         {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
         ))}
      </div>
   ) : (
      <div className={clsx("space-y-4", className)}>
         {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
         ))}
      </div>
   );
};

export default ListingComponent;
