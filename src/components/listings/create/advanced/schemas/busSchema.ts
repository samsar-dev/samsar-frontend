import { ListingFieldSchema } from '@/types/listings';

export const busSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: 'color',
    label: 'listings.exteriorColor',
    type: 'colorpicker',
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Exterior color is required' : null,
  },
  {
    name: 'condition',
    label: 'listings.condition',
    type: 'select',
    options: ['new', 'likeNew', 'excellent', 'good', 'fair', 'poor', 'salvage'],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Condition is required' : null,
  },
  {
    name: 'mileage',
    label: 'listings.mileage',
    type: 'number',
    section: 'essential',
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return 'Mileage is required';
      if (value < 0) return 'Mileage must be 0 or greater';
      return null;
    },
  },
  {
    name: 'seatingCapacity',
    label: 'listings.seatingCapacity',
    type: 'number',
    section: 'essential',
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return 'Seating capacity is required';
      if (value < 1) return 'Seating capacity must be greater than 0';
      return null;
    },
  },
  {
    name: 'previousOwners',
    label: 'listings.previousOwners',
    type: 'number',
    section: 'essential',
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return 'Previous owners is required';
      if (value < 0) return 'Previous owners must be 0 or greater';
      return null;
    },
  },
  {
    name: 'registrationStatus',
    label: 'listings.registrationStatus',
    type: 'select',
    options: ['registered', 'unregistered', 'expired'],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Registration status is required' : null,
  },
  {
    name: 'engine',
    label: 'listings.engine',
    type: 'text',
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Engine details are required' : null,
  },
  {
    name: 'fuelType',
    label: 'listings.fuelType',
    type: 'select',
    options: ['diesel', 'gasoline', 'electric', 'hybrid', 'cng'],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Fuel type is required' : null,
  },
  {
    name: 'transmissionType',
    label: 'listings.transmission',
    type: 'select',
    options: ['manual', 'automatic', 'semi_automatic'],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Transmission type is required' : null,
  },
  {
    name: 'serviceHistory',
    label: 'listings.serviceHistory',
    type: 'select',
    options: ['full', 'partial', 'none'],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Service history is required' : null,
  },

  // Advanced Section
  {
    name: 'airConditioning',
    label: 'comfort.airConditioning',
    type: 'select',
    options: ['none', 'front', 'full'],
    section: 'advanced',
    required: false,
  },
  {
    name: 'luggageSpace',
    label: 'listings.luggageSpace',
    type: 'number',
    section: 'advanced',
    required: false,
  },
  {
    name: 'wheelchairAccessible',
    label: 'accessibility.wheelchairAccessible',
    type: 'boolean',
    section: 'advanced',
    required: false,
  },
  {
    name: 'emergencyExits',
    label: 'safety.emergencyExits',
    type: 'number',
    section: 'advanced',
    required: false,
  },
];
