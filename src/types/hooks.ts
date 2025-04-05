// Listing hooks
export interface FavoritesHook {
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export interface SavedListingsHook {
  savedListings: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  addToSaved: (id: string) => void;
  removeFromSaved: (id: string) => void;
}

export type ListingViewType = "grid" | "list" | "card" | "saved" | "compact";
