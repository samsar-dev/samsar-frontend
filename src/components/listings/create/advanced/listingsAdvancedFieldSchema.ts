// src/components/listings/create/advanced/listingsAdvancedFieldSchema.ts
import { ListingFieldSchema } from "@/types/listings";
import { VehicleType, PropertyType, Condition } from "@/types/enums";

// Import individual schemas
import { carSchema } from './schemas/carSchema';
import { motorcycleSchema } from './schemas/motorcycleSchema';
import { truckSchema } from './schemas/truckSchema';
import { constructionSchema } from './schemas/constructionSchema';
import { vanSchema } from './schemas/vanSchema';
import { busSchema } from './schemas/busSchema';
import { houseSchema } from './schemas/houseSchema';
import { apartmentSchema } from './schemas/apartmentSchema';

// Define section configuration type
export type SectionId = 
  | 'essential'
  | 'advanced';

export interface SectionConfig {
  order: number;
  icon: string;
  label: string;
}

// Define section order and metadata
export const SECTION_CONFIG: Record<SectionId, SectionConfig> = {
  essential: {
    order: 1,
    icon: 'FaCarSide',
    label: 'sections.essential'
  },
  advanced: {
    order: 2,
    icon: 'FaCog',
    label: 'sections.advanced'
  }
};

// Common fields
const colorField: ListingFieldSchema = {
  name: 'color',
  label: 'listings.exteriorColor',
  type: 'colorpicker',
  section: 'appearance',
  required: false,
  validate: (value: string) => value.length <= 50 ? null : 'Color must be 50 characters or less'
};

const conditionField: ListingFieldSchema = {
  name: 'condition',
  label: 'listings.condition',
  type: 'select',
  options: Object.values(Condition),
  section: 'essential',
  required: true,
  validate: (value: string) => Object.values(Condition).includes(value as Condition) ? null : 'Invalid condition value'
};

// Base schema for empty categories to avoid errors
const baseVehicleSchema: ListingFieldSchema[] = [
  {
    name: 'make',
    label: 'listings.make',
    type: 'text',
    section: 'essential',
    required: true
  },
  {
    name: 'model',
    label: 'listings.model',
    type: 'text',
    section: 'essential',
    required: true
  },
  {
    name: 'year',
    label: 'listings.year',
    type: 'text',
    section: 'essential',
    required: true
  },
  {
    name: 'condition',
    label: 'listings.condition',
    type: 'select',
    options: Object.values(Condition),
    section: 'essential',
    required: true
  }
];

const baseRealEstateSchema: ListingFieldSchema[] = [
  {
    name: 'propertyType',
    label: 'listings.propertyType',
    type: 'select',
    options: Object.values(PropertyType),
    section: 'essential',
    required: true
  },
  {
    name: 'condition',
    label: 'listings.condition',
    type: 'select',
    options: Object.values(Condition),
    section: 'essential',
    required: true
  }
];

// Create schema map for all vehicle types
const vehicleSchemas: Partial<Record<VehicleType, ListingFieldSchema[]>> = {
  [VehicleType.CAR]: [...carSchema, colorField],
  [VehicleType.MOTORCYCLE]: [...motorcycleSchema, colorField],
  [VehicleType.TRUCK]: [...truckSchema, colorField],
  [VehicleType.VAN]: [...vanSchema, colorField],
  [VehicleType.BUS]: [...busSchema, colorField],
  [VehicleType.CONSTRUCTION]: [...constructionSchema],
  [VehicleType.RV]: [...baseVehicleSchema],
  [VehicleType.BOAT]: [...baseVehicleSchema],
  [VehicleType.OTHER]: [...baseVehicleSchema],
};

// Create schema map for all property types
const propertySchemas: Partial<Record<PropertyType, ListingFieldSchema[]>> = {
  [PropertyType.HOUSE]: [...houseSchema, conditionField],
  [PropertyType.APARTMENT]: [...apartmentSchema, conditionField],
  [PropertyType.CONDO]: [...baseRealEstateSchema],
  [PropertyType.LAND]: [...baseRealEstateSchema],
  [PropertyType.COMMERCIAL]: [...baseRealEstateSchema],
  [PropertyType.OTHER]: [...baseRealEstateSchema],
};

// Combine both schema maps
export const listingsAdvancedFieldSchema: Record<string, ListingFieldSchema[]> = {
  ...vehicleSchemas,
  ...propertySchemas
};
