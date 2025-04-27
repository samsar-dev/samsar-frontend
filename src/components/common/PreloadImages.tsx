import React, { useEffect } from 'react';

interface PreloadImagesProps {
  imageUrls: string[];
}

const PreloadImages: React.FC<PreloadImagesProps> = ({ imageUrls }) => {
  useEffect(() => {
    imageUrls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup preload links when component unmounts
      document.head.querySelectorAll('link[rel="preload"][as="image"]').forEach(link => {
        document.head.removeChild(link);
      });
    };
  }, [imageUrls]);

  return null;
};

export default PreloadImages;
