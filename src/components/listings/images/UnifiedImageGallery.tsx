import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import ImageFallback from "@/components/media/ImageFallback";
 
 
import { FaChevronLeft } from "@react-icons/all-files/fa/FaChevronLeft";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import { FaEdit } from "@react-icons/all-files/fa/FaEdit";
import { FaMapMarkerAlt } from "@react-icons/all-files/fa/FaMapMarkerAlt";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { FaEye } from "@react-icons/all-files/fa/FaEye";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type {
  Listing,
  RealEstateDetails,
  VehicleDetails,
} from "@/types/listings";

const PriceConverter = lazy(() => import("@/components/common/PriceConverter"));

type ImageType = string | File | { url: string };

export interface UnifiedImageGalleryProps {
  images?: ImageType[];
  listing?: Listing & {
    vehicleDetails?: VehicleDetails;
    realEstateDetails?: RealEstateDetails;
  };
  onDelete?: (id: string) => void;
  initialIndex?: number | null;
  onClose?: () => void;
  isModal?: boolean;
  className?: string;
}

const UnifiedImageGallery: React.FC<UnifiedImageGalleryProps> = ({
  images: propImages,
  listing,
  onDelete,
  initialIndex = null,
  onClose,
  isModal = true,
  className = "",
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<number | null>(
    initialIndex,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [previousImageIndex, setPreviousImageIndex] = useState<number | null>(
    null,
  );

  const images = useMemo(
    () => listing?.images || propImages || [],
    [listing, propImages],
  );

  useEffect(() => {
    setSelectedImage(initialIndex);
  }, [initialIndex]);

  const imageUrls = useMemo(() => {
    return images
      .map((image) => {
        if (typeof image === "string") return image;
        if (image instanceof File) return URL.createObjectURL(image);
        if (image && typeof image === "object" && "url" in image)
          return image.url;
        return "";
      })
      .filter(Boolean);
  }, [images]);

  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  const navigateImage = (direction: "prev" | "next") => {
    if (isLoading || selectedImage === null) return;

    setIsLoading(true);
    const current = selectedImage;
    setPreviousImageIndex(current);

    setTimeout(() => {
      if (direction === "prev") {
        setSelectedImage(current === 0 ? imageUrls.length - 1 : current - 1);
      } else {
        setSelectedImage(current === imageUrls.length - 1 ? 0 : current + 1);
      }
      setIsLoading(false);
    }, 150);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isModal) return;

    if (e.key === "Escape") {
      onClose?.();
    } else if (e.key === "ArrowLeft") {
      navigateImage("prev");
    } else if (e.key === "ArrowRight") {
      navigateImage("next");
    }
  };

  useEffect(() => {
    if (isModal) {
      window.addEventListener("keydown", handleKeyDown as any);
      return () => {
        window.removeEventListener("keydown", handleKeyDown as any);
      };
    }
  }, [selectedImage, isLoading, isModal]);

  const hasNext = selectedImage !== null && imageUrls.length > 1;
  const hasPrev = selectedImage !== null && imageUrls.length > 1;

  // ===== Card View Logic (from MyListingCard) =====
  if (!isModal && listing) {
    const {
      id,
      title,
      price,
      category,
      location,
      createdAt,
      vehicleDetails,
      realEstateDetails,
    } = listing;

    const formatViews = (count?: number) => {
      if (!count) return "0";
      if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
      return count.toString();
    };

    const firstImageUrl = imageUrls[0] || "";

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 relative">
        <Link
          to={`/listings/${id}`}
          className="block h-full transition-transform duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:shadow-gray-800"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-t-lg">
            <ImageFallback
              src={firstImageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            {imageUrls.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {imageUrls.length} images
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 truncate">{title}</h3>
            <div className="text-green-600 dark:text-green-400 font-semibold mb-2">
              <Suspense
                fallback={<div className="font-semibold">Loading price...</div>}
              >
                <PriceConverter price={price} />
              </Suspense>
            </div>

            <div className="flex items-center justify-between mb-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-1" />
                <span className="truncate max-w-[180px]">{location}</span>
              </div>
              {listing.views !== undefined && (
                <div className="flex items-center text-xs text-gray-500">
                  <FaEye className="mr-1" />
                  <span>{formatViews(listing.views)}</span>
                </div>
              )}
            </div>

            {/* Details based on category can be added here if needed */}
          </div>
        </Link>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2 px-4 pb-2">
          {createdAt ? new Date(createdAt).toLocaleDateString() : ""}
        </p>
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/listings/${id}/edit`;
            }}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
            title={t("common.edit")}
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm(t("listings.deleteConfirmation"))) {
                onDelete?.(id as string);
              }
            }}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
            title={t("common.delete")}
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ===== Modal View Logic =====
  if (!isModal) {
    // Fallback for non-modal without listing prop
    return (
      <div
        className={`relative bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center ${className}`}
      >
        <span className="text-gray-500">No listing data</span>
      </div>
    );
  }

  if (selectedImage === null) return null;

  const currentImageUrl = imageUrls[selectedImage] || "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="text-white text-lg font-medium">
            {selectedImage + 1} of {imageUrls.length}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Close gallery"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="relative flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <ImageFallback
              src={currentImageUrl}
              alt={`Image ${selectedImage + 1}`}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>

          {hasPrev && (
            <button
              onClick={() => navigateImage("prev")}
              disabled={isLoading}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all disabled:opacity-50"
              aria-label="Previous image"
            >
              <FaChevronLeft size={20} />
            </button>
          )}

          {hasNext && (
            <button
              onClick={() => navigateImage("next")}
              disabled={isLoading}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all disabled:opacity-50"
              aria-label="Next image"
            >
              <FaChevronRight size={20} />
            </button>
          )}
        </div>

        {imageUrls.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2 overflow-x-auto py-2">
            {imageUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isLoading) {
                    setIsLoading(true);
                    setPreviousImageIndex(selectedImage);
                    setSelectedImage(index);
                    setTimeout(() => setIsLoading(false), 150);
                  }
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-150 ${
                  selectedImage === index
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <ImageFallback
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedImageGallery;
