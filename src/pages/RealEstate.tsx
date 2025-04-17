import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RealEstateFilter, RealEstateFilterState } from '@/components/filters/RealEstateFilter';
import ListingCard from '@/components/listings/details/ListingCard';
import { ExtendedListing } from '@/types/listings';
import { ListingCategory } from '@/types/enums';
import { FaSpinner } from 'react-icons/fa';
import { listingsAPI } from '@/api/listings.api';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';

interface ListingsState {
  all: ExtendedListing[];
  loading: boolean;
  error: string | null;
}

const RealEstatePage: React.FC = () => {
  const [listings, setListings] = useState<ListingsState>({
    all: [],
    loading: true,
    error: null
  });
  const [filters, setFilters] = useState<RealEstateFilterState>({
    propertyType: null,
    listingAction: null,
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
    bedrooms: '',
    bathrooms: '',
    condition: null,
    location: ''
  });
  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  const fetchRealEstateListings = useCallback(async () => {
    try {
      setListings(prev => ({ ...prev, loading: true, error: null }));
      const response = await listingsAPI.getAll({
        category: {
          mainCategory: ListingCategory.REAL_ESTATE,
          ...(filters.propertyType && { subCategory: filters.propertyType })
        },
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        location: filters.location || undefined,

      }, abortControllerRef.current.signal);
      
      if (response.success && response.data?.listings) {
        setListings(prev => ({
          ...prev,
          all: response.data.listings ?? [], // Fix lint error here
          loading: false
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch real estate listings');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const errorMessage = 'Failed to load real estate listings';
      setListings(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
      console.error(err);
    }
  }, [filters]);

  // Debounced filter update
  const debouncedFetch = debounce(fetchRealEstateListings, 500);

  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const handleFilterChange = (filterUpdates: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...filterUpdates }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Real Estate Listings
          </h1>
          <RealEstateFilter 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {listings.loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-primary" />
          </div>
        ) : listings.error ? (
          <div className="text-center text-red-500 py-8">{listings.error}</div>
        ) : listings.all.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No real estate listings found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.all.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealEstatePage;
