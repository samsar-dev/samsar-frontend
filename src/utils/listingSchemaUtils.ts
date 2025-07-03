import type { ListingFieldSchema, SelectOption } from "@/types/listings";
import { carSchema } from "@/components/listings/create/advanced/schemas/carSchema";
import { motorcycleSchema } from "@/components/listings/create/advanced/schemas/motorcycleSchema";
import { truckSchema } from "@/components/listings/create/advanced/schemas/truckSchema";
import { tractorSchema } from "@/components/listings/create/advanced/schemas/tractorSchema";
import { constructionSchema } from "@/components/listings/create/advanced/schemas/constructionSchema";
import { vanSchema } from "@/components/listings/create/advanced/schemas/vanSchema";
import { busSchema } from "@/components/listings/create/advanced/schemas/busSchema";
import { houseSchema } from "@/components/listings/create/advanced/schemas/houseSchema";
import { apartmentSchema } from "@/components/listings/create/advanced/schemas/apartmentSchema";
import { landSchema } from "@/components/listings/create/advanced/schemas/landSchema";
import { VehicleType, PropertyType } from "@/types/enums";
import type { Listing } from "@/types";

// Define a union of all possible listing types
type ListingType =
  | VehicleType
  | PropertyType
  | "OTHER"
  | "RV"
  | "CONDO"
  | "COMMERCIAL";

type SchemaMap = {
  [key in ListingType]: ListingFieldSchema[];
};

// Default empty schema for unsupported types
const emptySchema: ListingFieldSchema[] = [];

const schemaMap: SchemaMap = {
  // Vehicle types
  [VehicleType.CAR]: carSchema,
  [VehicleType.MOTORCYCLE]: motorcycleSchema,
  [VehicleType.TRUCK]: truckSchema,
  [VehicleType.TRACTOR]: tractorSchema,
  [VehicleType.CONSTRUCTION]: constructionSchema,
  [VehicleType.VAN]: vanSchema,
  [VehicleType.BUS]: busSchema,

  // Property types
  [PropertyType.HOUSE]: houseSchema,
  [PropertyType.APARTMENT]: apartmentSchema,
  [PropertyType.LAND]: landSchema,

  // Additional types with empty schemas
  RV: emptySchema,
  OTHER: emptySchema,
  CONDO: emptySchema,
  COMMERCIAL: emptySchema,
};

export const getListingSchema = (
  listingType: VehicleType | PropertyType
): ListingFieldSchema[] => {
  return schemaMap[listingType] || [];
};

export const getFieldByName = (
  listingType: VehicleType | PropertyType,
  fieldName: string
): ListingFieldSchema | undefined => {
  const schema = getListingSchema(listingType);
  return schema.find((field) => field.name === fieldName);
};

export const getFieldsBySection = (
  listingType: VehicleType | PropertyType,
  section: "essential" | "advanced"
): ListingFieldSchema[] => {
  const schema = getListingSchema(listingType);
  return schema.filter((field) => field.section === section);
};

