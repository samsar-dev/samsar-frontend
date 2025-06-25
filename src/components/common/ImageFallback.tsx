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
import { ListingCategory, VehicleType, PropertyType } from "@/types/enums";

// Category icons mapping
const categoryIcons = {
  CAR: FaCar,
  TRUCK: FaTruck,
  MOTORCYCLE: FaMotorcycle,
  RV: FaCarSide,
  BUS: FaBus,
  VAN: FaCarSide, // Using car side view for van since no van icon available
  TRACTOR: FaTractor,
  CONSTRUCTION: FiTool, // Using tool icon for construction
  REAL_ESTATE: FaHome,
  OTHER: FiMapPin,
  // Adding more specific real estate icons
  HOUSE: FaHome,
  APARTMENT: FaBuilding,
  CONDO: FaBuilding,
  LAND: FaLandmark,
  COMMERCIAL: IoBusinessOutline // Using business outline icon for commercial
};

interface ImageFallbackProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  onError?: (error: Error | React.SyntheticEvent) => void;
  width?: number | string;
  height?: number | string;
  sizes?: string;
  srcSet?: string;
  category?: string; // Listing category for icon selection
}

const ImageFallback: React.FC<ImageFallbackProps> = ({
  src,
  alt,
  className = "",
  loading = "lazy",
  onError,
  width,
  height,
  sizes,
  srcSet,
  category,
}) => {
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setError(false);
    };
    img.onerror = () => {
      setError(true);
      if (onError) onError(new Error('Image failed to load'));
    };
  }, [src, onError]);

  if (error) {
    const Icon = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.OTHER;
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
      >
        <Icon className="text-4xl text-gray-400" />
        <div className="text-gray-500 text-center">
          <p className="mt-2">Image Unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      loading={loading}
      width={width}
      height={height}
      sizes={sizes}
      srcSet={srcSet}
    />
  );
};

// Helper function to get category from listing
export const getCategoryIcon = (listing: { category: { mainCategory: string, subCategory?: string } }) => {
  const { mainCategory, subCategory } = listing.category;
  
  // Handle vehicle types
  if (mainCategory === ListingCategory.VEHICLES) {
    switch (subCategory) {
      case VehicleType.CAR:
      case VehicleType.TRUCK:
      case VehicleType.MOTORCYCLE:
      case VehicleType.BUS:
      case VehicleType.TRACTOR:
        return subCategory;
      case VehicleType.RV:
      case VehicleType.VAN:
      case VehicleType.CONSTRUCTION:
        return subCategory;
      default:
        return 'OTHER';
    }
  }
  
  // Handle real estate types
  if (mainCategory === ListingCategory.REAL_ESTATE) {
    switch (subCategory) {
      case PropertyType.HOUSE:
      case PropertyType.APARTMENT:
      case PropertyType.CONDO:
      case PropertyType.LAND:
      case PropertyType.COMMERCIAL:
        return subCategory;
      default:
        return 'REAL_ESTATE';
    }
  }
  
  return 'OTHER';
};

export default memo(ImageFallback);
