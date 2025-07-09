import React, { useEffect } from "react";

interface PreloadImagesProps {
  imageUrls: string[];
  priority?: boolean;
  quality?: number;
  sizes?: { width: number; media?: string }[];
}

/**
 * Preloads the first image for perceived performance.
 * Mobile-aware. Avoids preloading unused sizes on mobile.
 */
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
    if (!imageUrls?.length || !imageUrls[0]) return;

    const imageUrl = imageUrls[0];
    const isR2Image = imageUrl.includes("r2.dev");
    const baseUrl = imageUrl.split("?")[0];
    const links: HTMLLinkElement[] = [];

    // Find size based on window width
    const bestSize =
      sizes.find((s) => {
        if (!s.media) return false;
        return window.matchMedia(s.media).matches;
      }) || sizes[0];

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.setAttribute("fetchpriority", priority ? "high" : "low");

    link.href = isR2Image
      ? `${baseUrl}?${new URLSearchParams({
          format: "webp",
          quality: quality.toString(),
          width: bestSize.width.toString(),
        })}`
      : imageUrl;

    document.head.appendChild(link);
    links.push(link);

    return () => {
      links.forEach(
        (l) => document.head.contains(l) && document.head.removeChild(l),
      );
    };
  }, [imageUrls, priority, quality, sizes]);

  return null;
};

export default PreloadImages;
