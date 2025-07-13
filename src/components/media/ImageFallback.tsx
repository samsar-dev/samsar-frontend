import React, { useState, useEffect, useRef, memo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCar,
  FaHome,
  FaTruck,
  FaMotorcycle,
  FaBus,
  FaTractor,
  FaCarSide,
  FaBuilding,
  FaLandmark,
} from "react-icons/fa";
import { FiMapPin, FiTool } from "react-icons/fi";
import { IoBusinessOutline } from "react-icons/io5";
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
  t?: (key: string, fallback: string) => string; // Add t function to props
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
}

const DEFAULT_PLACEHOLDER = "";

const ImageComponent: React.FC<ImageProps> = ({
  // Get translation function
  t: propT,
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
  // Use propT if provided, otherwise get from useTranslation
  const { t: hookT } = useTranslation();
  const t = propT || ((key: string, fallback: string) => {
    const translation = hookT(key);
    return translation !== key ? translation : fallback;
  });
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
    if (priority && isR2Image && baseUrl) {
      const preloadLink = document.createElement("link");
      preloadLink.rel = "preload";
      preloadLink.as = "image";
      preloadLink.href = getOptimizedImageUrl(800); // Preload medium size
      document.head.appendChild(preloadLink);

      return () => {
        document.head.removeChild(preloadLink);
      };
    }
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
        <div 
          className={`relative ${className}`}
          style={{
            width: width || "100%",
            height: height || "200px",
            backgroundColor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          role="img"
          aria-label={alt || "Image not available"}
        >
          <img
            src={placeholder}
            alt=""
            className="w-full h-full object-cover"
            width={width}
            height={height}
            aria-hidden="true"
          />
          <span className="sr-only">{alt || "Image not available"}</span>
        </div>
      );
    }

    // Get the appropriate icon based on category
    const Icon = getCategoryIcon(category);
    return (
      <div
        className={`relative ${className} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900`}
        style={{
          width: width || "100%",
          height: height || "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "0.75rem",
        }}
        role="img"
        aria-label={alt ? `${alt} - Image not available` : "Image not available"}
      >
        <Icon className="w-12 h-12 text-gray-400 dark:text-gray-600" aria-hidden="true" />
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">
            {t("imageUnavailable", "Image not available")}
          </p>
          {alt && (
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              {alt}
            </p>
          )}
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
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {category ? (
            React.createElement(getCategoryIcon(category), {
              className: "w-10 h-10 text-gray-300 dark:text-gray-600 animate-pulse",
              "aria-hidden": "true",
            })
          ) : (
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 animate-spin">
              <span className="sr-only">Loading image...</span>
            </div>
          )}
        </div>
      )}

      {/* Error state - only show if not loading and has error */}
      {!isLoading && hasError && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-gray-800/80 p-4 backdrop-blur-sm"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-3">
            <svg 
              className="w-6 h-6 text-red-500 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            {t("failedToLoadImage", "Failed to load image")}
          </p>
          {alt && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              {alt}
            </p>
          )}
        </div>
      )}

      {/* Show image content if not loading and no error */}
      {!isLoading && !hasError && (
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