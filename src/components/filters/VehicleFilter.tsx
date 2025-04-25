import React, { useState } from "react";
import {
  FuelType,
  TransmissionType,
  VehicleType,
  Condition,
} from "@/types/enums";
import { FaFilter, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export interface VehicleFilterState {
  vehicleType: VehicleType | null;
  make: string;
  model: string;
  minYear: string;
  maxYear: string;
  minPrice: string;
  maxPrice: string;
  fuelType: FuelType | null;
  transmission: TransmissionType | null;
  condition: Condition | null;
  location: string;
}

interface VehicleFilterProps {
  filters: VehicleFilterState;
  onFilterChange: (filters: Partial<VehicleFilterState>) => void;
}

export const VehicleFilter: React.FC<VehicleFilterProps> = ({
  filters,
  onFilterChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const defaultFilters: VehicleFilterState = {
    vehicleType: null,
    make: "",
    model: "",
    minYear: "",
    maxYear: "",
    minPrice: "",
    maxPrice: "",
    fuelType: null,
    transmission: null,
    condition: null,
    location: "",
  };

  const handleFilterChange = (field: keyof VehicleFilterState, value: any) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      vehicleType: null,
      make: "",
      model: "",
      minYear: "",
      maxYear: "",
      minPrice: "",
      maxPrice: "",
      fuelType: null,
      transmission: null,
      condition: null,
      location: "",
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FaFilter />
        <span>Advanced Filters</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Filter Vehicles</h2>
              <button
                onClick={clearFilters}
                className="text-red-500 hover:text-red-600 flex items-center gap-2"
              >
                <FaTimes />
                Clear Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <select
                  value={filters.vehicleType || ""}
                  onChange={(e) =>
                    handleFilterChange("vehicleType", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Vehicle Type</option>
                  {Object.values(VehicleType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Make"
                  value={filters.make}
                  onChange={(e) => handleFilterChange("make", e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />

                <input
                  type="text"
                  placeholder="Model"
                  value={filters.model}
                  onChange={(e) => handleFilterChange("model", e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min Year"
                    value={filters.minYear}
                    onChange={(e) =>
                      handleFilterChange("minYear", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Max Year"
                    value={filters.maxYear}
                    onChange={(e) =>
                      handleFilterChange("maxYear", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <select
                  value={filters.fuelType || ""}
                  onChange={(e) =>
                    handleFilterChange("fuelType", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Fuel Type</option>
                  {Object.values(FuelType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.transmission || ""}
                  onChange={(e) =>
                    handleFilterChange("transmission", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Transmission</option>
                  {Object.values(TransmissionType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.condition || ""}
                  onChange={(e) =>
                    handleFilterChange("condition", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Condition</option>
                  {Object.values(Condition).map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