export const getFieldValue = (listing: any, fieldName: string): any => {
  // Early return for invalid inputs
  if (!listing || !fieldName) {
    if (process.env.NODE_ENV === "development") {
      console.log("getFieldValue: Missing listing or fieldName", {
        listing: !!listing,
        fieldName,
      });
    }
    return undefined;
  }

  // Debug: Log the full listing data structure
  if (process.env.NODE_ENV === "development" && fieldName === "debug_all_fields") {
    console.log("Full listing data structure:", JSON.stringify(listing, null, 2));
  }

  // Helper function to safely get value from object path
  const safeGet = (obj: any, path: string) => {
    try {
      return path.split('.').reduce((o, p) => {
        // Skip if object is null or undefined
        if (o == null) return undefined;
        
        // Handle array indices in path (e.g., 'features[0]')
        const arrayMatch = p.match(/(.+?)\[(\d+)\]/);
        if (arrayMatch) {
          const arrayName = arrayMatch[1];
          const index = parseInt(arrayMatch[2], 10);
          return Array.isArray(o[arrayName]) ? o[arrayName][index] : undefined;
        }
        
        // Handle regular property access
        return o[p];
      }, obj);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error accessing path '${path}':`, e);
      }
      return undefined;
    }
  };

  // Common field paths to check
  const paths = [
    // Direct property
    fieldName,
    // Nested under details.vehicles
    `details.vehicles.${fieldName}`,
    // Nested under details.realEstate
    `details.realEstate.${fieldName}`,
    // Try with camelCase if fieldName is in snake_case
    fieldName.includes('_') 
      ? fieldName.split('_').reduce((acc, part, index) => 
          index === 0 ? part : acc + part[0].toUpperCase() + part.slice(1), 
          ''
        )
      : null,
    // Try with snake_case if fieldName is in camelCase
    fieldName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
  ].filter(Boolean) as string[];

  // Try each path until we find a value
  for (const path of paths) {
    const value = safeGet(listing, path);
    if (value !== undefined && value !== null) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Found value for ${fieldName} at path ${path}:`, value);
      }
      return value;
    }
  }

  // Handle special cases for vehicle features and arrays
  if (listing.details?.vehicles) {
    // Check if features is an array and fieldName is in it
    const vehicleFeatures = listing.details.vehicles.features;
    if (Array.isArray(vehicleFeatures)) {
      if (vehicleFeatures.includes(fieldName)) {
        return true; // Feature exists in the features array
      }
      
      // Check if any feature object has a 'name' property matching fieldName
      const feature = vehicleFeatures.find(
        (f: any) => f && typeof f === 'object' && 'name' in f && f.name === fieldName
      );
      if (feature) {
        return feature.value ?? true;
      }
    }

    // Check if field exists directly in vehicles with case-insensitive match
    const vehicleFields = Object.keys(listing.details.vehicles);
    const matchingField = vehicleFields.find(
      field => field.toLowerCase() === fieldName.toLowerCase()
    );

    if (matchingField) {
      const value = listing.details.vehicles[matchingField];
      if (value !== undefined && value !== null) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Found case-insensitive match for ${fieldName} as ${matchingField}:`, value);
        }
        return value;
      }
    }
  }

  // Handle special boolean fields that might be undefined
  const booleanFields = ['isActive', 'isFeatured', 'isAvailable'];
  if (booleanFields.includes(fieldName)) {
    return false; // Default value for boolean fields
  }

  // Handle numeric fields that might be undefined
  const numericFields = ['mileage', 'price', 'year'];
  if (numericFields.includes(fieldName)) {
    return 0; // Default value for numeric fields
  }

  // Return appropriate defaults for different field types
  if (fieldName.endsWith('Date') || fieldName.endsWith('At')) {
    return null; // Default for date fields
  }

  if (fieldName.endsWith('s') && fieldName !== 'status') {
    return []; // Default for array fields (plural names)
  }

  // Try direct access as a last resort
  const directValue = listing[fieldName];
  if (directValue !== undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${fieldName} as direct property:`, directValue);
    }
    return directValue;
  }

  // If we get here, the field wasn't found
  if (process.env.NODE_ENV === "development") {
    console.log(`Field ${fieldName} not found in listing. Tried paths:`, paths);
    console.log("Available keys in listing:", Object.keys(listing));
    if (listing.details) {
      console.log("Available keys in details:", Object.keys(listing.details));
      if (listing.details.vehicles) {
        console.log(
          "Available keys in vehicles:",
          Object.keys(listing.details.vehicles)
        );
      }
      if (listing.details.realEstate) {
        console.log(
          "Available keys in realEstate:",
          Object.keys(listing.details.realEstate)
        );
      }
    }
  }

  return undefined;
};

export const getFieldOptions = (
  listingType: VehicleType | PropertyType,
  fieldName: string
): Array<{ value: string; label: string }> => {
  const field = getFieldByName(listingType, fieldName);
  if (!field?.options) return [];
  // Convert string[] to SelectOption[] if needed
  if (Array.isArray(field.options) && field.options.length > 0) {
    if (typeof field.options[0] === "string") {
      return (field.options as string[]).map((option) => ({
        value: option,
        label: option,
      }));
    }
    return field.options as SelectOption[];
  }
  return [];
};

export const validateField = (
  listingType: VehicleType | PropertyType,
  fieldName: string,
  value: any
): string | null => {
  const field = getFieldByName(listingType, fieldName);
  if (!field?.validate) return null;

  try {
    return field.validate(value);
  } catch (error) {
    console.error(`Validation error for field ${fieldName}:`, error);
    return "Validation error";
  }
};
