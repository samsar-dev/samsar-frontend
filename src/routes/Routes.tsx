import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import type { RouteObject } from "react-router-dom";

import { Layout as LayoutComponent } from "@/components/layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import mainRoutes from "./MainRoutes";
import authRoutes from "./AuthRoutes";
import adminRoutes from "./AdminRoutes";
import profileRoutes from "./ProfileRoutes";

const NotFound = lazy(() => import("@/pages/NotFound"));

const Layout = ({ children }: { children: React.ReactNode }) => (
  <LayoutComponent>{children}</LayoutComponent>
);

const renderRoutes = (routes: RouteObject[]) => {
  return routes.map((route, index) => {
    const element = route.element ? (
      <Layout>{route.element}</Layout>
    ) : undefined;

    return (
      <Route key={route.path || index} path={route.path} element={element}>
        {route.children && renderRoutes(route.children)}
      </Route>
    );
  });
};

const Routes = () => {
  const allRoutes: RouteObject[] = [
    ...mainRoutes,
    ...authRoutes,
    ...adminRoutes,
    ...profileRoutes,
    { path: "*", element: <Layout><NotFound /></Layout> }
  ];

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouterRoutes>{renderRoutes(allRoutes)}</RouterRoutes>
    </Suspense>
  );
};

export default Routes;
