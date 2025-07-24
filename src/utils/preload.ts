/**
 * Preloads critical assets and routes for better performance
 */
export const preloadAssets = (): void => {
  if (typeof window === "undefined") return;

  // Preload critical routes
  const preloadRoute = (importFn: () => Promise<unknown>): void => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        importFn().catch(console.error);
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => importFn().catch(console.error), 2000);
    }
  };

  try {
    // Preload critical routes - ordered by importance and likelihood of visit
    // Core pages
    preloadRoute(() => import("@/pages/Home")); // Homepage - highest priority
    preloadRoute(() => import("@/pages/Search")); // Search results - high priority

    // User account pages

    // Listing related
    preloadRoute(() => import("@/pages/Vehicles")); // Vehicles listing - medium priority
    preloadRoute(() => import("@/pages/RealEstate")); // Real estate listing - medium priority

    // User management

    // Preload critical components used in multiple places
    // Note: Removed LoadingSpinner and toast as they are statically imported elsewhere
    // Removed SearchBar as it's statically imported in Navbar
    preloadRoute(() => import("@/components/listings/details/ListingCard")); // Used in search and listings

    // Preload critical images
    const preloadImage = (src: string): void => {
      const img = new Image();
      img.src = src;
    };

    // Add any critical images that should be preloaded
    const criticalImages = [
      "/logo.png",
      "/placeholder.jpg",
      "/icons/favicon.ico",
      "/icons/favicon-32x32.png",
      "/icons/favicon-16x16.png",
    ];

    criticalImages.forEach(preloadImage);
  } catch (error) {
    console.error("Error preloading assets:", error);
  }
};
