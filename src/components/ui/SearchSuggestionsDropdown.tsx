import React from "react";
import { Listing } from "@/types/listings";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ListingCategory } from "@/types/enums";

interface SearchSuggestionsDropdownProps {
  suggestions: Listing[];
  onClose: () => void;
}

const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({ suggestions, onClose }) => {
  const { t } = useTranslation();
  
  if (!suggestions.length) return null;
  
  return (
    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
      {suggestions.map((listing) => {
        // Determine category and subcategory for display
        let categoryLabel = '';
        let subcategoryLabel = '';
        
        if (listing.category?.mainCategory === ListingCategory.VEHICLES && listing.details?.vehicles?.vehicleType) {
          categoryLabel = t('navigation.vehicles');
          subcategoryLabel = listing.details.vehicles.vehicleType;
        } else if (listing.category?.mainCategory === ListingCategory.REAL_ESTATE && listing.details?.realEstate?.propertyType) {
          categoryLabel = t('navigation.real_estate');
          subcategoryLabel = listing.details.realEstate.propertyType;
        }
        
        return (
          <Link
            key={listing.id}
            to={`/listing/${listing.id}`}
            className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={onClose}
          >
            {listing.images && listing.images.length > 0 && (
              <img
                src={typeof listing.images[0] === 'string' ? listing.images[0] : ''}
                alt={listing.title}
                className="w-10 h-10 object-cover rounded mr-3"
              />
            )}
            <div className="flex-1">
              <div className="font-medium text-gray-900 truncate">{listing.title}</div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="truncate">{listing.location}</span>
                {categoryLabel && (
                  <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded-sm text-gray-700">
                    {categoryLabel}
                  </span>
                )}
                {subcategoryLabel && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 rounded-sm text-blue-700">
                    {subcategoryLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-2 text-sm text-blue-600 font-semibold whitespace-nowrap">
              {listing.price ? `$${listing.price}` : ''}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SearchSuggestionsDropdown;
