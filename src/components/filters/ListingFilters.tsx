import * as React from "react";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import type { FC } from "react";
import { FaCar } from "@react-icons/all-files/fa/FaCar";
import { FaMotorcycle } from "@react-icons/all-files/fa/FaMotorcycle";
import { MdSend } from "@react-icons/all-files/md/MdSend";
import { useTranslation } from "react-i18next";

import { ListingAction, VehicleType } from "@/types/enums";
import {
  getMakesForType,
  getModelsForMakeAndType,
} from "@/components/listings/data/vehicleModels";
import type { SelectedLocation } from "@/components/location/LocationSearch";
import LocationSearch from "@/components/location/LocationSearch";

interface ListingFiltersProps {
  selectedAction: ListingAction | null;
  setSelectedAction: (action: ListingAction | null) => void;
  selectedMake: string | null;
  setSelectedMake: (make: string | null) => void;
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  selectedMileage: number | null;
  setSelectedMileage: (mileage: number | null) => void;
  setSelectedLocation: (location: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (subcategory: string | null) => void;
  onSearch: () => void;
  loading: boolean;
  priceRange: { min: number | ""; max: number | "" };
  onPriceRangeChange: (range: { min: number | ""; max: number | "" }) => void;
  onLocationChange: (location: { address: string }) => void;
  // Optional props with default values
  selectedRadius?: number | null;
  setSelectedRadius?: (radius: number | null) => void;
  selectedBuiltYear?: number | null;
  setSelectedBuiltYear?: (year: number | null) => void;
  yearRange?: { min: number | ""; max: number | "" };
  onYearRangeChange?: (range: { min: number | ""; max: number | "" }) => void;
  onRadiusChange?: (radius: number | null) => void;
}

const ListingFiltersComponent: FC<ListingFiltersProps> = ({
  selectedAction,
  setSelectedAction,
  selectedMake,
  setSelectedMake,
  selectedModel,
  setSelectedModel,
  selectedYear,
  setSelectedYear,
  selectedMileage,
  setSelectedMileage,
  setSelectedLocation,
  selectedSubcategory,
  setSelectedSubcategory,
  onSearch,
  loading,
  priceRange,
  onPriceRangeChange,
  onLocationChange,
  onRadiusChange = () => {},
}) => {
  // Memoize translations and vehicle types at the top level
  const { t: tEnums } = useTranslation("enums");
  const { t } = useTranslation("filters");

  // Memoize vehicle types using translations
  const vehicleTypes = useMemo(() => {
    return [
      {
        id: VehicleType.CARS,
        name: tEnums("vehicleType.CAR"),
        icon: <FaCar className="w-6 h-6" />,
      },
      {
        id: VehicleType.MOTORCYCLES,
        name: tEnums("vehicleType.MOTORCYCLE"),
        icon: <FaMotorcycle className="w-6 h-6" />,
      },
    ];
  }, []);

  // Local UI state
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<SelectedLocation | null>(
    null,
  );

  // Memoize make/model fetching functions
  const fetchMakes = useCallback((type: VehicleType) => {
    try {
      return getMakesForType(type);
    } catch (error) {
      console.error("Error loading makes:", error);
      return [];
    }
  }, []);

  const fetchModels = useCallback((make: string, type: VehicleType) => {
    try {
      return getModelsForMakeAndType(make, type);
    } catch (error) {
      console.error("Error loading models:", error);
      return [];
    }
  }, []);

  // Update available makes when vehicle type changes
  useEffect(() => {
    if (selectedSubcategory) {
      const makes = fetchMakes(selectedSubcategory as VehicleType);
      setAvailableMakes(makes);
      setAvailableModels([]);
      setSelectedMake(null);
      setSelectedModel(null);
    }
  }, [selectedSubcategory, fetchMakes]);

  // Update available models when make changes
  useEffect(() => {
    if (selectedSubcategory && selectedMake) {
      const models = fetchModels(
        selectedMake,
        selectedSubcategory as VehicleType,
      );
      setAvailableModels(models);
      setSelectedModel(null);
    } else {
      setAvailableModels([]);
    }
  }, [selectedMake, selectedSubcategory, fetchModels]);

  // Memoize handlers
  const handleActionChange = useCallback(
    (value: string) => {
      setSelectedAction((value as ListingAction) || null);
    },
    [setSelectedAction],
  );

  const handleLocationSelect = useCallback(
    (location: SelectedLocation) => {
      setLocationData(location);
      setSelectedLocation(location.address);
      onLocationChange?.({ address: location.address });
      onRadiusChange?.(location.radius ?? null);
    },
    [onLocationChange, onRadiusChange],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      onSearch();
    },
    [onSearch],
  );

