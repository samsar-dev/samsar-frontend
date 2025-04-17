import React, { useState } from 'react';
import { PropertyType, Condition } from '@/types/enums';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export interface RealEstateFilterState {
  propertyType: PropertyType | null;
  listingAction: 'SELL' | 'RENT' | null;
  minPrice: string;
  maxPrice: string;
  minSize: string;
  maxSize: string;
  bedrooms: string;
  bathrooms: string;
  condition: Condition | null;
  location: string;
}

interface RealEstateFilterProps {
  filters: RealEstateFilterState;
  onFilterChange: (filters: Partial<RealEstateFilterState>) => void;
}

export const RealEstateFilter: React.FC<RealEstateFilterProps> = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const defaultFilters: RealEstateFilterState = {
    propertyType: null,
    listingAction: null,
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
    bedrooms: '',
    bathrooms: '',
    condition: null,
    location: '',
  };

  const handleFilterChange = (field: keyof RealEstateFilterState, value: any) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      propertyType: null,
      listingAction: null,
      minPrice: '',
      maxPrice: '',
      minSize: '',
      maxSize: '',
      bedrooms: '',
      bathrooms: '',
      condition: null,
      location: '',
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
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Filter Properties</h2>
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
                  value={filters.propertyType || ''}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Property Type</option>
                  {Object.values(PropertyType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.listingAction || ''}
                  onChange={(e) => handleFilterChange('listingAction', e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">For Sale/Rent</option>
                  <option value="sell">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>

                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min Size (m²)"
                    value={filters.minSize}
                    onChange={(e) => handleFilterChange('minSize', e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Max Size (m²)"
                    value={filters.maxSize}
                    onChange={(e) => handleFilterChange('maxSize', e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Bedrooms</option>
                    {[1, 2, 3, 4, 5, '6+'].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === '6+' ? '' : num === 1 ? 'Bedroom' : 'Bedrooms'}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Bathrooms</option>
                    {[1, 2, 3, 4, '5+'].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === '5+' ? '' : num === 1 ? 'Bathroom' : 'Bathrooms'}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={filters.condition || ''}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
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
