import React from "react";
import { Listing } from "@/types/listings";
import { Link } from "react-router-dom";

interface SearchSuggestionsDropdownProps {
  suggestions: Listing[];
  onClose: () => void;
}

const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({ suggestions, onClose }) => {
  if (!suggestions.length) return null;
  return (
    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
      {suggestions.map((listing) => (
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
            <div className="text-xs text-gray-500 truncate">{listing.location}</div>
          </div>
          <div className="ml-2 text-sm text-blue-600 font-semibold whitespace-nowrap">
            {listing.price ? `$${listing.price}` : ''}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SearchSuggestionsDropdown;
