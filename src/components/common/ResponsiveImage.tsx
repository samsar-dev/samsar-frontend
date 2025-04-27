import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  onError,
}) => {
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

  return (
    <img
      src={isR2Image ? `${baseUrl}?format=webp&quality=85` : src}
      srcSet={generateSrcSet()}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      onError={onError}
    />
  );
};

export default ResponsiveImage;