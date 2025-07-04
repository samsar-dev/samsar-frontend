import React, { useEffect } from 'react';

interface PreloadImagesProps {
  imageUrls: string[];
  priority?: boolean;
  quality?: number;
  sizes?: { width: number; media?: string; dpr?: number }[];
}

/**
 * Preloads critical images to improve LCP and perceived performance
 * Only preloads the first image by default as it's likely the LCP candidate
 * Uses responsive images with appropriate sizes and DPR for different devices
 */
const PreloadImages: React.FC<PreloadImagesProps> = ({
  imageUrls,
  priority = false,
  quality = 75, // Slightly lower quality for preload to save bandwidth
  sizes = [
    // Mobile - 1x and 2x DPI
    { width: 400, media: '(max-width: 640px)', dpr: 1 },
    { width: 800, media: '(max-width: 640px)', dpr: 2 },
    // Tablet - 1x and 2x DPI
    { width: 800, media: '(min-width: 641px) and (max-width: 1024px)', dpr: 1 },
    { width: 1200, media: '(min-width: 641px) and (max-width: 1024px)', dpr: 2 },
    // Desktop - 1x and 2x DPI
    { width: 1200, media: '(min-width: 1025px)', dpr: 1 },
    { width: 1800, media: '(min-width: 1025px)', dpr: 2 },
  ],
}) => {
  useEffect(() => {
    if (!imageUrls.length) return;

    // Only preload the first image by default as it's likely the LCP candidate
    const imageUrl = imageUrls[0];
    if (!imageUrl) return;

    const isR2Image = imageUrl.includes('r2.dev');
    const baseUrl = imageUrl.split('?')[0];
    
    // Don't preload if it's not an R2 image or if we can't determine base URL
    if (!isR2Image || !baseUrl) return;

    const preloadLinks: HTMLLinkElement[] = [];
    const linkAttributes = {
      as: 'image',
      fetchpriority: priority ? 'high' : 'low',
      // Add cache control for production
      ...(process.env.NODE_ENV === 'production' && {
        'data-cache-control': 'public, max-age=31536000, immutable',
      }),
    };

    // Create a function to generate preload links
    const createPreloadLink = (width: number, dpr: number = 1) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      // Set attributes
      Object.entries(linkAttributes).forEach(([key, value]) => {
        link.setAttribute(key, String(value));
      });
      
      // For R2 images, use WebP format and specified quality
      const params = new URLSearchParams({
        format: 'webp',
        quality: Math.round(quality * (dpr > 1 ? 0.9 : 1)).toString(), // Slightly better quality for HiDPI
        width: Math.ceil(width * dpr).toString(),
      });
      
      // Add cache control for production
      if (process.env.NODE_ENV === 'production') {
        params.append('cache-control', 'public, max-age=31536000, immutable');
      }
      
      link.href = `${baseUrl}?${params.toString()}`;
      
      // Add media query if specified
      const mediaQuery = sizes.find(s => s.width === width)?.media;
      if (mediaQuery) {
        link.media = mediaQuery;
      }
      
      // Add image dimensions as data attributes for debugging
      link.dataset.width = `${Math.ceil(width * dpr)}`;
      link.dataset.dpr = dpr.toString();
      
      document.head.appendChild(link);
      return link;
    };

    // Create preload links for each size and DPR
    const uniqueSizes = Array.from(
      new Set(sizes.map(s => s.width))
    );
    
    // Preload 1x and 2x versions for each size
    uniqueSizes.forEach(width => {
      if (width) {
        // Preload 1x
        preloadLinks.push(createPreloadLink(width, 1));
        
        // Only preload 2x for high DPI devices
        const mediaForSize = sizes.find(s => s.width === width)?.media || '';
        const hiDpiMedia = mediaForSize 
          ? `${mediaForSize} and (-webkit-min-device-pixel-ratio: 1.5), ${mediaForSize} and (min-resolution: 144dpi)`
          : '(-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi)';
        
        const hiDpiLink = createPreloadLink(width, 2);
        hiDpiLink.media = hiDpiMedia;
        preloadLinks.push(hiDpiLink);
      }
    });

    // Cleanup function to remove preload links when component unmounts
    return () => {
      preloadLinks.forEach(link => {
        if (link?.parentNode === document.head) {
          document.head.removeChild(link);
        }
      });
    };
  }, [imageUrls, priority, quality, sizes]);

  return null; // This component doesn't render anything
};

export default PreloadImages;
