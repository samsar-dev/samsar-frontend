import React, { Fragment, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { MdFilterList, MdCheck, MdMyLocation, MdLocationOn } from "react-icons/md";
import { Listbox, Transition, Switch } from "@headlessui/react";
import { FaCar, FaMotorcycle, FaTruck, FaHome, FaShuttleVan, FaBus, FaTractor } from "react-icons/fa";
import { ListingCategory, VehicleType } from "@/types/enums";
import { getMakesForType, getModelsForMakeAndType } from "@/components/listings/data/vehicleModels";
import LocationSearch from "@/components/location/LocationSearch";

// Utility to calculate distance between two lat/lng points in km
export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  try {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  } catch (error) {
    console.error('Error calculating distance:', error);
    return Infinity;
  }
}

interface LocationData {
  address: string;
  coordinates: [number, number];
  boundingBox?: [number, number, number, number];
  rawResult?: any;
}

type ListingAction = 'SALE' | 'RENT';

interface ListingFiltersProps {
  selectedCategory: string;
  selectedAction: ListingAction | null;
  setSelectedAction: (action: ListingAction | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (subcategory: string | null) => void;
  allSubcategories: string[];
  selectedMake: string | null;
  setSelectedMake: (make: string | null) => void;
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  selectedRadius: number | null;
  setSelectedRadius: (radius: number | null) => void;
  selectedBuiltYear: number | null;
  setSelectedBuiltYear: (year: number | null) => void;
  selectedAreas?: string[];
  setSelectedAreas?: (areas: string[]) => void;
  loading?: boolean;
  onLocationChange?: (location: { 
    address: string; 
    coordinates: [number, number];
    boundingBox?: [number, number, number, number];
  } | null) => void;
  onRadiusChange?: (radius: number | null) => void;
}

// Mapping of subcategories to icons
const SubcategoryIcons: {
  [key: string]: React.ComponentType<{ className?: string }>;
} = {
  CAR: FaCar,
  TRUCK: FaTruck,
  MOTORCYCLE: FaMotorcycle,
  VAN: FaShuttleVan,
  BUS: FaBus,
  TRACTOR: FaTractor,
  HOUSE: FaHome,
  APARTMENT: FaHome,
  CONDO: FaHome,
  // Add more mappings as needed
  OTHER: MdFilterList,
};

const ListingFilters: React.FC<ListingFiltersProps> = ({
  selectedCategory,
  selectedAction,
  setSelectedAction,
  selectedSubcategory,
  setSelectedSubcategory,
  allSubcategories,
  selectedMake,
  setSelectedMake,
  selectedModel,
  setSelectedModel,
  selectedYear,
  setSelectedYear,
  selectedLocation,
  setSelectedLocation,
  selectedRadius,
  setSelectedRadius,
  selectedBuiltYear,
  setSelectedBuiltYear,
  // selectedAreas and setSelectedAreas are kept in props for future use
  selectedAreas: _selectedAreas,
  setSelectedAreas: _setSelectedAreas,
  loading: _loading = false,
  onLocationChange,
  onRadiusChange,
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1989 }, (_, i) =>
    (currentYear - i).toString(),
  );
  const { t } = useTranslation(["filters", "common", "locations"]);
  // State for location and radius filtering
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);
  const [tempRadius, setTempRadius] = useState(10); // Temporary radius value for the slider
  const [localLoading, setLocalLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Get city and area translations - keeping for potential future use
  // const cities = t('locations:cities', { returnObjects: true, defaultValue: {} }) as Record<string, string>;
  // const areas = t('locations:areas', { returnObjects: true, defaultValue: {} }) as Record<string, string[]>;

  // City and area handling - keeping for potential future use
  // const getCityAreas = (cityId: string | null): string[] => {
  //   if (!cityId) return [];
  //   const cityAreas = areas[cityId];
  //   return Array.isArray(cityAreas) ? cityAreas : [];
  // };

  // Handle radius change
  const handleRadiusChange = useCallback((radius: number | null) => {
    // Only update if the radius has actually changed
    if (radius === selectedRadius) return;
    
    setSelectedRadius(radius);
    
    // If radius is being cleared, also clear the location
    if (radius === null) {
      setSelectedLocation(null);
    } else if (selectedLocation) {
      // Only update the radius if we have a location
      setTempRadius(radius);
    }
    
    // Notify parent component about the radius change if callback is provided
    onRadiusChange?.(radius);
  }, [onRadiusChange, selectedRadius, selectedLocation, setSelectedRadius, setSelectedLocation]);

  // Handle location selection from the search component
  const handleLocationSelect = useCallback((location: LocationData) => {
    setSelectedLocation(location.address);
    
    // Update location data in parent if callback provided
    onLocationChange?.({
      address: location.address,
      coordinates: location.coordinates,
      boundingBox: location.boundingBox
    });
    
    // If radius filter is enabled, apply the current radius
    if (showRadiusSlider) {
      handleRadiusChange(tempRadius);
    }
  }, [onLocationChange, handleRadiusChange, showRadiusSlider, tempRadius]);

  // Toggle radius slider
  const toggleRadiusSlider = useCallback((enabled: boolean) => {
    setShowRadiusSlider(enabled);
    if (!enabled) {
      handleRadiusChange(null);
    } else if (selectedLocation) {
      // Only apply radius if we have a location
      handleRadiusChange(tempRadius);
    }
  }, [handleRadiusChange, selectedLocation, tempRadius]);

  // Common translations
  const common = {
    filters: t("filters"),
    reset: t("reset"),
    categories: {
      vehicle: {
        CAR: t("categories.vehicle.CAR"),
        TRUCK: t("categories.vehicle.TRUCK"),
        MOTORCYCLE: t("categories.vehicle.MOTORCYCLE"),
        VAN: t("categories.vehicle.VAN"),
        BUS: t("categories.vehicle.BUS"),
        TRACTOR: t("categories.vehicle.TRACTOR"),
        RV: t("categories.vehicle.RV"),
      },
    },
    subcategories: {
      property: {
        HOUSE: t("subcategories.property.HOUSE"),
        APARTMENT: t("subcategories.property.APARTMENT"),
        CONDO: t("subcategories.property.CONDO"),
        LAND: t("subcategories.property.LAND"),
        COMMERCIAL: t("subcategories.property.COMMERCIAL"),
      },
      OTHER: t("subcategories.OTHER"),
    },
  };

  // Get available makes for the selected subcategory
  const availableMakes = useMemo(() => {
    if (!selectedSubcategory) return [];
    return getMakesForType(selectedSubcategory as VehicleType);
  }, [selectedSubcategory]);

  // Get available models for the selected make
  const availableModels = useMemo(() => {
    if (!selectedSubcategory || !selectedMake) return [];
    return getModelsForMakeAndType(
      selectedMake,
      selectedSubcategory as VehicleType,
    );
  }, [selectedSubcategory, selectedMake]);

  // Handle make change
  const handleMakeChange = (value: string | null) => {
    setSelectedMake(value);
    setSelectedModel(null);
  };

  // Reverse geocode coordinates to get location name
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      // Try to get the most specific location name available
      const locationName = data.address?.city || 
                         data.address?.town || 
                         data.address?.village || 
                         data.address?.county ||
                         data.display_name?.split(',')[0] ||
                         t('yourLocation');
      
      return locationName;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return t('yourLocation');
    }
  };

  // Handle getting user's current location
  const handleGetCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return undefined;
    }

    setLocalLoading(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Get location name using reverse geocoding
      const locationName = await reverseGeocode(latitude, longitude);
      
      // Create location data object
      const locationData: LocationData = {
        address: locationName,
        coordinates: [latitude, longitude],
        rawResult: { lat: latitude.toString(), lon: longitude.toString() }
      };
      
      // Update location state
      handleLocationSelect(locationData);
      
      // If radius filter is enabled, apply the current radius
      if (showRadiusSlider) {
        handleRadiusChange(tempRadius);
      }
      
      return locationData;
    } catch (error) {
      console.error('Geolocation error:', error);
      setLocationError('Unable to retrieve your location');
      throw error;
    } finally {
      setLocalLoading(false);
    }
  }, [handleLocationSelect, handleRadiusChange, showRadiusSlider, tempRadius]);

  // Handle subcategory change
  const handleSubcategoryChange = (value: string | null) => {
    setSelectedSubcategory(value);
    setSelectedMake(null);
    setSelectedModel(null);
  };

  const isVehicleCategory = (subcategory: string | null): boolean => {
    return Object.values(VehicleType).includes(subcategory as VehicleType);
  };

  const handleActionChange = (action: "SALE" | "RENT" | null) => {
    setSelectedAction(action);
  };

  const SubcategoryLabels: { [key: string]: string } = {
    // Vehicle Types
    CAR: common.categories.vehicle.CAR,
    TRUCK: common.categories.vehicle.TRUCK,
    MOTORCYCLE: common.categories.vehicle.MOTORCYCLE,
    VAN: common.categories.vehicle.VAN,
    BUS: common.categories.vehicle.BUS,
    TRACTOR: common.categories.vehicle.TRACTOR,
    RV: common.categories.vehicle.RV,

    // Property Types
    HOUSE: common.subcategories.property.HOUSE,
    APARTMENT: common.subcategories.property.APARTMENT,
    CONDO: common.subcategories.property.CONDO,
    LAND: common.subcategories.property.LAND,
    COMMERCIAL: common.subcategories.property.COMMERCIAL,

    // Fallback
    OTHER: common.subcategories.OTHER,
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedAction(null);
    setSelectedSubcategory(null);
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedYear(null);
    setSelectedLocation(null);
    setSelectedRadius(null);
    setSelectedBuiltYear(null);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-4 relative z-20 w-full max-w-full">
      <div className="flex flex-row justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
        <span className="text-base font-semibold text-gray-700 dark:text-gray-200">
          {common.filters}
        </span>
        <button
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          onClick={resetFilters}
        >
          {common.reset || "Reset"}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
        {/* Subcategory Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("subcategory")}
          </label>
          <Listbox
            value={selectedSubcategory || ""}
            onChange={handleSubcategoryChange}
            disabled={localLoading}
          >
            <div className="relative">
              <Listbox.Button
                className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  localLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {selectedSubcategory &&
                  SubcategoryIcons[selectedSubcategory] &&
                  React.createElement(SubcategoryIcons[selectedSubcategory], {
                    className: "w-5 h-5 mr-2",
                  })}
                <span className="truncate">
                  {selectedSubcategory
                    ? SubcategoryLabels[selectedSubcategory]
                    : t("all_subcategories")}
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-[70] mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none sm:text-sm">
                  <Listbox.Option
                    key="all"
                    value=""
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900 dark:text-white"}`
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                        >
                          {t("all_subcategories")}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-blue-600" : "text-blue-600"}`}
                          >
                            <MdCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                  {allSubcategories?.map((subcategory) => (
                    <Listbox.Option
                      key={subcategory}
                      value={subcategory}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900 dark:text-white"}`
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate flex items-center ${selected ? "font-medium" : "font-normal"}`}
                          >
                            {SubcategoryIcons[subcategory] &&
                              React.createElement(
                                SubcategoryIcons[subcategory],
                                { className: "w-5 h-5 mr-2 inline" },
                              )}
                            {SubcategoryLabels[subcategory]}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-blue-600" : "text-blue-600"}`}
                            >
                              <MdCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Action Filter - moved below filters for better UX */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("action")}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                handleActionChange(selectedAction === "SALE" ? null : "SALE")
              }
              disabled={localLoading}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedAction === "SALE"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              } ${localLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {t("actions.SALE")}
            </button>
            <button
              onClick={() =>
                handleActionChange(selectedAction === "RENT" ? null : "RENT")
              }
              disabled={localLoading}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedAction === "RENT"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              } ${localLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {t("actions.RENT")}
            </button>
          </div>
        </div>

        {/* Location Search with Radius Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("location")}
          </label>
          <div className="space-y-3">
            <div className={localLoading ? 'opacity-50' : ''}>
              <LocationSearch
                onSelectLocation={handleLocationSelect}
                className="w-full"
                placeholder={t('searchLocation') || 'Search for a location...'}
              />
            </div>
            
            {/* Location and Radius Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showRadiusSlider}
                  onChange={toggleRadiusSlider}
                  className={`${
                    showRadiusSlider ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span className="sr-only">Enable radius filter</span>
                  <span
                    className={`${
                      showRadiusSlider ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('radiusFilter')}
                </label>
              </div>
              {selectedLocation && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <MdLocationOn className="w-4 h-4 mr-1 text-blue-500" />
                  <span className="truncate">{selectedLocation}</span>
                </div>
              )}
            </div>
            {showRadiusSlider && (
              <div className="pl-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('radius')}:</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {tempRadius} km
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={tempRadius}
                  onChange={(e) => {
                    const newRadius = parseInt(e.target.value, 10);
                    setTempRadius(newRadius);
                    if (selectedLocation) {
                      handleRadiusChange(newRadius);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={!selectedLocation}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1km</span>
                  <span>{selectedLocation ? `${tempRadius}km` : 'Select location first'}</span>
                  <span>100km+</span>
                </div>
                {!selectedLocation && (
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    disabled={localLoading}
                  >
                    <MdMyLocation className="w-4 h-4 mr-1" />
                    {t('useMyLocation')}
                  </button>
                )}
              </div>
            )}
            
            {locationError && (
              <p className="text-sm text-red-600 dark:text-red-400">{locationError}</p>
            )}
          </div>
        </div>
        {/* Built Year Filter - Only for Real Estate */}
        {selectedCategory === ListingCategory.REAL_ESTATE && (
          <div className="space-y-2 z-[60]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("built_year")}
            </label>
            <Listbox
              value={selectedBuiltYear || ""}
              onChange={setSelectedBuiltYear}
              disabled={localLoading}
            >
              <div className="relative">
                <Listbox.Button
                  className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${localLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="truncate">
                    {selectedBuiltYear
                      ? t(`builtYearOptions.${selectedBuiltYear}`)
                      : t("builtYearOptions.any")}
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-[70] mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none sm:text-sm">
                    <Listbox.Option
                      value=""
                      className={({ active }) =>
                        `${active ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"} cursor-default select-none relative py-2 pl-3 pr-9`
                      }
                    >
                      {t("builtYearOptions.any")}
                    </Listbox.Option>
                    <Listbox.Option
                      value="2023"
                      className={({ active }) =>
                        `${active ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"} cursor-default select-none relative py-2 pl-3 pr-9`
                      }
                    >
                      {t("builtYearOptions.2023")}
                    </Listbox.Option>
                    <Listbox.Option
                      value="2010"
                      className={({ active }) =>
                        `${active ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"} cursor-default select-none relative py-2 pl-3 pr-9`
                      }
                    >
                      {t("builtYearOptions.2010")}
                    </Listbox.Option>
                    <Listbox.Option
                      value="2000"
                      className={({ active }) =>
                        `${active ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"} cursor-default select-none relative py-2 pl-3 pr-9`
                      }
                    >
                      {t("builtYearOptions.2000")}
                    </Listbox.Option>
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        )}

        {/* Make Filter - Only show for vehicle categories */}
        {isVehicleCategory(selectedSubcategory) &&
          availableMakes.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("make")}
              </label>
              <select
                value={selectedMake || ""}
                onChange={(e) => handleMakeChange(e.target.value || null)}
                disabled={localLoading}
                className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  localLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">{t("all_makes")}</option>
                {availableMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>
          )}

        {/* Model Filter - Only show when make is selected */}
        {selectedMake && availableModels.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("model")}
            </label>
            <select
              value={selectedModel || ""}
              onChange={(e) => setSelectedModel(e.target.value || null)}
              disabled={localLoading}
              className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                localLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">{t("all_models")}</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year Filter - Show for VEHICLES category */}
        {(selectedCategory === ListingCategory.VEHICLES ||
          isVehicleCategory(selectedSubcategory)) && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("year")}
            </label>
            <Listbox
              value={selectedYear || ""}
              onChange={setSelectedYear}
              disabled={localLoading}
            >
              <div className="relative">
                <Listbox.Button
                  className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    localLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="truncate">
                    {selectedYear || t("all_years")}
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-[70] mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none sm:text-sm">
                    <Listbox.Option
                      value=""
                      className={({ active }) =>
                        `${
                          active
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300"
                            : "text-gray-900 dark:text-gray-100"
                        }
                        cursor-default select-none relative py-2 pl-3 pr-9`
                      }
                    >
                      {t("all_years")}
                    </Listbox.Option>
                    {yearOptions.map((year) => (
                      <Listbox.Option
                        key={year}
                        value={year}
                        className={({ active }) =>
                          `${
                            active
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300"
                              : "text-gray-900 dark:text-gray-100"
                          }
                          cursor-default select-none relative py-2 pl-3 pr-9`
                        }
                      >
                        {({ selected }) => (
                          <div className="flex items-center">
                            <span className="truncate">{year}</span>
                            {selected && (
                              <span
                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                  selectedAction === "SALE"
                                    ? "text-blue-600"
                                    : "text-green-600"
                                }`}
                              >
                                <MdCheck className="w-5 h-5" />
                              </span>
                            )}
                          </div>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingFilters;
