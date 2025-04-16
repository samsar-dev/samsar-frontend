import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { APIResponse } from "@/types";
import { listingsAPI } from "@/api/listings.api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

// Define the favorite item type
interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

export interface FavoritesContextType {
  favorites: string[];
  isLoading: boolean;
  addFavorite: (itemId: string) => Promise<APIResponse<void>>;
  removeFavorite: (itemId: string) => Promise<APIResponse<void>>;
  isFavorite: (itemId: string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | null>(
  null,
);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await listingsAPI.getSavedListings();
      if (response.success && response.data?.favorites) {
        setFavorites(
          response.data.favorites.map((fav: FavoriteItem) => fav.id),
        );
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addFavorite = async (itemId: string): Promise<APIResponse<void>> => {
    try {
      setIsLoading(true);
      const response = await listingsAPI.addFavorite(itemId);
      if (response.success) {
        setFavorites((prev) => [...prev, itemId]);
        toast.success("Added to favorites");
      }
      return {
        success: response.success,
        data: undefined,
        error: response.error,
      };
    } catch (error) {
      console.error("Error adding favorite:", error);
      toast.error("Failed to add to favorites");
      return {
        success: false,
        data: undefined,
        error: "Failed to add to favorites",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (itemId: string): Promise<APIResponse<void>> => {
    try {
      setIsLoading(true);
      const response = await listingsAPI.removeFavorite(itemId);
      if (response.success) {
        setFavorites((prev) => prev.filter((id) => id !== itemId));
        toast.success("Removed from favorites");
      }
      return {
        success: response.success,
        data: undefined,
        error: response.error,
      };
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove from favorites");
      return {
        success: false,
        data: undefined,
        error: "Failed to remove from favorites",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = useCallback(
    (itemId: string) => favorites.includes(itemId),
    [favorites],
  );

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
