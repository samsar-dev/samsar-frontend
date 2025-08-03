import { lazy, memo, Suspense } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import PrivateRoute from "@/components/auth/AuthRoute";
import { Layout } from "@/components/layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";

// Layout wrapper for private routes
const withLayout = (Component: React.ComponentType) => {
  const WrappedComponent = () => (
    <PrivateRoute>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" label="Loading..." />
        </div>
      }>
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>
      </Suspense>
    </PrivateRoute>
  );
  return WrappedComponent;
};

// Lazy load components
const LazyProfile = withLayout(lazy(() => import("@/pages/Profile")));
const LazySettings = withLayout(lazy(() => import("@/pages/Settings")));
const LazyMessages = withLayout(lazy(() => import("@/pages/Messages")));
const LazyCreateListing = withLayout(lazy(() => import("@/components/listings/create/CreateListing")));
const LazyEditListing = withLayout(lazy(() => import("@/components/listings/edit/EditListingRedux")));
const LazyListingSuccess = withLayout(lazy(() => import("@/pages/ListingSuccess")));
const LazySavedListings = withLayout(lazy(() => import("@/components/profile/SavedListings")));
const LazyMyListings = lazy(() => import("@/components/profile/MyListings"));
const LazyChangePassword = lazy(() => import("@/components/profile/ChangePassword"));
const LazyProfileInfo = lazy(() => import("@/components/profile/ProfileInfo"));
const LazyUserProfile = withLayout(lazy(() => import("@/pages/UserProfile")));

// Private routes configuration
export const privateRoutes: RouteObject[] = [
  // Redirect /saved to /profile/saved for better UX
  {
    path: "/saved",
    element: <Navigate to="/profile/saved" replace />,
  },
  
  // Redirect from old /profile/listings to /profile/mylistings
  {
    path: "/profile/listings",
    element: <Navigate to="/profile/mylistings" replace />,
  },
  
  // Ensure change-password doesn't get caught by user profile routes
  {
    path: "/profile/password",
    element: <Navigate to="/profile/change-password" replace />,
  },

  // Profile routes
  {
    path: "/profile",
    element: <LazyProfile />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">Loading profile...</span>
            </div>
          }>
            <LazyProfileInfo />
          </Suspense>
        ),
      },
      {
        path: "mylistings",
        element: (
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">Loading my listings...</span>
            </div>
          }>
            <LazyMyListings />
          </Suspense>
        ),
      },
      {
        path: "change-password",
        element: (
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">Loading password form...</span>
            </div>
          }>
            <LazyChangePassword />
          </Suspense>
        ),
      },
      {
        path: "saved",
        element: (
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">Loading saved items...</span>
            </div>
          }>
            <LazySavedListings />
          </Suspense>
        ),
      },
    ],
  },
  
  // Public profile routes - these should come after the specific profile routes
  // to avoid conflicts with nested routes
  {
    path: "/profile/:userId/listings",
    element: <LazyUserProfile />,
  },
  {
    path: "/profile/:userId",
    element: <LazyUserProfile />,
  },
  
  // Messages route
  {
    path: "/messages",
    element: <LazyMessages />,
  },
  
  // Settings route
  {
    path: "/settings",
    element: <LazySettings />,
  },
  
  // Listing routes
  {
    path: "/listings/create",
    element: <LazyCreateListing />,
  },
  {
    path: "/listings/:id/edit",
    element: <LazyEditListing />,
  },
  {
    path: "/listing-success",
    element: <LazyListingSuccess />,
  },
  
  // User profile route (legacy)
  {
    path: "/profile/:username",
    element: <LazyUserProfile />,
  },
];

export default privateRoutes;
