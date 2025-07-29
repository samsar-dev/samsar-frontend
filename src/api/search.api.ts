import apiClient from "./apiClient";
import type { SearchQuery, SearchResponse, SearchResult } from "@/types/search";
import type { APIResponse } from "@/types/api";
import type { Listing } from "@/types/listings";
import type { User } from "@/types/user";

export const SearchAPI = {
  searchListings: async (
    query: string,
    filters?: SearchQuery["filters"],
  ): Promise<APIResponse<SearchResponse<Listing>>> =>
    apiClient.get("/search/listings", {
      params: {
        q: query,
        ...filters,
      },
    }),

  searchUsers: async (
    query: string,
  ): Promise<APIResponse<SearchResponse<User>>> =>
    apiClient.get("/search/users", {
      params: { q: query },
    }),
};
