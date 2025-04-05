import React, { useState, useEffect } from "react";
import { FaSearch, FaHistory } from "react-icons/fa";
import { searchAPI } from "@/api";

interface Props {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  recentSearches: string[];
}

const SearchSuggestions: React.FC<Props> = ({
  query,
  onSuggestionClick,
  recentSearches,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await searchAPI.get(
          `/suggestions?q=${encodeURIComponent(query)}`,
        );
        setSuggestions(response.data);
      } catch {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 mt-1 rounded-lg shadow-lg border z-50">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="p-2 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Recent Searches
          </h3>
          {recentSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(search)}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FaHistory className="text-gray-400 mr-2" />
              <span>{search}</span>
            </button>
          ))}
        </div>
      )}

      {/* Auto Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Search Suggestions
          </h3>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FaSearch className="text-gray-400 mr-2" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
