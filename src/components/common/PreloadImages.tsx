import React, { useEffect } from 'react';

interface PreloadImagesProps {
  imageUrls: string[];
  priority?: 'high' | 'low' | 'auto';
  optimizeForR2?: boolean;
}

const PreloadImages: React.FC<PreloadImagesProps> = ({ 
  imageUrls, 
  priority = 'high',
  optimizeForR2 = true
}) => {
  useEffect(() => {
    // Only preload a limited number of images to avoid resource contention
    const imagesToPreload = imageUrls.slice(0, 3);
    
    const links = imagesToPreload.map((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      
      // Apply R2 optimization if enabled and URL is from R2
      if (optimizeForR2 && url.includes('r2.dev')) {
        const baseUrl = url.split('?')[0];
        link.href = `${baseUrl}?format=webp&quality=80`;
      } else {
        link.href = url;
      }
      
      // Set fetch priority
      link.setAttribute('fetchpriority', priority);
      
      document.head.appendChild(link);
      return link;
    });

    return () => {
      // Cleanup preload links when component unmounts
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [imageUrls, priority, optimizeForR2]);

  return null;
};

export default PreloadImages;
