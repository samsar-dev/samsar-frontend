import {
  Routes as RouterRoutes,
  Route,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {
  Suspense,
  lazy,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  startTransition,
  useRef,
} from "react";
import type { RouteObject } from "react-router-dom";
import type { ErrorInfo } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { debounce } from "@/utils/debounce";
import { safeIdleCallback, cancelIdleCallback } from "@/utils/idleCallback";



// Optimized loading component with memoization
const RouteLoading = memo(() => (
  <div
    className="flex min-h-screen items-center justify-center bg-gray-50"
    role="status"
    aria-live="polite"
  >
    <LoadingSpinner
      size="lg"
      label="Loading page..."
      ariaLive="polite"
      ariaAtomic={true}
    />
  </div>
));
RouteLoading.displayName = "RouteLoading";

// Helper to create memoized page components
const createPage = <P extends object>(Component: React.ComponentType<P>) =>
  memo(Component);

// Type for preloadable components
interface PreloadableComponent
  extends React.LazyExoticComponent<React.ComponentType<any>> {
  preload: () => Promise<{ default: React.ComponentType }>;
  cancelPreload: () => void;
  _preloaded?: boolean; // Track if component has been preloaded
}

// Preload function with proper typing and preload tracking
const lazyWithPreload = (
  importFn: () => Promise<{ default: React.ComponentType }>,
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
          console.error("Failed to preload component:", error);
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
const createLazyPage = (
  importFn: () => Promise<{ default: React.ComponentType }>,
) =>
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
  NotFound,
} as const;

type RouteKey = keyof typeof PageComponents;

const Routes = () => {
  useEffect(() => {
    // Use requestIdleCallback to defer preloading until the browser is idle.
    const handle = requestIdleCallback(() => {
      import('@/utils/preloadUtils').then(utils => {
        utils.preloadCriticalAssets();
      });
    });

    // Cleanup the callback if the component unmounts.
    return () => cancelIdleCallback(handle);
  }, []);
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const observedElements = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isMounted = useRef(true);

  // Preload critical assets when the browser is idle
  useEffect(() => {
    const handle = requestIdleCallback(() => {
      import('@/utils/preloadUtils').then(utils => {
        utils.preloadCriticalAssets();
      });
    });
    return () => cancelIdleCallback(handle);
  }, []);

  // Preload critical routes first, then others
  useEffect(() => {
    isMounted.current = true;
    let preloadController = new AbortController();
    const { signal } = preloadController;

    const preloadRoutes = async () => {
      try {
        preloadController = new AbortController();
        const { signal } = preloadController;

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
          import("@/pages/RealEstate"),
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

  // Memoized route flattener
  const flattenRoutes = useCallback((routes: RouteObject[], parentPath = ""): RouteObject[] => {
    return routes.flatMap((route) => {
      const fullPath = parentPath + (route.path || "");
      const children = route.children ? flattenRoutes(route.children, fullPath) : [];
      return [{ ...route, path: fullPath }, ...children];
    });
  }, []);

  const loadRoutes = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load all routes
      const [mainModule, authModule, profileModule, adminModule] = await Promise.allSettled([
        import("./MainRoutes"),
        import("./AuthRoutes"),
        import("./ProfileRoutes"),
        import("./AdminRoutes")
      ]);

      // Extract routes with proper error handling
      const mainRoutes =
        mainModule.status === "fulfilled"
          ? mainModule.value.default
          : [];
      const authRoutes =
        authModule.status === "fulfilled"
          ? authModule.value.default
          : [];
      const profileRoutes =
        profileModule.status === "fulfilled"
          ? profileModule.value.default
          : [];
      const adminRoutes =
        adminModule.status === "fulfilled"
          ? adminModule.value.default
          : [];

      // Combine all routes with not found fallback
      const allRoutes = [
        ...mainRoutes,
        ...authRoutes,
        ...adminRoutes,
        ...profileRoutes,
        {
          path: "*",
          element: (
            <ErrorBoundary>
              <Suspense fallback={<RouteLoading />}>
                <NotFound />
              </Suspense>
            </ErrorBoundary>
          ),
        },
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
          ),
        },
        {
          path: "*",
          element: (
            <ErrorBoundary>
              <Suspense fallback={<RouteLoading />}>
                <NotFound />
              </Suspense>
            </ErrorBoundary>
          ),
        },
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const routeName = entry.target.getAttribute("data-route");
            const component = routeName && PageComponents[routeName as keyof typeof PageComponents];
            
            if (component?.preload) {
              component.preload();
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: "200px" }
    );

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, []);

  // Add route to intersection observer
  const observeRoute = useCallback((routeName: string, element: HTMLElement | null) => {
    if (element && !observedElements.current.has(routeName)) {
      element.setAttribute("data-route", routeName);
      observedElements.current.add(routeName);
      observerRef.current?.observe(element);
    }
  }, []);

  // Memoize route rendering
  const renderRoutes = useMemo(() => {
    return routes.map((route, index) => {
      const element = route.element ? (
        <Suspense fallback={<RouteLoading />}>
          {route.element}
        </Suspense>
      ) : null;

      return (
        <Route
          key={`${route.path || 'route'}-${index}`}
          path={route.path}
          element={element}
        >
          {route.children?.map((child, childIndex) => (
            <Route
              key={`${child.path || 'child'}-${childIndex}`}
              path={child.path}
              element={
                child.element ? (
                  <Suspense fallback={<RouteLoading />}>
                    {child.element}
                  </Suspense>
                ) : null
              }
            />
          ))}
        </Route>
      );
    });
  }, [routes]);

  // Memoized hover handler for route preloading
  const handleRouteHover = useMemo(() => {
    return debounce((routeName: RouteKey) => {
      const component = PageComponents[routeName];
      if (component?.preload) {
        component.preload();
      }
    }, 150);
  }, []);

  // Preload critical routes on mount
  useEffect(() => {
    if (!isLoading) {
      const preloadCritical = () => {
        safeIdleCallback(() => {
          ['Search', 'Vehicles', 'RealEstate'].forEach(route => {
            const component = PageComponents[route as keyof typeof PageComponents];
            if (component?.preload) {
              component.preload();
            }
          });
        });
      };

      preloadCritical();
    }
  }, [isLoading]);

  if (isLoading) {
    return <RouteLoading />;
  }

  return (
    <ErrorBoundary>
      <div className="route-container">
        <RouterRoutes>
          {renderRoutes}
        </RouterRoutes>
        {(['Search', 'Vehicles', 'RealEstate'] as const).map((route, index) => (
          <div
            key={route}
            ref={(el) => observeRoute(route, el)}
            style={{
              position: 'absolute',
              top: `${100 + index * 50}vh`,
              height: '1px',
              pointerEvents: 'none',
              visibility: 'hidden',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    </ErrorBoundary>
  );
};

export default Routes;
