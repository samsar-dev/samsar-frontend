import React, { Fragment, useMemo, useState } from "react";
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

interface ListingFiltersProps {
  selectedCategory: string;
  selectedAction: "SELL" | "RENT" | null;
  setSelectedAction: (value: "SELL" | "RENT" | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (value: string | null) => void;
  allSubcategories: string[];
  selectedMake: string | null;
  setSelectedMake: (value: string | null) => void;
  selectedModel: string | null;
  setSelectedModel: (value: string | null) => void;
  selectedYear: string | null;
  setSelectedYear: (value: string | null) => void;
  selectedLocation: string | null;
  setSelectedLocation: (value: string | null) => void;
  selectedBuiltYear: string | null;
  setSelectedBuiltYear: (value: string | null) => void;
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
  selectedBuiltYear,
  setSelectedBuiltYear,
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1989 }, (_, i) =>
    (currentYear - i).toString(),
  );
  const { t } = useTranslation(['filters', 'common']);
  const [localLoading, setLocalLoading] = useState(false);
  
  // Common translations
  const common = {
    filters: t('filters'),
    reset: t('reset'),
    categories: {
      vehicle: {
        CAR: t('categories.vehicle.CAR'),
        TRUCK: t('categories.vehicle.TRUCK'),
        MOTORCYCLE: t('categories.vehicle.MOTORCYCLE'),
        VAN: t('categories.vehicle.VAN'),
        BUS: t('categories.vehicle.BUS'),
        TRACTOR: t('categories.vehicle.TRACTOR'),
        RV: t('categories.vehicle.RV')
      }
    },
    subcategories: {
      property: {
        HOUSE: t('subcategories.property.HOUSE'),
        APARTMENT: t('subcategories.property.APARTMENT'),
        CONDO: t('subcategories.property.CONDO'),
        LAND: t('subcategories.property.LAND'),
        COMMERCIAL: t('subcategories.property.COMMERCIAL')
      },
      OTHER: t('subcategories.OTHER')
    }
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

  // Reset model when make changes
  const handleMakeChange = async (make: string | null) => {
    setLocalLoading(true);
    try {
      setSelectedMake(make);
      setSelectedModel(null);
    } finally {
      setLocalLoading(false);
    }
  };

  // Reset make and model when subcategory changes
  const handleSubcategoryChange = async (subcategory: string | null) => {
    setLocalLoading(true);
    try {
      setSelectedSubcategory(subcategory);
      setSelectedMake(null);
      setSelectedModel(null);
    } finally {
      setLocalLoading(false);
    }
  };

  const isVehicleCategory = (subcategory: string | null): boolean => {
    return Object.values(VehicleType).includes(subcategory as VehicleType);
  };

  const handleActionChange = async (action: "SELL" | "RENT" | null) => {
    setLocalLoading(true);
    try {
      setSelectedAction(action);
    } finally {
      setLocalLoading(false);
    }
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-4 relative z-20 w-full max-w-full">
      <div className="flex flex-row justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
        <span className="text-base font-semibold text-gray-700 dark:text-gray-200">
          {common.filters}
        </span>
        <button
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          onClick={() => {
            setSelectedSubcategory(null);
            setSelectedMake(null);
            setSelectedModel(null);
            setSelectedYear(null);
            setSelectedLocation(null);
            setSelectedBuiltYear(null);
            setSelectedAction(null);
          }}
        >
          {common.reset || "Reset"}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
        {/* Subcategory Filter */}
        {/* Subcategory Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('subcategory')}
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
                          {t('all_subcategories')}
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
            {t('action')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                handleActionChange(selectedAction === "SELL" ? null : "SELL")
              }
              disabled={localLoading}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedAction === "SELL"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              } ${localLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {t('actions.SELL')}
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
              {t('actions.RENT')}
            </button>
          </div>
        </div>

        {/* Location Filter - Available for both vehicle and real estate */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('location')}
          </label>
          <select
            name="location"
            value={selectedLocation || ""}
            onChange={(e) => setSelectedLocation(e.target.value || null)}
            className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 z-[60] ${localLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={localLoading}
          >
            <option value="">{t('allCities', { ns: 'common' })}</option>
            <option value="DAMASCUS">{t("cities.DAMASCUS")}</option>
            <option value="ALEPPO">{t("cities.ALEPPO")}</option>
            <option value="HOMS">{t("cities.HOMS")}</option>
            <option value="LATTAKIA">{t("cities.LATTAKIA")}</option>
            <option value="HAMA">{t("cities.HAMA")}</option>
            <option value="DEIR_EZZOR">{t("cities.DEIR_EZZOR")}</option>
            <option value="HASEKEH">{t("cities.HASEKEH")}</option>
            <option value="QAMISHLI">{t("cities.QAMISHLI")}</option>
            <option value="RAQQA">{t("cities.RAQQA")}</option>
            <option value="TARTOUS">{t("cities.TARTOUS")}</option>
            <option value="IDLIB">{t("cities.IDLIB")}</option>
            <option value="DARA">{t("cities.DARA")}</option>
            <option value="SWEDIA">{t("cities.SWEDIA")}</option>
            <option value="QUNEITRA">{t("cities.QUNEITRA")}</option>
          </select>
        </div>

        {/* Built Year Filter - Only for Real Estate */}
        {selectedCategory === ListingCategory.REAL_ESTATE && (
          <div className="space-y-2 z-[60]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('built_year')}
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
                      : t('builtYearOptions.any')}
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
                      {t('builtYearOptions.any')}
                    </Listbox.Option>
                    <Listbox.Option
                      value="2023"
                      className={({ active }) =>
                        `${active ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"} cursor-default select-none relative py-2 pl-3 pr-9`
                      }
                    >
                      {t('builtYearOptions.2023')}
                    </Listbox.Option>
                    <Listbox.Option
                      value="2010"
                      className={({ active }) =>
                        `${active ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"} cursor-default select-none relative py-2 pl-3 pr-9`
                      }
                    >
                      {t('builtYearOptions.2010')}
                    </Listbox.Option>
                    <Listbox.Option
                      value="2000"
                      className={({ active }) =>
                        `${active ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"} cursor-default select-none relative py-2 pl-3 pr-9`
                      }
                    >
                      {t('builtYearOptions.2000')}
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
                {t('make')}
              </label>
              <select
                value={selectedMake || ""}
                onChange={(e) => handleMakeChange(e.target.value || null)}
                disabled={localLoading}
                className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  localLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">{t('all_makes')}</option>
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
              {t('model')}
            </label>
            <select
              value={selectedModel || ""}
              onChange={(e) => setSelectedModel(e.target.value || null)}
              disabled={localLoading}
              className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                localLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">{t('all_models')}</option>
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
              {t('year')}
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
                    {selectedYear || t('all_years')}
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
                                  selectedAction === "SELL"
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
