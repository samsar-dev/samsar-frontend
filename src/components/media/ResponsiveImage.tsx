import React, { useState, useEffect } from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  placeholder?: string; // Optional custom placeholder image
  blur?: boolean; // Enable blur-up effect
  fetchPriority?: "high" | "low" | "auto";
}

const DEFAULT_PLACEHOLDER = "";

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
  onError,
  placeholder = DEFAULT_PLACEHOLDER,
  blur = false,
  fetchPriority = "auto",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle Cloudflare R2 URLs
  const isR2Image = src && src.includes("r2.dev");
  const baseUrl = src ? src.split("?")[0] : "";

  // Optimize image quality and format based on priority
  // Higher quality for priority images (LCP candidates)
  const imageQuality = priority ? 90 : 80;

  // For priority images, use smaller initial width to improve LCP
  const initialWidth = priority ? 600 : 800;

  const optimizedSrc = isR2Image
    ? `${baseUrl}?format=webp&quality=${imageQuality}&width=${initialWidth}`
    : src || placeholder;

  // Generate responsive URLs for R2 images with optimized quality and format
  const generateSrcSet = () => {
    if (!isR2Image || !baseUrl) return undefined;

    // Optimize widths based on priority and device sizes
    // For priority images (LCP candidates), include smaller sizes first for faster loading
    const widths = priority ? [400, 600, 800, 1200] : [800, 1200];

    return widths
      .map((width) => {
        const optimizedUrl = `${baseUrl}?width=${width}&format=webp&quality=${imageQuality}`;
        return `${optimizedUrl} ${width}w`;
      })
      .join(", ");
  };

  // Preload critical images if priority is true
  useEffect(() => {
    if (priority && typeof window !== "undefined") {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      // For priority images, preload a smaller version for faster LCP
      link.href = isR2Image
        ? `${baseUrl}?format=webp&quality=${imageQuality}&width=600`
        : src;
      link.fetchPriority = "high";

      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [priority, src, baseUrl, isR2Image, imageQuality]);

  // Handle image load
  const handleLoad = () => setLoading(false);
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    setLoading(false);
    if (onError) onError(e);
  };

  // Accessibility: fallback alt, role, tabIndex, aria-label
  const imgAlt = alt || "Image";

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      style={{ minHeight: 40 }}
      tabIndex={0}
      aria-label={imgAlt}
      role="img"
    >
      {loading && blur && !error && (
        <div
          className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse z-0"
          aria-hidden="true"
        />
      )}
      {error ? (
        <img
          src={placeholder}
          alt="Image not available"
          className="w-full h-full object-contain rounded shadow z-10"
          aria-label="Image not available"
          width="400"
          height="300"
        />
      ) : (
        <img
          src={optimizedSrc}
          srcSet={generateSrcSet()}
          sizes={sizes}
          alt={imgAlt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${blur && loading ? "opacity-0" : "opacity-100"} z-10`}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : fetchPriority}
          width={priority ? "600" : "800"}
          height="300"
          onLoad={handleLoad}
          onError={handleError}
          draggable={false}
        />
      )}
      {/* Spinner overlay when loading and not blur mode */}
      {loading && !blur && !error && (
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

export default ResponsiveImage;
