import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState, useCallback } from "react";
import type { RouteObject } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Preload function for critical routes
const preloadComponent = (importFn: () => Promise<{ default: React.ComponentType }>) => {
  const Component = lazy(importFn);
  // Start preloading
  importFn();
  return Component;
};

// Critical routes (preloaded)
const Home = preloadComponent(() => import("@/pages/Home"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Route-based code splitting with preloading
const lazyWithPreload = (importFn: () => Promise<{ default: React.ComponentType }>) => {
  const Component = lazy(importFn);
  // Add preload method to component
  (Component as any).preload = importFn;
  return Component;
};

const Routes = () => {
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Preload non-critical routes when app starts
  useEffect(() => {
    const preloadRoutes = async () => {
      try {
        await Promise.all([
          import("@/routes/MainRoutes"),
          import("@/routes/AuthRoutes"),
          import("@/routes/ProfileRoutes"),
          import("@/routes/AdminRoutes"),
        ]);
      } catch (error) {
        console.error("Failed to preload routes:", error);
      }
    };
    
    preloadRoutes();
  }, []);

  // Load routes with proper error boundaries
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        // Use dynamic imports for better code splitting
        const [
          { default: mainRoutes },
          { default: authRoutes },
          { default: adminRoutes },
          { default: profileRoutes }
        ] = await Promise.all([
          import("./MainRoutes"),
          import("./AuthRoutes"),
          import("./AdminRoutes"),
          import("./ProfileRoutes")
        ]);

        setRoutes([
          ...mainRoutes,
          ...authRoutes,
          ...adminRoutes,
          ...profileRoutes,
          { 
            path: "*", 
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <NotFound />
              </Suspense>
            ) 
          }
        ]);
      } catch (error) {
        console.error("Failed to load routes:", error);
        // Fallback to basic routes if dynamic loading fails
        setRoutes([
          { 
            path: "/", 
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <Home />
              </Suspense>
            ) 
          },
          { 
            path: "*", 
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <NotFound />
              </Suspense>
            ) 
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();
  }, []);

  const renderRoutes = useCallback((routesToRender: RouteObject[]) => {
    return routesToRender.map((route, index) => (
      <Route 
        key={route.path || index} 
        path={route.path} 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            {route.element}
          </Suspense>
        }
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    ));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <RouterRoutes>{renderRoutes(routes)}</RouterRoutes>;
};

export default Routes;
