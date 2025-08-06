import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { prefetchRoute, lazyWithPrefetch } from "@/utils/prefetch";

// Lazy load main components with prefetching
const Home = lazy(() => import("@/pages/Home"));
const Search = lazyWithPrefetch(() => import("@/pages/Search"), 1500); // Prefetch search early
const Vehicles = lazyWithPrefetch(() => import("@/pages/Vehicles"), 2000);
const RealEstate = lazyWithPrefetch(() => import("@/pages/RealEstate"), 2500);
const ListingDetailsRedux = lazy(
  () => import("@/components/listings/edit/ListingDetailsRedux"),
);
const About = lazy(() => import("@/pages/About"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));

// Prefetch critical routes after initial load
if (typeof window !== "undefined") {
  // Prefetch commonly accessed pages after a delay
  setTimeout(() => {
    prefetchRoute(() => import("@/pages/Search"), 0, "search-page");
    prefetchRoute(() => import("@/pages/Vehicles"), 500, "vehicles-page");
    prefetchRoute(() => import("@/pages/RealEstate"), 1000, "realestate-page");
  }, 3000); // Wait 3 seconds after initial load
}

// Layout wrapper component for routes that need the main layout
const withLayout = (Component: React.ComponentType) => {
  return <Component />;
};

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
    path: "/listings/:id",
    element: withLayout(ListingDetailsRedux),
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
