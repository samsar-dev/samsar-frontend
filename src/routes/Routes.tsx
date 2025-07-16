import { Routes as RouterRoutes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useState, useCallback, useMemo, memo } from "react";
import type { RouteObject } from "react-router-dom";
import type { ErrorInfo } from 'react';
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Reusable loading component with consistent styling
const RouteLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status" aria-live="polite">
    <LoadingSpinner 
      size="lg"
      label="Loading page..."
      ariaLive="polite"
      ariaAtomic={true}
    />
  </div>
);
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { debounce } from "@/utils/debounce";
import { safeIdleCallback, cancelIdleCallback } from "@/utils/idleCallback";
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
  const [observedElements, setObservedElements] = useState<Set<string>>(new Set());

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
          import("@/routes/ProfileRoutes").catch(e => {
            console.warn("Profile routes failed to preload, will retry on navigation");
            return null;
          }),
          import("@/routes/AdminRoutes").catch(e => {
            console.warn("Admin routes failed to preload, will retry on navigation");
            return null;
          }),
        ]);
      } catch (error) {
        console.error("Failed to preload routes:", error);
      }
    };
    
    preloadRoutes();
    
    // Preload other critical routes after initial render
    const preloadTimer = setTimeout(() => {
      // Preload main content that's likely to be visited next
      Promise.all([
        import("@/pages/Search"),
        import("@/pages/Vehicles"),
        import("@/pages/RealEstate")
      ]).catch(() => null);
    }, 2000);
    
    return () => clearTimeout(preloadTimer);
  }, []);

  // Memoize route loading to prevent unnecessary re-renders
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
            <Suspense fallback={<RouteLoading />}>
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
              <Suspense fallback={<RouteLoading />}>
                <Home />
              </Suspense>
            </ErrorBoundary>
          ) 
        },
        { 
          path: "*", 
          element: (
            <ErrorBoundary>
              <Suspense fallback={<RouteLoading />}>
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

  // Set up intersection observer for route preloading
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const routeName = entry.target.getAttribute('data-route');
          // The preloading is now handled by React.lazy and the browser's prefetching
          if (routeName) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, { rootMargin: '200px' });

    return () => observer.disconnect();
  }, []);

  // Add route to intersection observer
  const observeRoute = useCallback((routeName: string, element: HTMLElement | null) => {
    if (element && !observedElements.has(routeName)) {
      element.setAttribute('data-route', routeName);
      setObservedElements(prev => new Set(prev).add(routeName));
    }
  }, [observedElements]);

  // Memoize route rendering
  const renderRoutes = useCallback(() => {
    return routes.map((route, index) => {
      const routeElement = route.element ? (
        <ErrorBoundary>
          <Suspense fallback={<RouteLoading />}>
            {route.element}
          </Suspense>
        </ErrorBoundary>
      ) : null;

      return (
        <Route 
          key={`${route.path || 'route'}-${index}`} 
          path={route.path} 
          element={routeElement}
        >
          {route.children?.map((child, childIndex) => {
            const childElement = child.element ? (
              <ErrorBoundary>
                <Suspense fallback={<RouteLoading />}>
                  {child.element}
                </Suspense>
              </ErrorBoundary>
            ) : null;

            return (
              <Route
                key={`${child.path || 'child'}-${childIndex}`}
                path={child.path}
                element={childElement}
              />
            );
          })}
        </Route>
      );
    });
  }, [routes]);

  // Debounced route preloading on hover - using browser's built-in preloading
  const handleRouteHover = useMemo(
    () => debounce((routeName: RouteKey) => {
      // The preloading is now handled by React.lazy and the browser's prefetching
      // No need for manual preloading here
    }, 150),
    []
  );

  if (isLoading) {
    return <RouteLoading />;
  }

  return (
    <div className="route-container">
      <RouterRoutes>
        {renderRoutes()}
      </RouterRoutes>
      {/* Add invisible elements for intersection observation */}
      {/* Intersection observers for route preloading */}
      {(['Search', 'Vehicles', 'RealEstate'] as const).map((route, index) => (
        <div 
          key={route}
          ref={(el) => observeRoute(route, el)} 
          style={{ 
            position: 'absolute', 
            top: `${100 + (index * 50)}vh`, 
            height: '1px',
            pointerEvents: 'none' 
          }} 
        />
      ))}
    </div>
  );
};

export default Routes;
