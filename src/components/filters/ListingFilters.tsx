import React, { useEffect, useState, useCallback } from "react";
import { FaCar, FaMotorcycle, FaTruck, FaCaravan, FaBus } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import { useTranslation } from "react-i18next";

import { ListingAction, VehicleType } from "@/types/enums";
import {
  getMakesForType,
  getModelsForMakeAndType,
} from "@/components/listings/data/vehicleModels";
import LocationSearch, {
  SelectedLocation,
} from "@/components/location/LocationSearch";

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

const ListingFilters: React.FC<ListingFiltersProps> = ({
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
  // Local UI state
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<SelectedLocation | null>(
    null,
  );

  const { t } = useTranslation("filters");
  const { t: tEnums } = useTranslation("enums");

  const vehicleTypes = [
    {
      id: VehicleType.CAR,
      name: tEnums("vehicleType.CAR"),
      icon: <FaCar className="w-6 h-6" />,
    },
    {
      id: VehicleType.MOTORCYCLE,
      name: tEnums("vehicleType.MOTORCYCLE"),
      icon: <FaMotorcycle className="w-6 h-6" />,
    },
    {
      id: VehicleType.TRUCK,
      name: tEnums("vehicleType.TRUCK"),
      icon: <FaTruck className="w-6 h-6" />,
    },
    {
      id: VehicleType.VAN,
      name: tEnums("vehicleType.VAN"),
      icon: <FaTruck className="w-6 h-6" />,
    },
    {
      id: VehicleType.RV,
      name: tEnums("vehicleType.RV"),
      icon: <FaCaravan className="w-6 h-6" />,
    },
    {
      id: VehicleType.BUS,
      name: tEnums("vehicleType.BUS"),
      icon: <FaBus className="w-6 h-6" />,
    },
    {
      id: VehicleType.CONSTRUCTION,
      name: tEnums("vehicleType.CONSTRUCTION"),
      icon: <FaTruck className="w-6 h-6" />,
    },
    {
      id: VehicleType.TRACTOR,
      name: tEnums("vehicleType.TRACTOR"),
      icon: <FaTruck className="w-6 h-6" />,
    },
    {
      id: VehicleType.OTHER,
      name: tEnums("vehicleType.OTHER"),
      icon: <FaTruck className="w-6 h-6" />,
    },
  ];

  // Update available makes when vehicle type changes
  useEffect(() => {
    if (selectedSubcategory) {
      try {
        const makes = getMakesForType(selectedSubcategory as VehicleType);
        setAvailableMakes(makes);
      } catch (error) {
        console.error("Error loading makes:", error);
        setAvailableMakes([]);
      }
      setAvailableModels([]);
      setSelectedMake(null);
      setSelectedModel(null);
    }
  }, [selectedSubcategory]);

  // Update available models when make changes
  useEffect(() => {
    if (selectedSubcategory && selectedMake) {
      try {
        const models = getModelsForMakeAndType(
          selectedMake,
          selectedSubcategory as VehicleType,
        );
        setAvailableModels(models);
      } catch (error) {
        console.error("Error loading models:", error);
        setAvailableModels([]);
      }
      setSelectedModel(null);
    } else {
      setAvailableModels([]);
    }
  }, [selectedMake, selectedSubcategory]);

  const handleActionChange = (value: string) => {
    setSelectedAction((value as ListingAction) || null);
  };

  const handleLocationSelect = useCallback(
    (location: SelectedLocation) => {
      setLocationData(location);
      setSelectedLocation(location.address);
      onLocationChange?.({ address: location.address });
      if (onRadiusChange && location.radius) {
        onRadiusChange(location.radius);
      }
    },
    [onLocationChange, onRadiusChange],
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    try {
      onSearch();
    } catch (error) {
      console.error("Search failed:", error);
      // Optionally show error to user via toast or other UI feedback
    }
  };

  const handleReset = () => {
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedYear(null);
    setSelectedMileage(null);
    setSelectedLocation(null);
    setLocationData(null);
    setSelectedSubcategory(null);
    onPriceRangeChange({ min: "", max: "" });
    onRadiusChange?.(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 relative z-20 w-full max-w-6xl mx-auto">
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
                    ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                    : "text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="block text-sm font-medium text-gray-800 mb-1.5"
              >
                {t("make")}
                <span className="sr-only">{t("required")}</span>
              </label>
              <select
                aria-labelledby="make-label"
                className="w-full p-2.5 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("model")}
              </label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("first_registration")}
              </label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("kilometers_up_to")}
              </label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("payment_method")}
              </label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("price_up_to")} (€)
              </label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("location")}
              </label>
              <LocationSearch
                key={`location-search-${!!locationData}`} // Force re-render on reset
                onSelectLocation={handleLocationSelect}
                placeholder={t("search_location_placeholder")}
                className="w-full"
                inputClassName="w-full p-2 border border-gray-300 rounded-md pl-10"
                initialValue={locationData?.address || ""}
              />
              {locationData?.radius !== undefined && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
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
                  className="px-5 py-2.5 text-sm font-medium text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={handleReset}
                >
                  {t("reset")}
                </button>
                <button
                  type="button"
                  className="px-5 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {t("moreFilters")}
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 transition-colors"
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

export default ListingFilters;
