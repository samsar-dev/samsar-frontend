import React, { useState, useEffect } from "react";

const svgPlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23757575' font-size='16'%3EImage Unavailable%3C/text%3E%3C/svg%3E";

interface ImageFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

const ImageFallback: React.FC<ImageFallbackProps> = ({
  src,
  alt,
  className = "",
  onError,
}) => {
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsError(false);
  }, [src]);

  if (isError) {
    return (
      <div
        className={`relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}
      >
        <img
          src={svgPlaceholder}
          alt="Image Unavailable"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          role="img"
          aria-label="Placeholder image"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onError={() => {
        setIsError(true);
        onError?.();
      }}
      loading="lazy"
      decoding="async"
    />
  );
};

export default ImageFallback;
