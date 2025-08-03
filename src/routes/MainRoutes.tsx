import { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";
 

// Lazy load main components
const Home = lazy(() => import("@/pages/Home"));
const Search = lazy(() => import("@/pages/Search"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const RealEstate = lazy(() => import("@/pages/RealEstate"));
const ListingDetailsRedux = lazy(
  () => import("@/components/listings/edit/ListingDetailsRedux"),
);
const About = lazy(() => import("@/pages/About"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));

// Layout wrapper component for routes that need the main layout
const withLayout = (Component: React.ComponentType) => {
  return (
 
      <Component />
 
  );
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
