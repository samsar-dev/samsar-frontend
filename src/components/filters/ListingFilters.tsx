import React, { Fragment, useMemo, useState } from "react";

// Utility to calculate distance between two lat/lng points in km
export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
}

import { Listbox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { MdFilterList, MdCheck } from "react-icons/md";
import {
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaHome,
  FaShuttleVan,
  FaBus,
  FaTractor,
} from "react-icons/fa";
import { ListingCategory } from "@/types/enums";
import { VehicleType } from "@/types/enums";
import {
  getMakesForType,
  getModelsForMakeAndType,
} from "@/components/listings/data/vehicleModels";

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
  onLocationChange?: (coords: { lat: number; lng: number }) => void;
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
  selectedAreas,
  setSelectedAreas,
  selectedBuiltYear,
  setSelectedBuiltYear,
  loading = false,
  onLocationChange,
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1989 }, (_, i) =>
    (currentYear - i).toString(),
  );
  const { t } = useTranslation(["filters", "common"]);
  // State for location handling
  const [localLoading, setLocalLoading] = useState(loading);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get city and area translations
  const cities = t('cities', { returnObjects: true, defaultValue: {} }) as Record<string, string>;
  const areas = t('areas', { returnObjects: true, defaultValue: {} }) as Record<string, string[]>;
  
  // Get city options from translations
  const cityOptions = Object.entries(cities).map(([id, name]) => ({
    id,
    name: String(name) // Ensure name is a string
  }));
  
  // Get areas for the selected city
  const getCityAreas = (cityId: string | null): string[] => {
    if (!cityId) return [];
    const cityAreas = areas[cityId];
    return Array.isArray(cityAreas) ? cityAreas : [];
  };

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

  // Get coordinates for the selected location (exported for parent component)
  const getLocationCoordinates = (): { lat: number; lng: number } | null => {
    if (selectedLocation === 'current-location') {
      return userLocation;
    }
    // TODO: Add logic to get coordinates for other locations if needed
    return null;
  };

  // Export location coordinates to parent when they change
  React.useEffect(() => {
    if (onLocationChange && userLocation) {
      onLocationChange(userLocation);
    }
  }, [userLocation, onLocationChange]);

  // Get unique locations from listings
  const availableLocations = useMemo(() => {
    if (!selectedSubcategory || !selectedMake) return [];
    return getModelsForMakeAndType(
      selectedMake,
      selectedSubcategory as VehicleType,
    );
  }, [selectedSubcategory, selectedMake, getModelsForMakeAndType]);

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
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
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
      setUserLocation({ lat: latitude, lng: longitude });
      
      // Get location name using reverse geocoding
      const locationName = await reverseGeocode(latitude, longitude);
      
      // Set the location name in the input field
      setSelectedLocation(locationName);
      
      // Pass coordinates to parent if needed
      if (onLocationChange) {
        onLocationChange({ lat: latitude, lng: longitude });
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      setLocationError('Unable to retrieve your location');
    } finally {
      setLocalLoading(false);
    }
  };

  // Handle radius filter change
  const handleRadiusChange = (radius: number | null) => {
    // If radius is being cleared, also clear the location
    if (radius === null) {
      setSelectedLocation(null);
      setUserLocation(null);
    }
    setSelectedRadius(radius);
  };

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

        {/* Syrian cities with their nearby areas */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("location")}
          </label>
          <div className="space-y-3">
            <select
              name="location"
              value={selectedLocation || ""}
              onChange={(e) => setSelectedLocation(e.target.value || null)}
              className={`w-full appearance-none px-4 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 z-[60] ${
                localLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={localLoading}
            >
              <option value="">{t("selectCity")}</option>
              {cityOptions.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>

            {selectedLocation && (
              <div className="space-y-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="radiusCheckbox"
                      checked={selectedRadius !== null}
                      onChange={(e) => handleRadiusChange(e.target.checked ? 10 : null)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="radiusCheckbox" className="text-sm text-gray-700 dark:text-gray-300">
                      {t("radius")}
                    </label>
                  </div>
                  {selectedRadius !== null && (
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={localLoading}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedLocation && selectedLocation !== 'current-location' 
                      ? `${t('usingLocation')}: ${selectedLocation}` 
                      : t('useMyLocation')}
                    </button>
                  )}
                  {locationError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{locationError}</p>
                  )}
                </div>
                {selectedRadius !== null && (
                  <div className="pl-5">
                    <p className="text-xs text-gray-500 mb-2">
                      {t('nearbyAreas')}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Al-Rastan',
                        'Talbiseh',
                        'Al-Qusayr',
                        'Al-Mukharram'
                      ].map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(area);
                            // Clear user location when selecting a predefined area
                            setUserLocation(null);
                            // You might want to add coordinates for these areas
                            // and update the map/radius filter accordingly
                          }}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedLocation === area 
                              ? 'bg-blue-600 text-white dark:bg-blue-700' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                          } transition-colors`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
