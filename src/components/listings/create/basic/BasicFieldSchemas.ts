export type PropertySubtype =
  | "house"
  | "apartment"
  | "land"
  | "commercial"
  | "condo"
  | "other";

export interface BasicField {
  label: string; // i18n translation key
  name: string;
  type: "number" | "boolean" | "select";
  required: boolean;
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
}

const yearOptions: Array<{ value: string; label: string }> = Array.from(
  { length: new Date().getFullYear() - 1900 + 1 },
  (_, i) => {
    const year = (1900 + i).toString();
    return { value: year, label: year };
  }
);

export const realEstateBasicFields: Record<PropertySubtype, BasicField[]> = {
  house: [
    {
      label: "propertyDetails.totalArea",
      name: "size",
      type: "number",
      required: true,
      placeholder: "propertyDetails.totalAreaPlaceholder",
    },
    {
      label: "propertyDetails.yearBuilt",
      name: "yearBuilt",
      type: "select",
      required: true,
      options: yearOptions,
      placeholder: "propertyDetails.yearBuiltPlaceholder",
    },
    {
      label: "propertyDetails.bedrooms",
      name: "bedrooms",
      type: "number",
      required: true,
      placeholder: "propertyDetails.bedroomsPlaceholder",
    },
    {
      label: "propertyDetails.bathrooms",
      name: "bathrooms",
      type: "number",
      required: true,
      placeholder: "propertyDetails.bathroomsPlaceholder",
      helpText: "propertyDetails.bathroomsHelpText",
      step: 0.5,
    },
  ],
  apartment: [
    {
      label: "propertyDetails.totalArea",
      name: "size",
      type: "number",
      required: true,
      placeholder: "propertyDetails.totalAreaPlaceholder",
    },
    {
      label: "propertyDetails.bedrooms",
      name: "bedrooms",
      type: "number",
      required: true,
      placeholder: "propertyDetails.bedroomsPlaceholder",
    },
    {
      label: "propertyDetails.bathrooms",
      name: "bathrooms",
      type: "number",
      required: true,
      placeholder: "propertyDetails.bathroomsPlaceholder",
      step: 0.5,
    },
    {
      label: "propertyDetails.floorLevel",
      name: "floor",
      type: "number",
      required: true,
      min: 1,
      max: 100,
      placeholder: "propertyDetails.floorLevelPlaceholder",
    },
    {
      label: "propertyDetails.yearBuilt",
      name: "yearBuilt",
      type: "select",
      required: true,
      options: yearOptions,
      placeholder: "propertyDetails.yearBuiltPlaceholder",
    },
  ],
  condo: [
    {
      label: "propertyDetails.totalArea",
      name: "size",
      type: "number",
      required: true,
      placeholder: "propertyDetails.totalAreaPlaceholder",
    },
    {
      label: "propertyDetails.bedrooms",
      name: "bedrooms",
      type: "number",
      required: true,
      placeholder: "propertyDetails.bedroomsPlaceholder",
    },
    {
      label: "propertyDetails.bathrooms",
      name: "bathrooms",
      type: "number",
      required: true,
      placeholder: "propertyDetails.bathroomsPlaceholder",
      step: 0.5,
    },
    {
      label: "propertyDetails.floorLevel",
      name: "floor",
      type: "number",
      required: true,
      min: 1,
      max: 100,
      placeholder: "propertyDetails.floorLevelPlaceholder",
    },
    {
      label: "propertyDetails.yearBuilt",
      name: "yearBuilt",
      type: "select",
      required: true,
      options: yearOptions,
      placeholder: "propertyDetails.yearBuiltPlaceholder",
    },
  ],
  land: [
    {
      label: "propertyDetails.landArea",
      name: "size",
      type: "number",
      required: true,
      placeholder: "propertyDetails.landAreaPlaceholder",
    },
    {
      label: "propertyDetails.isBuildable",
      name: "buildable",
      type: "boolean",
      required: true,
      placeholder: "propertyDetails.isBuildablePlaceholder",
    },
    {
      label: "propertyDetails.yearBuilt",
      name: "yearBuilt",
      type: "select",
      required: true,
      options: yearOptions,
      placeholder: "propertyDetails.yearBuiltPlaceholder",
    },
  ],
  commercial: [
    {
      label: "propertyDetails.totalArea",
      name: "size",
      type: "number",
      required: true,
      placeholder: "propertyDetails.totalAreaPlaceholder",
    },
    {
      label: "propertyDetails.usageType",
      name: "usageType",
      type: "select",
      required: true,
      placeholder: "propertyDetails.usageTypePlaceholder",
      options: [
        { value: "Retail", label: "propertyDetails.usageTypeRetail" },
        { value: "Office", label: "propertyDetails.usageTypeOffice" },
        { value: "Industrial", label: "propertyDetails.usageTypeIndustrial" },
        { value: "Warehouse", label: "propertyDetails.usageTypeWarehouse" },
        { value: "Hospitality", label: "propertyDetails.usageTypeHospitality" },
        { value: "Mixed-use", label: "propertyDetails.usageTypeMixedUse" },
        { value: "Other", label: "propertyDetails.usageTypeOther" },
      ],
    },
    {
      label: "propertyDetails.yearBuilt",
      name: "yearBuilt",
      type: "select",
      required: true,
      options: yearOptions,
      placeholder: "propertyDetails.yearBuiltPlaceholder",
    },
  ],
  other: [
    {
      label: "propertyDetails.totalArea",
      name: "size",
      type: "number",
      required: true,
      placeholder: "propertyDetails.totalAreaPlaceholder",
    },
    {
      label: "propertyDetails.yearBuilt",
      name: "yearBuilt",
      type: "select",
      required: true,
      options: yearOptions,
      placeholder: "propertyDetails.yearBuiltPlaceholder",
    },
  ],
};
