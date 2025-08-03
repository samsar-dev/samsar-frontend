import Fuse, { type IFuseOptions } from "fuse.js";
import type { Listing } from "@/types/listings";

// Search configuration
const searchOptions: IFuseOptions<Listing> = {
  keys: [
    "title",
    "description",
    "location",
    "details.vehicles.make",
    "details.vehicles.model",
    "details.vehicles.vehicleType",
    "details.realEstate.propertyType",
  ],
  // More aggressive fuzzy matching
  threshold: 0.4,
  ignoreLocation: true, // Search across all text
  minMatchCharLength: 3, // Require at least 3 characters for matching
  // More permissive fuzzy matching
  includeScore: true,
  includeMatches: true,
  // Tune fuzzy matching
  findAllMatches: true,
  useExtendedSearch: true,
  // Weight the search results
  shouldSort: true,
  // More aggressive fuzzy matching
  distance: 100,
  // More permissive with character matching
  ignoreFieldNorm: true,

  // ✅ Allow safe access to nested fields
  getFn: (obj: any, path: string | string[]) => {
    const pathArray = Array.isArray(path) ? path : [path];
    return pathArray.flatMap((p) =>
      p.split(".").reduce((acc, part) => {
        if (Array.isArray(acc)) {
          return acc.flatMap((item) => item?.[part] || []);
        }
        return acc?.[part];
      }, obj),
    );
  },
};

// ✅ Create a Fuse instance
export const createFuse = (listings: Listing[]) => {
  return new Fuse(listings, searchOptions);
};

// ✅ Perform fuzzy search and return the best-matched listings
export const searchListings = (
  fuse: Fuse<Listing>,
  query: string,
): Listing[] => {
  if (!query.trim()) return [];

  const results = fuse.search(query, {
    limit: 10,
  });

  return results.map((result) => result.item);
};
