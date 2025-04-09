import { ListingFieldSchema } from '@/types/listings';

export const vanSchema: ListingFieldSchema[] = [
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
    section: 'details',
    required: true
  },
  {
    name: 'cargoVolume',
    label: 'listings.cargoVolume',
    type: 'text',
    section: 'specifications',
    required: true,
    validate: (value: string) => /^\d+(\.\d+)?$/.test(value) ? null : 'Invalid volume format'
  },
  {
    name: 'payloadCapacity',
    label: 'listings.payloadCapacity',
    type: 'text',
    section: 'specifications',
    required: true,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid capacity format'
  },
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
    section: 'specifications',
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
    section: 'features',
    required: false
  },
  {
    name: 'refrigeration',
    label: 'listings.refrigeration',
    type: 'boolean',
    section: 'features',
    required: false
  },
  {
    name: 'temperatureRange',
    label: 'listings.temperatureRange',
    type: 'text',
    section: 'specifications',
    required: false,
    validate: (value: string) => /^-?\d+(\.\d+)?$/.test(value) ? null : 'Invalid temperature format'
  },
  {
    name: 'interiorHeight',
    label: 'listings.interiorHeight',
    type: 'text',
    section: 'specifications',
    required: false,
    validate: (value: string) => /^\d+(\.\d+)?$/.test(value) ? null : 'Invalid height format'
  },
  {
    name: 'interiorLength',
    label: 'listings.interiorLength',
    type: 'text',
    section: 'specifications',
    required: false,
    validate: (value: string) => /^\d+(\.\d+)?$/.test(value) ? null : 'Invalid length format'
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
    section: 'safety',
    required: false
  }
];
