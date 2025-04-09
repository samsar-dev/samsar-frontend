import { ListingFieldSchema } from '@/types/listings';
import { FuelType, TransmissionType, Condition } from '@/types/enums';

export const busSchema: ListingFieldSchema[] = [
  {
    name: 'busType',
    label: 'listings.busType',
    type: 'select',
    options: [
      'School Bus',
      'Transit Bus',
      'Coach Bus',
      'Mini Bus',
      'Double Decker',
      'Shuttle Bus',
      'Other'
    ],
    section: 'details',
    required: true
  },
  {
    name: 'make',
    label: 'listings.make',
    type: 'text',
    section: 'details',
    required: true,
    validate: (value: string) => value.length > 0 ? null : 'Make is required'
  },
  {
    name: 'model',
    label: 'listings.model',
    type: 'text',
    section: 'details',
    required: true,
    validate: (value: string) => value.length > 0 ? null : 'Model is required'
  },
  {
    name: 'year',
    label: 'listings.year',
    type: 'text',
    section: 'details',
    required: true,
    validate: (value: string) => /^\d{4}$/.test(value) ? null : 'Invalid year format'
  },
  {
    name: 'mileage',
    label: 'listings.mileage',
    type: 'text',
    section: 'details',
    required: false,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid mileage format'
  },
  {
    name: 'fuelType',
    label: 'listings.fuelType',
    type: 'select',
    options: Object.values(FuelType),
    section: 'details',
    required: false
  },
  {
    name: 'transmissionType',
    label: 'listings.transmissionType',
    type: 'select',
    options: Object.values(TransmissionType),
    section: 'details',
    required: false
  },
  {
    name: 'seatingCapacity',
    label: 'listings.seatingCapacity',
    type: 'text',
    section: 'specifications',
    required: true,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid capacity format'
  },
  {
    name: 'wheelchairSpaces',
    label: 'listings.wheelchairSpaces',
    type: 'text',
    section: 'accessibility',
    required: false,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid number format'
  },
  {
    name: 'accessibilityFeatures',
    label: 'listings.accessibilityFeatures',
    type: 'multiselect',
    options: [
      'Wheelchair Lift',
      'Low Floor',
      'Kneeling System',
      'Wide Doors',
      'Priority Seating',
      'Other'
    ],
    section: 'accessibility',
    required: false
  },
  {
    name: 'engineLocation',
    label: 'listings.engineLocation',
    type: 'select',
    options: [
      'Front',
      'Rear',
      'Mid'
    ],
    section: 'specifications',
    required: false
  },
  {
    name: 'luggageCapacity',
    label: 'listings.luggageCapacity',
    type: 'text',
    section: 'specifications',
    required: false,
    validate: (value: string) => /^\d+(\.\d+)?$/.test(value) ? null : 'Invalid capacity format'
  },
  {
    name: 'amenities',
    label: 'listings.amenities',
    type: 'multiselect',
    options: [
      'Air Conditioning',
      'Restroom',
      'WiFi',
      'Entertainment System',
      'USB Ports',
      'Reclining Seats',
      'Storage Compartments',
      'Other'
    ],
    section: 'features',
    required: false
  },
  {
    name: 'safetyFeatures',
    label: 'listings.safetyFeatures',
    type: 'multiselect',
    options: [
      'ABS',
      'Electronic Stability Control',
      'Emergency Braking',
      'Lane Departure Warning',
      'Backup Camera',
      'Fire Suppression',
      'Other'
    ],
    section: 'safety',
    required: false
  },
  {
    name: 'routeType',
    label: 'listings.routeType',
    type: 'select',
    options: [
      'City',
      'Intercity',
      'Tour',
      'School',
      'Charter',
      'Other'
    ],
    section: 'usage',
    required: false
  },
  {
    name: 'condition',
    label: 'listings.condition',
    type: 'select',
    options: Object.values(Condition),
    section: 'details',
    required: true
  }
];
