import { Routes as RouterRoutes, Route } from "react-router-dom";
import {
  Suspense,
  lazy,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  ReactNode,
  LazyExoticComponent,
  ComponentType,
  ReactElement
} from "react";
import type { RouteObject } from "react-router-dom";

// Extend RouteObject to include preloadable components
interface PreloadableRouteObject extends Omit<RouteObject, 'element' | 'children'> {
  element?: ReactNode & {
    type?: LazyExoticComponent<ComponentType<any>> & {
      _preloaded?: boolean;
      preload?: () => Promise<{ default: ComponentType }>;
    };
  };
  children?: PreloadableRouteObject[];
}
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { debounce } from "@/utils/debounce";
import { safeIdleCallback, cancelIdleCallback } from "@/utils/idleCallback";

const createPage = <P extends object>(Component: React.ComponentType<P>) => memo(Component);

interface PreloadableComponent extends React.LazyExoticComponent<React.ComponentType<any>> {
  preload: () => Promise<{ default: React.ComponentType }>;
  cancelPreload: () => void;
  _preloaded?: boolean;
}

const lazyWithPreload = (
  importFn: () => Promise<{ default: React.ComponentType }>
): PreloadableComponent => {
  const Component = lazy(importFn) as PreloadableComponent;
  let preloadId: number | undefined;
  let loadingPromise: Promise<{ default: React.ComponentType }> | undefined;

  Component.preload = async () => {
    if (!Component._preloaded && !loadingPromise) {
      Component._preloaded = true;
      loadingPromise = importFn();
      preloadId = safeIdleCallback(async () => {
        try {
          return await importFn();
        } catch (error) {
          console.error("Preload failed:", error);
          return { default: Component };
        }
      });
    }
    return { default: Component };
  };

  Component.cancelPreload = () => {
    if (preloadId) {
      cancelIdleCallback(preloadId);
      preloadId = undefined;
    }
  };

  return Component;
};

const createLazyPage = (importFn: () => Promise<{ default: React.ComponentType }>) =>
  lazyWithPreload(async () => {
    const module = await importFn();
    return { default: createPage(module.default) };
  });

const Home = createLazyPage(() => import("@/pages/Home"));
const Search = createLazyPage(() => import("@/pages/Search"));
const Vehicles = createLazyPage(() => import("@/pages/Vehicles"));
const RealEstate = createLazyPage(() => import("@/pages/RealEstate"));
const NotFound = createLazyPage(() => import("@/pages/NotFound"));

export const PageComponents = {
  Home,
  Search,
  Vehicles,
  RealEstate,
  NotFound,
} as const;

type RouteKey = keyof typeof PageComponents;

const Routes = () => {
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  const [observedElements, setObservedElements] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    let routePreloadId: number | undefined;

    const preloadRoutes = async () => {
      try {
        // Load critical routes first
        const [mainRoutes, authRoutes] = await Promise.all([
          import("@/routes/MainRoutes").then(m => m.default).catch(() => []),
          import("@/routes/AuthRoutes").then(m => m.default).catch(() => []),
        ]);

        if (mounted) {
          setRoutes(prev => [...prev, ...mainRoutes, ...authRoutes]);
          setIsInitialized(true);
        }

        // Preload additional routes with debounced loading
        const preloadAdditionalRoutes = debounce(async () => {
          const [profileRoutes, adminRoutes] = await Promise.all([
            import("@/routes/ProfileRoutes").catch(() => null),
            import("@/routes/AdminRoutes").catch(() => null),
          ]);
          if (mounted) {
            setRoutes(prev => [
              ...prev,
              ...(profileRoutes?.default || []),
              ...(adminRoutes?.default || []),
            ]);
          }
        }, 2000);

        // Start preloading additional routes after main routes are loaded
        preloadAdditionalRoutes();
      } catch (error) {
        console.error('Error loading routes:', error);
        if (mounted) setIsInitialized(true);
      }
    };

    preloadRoutes();

    return () => {
      mounted = false;
      // Cleanup preload callbacks
      if (routePreloadId) {
        cancelIdleCallback(routePreloadId);
      }
    };
  }, []);

  const observeRoute = useCallback((routeName: string, el: HTMLElement | null) => {
    if (el && !observedElements.has(routeName)) {
      el.setAttribute("data-route", routeName);
      setObservedElements(prev => new Set(prev).add(routeName));
    }
  }, [observedElements]);

  const renderRoutes = useCallback(() => {
    if (!isInitialized) {
      // Show a minimal loading state or null to avoid layout shifts
      return null;
    }
    
    if (!routes.length) {
      return (
        <Route 
          path="*" 
          element={
            <ErrorBoundary>
              <Suspense fallback={null}>
                <NotFound />
              </Suspense>
            </ErrorBoundary>
          } 
        />
      );
    }
    
    return routes.map((route, i) => {
      // Skip undefined routes
      if (!route.path) {
        console.warn('Skipping route with undefined path:', route);
        return null;
      }

      // Type guard to check if the element has preload capability
      const elementWithPreload = route.element as ReactElement & {
        type?: LazyExoticComponent<ComponentType> & {
          _preloaded?: boolean;
          preload?: () => Promise<{ default: ComponentType }>;
        };
      };
      
      // Preload route component when it's about to be rendered
      if (elementWithPreload?.type?.preload && !elementWithPreload.type._preloaded) {
        try {
          elementWithPreload.type.preload().catch(err => {
            console.error(`Failed to preload route component:`, err);
          });
        } catch (err) {
          console.error(`Error during route preload:`, err);
        }
      }
      
      return (
        <Route
          key={route.path || i}
          path={route.path}
          element={
            <ErrorBoundary>
              <Suspense fallback={null}>
                {route.element}
              </Suspense>
            </ErrorBoundary>
          }
        >
          {route.children?.map((child, j) => (
            <Route
              key={child.path || j}
              path={child.path}
              element={
                <ErrorBoundary>
                  <Suspense fallback={null}>
                    {child.element}
                  </Suspense>
                </ErrorBoundary>
              }
            />
          ))}
        </Route>
      );
    });
  }, [routes, isInitialized]);

  const handleRouteHover = useMemo(
    () => debounce((routeName: RouteKey) => {
      // Use requestIdleCallback to preload on hover without blocking main thread
      requestIdleCallback(() => {
        const component = PageComponents[routeName];
        if (component?.preload) {
          // Add a small delay to avoid preloading if the user just hovers briefly
          setTimeout(() => {
            if (component.preload) {
              component.preload().catch(console.error);
            }
          }, 100);
        }
      });
    }, 200), // Slightly increased debounce time
    []
  );

  return (
    <div className="route-container">
      <RouterRoutes>
        {renderRoutes()}
      </RouterRoutes>
      {["Search", "Vehicles", "RealEstate"].map((route, i) => (
        <div
          key={route}
          ref={(el) => observeRoute(route, el)}
          style={{ position: "absolute", top: `${100 + i * 50}vh`, height: "1px", pointerEvents: "none" }}
        />
      ))}
    </div>
  );
};

export default memo(Routes);
