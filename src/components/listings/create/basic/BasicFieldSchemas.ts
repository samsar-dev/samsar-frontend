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
  options?: Array<{ value: string; label: string }>; // for select
}

export const realEstateBasicFields: Record<PropertySubtype, BasicField[]> = {
  house: [
    { label: 'Total Area (m²)', name: 'size', type: 'number', required: true, placeholder: 'Enter total area in square meters' },
    { 
      label: 'Year Built', 
      name: 'yearBuilt', 
      type: 'select', 
      required: true, 
      options: Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => ({
        value: (1900 + i).toString(),
        label: (1900 + i).toString()
      })),
      placeholder: 'Select year built'
    },
    { label: 'Bedrooms', name: 'bedrooms', type: 'number', required: true, placeholder: 'Enter number of bedrooms' },
    { label: 'Bathrooms', name: 'bathrooms', type: 'number', required: true, placeholder: 'Enter number of bathrooms', helpText: 'Half bathrooms allowed', step: 0.5 }
  ],
  apartment: [
    { label: 'Total Area (m²)', name: 'size', type: 'number', required: true, placeholder: 'Enter total area in square meters' },
    { label: 'Bedrooms', name: 'bedrooms', type: 'number', required: true },
    { label: 'Bathrooms', name: 'bathrooms', type: 'number', required: true, step: 0.5 },
    { label: 'Floor Level', name: 'floor', type: 'number', required: true, min: 1, max: 100 },
    { 
      label: 'Year Built', 
      name: 'yearBuilt', 
      type: 'select', 
      required: true, 
      options: Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => ({
        value: (1900 + i).toString(),
        label: (1900 + i).toString()
      })),
      placeholder: 'Select year built'
    }
  ],
  condo: [
    { label: 'Total Area (m²)', name: 'size', type: 'number', required: true, placeholder: 'Enter total area in square meters' },
    { label: 'Bedrooms', name: 'bedrooms', type: 'number', required: true },
    { label: 'Bathrooms', name: 'bathrooms', type: 'number', required: true, step: 0.5 },
    { label: 'Floor Level', name: 'floor', type: 'number', required: true, min: 1, max: 100 },
    { 
      label: 'Year Built', 
      name: 'yearBuilt', 
      type: 'select', 
      required: true, 
      options: Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => ({
        value: (1900 + i).toString(),
        label: (1900 + i).toString()
      })),
      placeholder: 'Select year built'
    }
  ],
  land: [
    { label: 'Land Area (m²)', name: 'size', type: 'number', required: true, placeholder: 'Enter land area in square meters' },
    { label: 'Is Buildable', name: 'buildable', type: 'boolean', required: true }
  ],
  commercial: [
    { label: 'Total Area (m²)', name: 'size', type: 'number', required: true, placeholder: 'Enter total area in square meters' },
    { 
      label: 'Usage Type', 
      name: 'usageType', 
      type: 'select', 
      required: true, 
      options: [
        { value: 'Retail', label: 'Retail' },
        { value: 'Office', label: 'Office' },
        { value: 'Industrial', label: 'Industrial' },
        { value: 'Warehouse', label: 'Warehouse' },
        { value: 'Hospitality', label: 'Hospitality' },
        { value: 'Mixed-use', label: 'Mixed-use' },
        { value: 'Other', label: 'Other' }
      ]
    },
    { 
      label: 'Year Built', 
      name: 'yearBuilt', 
      type: 'select', 
      required: true, 
      options: Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => ({
        value: (1900 + i).toString(),
        label: (1900 + i).toString()
      })),
      placeholder: 'Select year built'
    }
  ],
  other: [
    { label: 'Total Area (m²)', name: 'totalArea', type: 'number', required: true, placeholder: 'Enter total area in square meters' },
    { 
      label: 'Year Built', 
      name: 'yearBuilt', 
      type: 'select', 
      required: true, 
      options: Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => ({
        value: (1900 + i).toString(),
        label: (1900 + i).toString()
      })),
      placeholder: 'Select year built'
    }
  ]
};

 