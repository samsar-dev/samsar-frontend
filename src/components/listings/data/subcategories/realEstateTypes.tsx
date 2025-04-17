import { PropertyType } from '@/types/enums';

// Updated to match PropertyType enum
export const realEstateTypes: { [key in PropertyType]?: string[] } = {
  [PropertyType.HOUSE]: [
    'House / Villa',
    'Townhouse',
    'Duplex / Triplex',
    'Bungalow',
    'Farmhouse',
    'Loft',
    'Mobile Home',
    'Prefabricated Home',
    'Senior Living / Retirement Home',
    'Student Housing',
    'Gated Community',
  ],
  [PropertyType.APARTMENT]: [
    'Apartment / Flat',
    'Studio',
    'Penthouse',
  ],
  [PropertyType.CONDO]: [
    'Condo',
    'Co-Op',
  ],
  [PropertyType.LAND]: [
    'Residential Plot',
    'Commercial Plot',
    'Agricultural Land',
    'Industrial Land',
    'Mixed-Use Plot',
    'Beachfront Land',
    'Mountain / Forest Land',
    'Lakefront / Riverfront Land',
    'Urban Development Land',
    'Subdivided Land',
  ],
  [PropertyType.COMMERCIAL]: [
    'Office Space',
    'Retail Shop',
    'Warehouse',
    'Industrial Building',
    'Co-Working Space',
    'Restaurant / Café',
    'Hotel / Guesthouse',
    'Shopping Center / Mall',
    'Showroom',
    'Medical Office / Clinic',
    'Bank / Financial Institution',
    'Car Dealership',
    'Factory / Manufacturing Facility',
    'Data Center',
  ],
  [PropertyType.OTHER]: [
    'Other',
  ],
};

// Helper to get all categories
export const getAllCategories = () => Object.keys(realEstateTypes);

export const getTypesForCategory = (category: PropertyType) => realEstateTypes[category] || [];

export const searchCategories = (query: string) => {
  const normalizedQuery = query.toLowerCase();
  return getAllCategories().filter((category) =>
    category.toLowerCase().includes(normalizedQuery),
  );
};

export const searchTypes = (category: PropertyType, query: string) => {
  const normalizedQuery = query.toLowerCase();
  return getTypesForCategory(category).filter((type) =>
    type.toLowerCase().includes(normalizedQuery),
  );
};
