import {
  createBrowserRouter,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { Layout } from "@/components/layout";

// Loading fallback
import LoadingSpinner from "@/components/common/LoadingSpinner"; // or create a small spinner

// Lazy load pages
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Profile = lazy(() => import("@/pages/Profile"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Search = lazy(() => import("@/pages/Search"));
const ListingDetails = lazy(
  () => import("@/components/listings/edit/ListingDetails"),
);
const CreateListing = lazy(
  () => import("@/components/listings/create/CreateListing"),
);
const EditListing = lazy(
  () => import("@/components/listings/edit/EditListing"),
);
const Messages = lazy(() => import("@/pages/Messages"));

const Settings = lazy(() => import("@/pages/Settings"));
const ChangePassword = lazy(
  () => import("@/components/profile/ChangePassword"),
);
const MyListings = lazy(() => import("@/components/profile/MyListings"));
const ProfileInfo = lazy(() => import("@/components/profile/ProfileInfo"));
const SavedListings = lazy(() => import("@/components/profile/SavedListings"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const RealEstate = lazy(() => import("@/pages/RealEstate"));
const ListingSuccess = lazy(() => import("@/pages/ListingSuccess"));
const PrivateRoute = lazy(() => import("@/components/auth/AuthRoute"));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <Layout><Outlet /></Layout>,
    children: [
      {
        path: "/",
        element: <SuspenseWrapper><Home /></SuspenseWrapper>
      },
      {
        path: "/login",
        element: <SuspenseWrapper><Login /></SuspenseWrapper>
      },
      {
        path: "/register",
        element: <SuspenseWrapper><Register /></SuspenseWrapper>
      },
      {
        path: "/search",
        element: <SuspenseWrapper><Search /></SuspenseWrapper>
      },
      {
        path: "/listings/:id",
        element: <SuspenseWrapper><ListingDetails /></SuspenseWrapper>
      },
      {
        path: "/listings",
        element: <Navigate to="/" replace />
      },
      {
        path: "/vehicles",
        element: <SuspenseWrapper><Vehicles /></SuspenseWrapper>
      },
      {
        path: "/realestate",
        element: <SuspenseWrapper><RealEstate /></SuspenseWrapper>
      },
      {
        path: "/listingsuccess",
        element: <SuspenseWrapper><ListingSuccess /></SuspenseWrapper>
      },
      {
        element: <SuspenseWrapper><PrivateRoute><Outlet /></PrivateRoute></SuspenseWrapper>,
        children: [
          {
            path: "/profile",
            element: <Profile />,
            children: [
              { index: true, element: <ProfileInfo /> },
              { path: "listings", element: <MyListings /> },
              { path: "password", element: <ChangePassword /> }
            ]
          },
          { path: "/users/:userId", element: <UserProfile /> },
          { path: "/profile/:userId", element: <UserProfile /> },
          { path: "/settings", element: <Settings /> },
          { path: "/listings/create", element: <CreateListing /> },
          { path: "/listings/:id/edit", element: <EditListing /> },
          { path: "/saved-listings", element: <SavedListings /> },
          { path: "/messages", element: <Messages /> },
          { path: "/messages/:chatId", element: <Messages /> }
        ]
      }
    ]
  }
]);

export default router;
