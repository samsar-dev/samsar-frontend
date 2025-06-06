import React, { useState, useEffect, useRef } from "react";
import type { SearchBarProps } from "@/types/ui";

import { listingsAPI } from "@/api/listings.api";
import { SearchSuggestionsDropdown } from "./SearchSuggestionsDropdown";
import { useNavigate } from "react-router-dom";
import { ListingCategory } from "@/types/enums";
import Fuse from "fuse.js";
import { Listing } from "@/types/listings";
import { createFuse, searchListings } from "@/utils/searchUtils";

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search...",
  className = "",
  category,
  subcategory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Listing[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fuseRef = useRef<Fuse<Listing> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Close suggestions on outside click
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load all listings on mount for client-side search
  useEffect(() => {
    const loadListings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/listings?limit=100');
        const data = await response.json();
        if (data.listings) {
          fuseRef.current = createFuse(data.listings);
        }
      } catch (error) {
        console.error('Failed to load listings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadListings();
  }, []);

  // Handle search when searchTerm changes
  useEffect(() => {
    if (!searchTerm) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    debounceTimeout.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        
        // First try client-side fuzzy search
        if (fuseRef.current) {
          const results = searchListings(fuseRef.current, searchTerm);
          setSuggestions(results.slice(0, 4));
          setShowSuggestions(true);
          return;
        }

        // Fallback to server-side search if client-side fails
        const searchParams: any = { limit: 4 };

        if (category && category !== "all") {
          searchParams.category = {
            mainCategory: category === "vehicles" 
              ? ListingCategory.VEHICLES 
              : ListingCategory.REAL_ESTATE,
            ...(subcategory ? { subCategory: subcategory } : {})
          };
        }

        const response = await listingsAPI.search(searchTerm, searchParams);
        if (response.success && response.data?.listings) {
          setSuggestions(response.data.listings.slice(0, 4));
        } else {
          setSuggestions([]);
        }
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm, category, subcategory]);

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowSuggestions(false);
      onSearch(searchTerm, category, subcategory);
    }
    if (e.key === "ArrowDown" && suggestions.length > 0) {
      // Optionally: focus first suggestion
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(searchTerm, category, subcategory);
  };

  const handleSuggestionClick = (id: string) => {
    setShowSuggestions(false);
    setSearchTerm("");
    navigate(`/listing/${id}`);
  };

  return (
    <form
      className={`relative ${className}`}
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-20 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setShowSuggestions(true)}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {searchTerm && (
          <button
            type="button"
            className="absolute inset-y-0 right-10 flex items-center pr-3"
            onClick={handleClear}
            tabIndex={-1}
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg transition-colors"
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        </button>
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="w-full">
            <SearchSuggestionsDropdown
              suggestions={suggestions}
              onClose={() => setShowSuggestions(false)}
              isLoading={isLoading}
              searchQuery={searchTerm}
              onSuggestionClick={handleSuggestionClick}
            />
            {/* Click outside to close */}
            <div 
              className="fixed inset-0 bg-black opacity-0 z-40"
              onClick={() => setShowSuggestions(false)}
            />
          </div>
        )}
      </div>
    </form>
  );
};