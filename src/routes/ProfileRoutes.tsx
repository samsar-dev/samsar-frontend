import { lazy, memo, Suspense } from "react";
import { RouteObject, Outlet, Navigate } from "react-router-dom";
import PrivateRoute from "@/components/auth/AuthRoute";
import { Layout } from "@/components/layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";

// Optimized loading component for profile pages
const ProfileLoading = memo(() => (
  <div className="flex min-h-screen items-center justify-center">
    <LoadingSpinner size="lg" label="Loading profile..." />
  </div>
));
ProfileLoading.displayName = 'ProfileLoading';

// Enhanced lazy loading for profile components
const createProfileComponent = (importFn: () => Promise<{ default: React.ComponentType<any> }>, chunkName?: string) => {
  const LazyComponent = lazy(importFn);
  
  // Add preload method
  (LazyComponent as any).preload = importFn;
  
  return LazyComponent;
};

// Profile components with priority-based loading
const Profile = createProfileComponent(() => import("@/pages/Profile"), "profile");
const UserProfile = createProfileComponent(() => import("@/pages/UserProfile"), "user-profile");
const Settings = createProfileComponent(() => import("@/pages/Settings"), "settings");
const Messages = createProfileComponent(() => import("@/pages/Messages"), "messages");

// Profile sub-components (lower priority)
const ProfileInfo = createProfileComponent(() => import("@/components/profile/ProfileInfo"), "profile-info");
const SavedListings = createProfileComponent(() => import("@/components/profile/SavedListings"), "saved-listings");
const MyListings = createProfileComponent(() => import("@/components/profile/MyListings"), "my-listings");
const ChangePassword = createProfileComponent(() => import("@/components/profile/ChangePassword"), "change-password");

// Memoized layout wrapper for profile routes
const ProfileLayout = memo(({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Layout>
      <PrivateRoute>
        <Suspense fallback={<ProfileLoading />}>
          {children}
        </Suspense>
      </PrivateRoute>
    </Layout>
  </ErrorBoundary>
));
ProfileLayout.displayName = 'ProfileLayout';

// Memoized component wrapper
const withProfileLayout = memo((Component: React.ComponentType) => {
  const WrappedComponent = memo(() => (
    <ProfileLayout>
      <Component />
    </ProfileLayout>
  ));
  WrappedComponent.displayName = `withProfileLayout(${Component.displayName || Component.name})`;
  return <WrappedComponent />;
});

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
    element: withProfileLayout(Settings),
  },
  {
    path: "/profile/*", // Use wildcard to allow nested routes in Profile component
    element: withProfileLayout(Profile),
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
