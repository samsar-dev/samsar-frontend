import {
  Routes as RouterRoutes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Layout } from "@/components/layout";

// Loading fallback
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Prefetching utility
const prefetchComponent = (importFn: () => Promise<any>) => {
  if (typeof window !== "undefined") {
    // Use requestIdleCallback for non-critical preloading when browser is idle
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => importFn());
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => importFn(), 1000);
    }
  }
};

// Define import functions for each component
const importHome = () => import("@/pages/Home");
const importLogin = () => import("@/pages/Login");
const importRegister = () => import("@/pages/Register");
const importVerifyEmail = () => import("@/pages/VerifyEmail");
const importVerifyCode = () => import("@/pages/VerifyCode");
const importProfile = () => import("@/pages/Profile");
const importUserProfile = () => import("@/pages/UserProfile");
const importSearch = () => import("@/pages/Search");
const importListingDetails = () =>
  import("@/components/listings/edit/ListingDetails");
const importCreateListing = () =>
  import("@/components/listings/create/CreateListing");
const importEditListing = () =>
  import("@/components/listings/edit/EditListing");
const importMessages = () => import("@/pages/Messages");
const importSettings = () => import("@/pages/Settings");
const importChangePassword = () =>
  import("@/components/profile/ChangePassword");
const importMyListings = () => import("@/components/profile/MyListings");
const importProfileInfo = () => import("@/components/profile/ProfileInfo");
const importSavedListings = () => import("@/components/profile/SavedListings");
const importVehicles = () => import("@/pages/Vehicles");
const importRealEstate = () => import("@/pages/RealEstate");
const importListingSuccess = () => import("@/pages/ListingSuccess");
const importPrivateRoute = () => import("@/components/auth/AuthRoute");

// Lazy load pages
const Home = lazy(importHome);
const Login = lazy(importLogin);
const VerifyCode = lazy(importVerifyCode);
const PasswordReset = lazy(() => import("@/pages/PasswordReset"));
const PasswordResetVerification = lazy(() => import("@/pages/PasswordResetVerification"));
const Register = lazy(importRegister);
const VerifyEmail = lazy(importVerifyEmail);
const Profile = lazy(importProfile);
const UserProfile = lazy(importUserProfile);
const Search = lazy(importSearch);
const ListingDetails = lazy(importListingDetails);
const CreateListing = lazy(importCreateListing);
const EditListing = lazy(importEditListing);
const Messages = lazy(importMessages);
const Settings = lazy(importSettings);
const ChangePassword = lazy(importChangePassword);
const MyListings = lazy(importMyListings);
const ProfileInfo = lazy(importProfileInfo);
const SavedListings = lazy(importSavedListings);
const Vehicles = lazy(importVehicles);
const RealEstate = lazy(importRealEstate);
const ListingSuccess = lazy(importListingSuccess);
const PrivateRoute = lazy(importPrivateRoute);

// Create a skeleton component for listings
const ListingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const Routes = (): JSX.Element => {
  const location = useLocation();

  // Intelligent prefetching based on current route
  useEffect(() => {
    // Prefetch related routes when on certain pages
    if (location.pathname === "/") {
      // When on homepage, prefetch search and popular listing pages
      prefetchComponent(importSearch);
      prefetchComponent(importVehicles);
      prefetchComponent(importRealEstate);
    } else if (location.pathname.includes("/listings/")) {
      // When viewing a listing, prefetch edit listing component
      prefetchComponent(importEditListing);
    } else if (location.pathname === "/search") {
      // When on search page, prefetch listing details
      prefetchComponent(importListingDetails);
    } else if (location.pathname === "/profile") {
      // When on profile, prefetch related components
      prefetchComponent(importMyListings);
      prefetchComponent(importChangePassword);
    }
  }, [location.pathname]);
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4">
          {location.pathname.includes("/search") ||
          location.pathname === "/" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <ListingSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}
        </div>
      }
    >
      <Layout>
        <RouterRoutes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/password-reset-verification" element={<PasswordResetVerification />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-code" element={<VerifyCode />} />
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
      </Layout>
    </Suspense>
  );
};

export default Routes;
