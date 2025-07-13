import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import PrivateRoute from "@/components/auth/AuthRoute";

// Lazy load main components
const Home = lazy(() => import("@/pages/Home"));
const Search = lazy(() => import("@/pages/Search"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const RealEstate = lazy(() => import("@/pages/RealEstate"));
const ListingDetailsRedux = lazy(() => import("@/components/listings/edit/ListingDetailsRedux"));
const CreateListing = lazy(() => import("@/components/listings/create/CreateListing"));
const EditListing = lazy(() => import("@/components/listings/edit/EditListingRedux"));
const ListingSuccess = lazy(() => import("@/pages/ListingSuccess"));
const About = lazy(() => import("@/pages/About"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));

const mainRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/search",
    element: <Search />,
  },
  {
    path: "/vehicles",
    element: <Vehicles />,
  },
  {
    path: "/real-estate",
    element: <RealEstate />,
  },
  {
    path: "/listings/create",
    element: (
      <PrivateRoute>
        <CreateListing />
      </PrivateRoute>
    ),
  },
  {
    path: "/listings/edit/:id",
    element: (
      <PrivateRoute>
        <EditListing />
      </PrivateRoute>
    ),
  },
  {
    path: "/listings/:id",
    element: <ListingDetailsRedux />,
  },
  {
    path: "/listing-success",
    element: (
      <PrivateRoute>
        <ListingSuccess />
      </PrivateRoute>
    ),
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <ContactUs />,
  },
  {
    path: "/privacy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/terms",
    element: <TermsOfService />,
  },
];

export default mainRoutes;
