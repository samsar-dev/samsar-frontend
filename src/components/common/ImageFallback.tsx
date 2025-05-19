import React, { useState, useEffect, useRef, memo } from "react";

// SVG placeholder for when images fail to load
const svgPlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23757575' font-size='16'%3EImage Unavailable%3C/text%3E%3C/svg%3E";
  
// Backup placeholder in case SVG fails
const fallbackPlaceholder = "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

interface ImageFallbackProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  onError?: (error: React.SyntheticEvent) => void;
  width?: number | string;
  height?: number | string;
  sizes?: string;
  srcSet?: string;
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
}) => {
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  
  // Track mount state to prevent state updates on unmounted component
  const isMountedRef = useRef(true);
  
  // Track load attempts to prevent infinite retry loops
  const loadAttemptsRef = useRef(0);
  const maxLoadAttempts = 2;

  // Reset component state when src changes
  useEffect(() => {
    // Only update state if the component is still mounted
    if (isMountedRef.current) {
      setIsError(false);
      setIsLoaded(false);
      setImgSrc(src);
      loadAttemptsRef.current = 0;
    }
  }, [src]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle error state with fallback image
  if (isError) {
    return (
      <div
        className={`relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}
      >
        <img
          src={svgPlaceholder}
          alt="Image Unavailable"
          className="w-full h-full object-cover"
          loading={loading}
          decoding="async"
          role="img"
          aria-label="Placeholder image"
          width={width}
          height={height}
          onError={() => {
            // If even the SVG placeholder fails, use a minimal fallback
            if (isMountedRef.current) {
              const img = document.createElement('img');
              img.src = fallbackPlaceholder;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full ${!isLoaded ? "bg-gray-50 dark:bg-gray-800" : ""}`}
    >
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-cover ${className} transition-opacity duration-300`}
        onError={(e) => {
          // Handle image load errors with retry logic
          if (isMountedRef.current) {
            loadAttemptsRef.current += 1;
            
            // Try to reload the image once before showing error state
            if (loadAttemptsRef.current <= maxLoadAttempts && imgSrc === src) {
              // Add cache-busting parameter for retry
              const retrySrc = `${src}${src.includes('?') ? '&' : '?'}retry=${Date.now()}`;
              setImgSrc(retrySrc);
            } else {
              setIsError(true);
              onError?.(e);
            }
          }
        }}
        onLoad={() => {
          if (isMountedRef.current) {
            setIsLoaded(true);
          }
        }}
        loading={loading}
        decoding="async"
        width={width}
        height={height}
        sizes={sizes}
        srcSet={srcSet}
      />
    </div>
  );
};

export default memo(ImageFallback);