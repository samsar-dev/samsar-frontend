import { Routes as RouterRoutes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useState, useCallback, memo } from "react";
import type { RouteObject } from "react-router-dom";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { preloadCriticalAssets } from "@/utils/preloadUtils";

// Helper type for lazy-loaded components
type LazyComponentType<P = {}> = React.LazyExoticComponent<React.ComponentType<P>>;

// Helper to create memoized page components with proper error boundaries
const createPage = <P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  options: { preload?: boolean } = {}
): React.MemoExoticComponent<LazyComponentType<P>> => {
  const LazyComponent = lazy(importFn);
  const MemoizedComponent = memo(LazyComponent);
  
  // Add preload capability
  if (options.preload) {
    // Trigger preload in the background
    importFn().catch(() => {
      // Handle error silently - component will load when needed
    });
  }
  
  return MemoizedComponent;
};

// Simple implementation without the complex preloading that was causing type issues
const createLazyPage = <P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>
) => {
  return lazy(importFn);
};

// Preload critical route components with chunk names and priority
const Home = createPage(() => import("@/pages/Home"), { preload: true });
const Search = createPage(() => import("@/pages/Search"));

// Marketplace routes
const Vehicles = createLazyPage(() => import("@/pages/Vehicles"));
const RealEstate = createLazyPage(() => import("@/pages/RealEstate"));

// System routes
const NotFound = createLazyPage(() => import("@/pages/NotFound"));

export const PageComponents = {
  // Public routes
  Home,
  Search,
  
  // Marketplace routes
  Vehicles,
  RealEstate,
  
  // System routes
  NotFound
} as const;

type RouteKey = keyof typeof PageComponents;

// Preload critical assets when the app starts
if (typeof window !== 'undefined') {
  // Preload critical JS chunks
  const preloadScript = (src: string) => {
    // Only preload if the resource hasn't been loaded yet
    if (!document.querySelector(`link[href="${src}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      document.head.appendChild(link);
    }
  };

  // Add preload for critical chunks
  if (process.env.NODE_ENV === 'production') {
    // These paths should match your build output
    preloadScript('/static/js/main.chunk.js');
    preloadScript('/static/js/vendors~main.chunk.js');
  }
}

// Lazy load routes with proper code splitting
const Routes = () => {
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Preload non-critical routes when app starts
  useEffect(() => {
    const preloadRoutes = async () => {
      try {
        // Preload critical assets first
        preloadCriticalAssets();
        
        // Then preload route chunks
        await Promise.all([
          import("@/routes/MainRoutes"),
          import("@/routes/AuthRoutes"),
          import("@/routes/ProfileRoutes").catch(() => null),
          import("@/routes/AdminRoutes").catch(() => null),
        ]);
        
        // Preload main content that's likely to be visited next
        setTimeout(() => {
          Promise.all([
            import("@/pages/Search"),
            import("@/pages/Vehicles"),
            import("@/pages/RealEstate")
          ]).catch(() => null);
        }, 1000);
      } catch (error) {
        console.error("Failed to preload routes:", error);
      }
    };
    
    preloadRoutes();
  }, []);

  // Helper function to flatten route tree
  const flattenRoutes = (routes: RouteObject[], parentPath = ""): RouteObject[] => {
    return routes.flatMap(route => {
      const fullPath = parentPath + (route.path || "");
      const children = route.children ? flattenRoutes(route.children, fullPath) : [];
      return [{ ...route, path: fullPath }, ...children];
    });
  };

  const loadRoutes = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Define default empty routes for error cases
      const defaultRoutes: RouteObject[] = [];
      
      // Load route modules in parallel with error handling for each
      const [
        mainModule,
        authModule,
        adminModule,
        profileModule
      ] = await Promise.allSettled([
        import("./MainRoutes"),
        import("./AuthRoutes"),
        import("./AdminRoutes"),
        import("./ProfileRoutes")
      ]);
      
      // Extract routes with proper error handling
      const mainRoutes = mainModule.status === 'fulfilled' ? mainModule.value.default : defaultRoutes;
      const authRoutes = authModule.status === 'fulfilled' ? authModule.value.default : defaultRoutes;
      const adminRoutes = adminModule.status === 'fulfilled' ? adminModule.value.default : defaultRoutes;
      const profileRoutes = profileModule.status === 'fulfilled' ? profileModule.value.default : defaultRoutes;

      // Combine all routes with not found fallback
      const allRoutes = [
        ...mainRoutes,
        ...authRoutes,
        ...adminRoutes,
        ...profileRoutes,
        { 
          path: "*", 
          element: <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen" />}>
              <NotFound />
            </Suspense>
          </ErrorBoundary>
        }
      ];
      
      // Flatten the route tree and update state
      setRoutes(flattenRoutes(allRoutes));
    } catch (error) {
      console.error("Failed to load routes:", error);
      // Fallback to essential routes only
      setRoutes([
        { 
          path: "/", 
          element: (
            <ErrorBoundary>
              <Suspense fallback={<div className="min-h-screen" />}>
                <Home />
              </Suspense>
            </ErrorBoundary>
          ) 
        },
        { 
          path: "*", 
          element: (
            <ErrorBoundary>
              <Suspense fallback={<div className="min-h-screen" />}>
                <NotFound />
              </Suspense>
            </ErrorBoundary>
          ) 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load routes on component mount
  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  // Simple route rendering without animations
  const renderRoutes = useCallback(() => {
    return routes.map((route, index) => (
      <Route 
        key={`${route.path || 'route'}-${index}`} 
        path={route.path} 
        element={
          route.element ? (
            <ErrorBoundary>
              <Suspense fallback={null}>
                {route.element}
              </Suspense>
            </ErrorBoundary>
          ) : null
        }
      >
        {route.children?.map((child, childIndex) => (
          <Route
            key={`${child.path || 'child'}-${childIndex}`}
            path={child.path}
            element={
              child.element ? (
                <ErrorBoundary>
                  <Suspense fallback={null}>
                    {child.element}
                  </Suspense>
                </ErrorBoundary>
              ) : null
            }
          />
        ))}
      </Route>
    ));
  }, [routes]);

  if (isLoading) {
    return null; // Or a minimal loading state if needed
  }

  return (
    <RouterRoutes>
      {renderRoutes()}
    </RouterRoutes>
  );
};

export default Routes;
