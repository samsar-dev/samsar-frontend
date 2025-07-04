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

interface ImageProps {
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
  fetchPriority?: "high" | "low" | "auto";
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const DEFAULT_PLACEHOLDER = "";

const Image: React.FC<ImageProps> = ({
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
  fetchPriority = "auto",
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle R2 image optimization
  const isR2Image = src?.includes("r2.dev");
  const baseUrl = src?.split("?")[0] || "";
  const imageQuality = priority ? Math.min(90, quality) : quality;

  // Helper function to get the most appropriate icon based on category
  const getCategoryIcon = (category?: CategoryType) => {
    if (!category) return categoryIcons.OTHER;
    
    // Check if category exists in our icons
    if (category in categoryIcons) {
      return categoryIcons[category as keyof typeof categoryIcons];
    }
    
    // Handle specific cases or return default
    if (category.toString().toUpperCase() in categoryIcons) {
      const key = category.toString().toUpperCase() as keyof typeof categoryIcons;
      return categoryIcons[key];
    }
    
    return categoryIcons.OTHER;
  };

  // Generate optimized image URL
  const getOptimizedSrc = (width?: number) => {
    if (!isR2Image || !baseUrl) return src || "";
    return width
      ? `${baseUrl}?format=webp&quality=${imageQuality}&width=${width}`
      : `${baseUrl}?format=webp&quality=${imageQuality}`;
  };

  // Generate srcSet for responsive images
  const srcSet = (() => {
    if (!isR2Image || !baseUrl) return undefined;
    const widths = priority ? [400, 600, 800, 1200] : [800, 1200];
    return widths
      .map((w) => `${getOptimizedSrc(w)} ${w}w`)
      .join(", ");
  })();

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

  // Preload priority images
  useEffect(() => {
    if (priority && typeof window !== "undefined" && baseUrl) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = getOptimizedSrc(600);
      link.fetchPriority = "high";
      document.head.appendChild(link);
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [priority, baseUrl, imageQuality]);

  // Render fallback UI if image fails to load
  if (hasError || !src) {
    if (placeholder) {
      return (
        <img
          src={placeholder}
          alt={alt || 'Image not available'}
          className={className}
          width={width}
          height={height}
          aria-label={alt || 'Image not available'}
        />
      );
    }
    
    // Get the appropriate icon based on category
    const Icon = getCategoryIcon(category);
    return (
      <div
        className={`relative ${className}`}
        style={{
          width: width || '100%',
          height: height || '200px',
          background: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px',
        }}
        role="img"
        aria-label={alt || 'Image not available'}
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
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      style={{ minHeight: 40 }}
      tabIndex={0}
      aria-label={alt || 'Image'}
      role="img"
    >
      {isLoading && blur && (
        <div 
          className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse z-0"
          aria-hidden="true"
        />
      )}
      
      <img
        ref={imgRef}
        src={getOptimizedSrc()}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt || ''}
        className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        loading={loading}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        // @ts-ignore - fetchpriority is valid HTML but not yet in React types
        fetchpriority={fetchPriority}
        decoding={priority ? 'sync' : 'async'}
        draggable={false}
      />

      {isLoading && !blur && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <svg
            className="animate-spin h-7 w-7 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default memo(Image);
