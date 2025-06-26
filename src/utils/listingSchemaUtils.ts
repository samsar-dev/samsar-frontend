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
  if (!listing || !fieldName) {
    if (process.env.NODE_ENV === "development") {
      console.log("getFieldValue: Missing listing or fieldName", {
        listing,
        fieldName,
      });
    }
    return undefined;
  }

  // Debug: Log the full listing data structure
  if (
    process.env.NODE_ENV === "development" &&
    fieldName === "debug_all_fields"
  ) {
    console.log(
      "Full listing data structure:",
      JSON.stringify(listing, null, 2)
    );
  }

  // Helper function to safely get value from object path
  const safeGet = (obj: any, path: string) => {
    try {
      return path.split(".").reduce((o, p) => o?.[p], obj);
    } catch (e) {
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
    fieldName.includes("_")
      ? fieldName.split("_").reduce((acc, part, index) => {
          return index === 0
            ? part
            : acc + part[0].toUpperCase() + part.slice(1);
        }, "")
      : null,
    // Try with snake_case if fieldName is in camelCase
    fieldName.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
  ].filter(Boolean);

  // Try each path until we find a value
  for (const path of paths.filter((p): p is string => p !== null)) {
    const value = safeGet(listing, path);

    // If we found a value that's not undefined or null, return it
    if (value !== undefined && value !== null) {
      if (process.env.NODE_ENV === "development") {
        console.log(`Found value for ${fieldName} at path ${path}:`, value);
      }
      return value;
    }
  }

  // Special handling for array fields that might be empty
  if (
    listing.details?.vehicles?.[fieldName] === null ||
    listing.details?.realEstate?.[fieldName] === null
  ) {
    return [];
  }

  // Try to find the field in the details.vehicles object
  if (listing.details?.vehicles) {
    const vehicleFields = Object.keys(listing.details.vehicles);
    const matchingField = vehicleFields.find(
      (field) => field.toLowerCase() === fieldName.toLowerCase()
    );

    if (matchingField) {
      const value = listing.details.vehicles[matchingField];
      if (value !== undefined && value !== null) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `Found case-insensitive match for ${fieldName} as ${matchingField}:`,
            value
          );
        }
        return value;
      }
    }
  }

  // Try direct access as a last resort
  const directValue = listing[fieldName];
  if (directValue !== undefined) {
    if (process.env.NODE_ENV === "development") {
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
