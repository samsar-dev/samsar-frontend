// Modern lightweight fuzzy search implementation
import type { Listing } from "@/types/listings";

// Search configuration
const SEARCH_FIELDS = [
  "title",
  "description",
  "location",
  "details.vehicles.make",
  "details.vehicles.model",
  "details.vehicles.vehicleType",
  "details.realEstate.propertyType",
];

// Utility to get nested object values safely
const getNestedValue = (obj: any, path: string): string => {
  return (
    path.split(".").reduce((current, key) => {
      return current?.[key] ?? "";
    }, obj) ?? ""
  );
};

// Simple fuzzy matching function
const fuzzyMatch = (text: string, query: string): number => {
  if (!query || !text) return 0;

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match gets highest score
  if (textLower === queryLower) return 1;

  // Contains match
  if (textLower.includes(queryLower)) return 0.9;

  // Fuzzy match using Levenshtein-like approach
  let score = 0;
  let queryIndex = 0;

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length ? score / queryLower.length : 0;
};

// Modern search engine class
export class SearchEngine {
  private listings: Listing[] = [];
  private searchIndex: Map<string, string[]> = new Map();

  constructor(listings: Listing[]) {
    this.listings = listings;
    this.buildIndex();
  }

  private buildIndex() {
    this.listings.forEach((listing) => {
      const searchableText = SEARCH_FIELDS.map((field) =>
        getNestedValue(listing, field),
      )
        .join(" ")
        .toLowerCase();

      this.searchIndex.set(
        listing.id,
        searchableText.split(" ").filter(Boolean),
      );
    });
  }

  // Add or update listings
  updateListings(listings: Listing[]) {
    this.listings = listings;
    this.buildIndex();
  }

  // Perform fuzzy search
  search(query: string, limit: number = 10): Listing[] {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    const results: { listing: Listing; score: number }[] = [];

    this.listings.forEach((listing) => {
      let score = 0;

      // Check each searchable field
      SEARCH_FIELDS.forEach((field) => {
        const value = getNestedValue(listing, field);
        if (value) {
          score = Math.max(score, fuzzyMatch(value, queryLower));
        }
      });

      // Boost exact matches in title
      if (listing.title?.toLowerCase() === queryLower) {
        score = Math.max(score, 1.1);
      }

      if (score > 0.3) {
        // Minimum threshold
        results.push({ listing, score });
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((result) => result.listing);
  }
}

// ✅ Create a search engine instance
export const createSearchEngine = (listings: Listing[]) => {
  return new SearchEngine(listings);
};

// ✅ Perform search using the modern engine
export const searchListings = (
  engine: SearchEngine,
  query: string,
): Listing[] => {
  if (!query.trim()) return [];

  return engine.search(query, 10);
};
