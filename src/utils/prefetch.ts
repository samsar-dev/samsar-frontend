/**
 * Utility functions for dynamic import prefetching
 * Helps improve perceived performance by preloading routes before user navigation
 */

// Cache for prefetched modules to avoid duplicate requests
const prefetchCache = new Set<string>();

/**
 * Prefetch a dynamic import with optional delay
 * @param importFn - Function that returns a dynamic import promise
 * @param delay - Optional delay in milliseconds before prefetching (default: 0)
 * @param key - Optional cache key to prevent duplicate prefetches
 */
export const prefetchRoute = <T>(
  importFn: () => Promise<T>,
  delay: number = 0,
  key?: string
): void => {
  // Use cache key or function string as identifier
  const cacheKey = key || importFn.toString();
  
  if (prefetchCache.has(cacheKey)) {
    return; // Already prefetched
  }
  
  prefetchCache.add(cacheKey);
  
  const prefetch = () => {
    importFn().catch((error) => {
      console.warn('Prefetch failed:', error);
      // Remove from cache so it can be retried
      prefetchCache.delete(cacheKey);
    });
  };
  
  if (delay > 0) {
    setTimeout(prefetch, delay);
  } else {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 0);
    }
  }
};

/**
 * Create a lazy component with prefetch capability
 * @param importFn - Function that returns a dynamic import promise
 * @param prefetchDelay - Delay before prefetching (default: 2000ms)
 */
export const lazyWithPrefetch = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  prefetchDelay: number = 2000
) => {
  // Start prefetching after a delay
  prefetchRoute(importFn, prefetchDelay);
  
  // Return the lazy component
  return React.lazy(importFn);
};

/**
 * Prefetch routes based on user interaction patterns
 * Call this on hover, focus, or other user interactions
 */
export const prefetchOnInteraction = (
  importFn: () => Promise<any>,
  key?: string
) => {
  prefetchRoute(importFn, 100, key); // Small delay to avoid blocking current interaction
};

/**
 * Prefetch critical routes immediately after app load
 * Should be called after the initial route has loaded
 */
export const prefetchCriticalRoutes = () => {
  // Prefetch commonly accessed routes
  const criticalRoutes: Array<() => Promise<any>> = [
    () => import('@/pages/Profile'),
    () => import('@/pages/Settings'),
    () => import('@/pages/Messages'),
    () => import('@/components/listings/create/CreateListing'),
    () => import('@/pages/Search'),
  ];
  
  criticalRoutes.forEach((route, index) => {
    // Stagger prefetching to avoid overwhelming the network
    prefetchRoute(route, index * 500, `critical-route-${index}`);
  });
};

/**
 * Hook to prefetch routes on component mount
 */
export const usePrefetch = (routes: Array<() => Promise<any>>, delay: number = 1000) => {
  React.useEffect(() => {
    routes.forEach((route, index) => {
      prefetchRoute(route, delay + (index * 200));
    });
  }, [routes, delay]);
};

// Import React for the lazy function
import React from 'react';
