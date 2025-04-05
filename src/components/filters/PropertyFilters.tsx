import React from "react";
import type { SelectOption } from "@/types/common";
import { FormInput } from "@/components/listings/data/listingsData";
import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/FormField"; // Adjust import for FormField

interface PropertyFiltersProps {
  onFilterChange: (filterName: string, value: string | number) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  onFilterChange,
}) => {
  const { t } = useTranslation();

  const propertyTypeOptions: SelectOption[] = [
    { value: "", label: "All Types" },
    { value: "house", label: "House" },
    { value: "apartment", label: "Apartment" },
    { value: "condo", label: "Condo" },
    { value: "land", label: "Land" },
  ];

  const handleFilterChange = (filterName: string, value: string | number) => {
    onFilterChange(filterName, value);
  };

  return (
    <div className="space-y-4">
      <FormField
        label="Property Type"
        name="propertyType"
        type="select"
        value=""
        onChange={(value) => handleFilterChange("propertyType", value)}
        options={propertyTypeOptions}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Min Price"
          name="minPrice"
          type="number"
          value=""
          onChange={(value) => handleFilterChange("minPrice", value)}
          prefix="$"
        />
        <FormField
          label="Max Price"
          name="maxPrice"
          type="number"
          value=""
          onChange={(value) => handleFilterChange("maxPrice", value)}
          prefix="$"
        />
      </div>

      <FormField
        label="Bedrooms"
        name="bedrooms"
        type="number"
        value=""
        onChange={(value) => handleFilterChange("bedrooms", value)}
        min={0}
      />

      <FormField
        label="Bathrooms"
        name="bathrooms"
        type="number"
        value=""
        onChange={(value) => handleFilterChange("bathrooms", value)}
        min={0}
        step={0.5}
      />

      <FormInput
        label={t("location")}
        name="location"
        type="text"
        value=""
        onChange={(e) => handleFilterChange("location", e.target.value)}
        placeholder={t("enter_location")}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label={t("min_area")}
          name="areaMin"
          type="number"
          value=""
          onChange={(e) => handleFilterChange("areaMin", e.target.value)}
          placeholder={t("enter_min_area")}
          suffix="m²"
        />
        <FormInput
          label={t("max_area")}
          name="areaMax"
          type="number"
          value=""
          onChange={(e) => handleFilterChange("areaMax", e.target.value)}
          placeholder={t("enter_max_area")}
          suffix="m²"
        />
      </div>
    </div>
  );
};

export default PropertyFilters;
