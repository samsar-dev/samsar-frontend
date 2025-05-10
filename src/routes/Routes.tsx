import {
  Routes as RouterRoutes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";

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
  () => import("@/components/listings/edit/ListingDetails")
);
const CreateListing = lazy(
  () => import("@/components/listings/create/CreateListing")
);
const EditListing = lazy(
  () => import("@/components/listings/edit/EditListing")
);
const Messages = lazy(() => import("@/pages/Messages"));

const Settings = lazy(() => import("@/pages/Settings"));
const ChangePassword = lazy(
  () => import("@/components/profile/ChangePassword")
);
const MyListings = lazy(() => import("@/components/profile/MyListings"));
const ProfileInfo = lazy(() => import("@/components/profile/ProfileInfo"));
const SavedListings = lazy(() => import("@/components/profile/SavedListings"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const RealEstate = lazy(() => import("@/pages/RealEstate"));
const ListingSuccess = lazy(() => import("@/pages/ListingSuccess"));
const PrivateRoute = lazy(() => import("@/components/auth/AuthRoute"));

const Routes = (): JSX.Element => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" /> {/* Or simple text "Loading..." */}
        </div>
      }
    >
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />

        <Route path="/listings/:id" element={<ListingDetails />} />
        <Route path="/listings" element={<Navigate to="/" replace />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/realestate" element={<RealEstate />} />
        <Route path="/listingsuccess" element={<ListingSuccess />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/users/:userId" element={<UserProfile />} />


        {/* Protected routes */}
        <Route
          element={
            <PrivateRoute>
              <Outlet />
            </PrivateRoute>
          }
        >
          <Route path="/profile" element={<Profile />}>
            <Route index element={<ProfileInfo />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="password" element={<ChangePassword />} />
          </Route>

          <Route path="/settings" element={<Settings />} />
          <Route path="/listings/create" element={<CreateListing />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
          <Route path="/saved-listings" element={<SavedListings />} />
          <Route path="/messages/" element={<Messages />} />
          <Route path="/messages/:chatId" element={<Messages />} />
        </Route>
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes;
