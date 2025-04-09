import { ListingFieldSchema } from '@/types/listings';

export const vanSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: 'vanType',
    label: 'listings.vanType',
    type: 'select',
    options: [
      'Cargo',
      'Passenger',
      'Crew',
      'Panel',
      'Box',
      'Refrigerated',
      'Other'
    ],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Van type is required' : null,
  },
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
    name: 'cargoVolume',
    label: 'listings.cargoVolume',
    type: 'text',
    section: 'essential',
    required: true,
    validate: (value: string) => /^\d+(\.\d+)?$/.test(value) ? null : 'Invalid volume format'
  },
  {
    name: 'payloadCapacity',
    label: 'listings.payloadCapacity',
    type: 'text',
    section: 'essential',
    required: true,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid capacity format'
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
    options: ['manual', 'automatic', 'automated'],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Transmission type is required' : null,
  },

  // Advanced Section
  {
    name: 'roofHeight',
    label: 'listings.roofHeight',
    type: 'select',
    options: [
      'Low',
      'Medium',
      'High',
      'Super High'
    ],
    section: 'advanced',
    required: false
  },
  {
    name: 'loadingFeatures',
    label: 'listings.loadingFeatures',
    type: 'multiselect',
    options: [
      'Side Door',
      'Rear Door',
      'Lift Gate',
      'Loading Ramp',
      'Tie-downs',
      'Other'
    ],
    section: 'advanced',
    required: false
  },
  {
    name: 'refrigeration',
    label: 'listings.refrigeration',
    type: 'boolean',
    section: 'advanced',
    required: false
  },
  {
    name: 'temperatureRange',
    label: 'listings.temperatureRange',
    type: 'text',
    section: 'advanced',
    required: false,
    validate: (value: string) => /^-?\d+(\.\d+)?$/.test(value) ? null : 'Invalid temperature format'
  },
  {
    name: 'interiorHeight',
    label: 'listings.interiorHeight',
    type: 'text',
    section: 'advanced',
    required: false,
    validate: (value: string) => /^\d+(\.\d+)?$/.test(value) ? null : 'Invalid height format'
  },
  {
    name: 'interiorLength',
    label: 'listings.interiorLength',
    type: 'text',
    section: 'advanced',
    required: false,
    validate: (value: string) => /^\d+(\.\d+)?$/.test(value) ? null : 'Invalid length format'
  },
  {
    name: 'serviceHistory',
    label: 'listings.serviceHistory',
    type: 'select',
    options: ['full', 'partial', 'none'],
    section: 'advanced',
    required: false
  },
  {
    name: 'drivingAssistance',
    label: 'listings.drivingAssistance',
    type: 'multiselect',
    options: [
      'Backup Camera',
      'Parking Sensors',
      'Lane Departure Warning',
      'Blind Spot Monitor',
      'Cross Traffic Alert',
      'Other'
    ],
    section: 'advanced',
    required: false
  }
];
