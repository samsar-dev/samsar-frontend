// src/components/listings/create/advanced/listingsAdvancedFieldSchema.ts
import type { ListingFieldSchema } from "@/types/listings";
import { VehicleType, PropertyType, Condition } from "@/types/enums";

// Create a union of all possible keys
type SchemaKey = VehicleType | PropertyType;

// Schema loading functions to reduce bundle size
const schemaLoaders = {
  [VehicleType.CAR]: () => import("./schemas/carSchema").then(m => m.carSchema),
  [VehicleType.MOTORCYCLE]: () => import("./schemas/motorcycleSchema").then(m => m.motorcycleSchema),
  [VehicleType.TRUCK]: () => import("./schemas/truckSchema").then(m => m.truckSchema),
  [VehicleType.TRACTOR]: () => import("./schemas/tractorSchema").then(m => m.tractorSchema),
  [VehicleType.CONSTRUCTION]: () => import("./schemas/constructionSchema").then(m => m.constructionSchema),
  [VehicleType.VAN]: () => import("./schemas/vanSchema").then(m => m.vanSchema),
  [VehicleType.BUS]: () => import("./schemas/busSchema").then(m => m.busSchema),
  [PropertyType.HOUSE]: () => import("./schemas/houseSchema").then(m => m.houseSchema),
  [PropertyType.APARTMENT]: () => import("./schemas/apartmentSchema").then(m => m.apartmentSchema),
  [PropertyType.LAND]: () => import("./schemas/landSchema").then(m => m.landSchema),
};

import { FaCarSide } from "@react-icons/all-files/fa/FaCarSide";
import { FaCogs } from "@react-icons/all-files/fa/FaCogs";
import { FaCouch } from "@react-icons/all-files/fa/FaCouch";
import { FaShieldAlt } from "@react-icons/all-files/fa/FaShieldAlt";
import { FaBuilding } from "@react-icons/all-files/fa/FaBuilding";
import { FaCog } from "@react-icons/all-files/fa/FaCog";
import { FaList } from "@react-icons/all-files/fa/FaList";
import { FaTachometerAlt } from "@react-icons/all-files/fa/FaTachometerAlt";
import { FaWheelchair } from "@react-icons/all-files/fa/FaWheelchair";
import { FaPaintBrush } from "@react-icons/all-files/fa/FaPaintBrush";
import { FaTree } from "@react-icons/all-files/fa/FaTree";
import { FaClock } from "@react-icons/all-files/fa/FaClock";

// Define section configuration type
export type SectionId = "essential" | "advanced" | "images";

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
    label: "essentialDetails",
  },
  advanced: {
    order: 2,
    icon: "FaCog",
    label: "advancedDetails",
  },
  images: {
    order: 3,
    icon: "FaList",
    label: "listingImages",
  },
};

// Common fields
const colorField: ListingFieldSchema = {
  name: "color",
  label: "listings.exteriorColor",
  type: "colorpicker",
  section: "appearance",
  required: false,
  validate: (value: string | number | boolean) => {
    const error =
      typeof value === "string" && value.length > 50
        ? ("Color must be 50 characters or less" as string)
        : null;
    if (error) {
      console.log(
        "[listingsAdvancedFieldSchema] Validation error:",
        error,
        "Input value:",
        value,
      );
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
  validate: (value: string | number | boolean) => {
    const error = !Object.values(Condition).includes(value as Condition)
      ? "Invalid condition value"
      : null;
    if (error) {
      console.log(
        "[listingsAdvancedFieldSchema] Validation error:",
        error,
        "Input value:",
        value,
      );
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

// Dynamic schema loading functions
export const loadSchema = async (type: VehicleType | PropertyType): Promise<ListingFieldSchema[]> => {
  const loader = schemaLoaders[type as keyof typeof schemaLoaders];
  if (!loader) return [];
  
  const schema = await loader();
  
  // Add common fields based on type
  if (Object.values(VehicleType).includes(type as VehicleType)) {
    if (type === VehicleType.CAR) return schema; // CAR schema already has all fields
    if ([VehicleType.MOTORCYCLE, VehicleType.VAN, VehicleType.BUS].includes(type as VehicleType)) {
      return [...schema, colorField];
    }
    return schema;
  }
  
  if (Object.values(PropertyType).includes(type as PropertyType)) {
    if ([PropertyType.HOUSE, PropertyType.APARTMENT].includes(type as PropertyType)) {
      return [...schema, conditionField];
    }
    return schema;
  }
  
  return schema;
};

// Legacy static schema map (deprecated - use loadSchema instead)
export const listingsAdvancedFieldSchema: Record<SchemaKey, ListingFieldSchema[]> = {
  // Vehicle types
  [VehicleType.CAR]: [],
  [VehicleType.MOTORCYCLE]: [],
  [VehicleType.TRUCK]: [],
  [VehicleType.TRACTOR]: [],
  [VehicleType.CONSTRUCTION]: [],
  [VehicleType.VAN]: [],
  [VehicleType.BUS]: [],
  [VehicleType.RV]: [],
  [VehicleType.OTHER]: [],
  
  // Property types
  [PropertyType.HOUSE]: [],
  [PropertyType.APARTMENT]: [],
  [PropertyType.LAND]: [],
  [PropertyType.CONDO]: [],
  [PropertyType.COMMERCIAL]: [],
};

// Dynamic field list loading functions
export const loadFieldList = async (type: VehicleType | PropertyType): Promise<ListingFieldSchema[]> => {
  return loadSchema(type);
};

// Legacy static field lists (deprecated - use loadFieldList instead)
export const carAdvancedFieldList: ListingFieldSchema[] = [];
export const busAdvancedFieldList: ListingFieldSchema[] = [];
export const motorcycleAdvancedFieldList: ListingFieldSchema[] = [];
export const truckAdvancedFieldList: ListingFieldSchema[] = [];
export const vanAdvancedFieldList: ListingFieldSchema[] = [];
export const tractorAdvancedFieldList: ListingFieldSchema[] = [];
export const constructionAdvancedFieldList: ListingFieldSchema[] = [];
export const houseAdvancedFieldList: ListingFieldSchema[] = [];
export const apartmentAdvancedFieldList: ListingFieldSchema[] = [];
export const landAdvancedFieldList: ListingFieldSchema[] = [];

// Dynamic lookup functions for review section
export const loadVehicleFieldList = async (vehicleType: VehicleType): Promise<ListingFieldSchema[]> => {
  return loadSchema(vehicleType);
};

export const loadPropertyFieldList = async (propertyType: PropertyType): Promise<ListingFieldSchema[]> => {
  return loadSchema(propertyType);
};

// Legacy static maps (deprecated - use load functions instead)
export const vehicleAdvancedFieldLists = {};
export const propertyAdvancedFieldLists = {};

export const validateAdvancedFields = (values: any) => {
  console.log(
    "[listingsAdvancedFieldSchema] validateAdvancedFields input values:",
    values,
  );
  return true;
};
