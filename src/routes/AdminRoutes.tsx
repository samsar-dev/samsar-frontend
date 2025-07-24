import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import PrivateRoute from "@/components/auth/AuthRoute";

// Lazy load admin components
const ContactSubmissions = lazy(
  () => import("@/pages/admin/ContactSubmissions"),
);
const UsersList = lazy(() => import("@/pages/admin/UsersList"));
const Newsletter = lazy(() => import("@/pages/admin/Newsletter"));
const AdminReports = lazy(() => import("@/pages/admin/ReportsPage"));

const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <PrivateRoute roles={["ADMIN"]}>
        <ContactSubmissions />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <PrivateRoute roles={["ADMIN"]}>
        <UsersList />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/newsletter",
    element: (
      <PrivateRoute roles={["ADMIN"]}>
        <Newsletter />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/reports",
    element: (
      <PrivateRoute roles={["ADMIN"]}>
        <AdminReports />
      </PrivateRoute>
    ),
  },
];

export default adminRoutes;
