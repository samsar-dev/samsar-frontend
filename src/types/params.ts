import { ListingCategory } from './enums';

export interface ListingParams {
  page?: number;
  limit?: number;
  mainCategory?: ListingCategory;
  subCategory?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}
