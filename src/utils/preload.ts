/**
 * Preloads critical assets and routes for better performance
 */
export const preloadAssets = (): void => {
  if (typeof window === 'undefined') return;

  // Preload critical routes
  const preloadRoute = (importFn: () => Promise<unknown>): void => {
    if ('requestIdleCallback' in window) {
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
    preloadRoute(() => import('@/pages/Home'));           // Homepage - highest priority
    preloadRoute(() => import('@/pages/Search'));         // Search results - high priority
    
    // User account pages
    preloadRoute(() => import('@/pages/Profile'));        // User profile - high priority
    preloadRoute(() => import('@/pages/Login'));          // Login page - high priority
    preloadRoute(() => import('@/pages/Register'));       // Registration page - high priority
    preloadRoute(() => import('@/pages/Settings'));       // User settings - high priority
    preloadRoute(() => import('@/pages/Messages'));       // User messages - high priority
    
    // Listing related
    preloadRoute(() => import('@/pages/Vehicles'));       // Vehicles listing - medium priority
    preloadRoute(() => import('@/pages/RealEstate'));     // Real estate listing - medium priority
    preloadRoute(() => import('@/pages/ListingSuccess')); // After listing creation - medium priority
    preloadRoute(() => import('@/components/listings/create/CreateListing')); // Create listing - medium priority
    
    // User management
    preloadRoute(() => import('@/components/profile/ChangePassword')); // Password change - medium priority
    preloadRoute(() => import('@/components/profile/MyListings'));     // User's listings - medium priority
    
    // Preload critical components used in multiple places
    preloadRoute(() => import('@/components/listings/details/ListingCard')); // Used in search and listings
    preloadRoute(() => import('@/components/search/SearchBar'));             // Used in header
    preloadRoute(() => import('@/components/common/LoadingSpinner'));                     // Used for dialogs
    preloadRoute(() => import('@/components/common/toast'));                     // Used for notifications

    // Preload critical images
    const preloadImage = (src: string): void => {
      const img = new Image();
      img.src = src;
    };

    // Add any critical images that should be preloaded
    const criticalImages = [
      '/logo.png',
      '/placeholder.jpg',
      '/icons/favicon.ico',
      '/icons/favicon-32x32.png',
      '/icons/favicon-16x16.png'
    ];

    criticalImages.forEach(preloadImage);
  } catch (error) {
    console.error('Error preloading assets:', error);
  }
};
