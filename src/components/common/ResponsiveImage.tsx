import React, { useState } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  placeholder?: string; // Optional custom placeholder image
  blur?: boolean;       // Enable blur-up effect
}

const DEFAULT_PLACEHOLDER = "/placeholder.jpg";

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  onError,
  placeholder = DEFAULT_PLACEHOLDER,
  blur = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle Cloudflare R2 URLs
  const isR2Image = src.includes('r2.dev');
  const baseUrl = src.split('?')[0];

  // Generate responsive URLs for R2 images
  const generateSrcSet = () => {
    if (!isR2Image) return undefined;
    const widths = [400, 800, 1200, 1600];
    return widths
      .map(width => {
        const optimizedUrl = `${baseUrl}?width=${width}&format=webp&quality=85`;
        return `${optimizedUrl} ${width}w`;
      })
      .join(', ');
  };

  // Handle image load
  const handleLoad = () => setLoading(false);
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    setLoading(false);
    if (onError) onError(e);
  };

  // Accessibility: fallback alt, role, tabIndex, aria-label
  const imgAlt = alt || 'Image';

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      style={{ minHeight: 40 }}
      tabIndex={0}
      aria-label={imgAlt}
      role="img"
    >
      {loading && blur && !error && (
        <img
          src={placeholder}
          alt="Loading..."
          className="absolute inset-0 w-full h-full object-cover blur-md animate-pulse z-0"
          aria-hidden="true"
        />
      )}
      {error ? (
        <img
          src={placeholder}
          alt="Image not available"
          className="w-full h-full object-contain rounded shadow z-10"
          aria-label="Image not available"
        />
      ) : (
        <img
          src={isR2Image ? `${baseUrl}?format=webp&quality=85` : src}
          srcSet={generateSrcSet()}
          sizes={sizes}
          alt={imgAlt}
          className={`w-full h-full object-contain transition-opacity duration-500 ${blur && loading ? 'opacity-0' : 'opacity-100'} z-10`}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          draggable={false}
        />
      )}
      {/* Spinner overlay when loading and not blur mode */}
      {loading && !blur && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <svg className="animate-spin h-7 w-7 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ResponsiveImage;