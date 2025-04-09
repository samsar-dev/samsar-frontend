import { ListingFieldSchema } from '@/types/listings';

export const constructionSchema: ListingFieldSchema[] = [
  {
    name: 'equipmentType',
    label: 'listings.equipmentType',
    type: 'select',
    options: [
      'Excavator',
      'Bulldozer',
      'Crane',
      'Forklift',
      'Loader',
      'Backhoe',
      'Dump Truck',
      'Other'
    ],
    section: 'details',
    required: true
  },
  {
    name: 'operatingWeight',
    label: 'listings.operatingWeight',
    type: 'text',
    section: 'specifications',
    required: true,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid weight format'
  },
  {
    name: 'maxLiftingCapacity',
    label: 'listings.maxLiftingCapacity',
    type: 'text',
    section: 'specifications',
    required: false,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid capacity format'
  },
  {
    name: 'enginePower',
    label: 'listings.enginePower',
    type: 'text',
    section: 'specifications',
    required: true,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid power format'
  },
  {
    name: 'hoursUsed',
    label: 'listings.hoursUsed',
    type: 'text',
    section: 'usage',
    required: true,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid hours format'
  },
  {
    name: 'maintenanceHistory',
    label: 'listings.maintenanceHistory',
    type: 'textarea',
    section: 'maintenance',
    required: false
  },
  {
    name: 'attachments',
    label: 'listings.attachments',
    type: 'multiselect',
    options: [
      'Bucket',
      'Hammer',
      'Auger',
      'Grapple',
      'Fork',
      'Blade',
      'Other'
    ],
    section: 'equipment',
    required: false
  },
  {
    name: 'hydraulicSystem',
    label: 'listings.hydraulicSystem',
    type: 'text',
    section: 'specifications',
    required: false
  },
  {
    name: 'safetyFeatures',
    label: 'listings.safetyFeatures',
    type: 'multiselect',
    options: [
      'ROPS',
      'FOPS',
      'Backup Camera',
      'Safety Sensors',
      'Emergency Stop',
      'Fire Suppression',
      'Other'
    ],
    section: 'safety',
    required: false
  }
];
