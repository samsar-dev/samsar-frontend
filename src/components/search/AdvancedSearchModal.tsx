import React, { useState } from "react";
import type { ListingCategory } from "@/types/listings.ts";
import apiClient from "@/api/apiClient";

interface AdvancedSearchModalProps {
  visible: boolean;
  category: ListingCategory;
  onClose: () => void;
}

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  visible,
  category,
  onClose,
}) => {
  const [filters, setFilters] = useState({
    keyword: "",
    priceRange: { min: "", max: "" },
    color: "",
    fuelType: "",
    transmission: "",
    yearMin: "",
    yearMax: "",
  });

  if (!visible) return null;

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    apiClient
      .get("/advanced-search", { params: filters })
      .then(() => {
        console.log("Applying Advanced Filters:", filters);
        onClose();
      })
      .catch((error) => {
        console.error("Error fetching advanced search results:", error);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Advanced Search -{" "}
            {category === "vehicles" ? "Vehicles" : "Real Estate"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {/* Keyword Search */}
        <input
          type="text"
          placeholder="Search by keyword..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange("keyword", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* Price Range */}
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.priceRange.min}
            onChange={(e) =>
              handleFilterChange("priceRange", {
                ...filters.priceRange,
                min: e.target.value,
              })
            }
            className="w-1/2 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.priceRange.max}
            onChange={(e) =>
              handleFilterChange("priceRange", {
                ...filters.priceRange,
                max: e.target.value,
              })
            }
            className="w-1/2 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Category-Specific Filters */}
        <select
          value={filters.color}
          onChange={(e) => handleFilterChange("color", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mt-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select Color</option>
          {["White", "Black", "Silver", "Red", "Blue", "Green"].map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>

        <select
          value={filters.fuelType}
          onChange={(e) => handleFilterChange("fuelType", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mt-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select Fuel Type</option>
          {["Petrol", "Diesel", "Electric", "Hybrid"].map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>

        <select
          value={filters.transmission}
          onChange={(e) => handleFilterChange("transmission", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mt-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select Transmission</option>
          {["Automatic", "Manual", "CVT"].map((trans) => (
            <option key={trans} value={trans}>
              {trans}
            </option>
          ))}
        </select>

        <select
          value={filters.yearMin}
          onChange={(e) => handleFilterChange("yearMin", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mt-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select Min Year</option>
          {Array.from(
            { length: 30 },
            (_, i) => new Date().getFullYear() - i,
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={filters.yearMax}
          onChange={(e) => handleFilterChange("yearMax", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mt-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select Max Year</option>
          {Array.from(
            { length: 30 },
            (_, i) => new Date().getFullYear() - i,
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Search & Close Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;
