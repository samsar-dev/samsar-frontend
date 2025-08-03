import type React from 'react';
import { useEffect, useMemo, memo } from 'react';

interface PreloadImagesProps {
  imageUrls: string[];
}

const PreloadImages: React.FC<PreloadImagesProps> = ({ imageUrls = [] }) => {
  useMemo(() => {
    if (!imageUrls.length) return;
    
    const uniqueUrls = Array.from(new Set(imageUrls));
    uniqueUrls.forEach(url => {
      if (!url) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [imageUrls]);

  useEffect(() => {
    return () => {
      const links = document.querySelectorAll('link[rel="preload"][as="image"]');
      links.forEach(link => link.remove());
    };
  }, []);

  return null;
};

export default memo(PreloadImages);
