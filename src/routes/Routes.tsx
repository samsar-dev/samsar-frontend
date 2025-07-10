import {
  Routes as RouterRoutes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";

// Loading fallback
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EditListing from "@/components/listings/edit/EditListing";

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
  import("@/components/listings/edit/ListingDetailsRedux");
const importCreateListing = () =>
  import("@/components/listings/create/CreateListing");
const importEditListing = () =>
  import("@/components/listings/edit/EditListingRedux");
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
const importContactSubmissions = () =>
  import("@/pages/admin/ContactSubmissions");
const importUsersList = () => import("@/pages/admin/UsersList");
const importNewsletter = () => import("@/pages/admin/Newsletter");
const importAdminReports = () => import("@/pages/admin/ReportsPage");

// Role-based access control types
type UserRole = 'user' | 'admin' | 'moderator';

// Role-based route guard
const withRole = (Component: React.ComponentType, allowedRoles: UserRole[]) => {
  return function WithRoleWrapper(props: any) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return <Component {...props} />;
  };
};

// Lazy load pages with better chunk naming
const Home = lazy(() => import("@/pages/Home").then(m => ({ default: m.default })));
const Login = lazy(() => import("@/pages/Login").then(m => ({ default: m.default })));
const VerifyCode = lazy(() => import("@/pages/VerifyCode").then(m => ({ default: m.default })));
const PasswordReset = lazy(() => import("@/pages/PasswordReset").then(m => ({ default: m.default })));
const PasswordResetVerification = lazy(() => 
  import("@/pages/PasswordResetVerification").then(m => ({ default: m.default }))
);
const Register = lazy(() => import("@/pages/Register").then(m => ({ default: m.default })));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail").then(m => ({ default: m.default })));
const Profile = lazy(() => import("@/pages/Profile").then(m => ({ default: m.default })));
const UserProfile = lazy(() => import("@/pages/UserProfile").then(m => ({ default: m.default })));
const Search = lazy(() => import("@/pages/Search").then(m => ({ default: m.default })));
const ListingDetailsRedux = lazy(() => 
  import("@/components/listings/edit/ListingDetailsRedux").then(m => ({ default: m.default }))
);
const CreateListing = lazy(() => 
  import("@/components/listings/create/CreateListing").then(m => ({ default: m.default }))
);
const EditListingRedux = lazy(() => 
  import("@/components/listings/edit/EditListingRedux").then(m => ({ default: m.default }))
);
const Messages = lazy(() => import("@/pages/Messages").then(m => ({ default: m.default })));
const Settings = lazy(() => import("@/pages/Settings").then(m => ({ default: m.default })));
const ChangePassword = lazy(() => 
  import("@/components/profile/ChangePassword").then(m => ({ default: m.default }))
);
const MyListings = lazy(() => import("@/components/profile/MyListings").then(m => ({ default: m.default })));
const ProfileInfo = lazy(() => import("@/components/profile/ProfileInfo").then(m => ({ default: m.default })));
const SavedListings = lazy(() => 
  import("@/components/profile/SavedListings").then(m => ({ default: m.default }))
);
const Vehicles = lazy(() => import("@/pages/Vehicles").then(m => ({ default: m.default })));
const RealEstate = lazy(() => import("@/pages/RealEstate").then(m => ({ default: m.default })));
const Newsletter = lazy(() => import("@/pages/admin/Newsletter").then(m => ({ default: m.default })));
const AdminReports = lazy(() => import("@/pages/admin/ReportsPage").then(m => ({ default: m.default })));
const ListingSuccess = lazy(() => import("@/pages/ListingSuccess").then(m => ({ default: m.default })));
const PrivateRoute = lazy(() => import("@/components/auth/AuthRoute").then(m => ({ default: m.default })));
const About = lazy(() => import("@/pages/About").then(m => ({ default: m.default })));
const ContactUs = lazy(() => import("@/pages/ContactUs").then(m => ({ default: m.default })));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy").then(m => ({ default: m.default })));
const TermsOfService = lazy(() => import("@/pages/TermsOfService").then(m => ({ default: m.default })));
const ContactSubmissions = lazy(() => 
  import("@/pages/admin/ContactSubmissions").then(m => ({ default: m.default }))
);
const UsersList = lazy(() => import("@/pages/admin/UsersList").then(m => ({ default: m.default })));

// Create admin-wrapped components
const AdminContactSubmissions = withRole(ContactSubmissions, ['admin']);
const AdminUsersList = withRole(UsersList, ['admin']);
const AdminNewsletter = withRole(Newsletter, ['admin']);
const AdminReportsPage = withRole(AdminReports, ['admin']);

// Create a skeleton component for listings
const ListingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

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
          <Route
            path="/password-reset-verification"
            element={<PasswordResetVerification />}
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/search" element={<Search />} />

          <Route path="/listings/:id" element={<ListingDetailsRedux />} />
          <Route path="/listings" element={<Navigate to="/" replace />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/realestate" element={<RealEstate />} />
          <Route path="/listingsuccess" element={<ListingSuccess />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/users/:userId" element={<UserProfile />} />

          {/* New static pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Admin Routes with role-based access */}
          <Route
            path="/admin/contact-submissions"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <AdminContactSubmissions />
              </Suspense>
            }
          />
          <Route
            path="/admin/users"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <AdminUsersList />
              </Suspense>
            }
          />
          <Route
            path="/admin/newsletter"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <AdminNewsletter />
              </Suspense>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <AdminReportsPage />
              </Suspense>
            }
          />
          <Route 
            path="/unauthorized" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                  <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                  <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                  </p>
                  <Link 
                    to="/" 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Return Home
                  </Link>
                </div>
              </div>
            } 
          />

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
