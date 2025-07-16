import React, { useState, useEffect, useRef, memo } from "react";
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
  fallbackText?: string;
  placeholder?: string;
  blur?: boolean;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
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

  // Calculate optimal quality and width based on viewport and priority
  const calculateOptimalQuality = () => {
    // Use more aggressive compression
    if (priority) return 75; // High quality for priority images
    if (window.innerWidth < 640) return 40; // Lower quality for mobile
    return 55; // Medium quality for desktop
  };

  const calculateOptimalWidth = () => {
    // Use smaller dimensions based on container size
    const containerWidth = window.innerWidth;
    const containerHeight = 192; // 48 * 4 (from h-48)

    // Calculate aspect ratio based on container
    const aspectRatio = containerWidth / containerHeight;

    // Adjust width based on aspect ratio and viewport
    if (priority) {
      return Math.min(1200, Math.round(containerWidth * 0.9)); // Max 1200px for priority
    }

    if (containerWidth < 640) {
      return Math.min(400, Math.round(containerWidth * 0.7)); // Mobile optimized
    }

    if (containerWidth < 1024) {
      return Math.min(800, Math.round(containerWidth * 0.8)); // Tablet optimized
    }

    return Math.min(1200, Math.round(containerWidth * 0.8)); // Desktop optimized
  };

  const imageQuality = calculateOptimalQuality();
  const optimalWidth = calculateOptimalWidth();

  // State for image loading and error handling
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [srcSet, setSrcSet] = useState<string | undefined>();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Update image URL when optimalWidth changes
  useEffect(() => {
    // Generate srcSet with multiple sizes
    const sizes = [200, 400, 600, 800, 1000, 1200];
    const srcSet = sizes
      .map((size) => `${getOptimizedImageUrl(size)} ${size}w`)
      .join(", ");

    setImageUrl(getOptimizedImageUrl(optimalWidth));
    setSrcSet(srcSet);
  }, [optimalWidth]);

  // Generate optimized image URL with proper caching headers
  const getOptimizedImageUrl = (width: number) => {
    if (!isR2Image || !baseUrl) return src || "";
    const params = new URLSearchParams();

    // Use AVIF format if supported
    const supportsAVIF = 'image/avif' in window.Image.prototype.decode;
    params.append("format", supportsAVIF ? "avif" : "webp");
    
    // Use more aggressive compression
    params.append("quality", "30"); // Very low quality for faster loading
    params.append("width", width.toString());
    
    // Add progressive loading
    params.append("progressive", "true");
    
    // Add proper caching headers
    const cacheControl = process.env.NODE_ENV === "production" 
      ? "public, max-age=31536000, immutable" // 1 year in production
      : "public, max-age=3600"; // 1 hour in development
    
    params.append("cache-control", cacheControl);
    params.append("expires", new Date(Date.now() + (cacheControl === "public, max-age=31536000, immutable" ? 31536000000 : 3600000)).toUTCString());
    
    // Add proper response headers
    params.append("vary", "Accept, Accept-Encoding");
    params.append("content-type", supportsAVIF ? "image/avif" : "image/webp");
    params.append("content-disposition", "inline");
    
    // Add cache-busting parameter for non-production environments
    if (process.env.NODE_ENV !== "production") {
      params.append("_t", Date.now().toString());
    }

    return `${baseUrl}?${params.toString()}`;
  };

  // Define responsive image sizes based on viewport
  // Use narrower responsive widths to reduce transfer size
  const responsiveSizes = [
    { media: "(max-width: 640px)", width: 300 },
    { media: "(max-width: 1024px)", width: 600 },
    { media: "(min-width: 1025px)", width: 900 },
  ];

  // Preload critical images
  useEffect(() => {
    if (priority && isR2Image && baseUrl) {
      const preloadLink = document.createElement("link");
      preloadLink.rel = "preload";
      preloadLink.as = "image";
      preloadLink.href = getOptimizedImageUrl(600); // Preload medium size (reduced)
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
          width: width,
          height: height,
        }}
      >
        {error ? (
          <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
            <span className="text-red-600">Error loading image</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            srcSet={srcSet}
            sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
            alt={alt}
            className={`absolute inset-0 object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => {
              setImageLoaded(true);
              if (onLoad) onLoad();
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              setError(true);
              if (onError) onError(e);
            }}
            loading={loading}
            decoding="async"
          />
        )}

        {!imageLoaded && !error && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            {placeholder ? (
              <img
                src={placeholder}
                alt="Placeholder"
                className="w-1/3 h-1/3 object-contain"
              />
            ) : (
              <span className="text-gray-600">Loading...</span>
            )}
          </div>
        )}
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
            className: "w-1/4 h-1/4 text-gray-400 mb-2",
            "aria-hidden": "true",
          })}
          <span className="text-sm text-gray-500 text-center">
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