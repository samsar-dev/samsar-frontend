import React, { useEffect } from 'react';

interface PreloadImagesProps {
  imageUrls: string[];
  priority?: boolean;
  quality?: number;
  sizes?: { width: number; media?: string }[];
}

/**
 * Preloads images to improve perceived performance
 * Only preloads the first image by default as it's likely the LCP candidate
 */
const PreloadImages: React.FC<PreloadImagesProps> = ({
  imageUrls,
  priority = false,
  quality = 85,
  sizes = [
    { width: 400, media: '(max-width: 640px)' },
    { width: 800, media: '(max-width: 1024px)' },
    { width: 1200, media: '(min-width: 1025px)' },
  ],
}) => {
  useEffect(() => {
    if (!imageUrls?.length) return;
    
    // Only preload the first image to avoid resource contention
    const imageUrl = imageUrls[0];
    if (!imageUrl) return;

    const links: HTMLLinkElement[] = [];
    const isR2Image = imageUrl.includes('r2.dev');
    const baseUrl = imageUrl.split('?')[0];

    // Create a single preload for the most likely size (800px)
    const createPreloadLink = (width: number) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      
      if (isR2Image) {
        const params = new URLSearchParams({
          format: 'webp',
          quality: quality.toString(),
          width: width.toString(),
        });
        link.href = `${baseUrl}?${params.toString()}`;
      } else {
        link.href = imageUrl;
      }
      
      link.setAttribute('fetchpriority', priority ? 'high' : 'low');
      document.head.appendChild(link);
      return link;
    };

    // Preload the most common size (800px)
    const commonSize = sizes.find(s => s.width === 800) || sizes[Math.floor(sizes.length / 2)];
    if (commonSize) {
      links.push(createPreloadLink(commonSize.width));
    }

    return () => {
      // Cleanup preload links when component unmounts
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [imageUrls, priority, quality, sizes]);

  return null;
};

export default PreloadImages;
