import { useState } from "react";
import type { APIResponse } from "@/types/api";

export interface FavoritesContextType {
  favorites: string[];
  addFavorite: (itemId: string) => Promise<APIResponse<void>>;
  removeFavorite: (itemId: string) => Promise<APIResponse<void>>;
  isFavorite: (itemId: string) => boolean;
  isLoading: boolean;
  toggleFavorite: (itemId: string) => Promise<void>;
}

export const useFavorites = (): FavoritesContextType => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async (itemId: string) => {
    if (favorites.includes(itemId)) {
      await removeFavorite(itemId);
    } else {
      await addFavorite(itemId);
    }
  };

  const addFavorite = async (itemId: string): Promise<APIResponse<void>> => {
    try {
      setIsLoading(true);
      // API call would go here
      setFavorites((prev) => [...prev, itemId]);
      return { success: true, data: undefined, error: null };
    } catch (error) {
      console.error("Error adding favorite:", error);
      return {
        success: false,
        error: "Failed to add favorite",
        data: undefined,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (itemId: string): Promise<APIResponse<void>> => {
    try {
      setIsLoading(true);
      // API call would go here
      setFavorites((prev) => prev.filter((id) => id !== itemId));
      return { success: true, data: undefined, error: null };
    } catch (error) {
      console.error("Error removing favorite:", error);
      return {
        success: false,
        error: "Failed to remove favorite",
        data: undefined,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
};