  const handleReset = useCallback(() => {
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedYear(null);
    setSelectedMileage(null);
    setSelectedLocation(null);
    setLocationData(null);
    setSelectedSubcategory(null);
    onPriceRangeChange({ min: "", max: "" });
    onRadiusChange?.(null);
  }, [
    setSelectedMake,
    setSelectedModel,
    setSelectedYear,
    setSelectedMileage,
    setSelectedLocation,
    setSelectedSubcategory,
    onPriceRangeChange,
    onRadiusChange,
  ]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 relative z-20 w-full max-w-6xl mx-auto transition-colors">
      <div className="flex flex-row gap-6 items-start">
        {/* Vehicle Type Selector */}
        <div className="flex flex-col space-y-3">
          <h2 className="sr-only">{t("vehicle_type")}</h2>
          <div className="grid grid-cols-3 gap-2">
            {vehicleTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  setSelectedSubcategory(
                    type.id === selectedSubcategory ? null : type.id,
                  )
                }
                className={`p-3 rounded-lg flex flex-col items-center justify-center min-h-[5.5rem] min-w-[5.5rem] transition-colors ${
                  type.id === selectedSubcategory
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-2 ring-blue-500"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                }`}
                aria-pressed={type.id === selectedSubcategory}
                aria-label={type.name}
              >
                {React.cloneElement(type.icon, {
                  "aria-hidden": "true",
                  className: "w-6 h-6",
                })}
                <span className="text-xs mt-1.5 font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Filter Area */}
        <div className="flex-1">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
          >
            <div>
              <label
                id="make-label"
                className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5"
              >
                {t("make")}
                <span className="sr-only">{t("required")}</span>
              </label>
              <select
                aria-labelledby="make-label"
                className="w-full p-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedMake || ""}
                onChange={(e) => setSelectedMake(e.target.value || null)}
                disabled={loading}
                aria-required="true"
              >
                <option value="">{t("select_make")}</option>
                {availableMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("model")}
              </label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedModel || ""}
                onChange={(e) => setSelectedModel(e.target.value || null)}
                disabled={!selectedMake || loading}
                aria-disabled={!selectedMake || loading}
                aria-labelledby="model-label"
              >
                <option value="">{t("select_model")}</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("first_registration")}
              </label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedYear || ""}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                disabled={loading}
                aria-labelledby="year-label"
              >
                <option value="">{t("builtYearOptions.any")}</option>
                {Array.from(
                  { length: 30 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("kilometers_up_to")}
              </label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedMileage || ""}
                onChange={(e) =>
                  setSelectedMileage(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                disabled={loading}
                aria-labelledby="mileage-label"
              >
                <option value="">{t("no_max")}</option>
                {[
                  5000, 10000, 20000, 30000, 40000, 50000, 75000, 100000,
                  125000, 150000, 175000, 200000,
                ].map((km) => (
                  <option key={km} value={km}>
                    {km.toLocaleString()} km
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("payment_method")}
              </label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedAction || ""}
                onChange={(e) => handleActionChange(e.target.value)}
                disabled={loading}
                aria-labelledby="payment-label"
              >
                <option value="">{t("any")}</option>
                <option value={ListingAction.SALE}>
                  {tEnums("listingType.FOR_SALE")}
                </option>
                <option value={ListingAction.RENT}>
                  {tEnums("listingType.FOR_RENT")}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("price_up_to")} (€)
              </label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={priceRange.max || ""}
                onChange={(e) =>
                  onPriceRangeChange({
                    ...priceRange,
                    max: e.target.value ? parseInt(e.target.value) : "",
                  })
                }
                disabled={loading}
                aria-labelledby="price-label"
              >
                <option value="">{t("no_max")}</option>
                {[
                  500, 1000, 2500, 5000, 7500, 10000, 15000, 20000, 25000,
                  30000, 40000, 50000, 75000, 100000, 125000, 150000, 175000,
                  200000, 250000, 300000, 400000, 500000,
                ].map((price) => (
                  <option key={price} value={price}>
                    {price.toLocaleString()} €
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("location")}
              </label>
              <LocationSearch
                key={`location-search-${!!locationData}`} // Force re-render on reset
                onSelectLocation={handleLocationSelect}
                placeholder={t("search_location_placeholder")}
                className="w-full"
                inputClassName="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                initialValue={locationData?.address || ""}
              />
              {locationData?.radius !== undefined && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Within {locationData.radius} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={locationData.radius}
                    onChange={(e) => {
                      const newRadius = parseInt(e.target.value);
                      setLocationData((prev) => ({
                        ...prev!,
                        radius: newRadius,
                      }));
                      onRadiusChange?.(newRadius);
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer dark:accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{t("reset")}</span>
                    <span>50 {t("distance.km")}</span>
                    <span>100 {t("distance.km")}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end mt-4 gap-2">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={loading}
                  aria-label={t("reset_filters")}
                >
                  {t("reset")}
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  aria-label={t("search")}
                >
                  <MdSend className="mr-2 w-5 h-5" aria-hidden="true" />
                  {t("search")}
                  <span className="sr-only">{t("search_listings")}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const ListingFilters = memo(
  ListingFiltersComponent,
  (prevProps, nextProps) => {
    // Only re-render if actual filter values change, not loading state
    return (
      prevProps.selectedAction === nextProps.selectedAction &&
      prevProps.selectedMake === nextProps.selectedMake &&
      prevProps.selectedModel === nextProps.selectedModel &&
      prevProps.selectedYear === nextProps.selectedYear &&
      prevProps.selectedMileage === nextProps.selectedMileage &&
      prevProps.selectedSubcategory === nextProps.selectedSubcategory &&
      prevProps.priceRange.min === nextProps.priceRange.min &&
      prevProps.priceRange.max === nextProps.priceRange.max
    );
  },
);

export default ListingFilters;
