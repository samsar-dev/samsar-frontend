import { useEffect, useRef, useCallback } from "react";

// Global set to track preloaded images
const preloadedImages = new Set<string>();

interface PreloadImagesProps {
  imageUrls: string[];
  priority?: boolean;
  quality?: number;
  sizes?: { width: number; media?: string }[];
  onLoad?: () => void;
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
  onLoad,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  // Type assertion for window object
  const win = window as Window & typeof globalThis;

  // Function to check if an image is in or near the viewport
  const isInViewport = useCallback((element: HTMLElement): boolean => {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const buffer = window.innerHeight * 0.5; // 50% viewport height buffer
    
    return (
      rect.top >= -buffer &&
      rect.bottom <= (window.innerHeight + buffer)
    );
  }, []);

  // Function to handle image preloading
  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!url || preloadedImages.has(url)) {
        resolve();
        return;
      }

      // Check if the image is already in the DOM and in/near viewport
      const imgElements = Array.from(document.images).filter(
        img => (img.src === url || img.dataset.src === url) && isInViewport(img)
      );
      
      // Skip preloading if no matching visible images found
      if (imgElements.length === 0) {
        resolve();
        return;
      }

      // Use Image object for preloading
      const img = new Image();
      
      // Set up cleanup
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
        img.src = ''; // Cancel the request
      };
      cleanupRef.current.push(cleanup);

      img.onload = () => {
        preloadedImages.add(url);
        onLoad?.();
        resolve();
      };
      
      img.onerror = (error) => {
        console.warn(`Failed to preload image: ${url}`, error);
        resolve();
      };

      // Start loading
      img.src = url;
    });
  }, [onLoad, isInViewport]);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!imageUrls?.length) return;

    // Cleanup previous preloads and observer
    cleanupRef.current.forEach(cleanup => cleanup?.());
    cleanupRef.current = [];
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Only create observer if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target instanceof HTMLImageElement) {
            const img = entry.target;
            const imgUrl = img.src || img.dataset.src;
            if (imgUrl) {
              preloadImage(imgUrl);
              observerRef.current?.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50% 0px', // Start loading when within 50% of viewport
        threshold: 0.01
      });

      // Find and observe all matching images
      imageUrls.forEach(url => {
        const imgElements = document.querySelectorAll<HTMLImageElement>(
          `img[src="${url}"], img[data-src="${url}"]`
        );
        
        imgElements.forEach(img => {
          if (isInViewport(img)) {
            // If already in viewport, preload immediately
            preloadImage(url);
          } else {
            // Otherwise, observe for when it comes into view
            observerRef.current?.observe(img);
          }
        });
      });

      // Cleanup observer on unmount
      return () => {
        observerRef.current?.disconnect();
      };
    } else {
      // Fallback for browsers without IntersectionObserver
      const handleScroll = () => {
        imageUrls.forEach(url => {
          const imgElements = document.querySelectorAll<HTMLImageElement>(
            `img[src="${url}"], img[data-src="${url}"]`
          );
          
          imgElements.forEach(img => {
            if (isInViewport(img)) {
              preloadImage(url);
            }
          });
        });
      };

      // Initial check
      handleScroll();
      
      // Add scroll listener with debounce
      const debouncedScroll = debounce(handleScroll, 100) as EventListener;
      win.addEventListener('scroll', debouncedScroll, { passive: true });
      
      // Cleanup
      return () => {
        win.removeEventListener('scroll', debouncedScroll as EventListener);
      };
    }
  }, [imageUrls, preloadImage, isInViewport]);

  // Type-safe debounce helper
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
      const context = this;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };

  return null;
};

export default PreloadImages;
