import { useEffect } from "react";

// Global set to track preloaded images
const preloadedImages = new Set<string>();

interface PreloadImagesProps {
  imageUrls: string[];
  priority?: boolean;
  quality?: number;
  sizes?: { width: number; media?: string }[];
}

const PreloadImages: React.FC<PreloadImagesProps> = ({
  imageUrls,
  priority = false,
  quality = 85,
  sizes = [
    { width: 400, media: "(max-width: 640px)" },
    { width: 800, media: "(max-width: 1024px)" },
    { width: 1200, media: "(min-width: 1025px)" },
  ],
}) => {
  useEffect(() => {
    if (!imageUrls?.length) return;

    const preloadImage = (url: string) => {
      if (!url || preloadedImages.has(url)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.setAttribute('fetchpriority', priority ? 'high' : 'low');
      document.head.appendChild(link);
      preloadedImages.add(url);
      
      return () => {
        document.head.contains(link) && document.head.removeChild(link);
      };
    };

    // Only preload the first image
    const mainImage = imageUrls[0];
    if (mainImage) {
      if (mainImage.includes('r2.dev')) {
        const baseUrl = mainImage.split('?')[0];
        // Find the best size for current viewport
        const bestSize = sizes.find(size => 
          !size.media || window.matchMedia(size.media).matches
        ) || sizes[0];
        
        const imgUrl = `${baseUrl}?${new URLSearchParams({
          format: 'webp',
          quality: quality.toString(),
          width: bestSize.width.toString(),
        })}`;
        
        preloadImage(imgUrl);
      } else {
        preloadImage(mainImage);
      }
    }
  }, [imageUrls, priority, quality, sizes]);

  return null;
};

export default PreloadImages;