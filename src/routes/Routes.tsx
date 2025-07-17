import { Routes as RouterRoutes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense, lazy, useEffect, useState, useCallback, useMemo, memo, startTransition } from "react";
import type { RouteObject } from "react-router-dom";
import type { ErrorInfo } from 'react';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { debounce } from "@/utils/debounce";
import { safeIdleCallback, cancelIdleCallback } from "@/utils/idleCallback";
import { preloadCriticalAssets } from "@/utils/preloadUtils";

// Optimized loading component with memoization
const RouteLoading = memo(() => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status" aria-live="polite">
    <LoadingSpinner 
      size="lg"
      label="Loading page..."
      ariaLive="polite"
      ariaAtomic={true}
    />
  </div>
));
RouteLoading.displayName = 'RouteLoading';

// Helper to create memoized page components
const createPage = <P extends object>(Component: React.ComponentType<P>) => 
  memo(Component);

// Type for preloadable components
interface PreloadableComponent extends React.LazyExoticComponent<React.ComponentType<any>> {
  preload: () => Promise<{ default: React.ComponentType }>;
  cancelPreload: () => void;
  _preloaded?: boolean; // Track if component has been preloaded
}

// Preload function with proper typing and preload tracking
const lazyWithPreload = (
  importFn: () => Promise<{ default: React.ComponentType }>
): PreloadableComponent => {
  const Component = lazy(importFn) as PreloadableComponent;
  
  // Wrap the preload function to track if it's been called
  const originalPreload = importFn;
  let preloadId: number | undefined;

  Component.preload = async () => {
    if (!Component._preloaded) {
      Component._preloaded = true;
      preloadId = safeIdleCallback(async () => {
        try {
          return await originalPreload();
        } catch (error) {
          console.error('Failed to preload component:', error);
          return { default: Component };
        }
      });
    }
    return { default: Component };
  };

  // Cleanup function to cancel pending preload if needed
  Component.cancelPreload = () => {
    if (preloadId) {
      cancelIdleCallback(preloadId);
      preloadId = undefined;
    }
  };
  
  return Component;
};

// Helper to create memoized lazy-loaded pages
const createLazyPage = (importFn: () => Promise<{ default: React.ComponentType }>) => 
  lazyWithPreload(async () => {
    const module = await importFn();
    return { default: createPage(module.default) };
  });

// Preload critical route components (memoized) with chunk names
// Public routes
const Home = createLazyPage(() => import("@/pages/Home"));
const Search = createLazyPage(() => import("@/pages/Search"));

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


const Routes = () => {
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [observedElements, setObservedElements] = useState<Set<string>>(new Set());

  // Optimized preloading with priority-based loading
  useEffect(() => {
    let preloadController: AbortController | null = null;
    
    const preloadRoutes = async () => {
      try {
        preloadController = new AbortController();
        const { signal } = preloadController;
        
        // Preload critical assets first
        await preloadCriticalAssets();
        
        if (signal.aborted) return;
        
        // Priority 1: Main routes (most likely to be visited)
        const mainRoutesPromise = import("@/routes/MainRoutes");
        
        // Priority 2: Auth routes (common user flow)
        const authRoutesPromise = import("@/routes/AuthRoutes");
        
        // Wait for high priority routes
        await Promise.allSettled([mainRoutesPromise, authRoutesPromise]);
        
        if (signal.aborted) return;
        
        // Priority 3: Profile and Admin routes (lower priority)
        const lowPriorityPromises = [
          import("@/routes/ProfileRoutes").catch(() => null),
          import("@/routes/AdminRoutes").catch(() => null),
        ];
        
        // Use requestIdleCallback for low priority preloading
        safeIdleCallback(async () => {
          if (!signal.aborted) {
            await Promise.allSettled(lowPriorityPromises);
          }
        });
        
      } catch (error) {
        console.error("Failed to preload routes:", error);
      }
    };
    
    // Start preloading immediately
    startTransition(() => {
      preloadRoutes();
    });
    
    // Preload critical pages after a short delay
    const criticalPagesTimer = setTimeout(() => {
      safeIdleCallback(() => {
        Promise.allSettled([
          import("@/pages/Search"),
          import("@/pages/Vehicles"),
          import("@/pages/RealEstate")
        ]);
      });
    }, 1000);
    
    return () => {
      clearTimeout(criticalPagesTimer);
      if (preloadController) {
        preloadController.abort();
      }
    };
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
          if (routeName && PageComponents[routeName as keyof typeof PageComponents]) {
            PageComponents[routeName as keyof typeof PageComponents].preload();
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
      // The actual observation is handled by the IntersectionObserver setup above
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

  // Debounced route preloading on hover
  const handleRouteHover = useMemo(
    () => debounce((routeName: RouteKey) => {
      const component = PageComponents[routeName];
      if (component && typeof component.preload === 'function') {
        component.preload();
      }
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
