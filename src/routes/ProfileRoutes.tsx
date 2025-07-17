import { lazy } from "react";
import { RouteObject, Outlet, Navigate } from "react-router-dom";
import PrivateRoute from "@/components/auth/AuthRoute";
import { Layout } from "@/components/layout";

// Lazy load profile components
const Profile = lazy(() => import("@/pages/Profile"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const ProfileInfo = lazy(() => import("@/components/profile/ProfileInfo"));
const SavedListings = lazy(() => import("@/components/profile/SavedListings"));
const MyListings = lazy(() => import("@/components/profile/MyListings"));
const ChangePassword = lazy(() => import("@/components/profile/ChangePassword"));
const Messages = lazy(() => import("@/pages/Messages"));
const Settings = lazy(() => import("@/pages/Settings"));

// Layout wrapper for profile routes
const ProfileLayout = ({ children }: { children: React.ReactNode }) => (
  <Layout>
    <PrivateRoute>
      {children}
    </PrivateRoute>
  </Layout>
);

const profileRoutes: RouteObject[] = [
  // Redirects for backward compatibility
  {
    path: "/saved-listings",
    element: <Navigate to="/profile/saved" replace />,
  },
  {
    path: "/messages",
    element: <Navigate to="/profile/messages" replace />,
  },
  // Settings route
  {
    path: "/settings",
    element: (
      <ProfileLayout>
        <Settings />
      </ProfileLayout>
    ),
  },
  {
    path: "/profile/*", // Use wildcard to allow nested routes in Profile component
    element: (
      <ProfileLayout>
        <Profile />
      </ProfileLayout>
    ),
  },
  {
    path: "/user/:id",
    element: <UserProfile />,
  },
  {
    path: "/user/:id/listings",
    element: <UserProfile />, // This will be handled by the showListings prop in the Profile component
  },
];

export default profileRoutes;
