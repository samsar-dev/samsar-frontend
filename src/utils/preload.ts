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
    /**
     * Preload strategy:
     * 1. Respect user/network preferences – do **not** preload on slow connections or when the user has enabled
     *    `Save-Data`.
     * 2. Only preload the absolutely critical, lightweight routes required for the initial user journey
     *    (home → search → listing card hover/open).
     */
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const saveData = connection?.saveData;
    const effectiveType = connection?.effectiveType as string | undefined;

    // Abort preloading on slow networks (2G / 3G) or when the user requests reduced data usage
    if (saveData || (effectiveType && /2g|3g/.test(effectiveType))) {
      return;
    }

    // Preload **only** the most frequently visited, lightweight routes/components
    preloadRoute(() => import('@/pages/Home'));   // Entry point
    preloadRoute(() => import('@/pages/Search')); // Next common action

    // Shared component that is visible above-the-fold in both pages
    preloadRoute(() => import('@/components/listings/details/ListingCard'));
    
    // ListingCard already preloaded above – no need for duplicate call

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
