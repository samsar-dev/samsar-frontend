import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMapPin, FiX, FiSearch } from 'react-icons/fi';
import { useDebounce } from 'react-use';
import { useLocation } from '@/hooks/useLocation';

interface LocationResult {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

interface LocationSearchProps {
  onSelectLocation: (location: {
    address: string;
    coordinates: [number, number];
  }) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  showCurrentLocation?: boolean;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelectLocation,
  placeholder = 'Search for a location...',
  className = '',
  initialValue = '',
  showCurrentLocation = true,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateLocation } = useLocation();

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce search
  useDebounce(
    () => {
      if (query.length > 2) {
        searchLocations(query);
      } else {
        setResults([]);
      }
    },
    300,
    [query]
  );

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&countrycodes=sy&accept-language=ar&limit=5`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'YourAppName/1.0 (your@email.com)' // Required by Nominatim
        }
      });
      
      const data = await response.json();
      
      // Transform Nominatim response to match our expected format
      const formattedResults = data.map((item: any) => ({
        id: item.place_id,
        place_name: item.display_name,
        center: [parseFloat(item.lat), parseFloat(item.lon)],
        text: item.display_name.split(',')[0],
        address: {
          city: item.address?.city || item.address?.town || item.address?.village || '',
          country: item.address?.country || 'Syria'
        }
      }));
      
      setResults(formattedResults);
    } catch (error) {
      console.error('Error searching locations:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (result: LocationResult) => {
    setQuery(result.place_name);
    onSelectLocation({
      address: result.place_name,
      coordinates: result.center,
    });
    setShowResults(false);
    inputRef.current?.blur();
  };

  const handleCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const position = await updateLocation();
      
      // Reverse geocode using Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=ar`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)'
          }
        }
      );
      
      const data = await response.json();
      if (data) {
        const displayName = data.display_name || `${data.address?.city || data.address?.town || data.address?.village || 'Location'}`;
        setQuery(displayName);
        onSelectLocation({
          address: displayName,
          coordinates: [position.coords.latitude, position.coords.longitude],
        });
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      // Handle error (e.g., show toast)
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    onSelectLocation({
      address: '',
      coordinates: [0, 0],
    });
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        )}
      </div>

      {(showResults && results.length > 0) && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm max-h-60 overflow-auto">
          {showCurrentLocation && (
            <button
              type="button"
              onClick={handleCurrentLocation}
              className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-gray-100 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <FiMapPin className="mr-2" />
                  <span>{t('location.useCurrentLocation')}</span>
                </>
              )}
            </button>
          )}
          {results.map((result) => (
            <div
              key={result.id}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
              onClick={() => handleSelectLocation(result)}
            >
              <div className="flex items-center">
                <FiMapPin className="flex-shrink-0 h-5 w-5 text-gray-400" />
                <span className="font-normal block truncate mr-2">
                  {result.place_name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
