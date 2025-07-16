import { Routes as RouterRoutes, Route } from "react-router-dom";
import {
  Suspense,
  lazy,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import type { RouteObject } from "react-router-dom";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { debounce } from "@/utils/debounce";
import { safeIdleCallback, cancelIdleCallback } from "@/utils/idleCallback";
import { preloadCriticalAssets } from "@/utils/preloadUtils";

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

  Component.preload = async () => {
    if (!Component._preloaded) {
      Component._preloaded = true;
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

  useEffect(() => {
    const preload = async () => {
      preloadCriticalAssets();
      const [mainRoutes, authRoutes] = await Promise.all([
        import("@/routes/MainRoutes").then(m => m.default).catch(() => []),
        import("@/routes/AuthRoutes").then(m => m.default).catch(() => []),
      ]);
      setRoutes([...mainRoutes, ...authRoutes]);
      setIsInitialized(true);
      Promise.all([
        import("@/routes/ProfileRoutes").catch(() => null),
        import("@/routes/AdminRoutes").catch(() => null),
      ]).then(([profileRoutes, adminRoutes]) => {
        setRoutes(prev => [
          ...prev,
          ...(profileRoutes?.default || []),
          ...(adminRoutes?.default || []),
        ]);
      });
    };
    preload();
  }, []);

  const observeRoute = useCallback((routeName: string, el: HTMLElement | null) => {
    if (el && !observedElements.has(routeName)) {
      el.setAttribute("data-route", routeName);
      setObservedElements(prev => new Set(prev).add(routeName));
    }
  }, [observedElements]);

  const renderRoutes = useCallback(() => {
    if (!isInitialized) return null;
    if (!routes.length) {
      return <Route path="*" element={<ErrorBoundary><Suspense fallback={null}><NotFound /></Suspense></ErrorBoundary>} />;
    }
    return routes.map((route, i) => (
      <Route
        key={route.path || i}
        path={route.path}
        element={<ErrorBoundary><Suspense fallback={null}>{route.element}</Suspense></ErrorBoundary>}
      >
        {route.children?.map((child, j) => (
          <Route
            key={child.path || j}
            path={child.path}
            element={<ErrorBoundary><Suspense fallback={null}>{child.element}</Suspense></ErrorBoundary>}
          />
        ))}
      </Route>
    ));
  }, [routes, isInitialized]);

  const handleRouteHover = useMemo(
    () => debounce((routeName: RouteKey) => {
      const component = PageComponents[routeName];
      if (component?.preload) component.preload();
    }, 150),
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
