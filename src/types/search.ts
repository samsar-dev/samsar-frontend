import type { Listing } from "./listings";
import type { APIResponse } from "./api";

export interface SearchQuery {
  term: string;
  filters?: {
    category?: string;
    priceRange?: {
      min?: number;
      max?: number;
    };
    location?: string;
    sortBy?: "relevance" | "price" | "date";
    sortOrder?: "asc" | "desc";
  };
}

export interface SearchResult<T = Listing> {
  item: T;
  score: number;
  highlights?: {
    field: string;
    matches: string[];
  }[];
}

export interface SearchResponse<T = Listing> {
  results: SearchResult<T>[];
  totalResults: number;
  searchTime: number;
  suggestions?: string[];
}

export interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: string) => void;
  className?: string;
}

export interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: SearchQuery) => void;
  initialQuery?: SearchQuery;
}

export type { APIResponse };
