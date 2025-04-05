import React from "react";
import { useFavorites } from "@/hooks";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { HeartIcon, HeartFilledIcon } from "@/components/ui";
import { FaHeart } from "react-icons/fa";

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
  const { addToSaved, removeFromSaved, savedListings } = useSavedListings();
  const isItemFavorited = isFavorite(itemId);
  const isItemSaved = savedListings.some((listing) => listing._id === itemId);

  const handleToggle = async () => {
    try {
      if (type === "favorite") {
        isItemFavorited
          ? await removeFavorite(itemId)
          : await addFavorite(itemId);
      } else {
        isItemSaved ? removeFromSaved(itemId) : addToSaved({ _id: itemId });
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
        isItemFavorited ? (
          <HeartFilledIcon className="w-6 h-6 text-red-500" />
        ) : (
          <HeartIcon className="w-6 h-6 text-gray-500 hover:text-red-500" />
        )
      ) : (
        <FaHeart
          className={`text-xl ${isItemSaved ? "text-blue-500" : "text-gray-500"}`}
        />
      )}
    </button>
  );
};
