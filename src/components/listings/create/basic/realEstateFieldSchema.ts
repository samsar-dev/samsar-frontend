// types/realEstateBasicFields.ts
export type PropertySubtype = 'house' | 'apartment' | 'land' | 'commercial' | 'condo' | 'other';

export interface BasicField {
  label: string;
  name: string;
  type: 'number' | 'boolean' | 'select';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[]; // for select
}

export const realEstateBasicFields: Record<PropertySubtype, BasicField[]> = {
  house: [
    { label: 'Total Area (m²)', name: 'totalArea', type: 'number', required: true, placeholder: 'Enter total area in square meters' },
    { label: 'Bedrooms', name: 'bedrooms', type: 'number', required: true, placeholder: 'Enter number of bedrooms' },
    { label: 'Bathrooms', name: 'bathrooms', type: 'number', required: true, placeholder: 'Enter number of bathrooms', helpText: 'Half bathrooms allowed', step: 0.5 },
    { label: 'Year Built', name: 'yearBuilt', type: 'number', required: true, placeholder: 'Enter year built', min: 1900, max: new Date().getFullYear() },
  ],
  apartment: [
    { label: 'Total Area (m²)', name: 'totalArea', type: 'number', required: true, placeholder: 'Enter total area in square meters' },
    { label: 'Bedrooms', name: 'bedrooms', type: 'number', required: true },
    { label: 'Bathrooms', name: 'bathrooms', type: 'number', required: true, step: 0.5 },
    { label: 'Floor Level', name: 'floorLevel', type: 'number', required: true, min: 1, max: 100 },
    { label: 'Year Built', name: 'yearBuilt', type: 'number', required: true, placeholder: 'Enter year built', min: 1900, max: new Date().getFullYear() },
  ],
  condo: [
    { label: 'Total Area (m²)', name: 'totalArea', type: 'number', required: true, placeholder: 'Enter total area in square meters' },
    { label: 'Bedrooms', name: 'bedrooms', type: 'number', required: true },
    { label: 'Bathrooms', name: 'bathrooms', type: 'number', required: true, step: 0.5 },
    { label: 'Floor Level', name: 'floorLevel', type: 'number', required: true, min: 1, max: 100 },
    { label: 'Year Built', name: 'yearBuilt', type: 'number', required: true, placeholder: 'Enter year built', min: 1900, max: new Date().getFullYear() },
  ],
  land: [
    { label: 'Land Area (m²)', name: 'totalArea', type: 'number', required: true, placeholder: 'Enter land area in square meters' },
    { label: 'Is Buildable', name: 'isBuildable', type: 'boolean', required: false },
  ],
  commercial: [
    { label: 'Total Area (m²)', name: 'totalArea', type: 'number', required: true, placeholder: 'Enter total area in square meters' },
    { label: 'Usage Type', name: 'usageType', type: 'select', required: true, options: ['Retail', 'Office', 'Industrial', 'Warehouse', 'Hospitality', 'Mixed-use', 'Other'] },
    { label: 'Year Built', name: 'yearBuilt', type: 'number', required: true, placeholder: 'Enter year built', min: 1900, max: new Date().getFullYear() },
  ],
  other: [
    { label: 'Total Area (m²)', name: 'totalArea', type: 'number', required: true, placeholder: 'Enter total area in square meters' },
    { label: 'Year Built', name: 'yearBuilt', type: 'number', required: true, placeholder: 'Enter year built', min: 1900, max: new Date().getFullYear() },
  ],
};

 