import React, { useEffect } from "react";

interface PreloadImagesProps {
  imageUrls: string[];
  priority?: "high" | "low" | "auto";
  optimizeForR2?: boolean;
  sizes?: number[];
}

const PreloadImages: React.FC<PreloadImagesProps> = ({
  imageUrls,
  priority = "high",
  optimizeForR2 = true,
  sizes = [600],
}) => {
  useEffect(() => {
    // Only preload a limited number of images to avoid resource contention
    // Focus on the first image which is most likely to be an LCP candidate
    const imagesToPreload = imageUrls.slice(0, 1);

    if (imagesToPreload.length === 0) return;

    const links: HTMLLinkElement[] = [];

    imagesToPreload.forEach((url) => {
      if (!url) return;

      // Apply R2 optimization if enabled and URL is from R2
      if (optimizeForR2 && url.includes("r2.dev")) {
        const baseUrl = url.split("?")[0];

        // For R2 images, preload the webp version with appropriate size
        // This creates one preload link per size
        sizes.forEach((size) => {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = `${baseUrl}?format=webp&quality=85&width=${size}`;
          link.setAttribute("fetchpriority", priority);
          link.setAttribute("imagesizes", `${size}px`);
          link.setAttribute("imagesrcset", `${link.href} ${size}w`);
          document.head.appendChild(link);
          links.push(link);
        });
      } else {
        // For non-R2 images, just preload the original
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = url;
        link.setAttribute("fetchpriority", priority);
        document.head.appendChild(link);
        links.push(link);
      }
    });

    return () => {
      // Cleanup preload links when component unmounts
      links.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [imageUrls, priority, optimizeForR2, sizes]);

  return null;
};

export default PreloadImages;
