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
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle R2 image optimization with responsive sizes and caching
  const isR2Image = src?.includes("r2.dev");
  const baseUrl = src?.split("?")[0] || "";
  
  // Use memo to prevent unnecessary recalculations
  const imageQuality = React.useMemo(() => 
    priority ? Math.min(85, quality) : Math.max(50, Math.min(70, quality)),
    [priority, quality]
  );
  
  // Memoize the optimized URL generation
  const getOptimizedImageUrl = React.useCallback((width?: number) => {
    if (!isR2Image || !baseUrl) return src || "";
    
    const params = new URLSearchParams();
    params.set('format', 'webp');
    params.set('quality', imageQuality.toString());
    
    // Only add width if specified and greater than 0
    if (width && width > 0) {
      params.set('width', Math.ceil(width).toString());
    }
    
    // Add cache-control headers for production
    if (process.env.NODE_ENV === 'production') {
      params.set('cache-control', 'public, max-age=31536000, immutable');
    } else {
      // Cache busting for development - only add if not already present
      if (!params.has('_t')) {
        params.set('_t', Date.now().toString());
      }
    }
    
    return `${baseUrl}?${params.toString()}`;
  }, [isR2Image, baseUrl, src, imageQuality]);
  
  // Define responsive image sizes based on viewport and common display sizes
  // Using a single source set with width descriptors instead of media queries
  const responsiveSizes = React.useMemo(() => [
    // Smaller sizes for mobile
    { width: 320 },
    { width: 480 },
    // Medium sizes for tablets
    { width: 768 },
    { width: 1024 },
    // Larger sizes for desktops
    { width: 1280 },
    { width: 1600 },
    { width: 1920 }
  ], []);
  
  // Get the most appropriate image size based on viewport
  const getOptimalImageSize = React.useCallback(() => {
    if (typeof window === 'undefined') return 800; // Default server-side
    
    const viewportWidth = Math.min(window.innerWidth, 1920); // Cap at 1920px
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x DPR
    
    // Find the smallest size that's larger than viewport width
    const sortedSizes = [...responsiveSizes].sort((a, b) => a.width - b.width);
    const optimalSize = sortedSizes.find(size => size.width * dpr >= viewportWidth) || 
                       sortedSizes[sortedSizes.length - 1];
    
    return Math.ceil(optimalSize.width * dpr);
  }, [responsiveSizes]);
  
  // Preload critical images
  useEffect(() => {
    if (priority && isR2Image && baseUrl) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
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
      const key = category.toString().toUpperCase() as keyof typeof categoryIcons;
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

  // Calculate optimal image dimensions
  const optimalWidth = width || (height ? undefined : '100%');
  const optimalHeight = height || (width ? 'auto' : '100%');
  const imgAspectRatio = width && height ? (Number(width) / Number(height)).toFixed(2) : '4/3';
  
  // Generate srcSet string for responsive images
  const generateSrcSet = () => {
    if (!isR2Image || !baseUrl) return undefined;
    
    const uniqueSizes = Array.from(new Set(responsiveSizes.map(s => s.width)));
    return uniqueSizes
      .map(width => `${getOptimizedImageUrl(width)} ${width}w`)
      .join(',');
  };
  
  // Get the most appropriate image source
  const getOptimalSrc = () => {
    if (!isR2Image || !baseUrl) return src || '';
    const optimalSize = getOptimalImageSize();
    return getOptimizedImageUrl(optimalSize);
  };

  // Render the actual image
  return (
    <div 
      className={`relative ${className}`} 
      style={{ 
        width: optimalWidth, 
        height: optimalHeight,
        minHeight: '40px', // Ensure minimum height for placeholder
        aspectRatio: imgAspectRatio,
        contain: 'paint', // Improve rendering performance
      }}
      data-priority={priority ? 'true' : 'false'}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          {category && React.createElement(getCategoryIcon(category), {
            className: 'w-1/3 h-1/3 text-gray-400',
            'aria-hidden': 'true',
          })}
        </div>
      )}
      
      {/* Error state */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
          {React.createElement(getCategoryIcon(category), {
            className: 'w-1/4 h-1/4 text-gray-400 mb-2',
            'aria-hidden': 'true'
          })}
          <span className="text-sm text-gray-500 text-center">
            {alt || 'Image not available'}
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
                .map(size => `${getOptimizedImageUrl(size.width)} ${size.width}w`)
                .join(', ')}
              sizes={sizes}
            />
          )}
          
          {/* Fallback image */}
          <img
            ref={imgRef}
            src={getOptimalSrc()}
            srcSet={generateSrcSet()}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            } ${blur ? 'blur-sm' : ''}`}
            loading={loading}
            fetchPriority={priority ? 'high' : 'low'}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`}
            decoding={priority ? 'sync' : 'async'}
            style={{
              contentVisibility: 'auto', // Improve rendering performance
            }}
          />
        </picture>
      )}
    </div>
  );
};

export default memo(Image);
