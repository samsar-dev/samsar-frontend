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
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "fetchPriority" | "srcSet"> {
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
  srcSet?: string;
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

  // Handle R2 image optimization with Cloudflare best practices
  const isR2Image = src?.includes("r2.dev");
  const baseUrl = src?.split("?")[0] || "";
  const imageQuality = priority ? Math.min(90, quality) : Math.max(60, quality);

  // Generate optimized image URL with Cloudflare best practices
  const getOptimizedImageUrl = (width?: number, dpr: number = 1) => {
    if (!isR2Image || !baseUrl) return src || "";
    const params = new URLSearchParams();
    
    // Use format=auto for browser-specific optimization
    params.append("format", "auto");
    // Use fit=cover to maintain aspect ratio
    params.append("fit", "cover");
    // Adjust quality based on size
    if (width && width <= 400) {
      params.append("quality", "60");
    } else if (width && width <= 800) {
      params.append("quality", "70");
    } else {
      params.append("quality", "75");
    }
    
    if (width) {
      const finalWidth = Math.round(width * dpr);
      params.append("width", finalWidth.toString());
    }

    // Add cache-busting parameter for non-production environments
    if (process.env.NODE_ENV !== "production") {
      params.append("_t", Date.now().toString());
    }

    return `${baseUrl}?${params.toString()}`;
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (widths: number[]) => {
    if (!isR2Image || !baseUrl) return undefined;
    
    return widths
      .map(width => {
        const url1x = getOptimizedImageUrl(width, 1);
        const url2x = getOptimizedImageUrl(width, 2);
        return `${url1x} 1x, ${url2x} 2x`;
      })
      .join(', ');
  };

  // Define responsive image sizes with proper aspect ratio
  const responsiveSizes = [
    { media: "(max-width: 640px)", width: 300 },
    { media: "(max-width: 1024px)", width: 500 },
    { media: "(min-width: 1025px)", width: 300 },
  ];
  
  // Default sizes attribute for responsive images
  const defaultSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  // Preload critical images
  useEffect(() => {
    if (priority && isR2Image && baseUrl) {
      // Preconnect to R2 domain
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = 'https://pub-363346cde076465bb0bb5ca74ae5d4f9.r2.dev';
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);

      // Preload critical image
      const preloadLink = document.createElement("link");
      preloadLink.rel = "preload";
      preloadLink.as = "image";
      preloadLink.href = getOptimizedImageUrl(300, 1);
      
      // Add srcSet for preloading
      const srcSet = [
        `${getOptimizedImageUrl(300, 1)} 1x`,
        `${getOptimizedImageUrl(300, 2)} 2x`
      ].join(', ');
      
      preloadLink.setAttribute('imagesrcset', srcSet);
      document.head.appendChild(preloadLink);

      return () => {
        document.head.removeChild(preloadLink);
        document.head.removeChild(preconnect);
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
        <Icon className="text-4xl text-gray-400" />
        <div className="text-gray-500 text-center">
          <p className="mt-2">Image Unavailable</p>
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
            src={isR2Image ? getOptimizedImageUrl(300, 1) : src}
            srcSet={isR2Image ? generateSrcSet([300, 500]) : undefined}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
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
            sizes={sizes || defaultSizes}
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