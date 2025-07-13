import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useMemo, useState, useEffect } from "react";
import type { RouteObject } from "react-router-dom";

import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load the 404 page
const NotFound = lazy(() => import("@/pages/NotFound"));

// Optimized route renderer that doesn't wrap in Layout
const renderRoutes = (routes: RouteObject[]) => {
  return routes.map((route, index) => (
    <Route 
      key={route.path || index} 
      path={route.path} 
      element={route.element}
    >
      {route.children && renderRoutes(route.children)}
    </Route>
  ));
};

const Routes = () => {
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        // Import all route modules in parallel
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
          { path: "*", element: <NotFound /> }
        ]);
      } catch (error) {
        console.error("Failed to load routes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouterRoutes>{renderRoutes(routes)}</RouterRoutes>
    </Suspense>
  );
};

export default Routes;
