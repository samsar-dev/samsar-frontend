import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { MdFilterList, MdCheck } from "react-icons/md";
import { FaCar, FaMotorcycle, FaTruck, FaHome, FaShuttleVan, FaBus, FaTractor } from "react-icons/fa";

interface ListingFiltersProps {
  selectedAction: "SELL" | "RENT" | null;
  setSelectedAction: (value: "SELL" | "RENT" | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (value: string | null) => void;
  allSubcategories: string[];
}

// Mapping of subcategories to icons
const SubcategoryIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
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
  OTHER: MdFilterList
};

const SubcategoryLabels: { [key: string]: string } = {
  // Vehicle Types
  CAR: "Cars",
  TRUCK: "Trucks",
  MOTORCYCLE: "Motorcycles",
  VAN: "Vans",
  BUS: "Buses",
  TRACTOR: "Tractors",
  RV: "RVs",
  BOAT: "Boats",
  
  // Property Types
  HOUSE: "Houses",
  APARTMENT: "Apartments",
  CONDO: "Condos",
  LAND: "Land",
  COMMERCIAL: "Commercial",
  
  // Fallback
  OTHER: "Other"
};

const ListingFilters: React.FC<ListingFiltersProps> = ({
  selectedAction,
  setSelectedAction,
  selectedSubcategory,
  setSelectedSubcategory,
  allSubcategories,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        {/* Rent/Sell filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedAction(null)}
            className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
              selectedAction === null 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {t("All")}
          </button>
          <button
            onClick={() => setSelectedAction("SELL")}
            className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
              selectedAction === "SELL" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {t("forSale")}
          </button>
          <button
            onClick={() => setSelectedAction("RENT")}
            className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
              selectedAction === "RENT" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {t("forRent")}
          </button>
        </div>

        {/* Subcategory filter */}
        {allSubcategories && allSubcategories.length > 0 && (
          <div className="w-64">
            <Listbox 
              value={selectedSubcategory || ""} 
              onChange={(value) => setSelectedSubcategory(value || null)}
            >
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-full bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span className="block truncate flex items-center">
                    {selectedSubcategory ? (
                      <>
                        {SubcategoryIcons[selectedSubcategory] && React.createElement(SubcategoryIcons[selectedSubcategory], { className: "w-5 h-5 mr-2 inline" })}
                        {SubcategoryLabels[selectedSubcategory] || selectedSubcategory}
                      </>
                    ) : (
                      t("All Categories")
                    )}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <MdFilterList
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                    {/* Add an "All Categories" option */}
                    <Listbox.Option
                      key="all"
                      value=""
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active 
                            ? 'bg-blue-100 text-blue-900' 
                            : 'text-gray-900 dark:text-white'
                        }`
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {t("All Categories")}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? 'text-blue-600' : 'text-blue-600'
                              }`}
                            >
                              <MdCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                    {/* Subcategory options */}
                    {allSubcategories.map((subcategory) => (
                      <Listbox.Option
                        key={subcategory}
                        value={subcategory}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active 
                              ? 'bg-blue-100 text-blue-900' 
                              : 'text-gray-900 dark:text-white'
                          }`
                        }
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate flex items-center ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {SubcategoryIcons[subcategory] && React.createElement(SubcategoryIcons[subcategory], { className: "w-5 h-5 mr-2 inline" })}
                              {SubcategoryLabels[subcategory] || subcategory}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? 'text-blue-600' : 'text-blue-600'
                                }`}
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
        )}
      </div>
    </div>
  );
};

export default ListingFilters;
