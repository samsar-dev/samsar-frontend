import React from "react";
import type { SelectOption } from "@/types/common";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

interface VehicleFiltersProps {
  onFilterChange: (filterName: string, value: string | number) => void;
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({ onFilterChange }) => {
  const { t } = useTranslation();

  const vehicleTypeOptions: SelectOption[] = [
    { value: "", label: t("all_types") },
    { value: "car", label: t("car") },
    { value: "truck", label: t("truck") },
    { value: "motorcycle", label: t("motorcycle") },
    { value: "rv", label: t("rv") },
  ];

  return (
    <div className="space-y-4">
      <Button.FormField
        label={t("vehicle_type")}
        name="vehicleType"
        type="select"
        value=""
        onChange={(value) => onFilterChange("vehicleType", value)}
        options={vehicleTypeOptions}
      />
      <Button.FormField
        label={t("make")}
        name="make"
        type="text"
        value=""
        onChange={(value) => onFilterChange("make", value)}
      />
      <Button.FormField
        label={t("model")}
        name="model"
        type="text"
        value=""
        onChange={(value) => onFilterChange("model", value)}
      />
      <Button.FormField
        label={t("min_year")}
        name="minYear"
        type="number"
        value=""
        onChange={(value) => onFilterChange("minYear", value)}
        min={1900}
        max={new Date().getFullYear() + 1}
      />
      <Button.FormField
        label={t("max_year")}
        name="maxYear"
        type="number"
        value=""
        onChange={(value) => onFilterChange("maxYear", value)}
        min={1900}
        max={new Date().getFullYear() + 1}
      />
      <Button.FormField
        label={t("min_price")}
        name="minPrice"
        type="number"
        value=""
        onChange={(value) => onFilterChange("minPrice", value)}
        prefix="$"
      />
      <Button.FormField
        label={t("max_price")}
        name="maxPrice"
        type="number"
        value=""
        onChange={(value) => onFilterChange("maxPrice", value)}
        prefix="$"
      />
    </div>
  );
};

export default VehicleFilters;
