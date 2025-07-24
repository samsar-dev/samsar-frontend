import { useEffect } from "react";

// Global set to track preloaded images
const preloadedImages = new Set<string>();

interface PreloadImagesProps {
  imageUrls: string[];
}

const PreloadImages: React.FC<PreloadImagesProps> = ({
  imageUrls,
}) => {
  useEffect(() => {
    if (!imageUrls?.length) return;
    const url = imageUrls[0];
    if (!url) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
    return () => {
      document.head.contains(link) && document.head.removeChild(link);
    };
  }, [imageUrls]);

  return null;
};

export default PreloadImages;
