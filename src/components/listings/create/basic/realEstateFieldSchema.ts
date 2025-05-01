// src/components/listings/create/basic/realEstateFieldOptions.ts

import type { SelectOption } from "@/types/listings";

export const yesNoOptions: SelectOption[] = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

export const zoningOptions: SelectOption[] = [
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Industrial", value: "industrial" },
  { label: "Agricultural", value: "agricultural" },
  { label: "Mixed-use", value: "mixed_use" },
  { label: "Recreational", value: "recreational" },
];

export const propertyConditionOptions: SelectOption[] = [
  { label: "New", value: "new" },
  { label: "Excellent", value: "excellent" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Needs Work", value: "needs_work" },
  { label: "Fixer-upper", value: "fixer_upper" },
];

export const propertyUsageOptions: SelectOption[] = [
  { label: "Retail", value: "retail" },
  { label: "Office", value: "office" },
  { label: "Industrial", value: "industrial" },
  { label: "Warehouse", value: "warehouse" },
  { label: "Hospitality", value: "hospitality" },
  { label: "Mixed-use", value: "mixed_use" },
  { label: "Other", value: "other" },
];

export const accessRoadOptions: SelectOption[] = yesNoOptions;

export const isBuildableOptions: SelectOption[] = yesNoOptions;

export const hasGarageOptions: SelectOption[] = yesNoOptions;
export const hasGardenOptions: SelectOption[] = yesNoOptions;
export const hasBalconyOptions: SelectOption[] = yesNoOptions;
export const hasElevatorOptions: SelectOption[] = yesNoOptions;
export const hasPoolOptions: SelectOption[] = yesNoOptions;
export const hasGymOptions: SelectOption[] = yesNoOptions;

export const customFeatureOptions: SelectOption[] = [
  { label: "Furnished", value: "furnished" },
  { label: "Basement", value: "basement" },
  { label: "Security System", value: "security" },
  { label: "Fireplace", value: "fireplace" },
  { label: "Smart Home", value: "smart_home" },
];

export const floorOptions = Array.from({ length: 50 }, (_, i) => ({
  label: `${i}`,
  value: `${i}`,
}));

export const totalFloorsOptions = floorOptions;

export const yearBuiltOptions = Array.from(
  { length: new Date().getFullYear() - 1900 + 1 },
  (_, i) => {
    const year = 1900 + i;
    return { label: `${year}`, value: `${year}` };
  }
);
