import { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import PrivateRoute from "@/components/auth/AuthRoute";
import { Layout } from "@/components/layout";

// Lazy load main components
const Home = lazy(() => import("@/pages/Home"));
const Search = lazy(() => import("@/pages/Search"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const RealEstate = lazy(() => import("@/pages/RealEstate"));
const ListingDetailsRedux = lazy(
  () => import("@/components/listings/edit/ListingDetailsRedux"),
);
const CreateListing = lazy(
  () => import("@/components/listings/create/CreateListing"),
);
const EditListing = lazy(
  () => import("@/components/listings/edit/EditListingRedux"),
);
const ListingSuccess = lazy(() => import("@/pages/ListingSuccess"));
const About = lazy(() => import("@/pages/About"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Settings = lazy(() => import("@/pages/Settings"));
const Messages = lazy(() => import("@/pages/Messages"));
const SavedListings = lazy(() => import("@/components/profile/SavedListings"));

// Layout wrapper component for routes that need the main layout
const withLayout = (Component: React.ComponentType) => {
  return (
    <Layout>
      <Component />
    </Layout>
  );
};

const mainRoutes: RouteObject[] = [
  // Redirect from /realestate to /real-estate for backward compatibility
  {
    path: "/realestate",
    element: <Navigate to="/real-estate" replace />,
  },
  // Direct messages route
  {
    path: "/messages",
    element: (
      <PrivateRoute>
        <Layout>
          <Messages />
        </Layout>
      </PrivateRoute>
    ),
  },
  // Direct saved listings route
  {
    path: "/saved",
    element: (
      <PrivateRoute>
        <Layout>
          <SavedListings />
        </Layout>
      </PrivateRoute>
    ),
  },
  // Direct settings route
  {
    path: "/settings",
    element: (
      <PrivateRoute>
        <Layout>
          <Settings />
        </Layout>
      </PrivateRoute>
    ),
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
    element: <PrivateRoute>{withLayout(CreateListing)}</PrivateRoute>,
  },
  {
    path: "/listings/edit/:id",
    element: <PrivateRoute>{withLayout(EditListing)}</PrivateRoute>,
  },
  {
    path: "/listings/:id",
    element: withLayout(ListingDetailsRedux),
  },
  {
    path: "/listing-success",
    element: <PrivateRoute>{withLayout(ListingSuccess)}</PrivateRoute>,
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
