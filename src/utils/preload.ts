/**
 * Preloads critical assets and routes for better performance
 */

// Internal preload function
const preloadAssetsInternal = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  // Preload critical routes
  const preloadRoute = async (importFn: () => Promise<unknown>): Promise<void> => {
    try {
      await importFn();
    } catch (error) {
      console.error('Failed to preload route:', error);
    }
  };

  // Preload critical components
  const preloadComponent = async (importFn: () => Promise<unknown>): Promise<void> => {
    try {
      await importFn();
    } catch (error) {
      console.error('Failed to preload component:', error);
    }
  };

  // Preload critical images
  const preloadImage = (src: string): void => {
    const img = new Image();
    img.src = src;
  };

  // Preload routes and components
  await Promise.all([
    preloadRoute(() => import("@/pages/Home")),
    preloadRoute(() => import("@/pages/Search")),
    preloadRoute(() => import("@/pages/Vehicles")),
    preloadRoute(() => import("@/pages/RealEstate")),
    preloadComponent(() => import("@/components/listings/details/ListingCard"))
  ]);

  // Preload critical images
  const criticalImages = [
    "/logo.png",
    "/placeholder.jpg",
    "/icons/favicon.ico",
    "/icons/favicon-32x32.png",
    "/icons/favicon-16x16.png"
  ];

  criticalImages.forEach(preloadImage);
};

// Export a lazy version for immediate use
export const preloadAssets = () => {
  if (typeof window === "undefined") return;

  // Use requestIdleCallback if available
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(preloadAssetsInternal);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(preloadAssetsInternal, 2000);
  }
};

// Export a direct version for immediate execution
export const preloadAssetsNow = async () => {
  if (typeof window === "undefined") return;
  await preloadAssetsInternal();
};

// Default export for lazy loading
export default preloadAssetsNow;
