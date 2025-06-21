import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import { Slider } from '@/components/ui/slider';
import { useLocation } from '@/hooks/useLocation';
import LocationSearch from './LocationSearch';

interface LocationFilterProps {
  onLocationChange: (location: {
    coordinates: [number, number] | null;
    radius: number;
    address?: string;
  }) => void;
  defaultRadius?: number;
  className?: string;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  onLocationChange,
  defaultRadius = 10,
  className = '',
}) => {
  const { t } = useTranslation();
  const [radius, setRadius] = useState(defaultRadius);
  const [address, setAddress] = useState<string>('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const { location: currentLocation, getDistanceFrom } = useLocation();

  // Initialize with current location if available
  useEffect(() => {
    if (currentLocation) {
      setCoordinates([currentLocation.latitude, currentLocation.longitude]);
      // Reverse geocode to get address if needed
      // This would be similar to the reverse geocoding in LocationSearch
    }
  }, [currentLocation]);

  // Notify parent when location or radius changes
  useEffect(() => {
    onLocationChange({
      coordinates,
      radius,
      address,
    });
  }, [coordinates, radius, address, onLocationChange]);

  const handleLocationSelect = (selected: {
    address: string;
    coordinates: [number, number];
  }) => {
    setAddress(selected.address);
    setCoordinates(selected.coordinates);
    
    // Notify parent component
    onLocationChange({
      coordinates: selected.coordinates,
      radius,
      address: selected.address,
    });
  };

  const handleUseCurrentLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const newCoords: [number, number] = [
        position.coords.latitude,
        position.coords.longitude,
      ];

      // Reverse geocode to get address using Nominatim
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
        setAddress(displayName);
      }

      setCoordinates(newCoords);
    } catch (error) {
      console.error('Error getting current location:', error);
      // Handle error (e.g., show toast)
    }
  };

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('location.searchLocation')}
        </label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <LocationSearch
              onSelectLocation={handleLocationSelect}
              placeholder={t('location.searchPlaceholder') || 'Search for a location...'}
              initialValue={address}
              showCurrentLocation={false}
            />
          </div>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            title={t('location.useCurrentLocation') || 'Use current location'}
          >
            <FiNavigation className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {t('location.radius')}: {radius} km
          </label>
        </div>
        <Slider
          value={[radius]}
          onValueChange={handleRadiusChange}
          min={1}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {coordinates && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
          <div className="flex items-start">
            <FiMapPin className="flex-shrink-0 h-5 w-5 text-primary-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">{address || (t('location.currentLocation') || 'Current Location')}</p>
              <p className="text-gray-500">
                {t('location.radiusAround', { radius })} km
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
