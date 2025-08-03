import React, { useState, useEffect, useRef, memo } from "react";
import { FaCar } from "@react-icons/all-files/fa/FaCar";
import { FaHome } from "@react-icons/all-files/fa/FaHome";
import { FaTruck } from "@react-icons/all-files/fa/FaTruck";
import { FaMotorcycle } from "@react-icons/all-files/fa/FaMotorcycle";
import { FaBus } from "@react-icons/all-files/fa/FaBus";
import { FaTractor } from "@react-icons/all-files/fa/FaTractor";
import { FaCarSide } from "@react-icons/all-files/fa/FaCarSide";
import { FaBuilding } from "@react-icons/all-files/fa/FaBuilding";
import { FaLandmark } from "@react-icons/all-files/fa/FaLandmark";
import { FiMapPin } from "@react-icons/all-files/fi/FiMapPin";
import { FiTool } from "@react-icons/all-files/fi/FiTool";
import { IoBusinessOutline } from "@react-icons/all-files/io5/IoBusinessOutline";
import type { ListingCategory, VehicleType, PropertyType } from "@/types/enums";

// Category icons mapping with proper typing
const categoryIcons = {
  CAR: FaCar,
  TRUCK: FaTruck,
  MOTORCYCLE: FaMotorcycle,
  RV: FaCarSide,
  BUS: FaBus,
  VAN: FaCarSide,
  TRACTOR: FaTractor,
  CONSTRUCTION: FiTool,
  REAL_ESTATE: FaHome,
  OTHER: FiMapPin,
  HOUSE: FaHome,
  APARTMENT: FaBuilding,
  CONDO: FaBuilding,
  LAND: FaLandmark,
  COMMERCIAL: IoBusinessOutline,
};

// Union type of all possible category enums
type CategoryType = ListingCategory | VehicleType | PropertyType | string;

interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "fetchPriority"> {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  sizes?: string;
  width?: number | string;
  height?: number | string;
  quality?: number;
  category?: CategoryType;
  placeholder?: string;
  blur?: boolean;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  responsive?: boolean;
  maxWidth?: number;
}

const DEFAULT_PLACEHOLDER = "";

const ImageComponent: React.FC<ImageProps> = ({
  src,
  alt,
  className = "",
  loading = "lazy",
  priority = false,
  sizes = "100vw",
  width,
  height,
  quality = 80,
  category,
  placeholder = DEFAULT_PLACEHOLDER,
  blur = false,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle R2 image optimization with responsive sizes and caching
  const isR2Image = src?.includes("r2.dev");
  const baseUrl = src?.split("?")[0] || "";
  const imageQuality = priority ? Math.min(90, quality) : Math.max(60, quality);

  // Generate optimized image URL with WebP format and proper caching
  const getOptimizedImageUrl = (width?: number) => {
    if (!isR2Image || !baseUrl) return src || "";
    const params = new URLSearchParams();
    params.append("format", "webp");
    params.append("quality", imageQuality.toString());
    if (width) params.append("width", width.toString());

    // Add cache-busting parameter for non-production environments
    if (process.env.NODE_ENV !== "production") {
      params.append("_t", Date.now().toString());
    }

    return `${baseUrl}?${params.toString()}`;
  };

  // Define responsive image sizes based on viewport
  const responsiveSizes = [
    { media: "(max-width: 640px)", width: 400 },
    { media: "(max-width: 1024px)", width: 800 },
    { media: "(min-width: 1025px)", width: 1200 },
  ];

  // Preload critical images
  useEffect(() => {
    // Remove preload injection - let browser handle critical image loading
    // Preloading should only be used for above-the-fold critical images
  }, [priority, isR2Image, baseUrl, imageQuality]);

  // Helper function to get the most appropriate icon based on category
  const getCategoryIcon = (category?: CategoryType) => {
    if (!category) return categoryIcons.OTHER;

    // Check if category exists in our icons
    if (category in categoryIcons) {
      return categoryIcons[category as keyof typeof categoryIcons];
    }

    // Handle specific cases or return default
    if (category.toString().toUpperCase() in categoryIcons) {
      const key = category
        .toString()
        .toUpperCase() as keyof typeof categoryIcons;
      return categoryIcons[key];
    }

    return categoryIcons.OTHER;
  };

  // getOptimizedImageUrl is used consistently for all image URL generation

  // Handle image load events
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  // Render fallback UI if image fails to load
  if (hasError || !src) {
    if (placeholder) {
      return (
        <img
          src={placeholder}
          alt={alt || "Image not available"}
          className={className}
          width={width}
          height={height}
          aria-label={alt || "Image not available"}
        />
      );
    }

    // Get the appropriate icon based on category
    const Icon = getCategoryIcon(category);
    return (
      <div
        className={`relative ${className}`}
        style={{
          width: width || "100%",
          height: height || "200px",
          background: "#e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "8px",
        }}
        role="img"
        aria-label={alt || "Image not available"}
      >
        <Icon className="text-4xl text-gray-600 dark:text-gray-400" />
        <div className="text-gray-700 dark:text-gray-300 text-center">
          <p className="mt-2 font-medium">Image Unavailable</p>
        </div>
      </div>
    );
  }

  // Render the actual image
  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{
        width: width || "100%",
        height: height || "auto",
        minHeight: "40px", // Ensure minimum height for placeholder
      }}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          {category &&
            React.createElement(getCategoryIcon(category), {
              className: "w-1/3 h-1/3 text-gray-400",
              "aria-hidden": "true",
            })}
        </div>
      )}

      {/* Error state */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
          {React.createElement(getCategoryIcon(category), {
            className: "w-1/4 h-1/4 text-gray-600 dark:text-gray-400 mb-2",
            "aria-hidden": "true",
          })}
          <span className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
            {alt || "Image not available"}
          </span>
        </div>
      ) : (
        /* Image content */
        <picture>
          {/* WebP sources for modern browsers */}
          {isR2Image && (
            <source
              type="image/webp"
              srcSet={responsiveSizes
                .map(
                  (size) =>
                    `${getOptimizedImageUrl(size.width)} ${size.width}w`,
                )
                .join(", ")}
              sizes={sizes}
            />
          )}

          {/* Fallback image */}
          <img
            ref={imgRef}
            src={isR2Image ? getOptimizedImageUrl(1200) : src}
            srcSet={
              isR2Image
                ? responsiveSizes
                    .map(
                      (size) =>
                        `${getOptimizedImageUrl(size.width)} ${size.width}w`,
                    )
                    .join(", ")
                : undefined
            }
            alt={alt}
            className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            } ${blur ? "blur-sm" : ""}`}
            loading={loading}
            {...(priority
              ? { fetchpriority: "high", decoding: "sync" as const }
              : { decoding: "async" as const })}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            sizes={sizes}
          />
        </picture>
      )}
    </div>
  );
};

// Custom comparison function for React.memo
const areEqual = (prevProps: ImageProps, nextProps: ImageProps) => {
  return (
    prevProps.src === nextProps.src &&
    prevProps.alt === nextProps.alt &&
    prevProps.className === nextProps.className &&
    prevProps.loading === nextProps.loading &&
    prevProps.priority === nextProps.priority &&
    prevProps.sizes === nextProps.sizes &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.quality === nextProps.quality &&
    prevProps.category === nextProps.category &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.blur === nextProps.blur
  );
};

export default memo(ImageComponent, areEqual);
