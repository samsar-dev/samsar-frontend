import React from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface ListingActionButtonProps {
  itemId: string;
  type: "favorite" | "save";
  className?: string;
}

export const ListingActionButton: React.FC<ListingActionButtonProps> = ({
  itemId,
  type,
  className,
}) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { addToSaved, removeFromSaved, isSaved } = useSavedListings();
  const isItemFavorited = isFavorite(itemId);
  const isItemSaved = isSaved(itemId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (type === "favorite") {
        isItemFavorited
          ? await removeFavorite(itemId)
          : await addFavorite(itemId);
      } else {
        isItemSaved ? removeFromSaved(itemId) : addToSaved(itemId);
      }
    } catch (error) {
      console.error("Error toggling listing action:", error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className || ""}`}
      aria-label={
        isItemFavorited || isItemSaved ? "Remove from list" : "Add to list"
      }
    >
      {type === "favorite" ? (
        isItemFavorited || isItemSaved ? (
          <FaHeart className="h-5 w-5 text-red-500" />
        ) : (
          <FaRegHeart className="h-5 w-5 text-gray-400 hover:text-red-500" />
        )
      ) : (
        <FaHeart
          className={`text-xl ${isItemSaved ? "text-blue-500" : "text-gray-500"}`}
        />
      )}
    </button>
  );
};
