import { useEffect } from "react";
import { prefetchCriticalRoutes } from "@/utils/prefetch";

/**
 * Hook to prefetch critical routes after the app has loaded
 * Should be used in the main App component or layout
 */
export const usePrefetchCritical = (delay: number = 3000) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      prefetchCriticalRoutes();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);
};

/**
 * Hook to prefetch routes based on user authentication status
 */
export const usePrefetchByAuth = (
  isAuthenticated: boolean,
  delay: number = 2000,
) => {
  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const timer = setTimeout(() => {
      // Prefetch authenticated user routes
      import("@/pages/Profile").catch(() => {});
      import("@/pages/Settings").catch(() => {});
      import("@/pages/Messages").catch(() => {});
      import("@/components/listings/create/CreateListing").catch(() => {});
    }, delay);

    return () => clearTimeout(timer);
  }, [isAuthenticated, delay]);
};
