import { lazy, memo, Suspense } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import PrivateRoute from "@/components/auth/AuthRoute";
import { Layout } from "@/components/layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";

// Optimized loading component
const PageLoading = memo(() => (
  <div className="flex min-h-screen items-center justify-center">
    <LoadingSpinner size="lg" label="Loading..." />
  </div>
));
PageLoading.displayName = 'PageLoading';

// Enhanced lazy loading with error boundaries and preloading
const createLazyComponent = (importFn: () => Promise<{ default: React.ComponentType<any> }>, chunkName?: string) => {
  const LazyComponent = lazy(importFn);
  
  // Add preload method for manual preloading
  (LazyComponent as any).preload = importFn;
  
  return LazyComponent;
};

// Critical path components (loaded immediately)
const Home = createLazyComponent(() => import("@/pages/Home"), "home");
const Search = createLazyComponent(() => import("@/pages/Search"), "search");

// High priority components (marketplace)
const Vehicles = createLazyComponent(() => import("@/pages/Vehicles"), "vehicles");
const RealEstate = createLazyComponent(() => import("@/pages/RealEstate"), "real-estate");

// Medium priority components (listings)
const ListingDetailsRedux = createLazyComponent(() => import("@/components/listings/edit/ListingDetailsRedux"), "listing-details");
const CreateListing = createLazyComponent(() => import("@/components/listings/create/CreateListing"), "create-listing");
const EditListing = createLazyComponent(() => import("@/components/listings/edit/EditListingRedux"), "edit-listing");
const ListingSuccess = createLazyComponent(() => import("@/pages/ListingSuccess"), "listing-success");

// Low priority components (static pages)
const About = createLazyComponent(() => import("@/pages/About"), "about");
const ContactUs = createLazyComponent(() => import("@/pages/ContactUs"), "contact");
const PrivacyPolicy = createLazyComponent(() => import("@/pages/PrivacyPolicy"), "privacy");
const TermsOfService = createLazyComponent(() => import("@/pages/TermsOfService"), "terms");

// Memoized layout wrapper to prevent unnecessary re-renders
const withLayout = memo((Component: React.ComponentType) => {
  const WrappedComponent = memo(() => (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<PageLoading />}>
          <Component />
        </Suspense>
      </Layout>
    </ErrorBoundary>
  ));
  WrappedComponent.displayName = `withLayout(${Component.displayName || Component.name})`;
  return <WrappedComponent />;
});

// Memoized private route wrapper
const withPrivateLayout = memo((Component: React.ComponentType) => {
  const WrappedComponent = memo(() => (
    <ErrorBoundary>
      <PrivateRoute>
        <Layout>
          <Suspense fallback={<PageLoading />}>
            <Component />
          </Suspense>
        </Layout>
      </PrivateRoute>
    </ErrorBoundary>
  ));
  WrappedComponent.displayName = `withPrivateLayout(${Component.displayName || Component.name})`;
  return <WrappedComponent />;
});

const mainRoutes: RouteObject[] = [
  // Redirect from /realestate to /real-estate for backward compatibility
  {
    path: "/realestate",
    element: <Navigate to="/real-estate" replace />,
  },
  {
    path: "/",
    element: withLayout(Home),
  },
  {
    path: "/search",
    element: withLayout(Search),
  },
  {
    path: "/vehicles",
    element: withLayout(Vehicles),
  },
  {
    path: "/real-estate",
    element: withLayout(RealEstate),
  },
  {
    path: "/listings/create",
    element: withPrivateLayout(CreateListing),
  },
  {
    path: "/listings/edit/:id",
    element: withPrivateLayout(EditListing),
  },
  {
    path: "/listings/:id",
    element: withLayout(ListingDetailsRedux),
  },
  {
    path: "/listing-success",
    element: withPrivateLayout(ListingSuccess),
  },
  {
    path: "/about",
    element: withLayout(About),
  },
  {
    path: "/contact",
    element: withLayout(ContactUs),
  },
  {
    path: "/privacy-policy",
    element: withLayout(PrivacyPolicy),
  },
  {
    path: "/terms",
    element: withLayout(TermsOfService),
  },
];

export default mainRoutes;
