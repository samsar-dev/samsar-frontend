// src/components/listings/create/advanced/listingsAdvancedFieldSchema.ts
import type { ListingFieldSchema } from "@/types/listings";
import { VehicleType, PropertyType, Condition } from "@/types/enums";

// Import individual schemas
import { carSchema } from "./schemas/carSchema";
import { motorcycleSchema } from "./schemas/motorcycleSchema";
import { truckSchema } from "./schemas/truckSchema";
import { tractorSchema } from "./schemas/tractorSchema";
import { constructionSchema } from "./schemas/constructionSchema";
import { vanSchema } from "./schemas/vanSchema";
import { busSchema } from "./schemas/busSchema";
import { houseSchema } from "./schemas/houseSchema";
import { apartmentSchema } from "./schemas/apartmentSchema";
import { landSchema } from "./schemas/landSchema";

import {
  FaCarSide,
  FaCogs,
  FaCouch,
  FaShieldAlt,
  FaBuilding,
  FaCog,
  FaList,
  FaTachometerAlt,
  FaWheelchair,
  FaPaintBrush,
  FaTree,
  FaClock,
} from "react-icons/fa";

// Define section configuration type
export type SectionId = "essential" | "advanced";

export interface SectionConfig {
  order: number;
  icon: string;
  label: string;
}

export const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FaCarSide,
    FaCogs,
    FaCouch,
    FaShieldAlt,
    FaBuilding,
    FaCog,
    FaList,
    FaTachometerAlt,
    FaWheelchair,
    FaPaintBrush,
    FaTree,
    FaClock,
  };
  return iconMap[iconName] || FaCog;
};

// Define section order and metadata
export const SECTION_CONFIG: Record<SectionId, SectionConfig> = {
  essential: {
    order: 1,
    icon: "FaCarSide",
    label: "sections.essential",
  },
  advanced: {
    order: 2,
    icon: "FaCog",
    label: "sections.advanced",
  },
};

// Common fields
const colorField: ListingFieldSchema = {
  name: "color",
  label: "listings.exteriorColor",
  type: "colorpicker",
  section: "appearance",
  required: false,
  validate: (value: string) => {
    const error = value.length > 50 ? "Color must be 50 characters or less" : null;
    if (error) {
      console.log('[listingsAdvancedFieldSchema] Validation error:', error, 'Input value:', value);
    }
    return error;
  },
};

const conditionField: ListingFieldSchema = {
  name: "condition",
  label: "listings.condition",
  type: "select",
  options: Object.values(Condition),
  section: "essential",
  required: true,
  validate: (value: string) => {
    const error = !Object.values(Condition).includes(value as Condition) ? "Invalid condition value" : null;
    if (error) {
      console.log('[listingsAdvancedFieldSchema] Validation error:', error, 'Input value:', value);
    }
    return error;
  },
};

// Base schema for empty categories to avoid errors
const baseVehicleSchema: ListingFieldSchema[] = [
  {
    name: "make",
    label: "listings.make",
    type: "text",
    section: "essential",
    required: true,
  },
  {
    name: "model",
    label: "listings.model",
    type: "text",
    section: "essential",
    required: true,
  },
  {
    name: "year",
    label: "listings.year",
    type: "text",
    section: "essential",
    required: true,
  },
  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: Object.values(Condition),
    section: "essential",
    required: true,
  },
];

const baseRealEstateSchema: ListingFieldSchema[] = [
  {
    name: "propertyType",
    label: "listings.propertyType",
    type: "select",
    options: Object.values(PropertyType),
    section: "essential",
    required: true,
  },
  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: Object.values(Condition),
    section: "essential",
    required: true,
  },
];

// Create schema map for all vehicle types
// NOTE: For VehicleType.CAR, we use ONLY carSchema, which already contains all required fields and validation logic.
const vehicleSchemas: Partial<Record<VehicleType, ListingFieldSchema[]>> = {
  [VehicleType.CAR]: carSchema, // Do NOT add colorField or any overrides for cars!
  [VehicleType.MOTORCYCLE]: [...motorcycleSchema, colorField],
  [VehicleType.TRUCK]: truckSchema,
  [VehicleType.TRACTOR]: tractorSchema,
  [VehicleType.VAN]: [...vanSchema, colorField],
  [VehicleType.BUS]: [...busSchema, colorField],
  [VehicleType.CONSTRUCTION]: [...constructionSchema],
  [VehicleType.RV]: [...baseVehicleSchema],
  [VehicleType.OTHER]: [...baseVehicleSchema],
};

// Create schema map for all property types
const propertySchemas: Partial<Record<PropertyType, ListingFieldSchema[]>> = {
  [PropertyType.HOUSE]: [...houseSchema, conditionField],
  [PropertyType.APARTMENT]: [...apartmentSchema, conditionField],
  [PropertyType.CONDO]: [...baseRealEstateSchema],
  [PropertyType.LAND]: [...landSchema],
  [PropertyType.COMMERCIAL]: [...baseRealEstateSchema],
  [PropertyType.OTHER]: [...baseRealEstateSchema],
};

// Combine both schema maps
export const listingsAdvancedFieldSchema = {
  [VehicleType.CAR]: carSchema,
  [VehicleType.MOTORCYCLE]: motorcycleSchema,
  [VehicleType.TRUCK]: truckSchema,
  [VehicleType.TRACTOR]: tractorSchema,
  [VehicleType.CONSTRUCTION]: constructionSchema,
  [VehicleType.VAN]: vanSchema,
  [VehicleType.BUS]: busSchema,
  [PropertyType.HOUSE]: houseSchema,
  [PropertyType.APARTMENT]: apartmentSchema,
  [PropertyType.LAND]: landSchema,
};

// Export individual field lists
export const carAdvancedFieldList: ListingFieldSchema[] = [...carSchema];
export const busAdvancedFieldList: ListingFieldSchema[] = [...busSchema];
export const motorcycleAdvancedFieldList: ListingFieldSchema[] = [...motorcycleSchema];
export const truckAdvancedFieldList: ListingFieldSchema[] = [...truckSchema];
export const vanAdvancedFieldList: ListingFieldSchema[] = [...vanSchema];
export const tractorAdvancedFieldList: ListingFieldSchema[] = [...tractorSchema];
export const constructionAdvancedFieldList: ListingFieldSchema[] = [...constructionSchema];
export const houseAdvancedFieldList: ListingFieldSchema[] = [...houseSchema];
export const apartmentAdvancedFieldList: ListingFieldSchema[] = [...apartmentSchema];
export const landAdvancedFieldList: ListingFieldSchema[] = [...landSchema];

// Map for dynamic lookup in review section
export const vehicleAdvancedFieldLists = {
  CAR: carAdvancedFieldList,
  BUS: busAdvancedFieldList,
  MOTORCYCLE: motorcycleAdvancedFieldList,
  TRUCK: truckAdvancedFieldList,
  VAN: vanAdvancedFieldList,
  TRACTOR: tractorAdvancedFieldList,
  CONSTRUCTION: constructionAdvancedFieldList,
};

export const propertyAdvancedFieldLists = {
  HOUSE: houseAdvancedFieldList,
  APARTMENT: apartmentAdvancedFieldList,
  LAND: landAdvancedFieldList,
};

export const validateAdvancedFields = (values: any) => {
  console.log('[listingsAdvancedFieldSchema] validateAdvancedFields input values:', values);
  return true;
};