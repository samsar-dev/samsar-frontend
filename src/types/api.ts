// Generic API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface APIListResponse<T> {
  success: boolean;
  data: {
    listings: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  message?: string;
  error?: string;
}

export interface APIError {
  success: false;
  error: string;
  data: null;
  status?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: "asc" | "desc";
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
  data: null;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError extends Error {
  status?: number;
  response?: {
    data?: ErrorResponse;
    status: number;
  };
}

// Common Filter Types
export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PriceRange {
  minPrice?: number;
  maxPrice?: number;
}
