import React from "react";
import { Listing } from "@/types/listings";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ListingCategory } from "@/types/enums";

interface SearchSuggestionsDropdownProps {
  suggestions: Listing[];
  onClose: () => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSuggestionClick?: (id: string) => void;
}

const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({
  suggestions,
  onClose,
  isLoading = false,
  searchQuery = "",
  onSuggestionClick,
}) => {
  const { t } = useTranslation();
  const query = searchQuery.trim();

  // Show loading state
  if (isLoading) {
    return (
      <div
        id="search-suggestions"
        role="status"
        aria-live="polite"
        className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
      >
        <div className="p-3 text-center text-gray-500">
          {t("search.searching") || "Searching..."}
        </div>
      </div>
    );
  }

  // Show no results message if we have a query but no suggestions
  if (!suggestions.length && query) {
    return (
      <div
        id="search-suggestions"
        role="status"
        aria-live="polite"
        className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
      >
        <div className="p-3 text-center text-gray-500">
          {t("search.noResults") || `No results found for "${query}"`}
        </div>
      </div>
    );
  }

  // Don't show anything if no suggestions and no query
  if (!suggestions.length) return null;

  return (
    <div
      id="search-suggestions"
      role="listbox"
      aria-labelledby="search-input"
      className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
    >
      <ul className="py-1">
        {suggestions.map((listing, index) => {
          // Determine category and subcategory for display
          let categoryLabel = "";
          let subcategoryLabel = "";

          if (
            listing.category?.mainCategory === ListingCategory.VEHICLES &&
            listing.details?.vehicles?.vehicleType
          ) {
            categoryLabel = t("navigation.vehicles");
            subcategoryLabel = listing.details.vehicles.vehicleType;
          } else if (
            listing.category?.mainCategory === ListingCategory.REAL_ESTATE &&
            listing.details?.realEstate?.propertyType
          ) {
            categoryLabel = t("navigation.real_estate");
            subcategoryLabel = listing.details.realEstate.propertyType;
          }

          return (
            <li
              key={listing.id}
              role="option"
              id={`suggestion-${index}`}
              aria-selected="false"
              className="hover:bg-gray-50"
            >
              <Link
                to={`/listings/${listing.id}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  if (onSuggestionClick && listing.id) {
                    onSuggestionClick(String(listing.id));
                  }
                  window.location.href = `/listings/${listing.id}`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClose();
                    if (onSuggestionClick && listing.id) {
                      onSuggestionClick(String(listing.id));
                    }
                    window.location.href = `/listings/${listing.id}`;
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    onClose();
                    // Return focus to the search input
                    document.getElementById("search-input")?.focus();
                  }
                }}
              >
                <div
                  className="font-medium text-gray-900"
                  aria-label={`Title: ${listing.title}`}
                >
                  {listing.title}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span
                    className="truncate"
                    aria-label={`Location: ${listing.location}`}
                  >
                    {listing.location}
                  </span>
                  {categoryLabel && (
                    <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded-sm text-gray-700">
                      {categoryLabel}
                    </span>
                  )}
                  {subcategoryLabel && (
                    <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded-sm text-gray-600">
                      {subcategoryLabel}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { SearchSuggestionsDropdown };
