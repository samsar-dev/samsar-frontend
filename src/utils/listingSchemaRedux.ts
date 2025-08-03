import type { VehicleType, PropertyType } from "@/types/enums";
import {
  getFieldsBySection,
  getFieldValue as getFieldValueUtil,
  validateField as validateFieldUtil,
} from "./listingSchemaUtils";
import type { ListingFieldSchema } from "@/types/listings";

// Define valid section types
type SectionType = "essential" | "advanced";

// Define all possible field types that match the expected types in the schema
type FieldType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "date"
  | "textarea"
  | "color"
  | "featureGroup";

// Extend the base field schema to include additional properties
export interface ExtendedFieldSchema extends Omit<ListingFieldSchema, "type"> {
  type: FieldType;
  defaultValue?: any;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export const getSchemaFieldsForSection = (
  listingType: VehicleType | PropertyType,
  section: SectionType,
): ListingFieldSchema[] => {
  return getFieldsBySection(listingType, section);
};

export const getFieldValueFromState = (state: any, fieldName: string): any => {
  return getFieldValueUtil(state, fieldName);
};

// Re-export validateField from listingSchemaUtils
export const validateField = validateFieldUtil;

export const validateFieldValue = (
  listingType: VehicleType | PropertyType,
  fieldName: string,
  value: any,
): string | null => {
  return validateFieldUtil(listingType, fieldName, value);
};

// Helper function to get default value based on field type
const getDefaultValue = (type: string): any => {
  switch (type) {
    case "number":
      return 0;
    case "boolean":
      return false;
    case "multiselect":
      return [];
    case "date":
      return null;
    case "select":
    case "text":
    case "textarea":
    case "color":
    case "featureGroup":
    default:
      return "";
  }
};

export const getInitialValuesFromSchema = (
  schema: ListingFieldSchema[],
): Record<string, any> => {
  return schema.reduce(
    (initialValues, field) => {
      // Always use getDefaultValue since defaultValue doesn't exist on ListingFieldSchema
      initialValues[field.name] = getDefaultValue(field.type);
      return initialValues;
    },
    {} as Record<string, any>,
  );
};

export const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

export const setNestedValue = (obj: any, path: string, value: any): any => {
  const [first, ...rest] = path.split(".");

  if (rest.length === 0) {
    return { ...obj, [first]: value };
  }

  return {
    ...obj,
    [first]: setNestedValue(obj[first] || {}, rest.join("."), value),
  };
};
