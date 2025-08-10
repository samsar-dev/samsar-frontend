import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import PrivateRoute from "@/components/auth/AuthRoute";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { lazyWithPrefetch } from "@/utils/prefetch";

// Layout wrapper for private routes
const withLayout = (Component: React.ComponentType) => {
  const WrappedComponent = () => (
    <PrivateRoute>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" label="Loading..." />
          </div>
        }
      >
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>
      </Suspense>
    </PrivateRoute>
  );
  return WrappedComponent;
};

// Lazy load components with prefetching for better UX
const LazyProfile = withLayout(
  lazyWithPrefetch(() => import("@/pages/Profile"), 1000),
);
const LazySettings = withLayout(
  lazyWithPrefetch(() => import("@/pages/Settings"), 1500),
);
const LazyMessages = withLayout(
  lazyWithPrefetch(() => import("@/pages/Messages"), 2000),
);
const LazyCreateListing = withLayout(
  lazyWithPrefetch(
    () => import("@/components/listings/create/CreateListing"),
    2500,
  ),
);
const LazyEditListing = withLayout(
  lazy(() => import("@/components/listings/edit/EditListingRedux")),
);
const LazyListingSuccess = withLayout(
  lazy(() => import("@/pages/ListingSuccess")),
);
const LazySavedListings = withLayout(
  lazy(() => import("@/components/profile/SavedListings")),
);
const LazyMyListings = lazy(() => import("@/components/profile/MyListings"));
const LazyChangePassword = lazy(
  () => import("@/components/profile/ChangePassword"),
);
const LazyChangeEmail = lazy(
  () => import("@/components/profile/ChangeEmail"),
);
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
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500">Loading profile...</span>
              </div>
            }
          >
            <LazyProfileInfo />
          </Suspense>
        ),
      },
      {
        path: "mylistings",
        element: (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500">
                  Loading my listings...
                </span>
              </div>
            }
          >
            <LazyMyListings />
          </Suspense>
        ),
      },
      {
        path: "change-password",
        element: (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500">
                  Loading password form...
                </span>
              </div>
            }
          >
            <LazyChangePassword />
          </Suspense>
        ),
      },
      {
        path: "email",
        element: (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500">
                  Loading email form...
                </span>
              </div>
            }
          >
            <LazyChangeEmail />
          </Suspense>
        ),
      },
      {
        path: "saved",
        element: (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500">
                  Loading saved items...
                </span>
              </div>
            }
          >
            <LazySavedListings />
          </Suspense>
        ),
      },
      {
        path: ":userId/listings",
        element: <LazyUserProfile />,
      },
      {
        path: ":userId",
        element: <LazyUserProfile />,
      },
    ],
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
