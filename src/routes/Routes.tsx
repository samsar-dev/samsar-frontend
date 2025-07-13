import {
  Routes as RouterRoutes,
  Route,
  Navigate,
  useLocation,
  Outlet
} from "react-router-dom";
import { Suspense, lazy, useEffect, memo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Layout as LayoutComponent } from "@/components/layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Memoized Layout component
const Layout = memo(({ children }: { children: React.ReactNode }) => (
  <LayoutComponent>{children}</LayoutComponent>
));

// Route-based code splitting with chunk names
const Home = lazy(() => import(/* webpackChunkName: "home" */ "@/pages/Home"));
const Login = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/Login"));
const Register = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/Register"));
const VerifyEmail = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/VerifyEmail"));
const VerifyCode = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/VerifyCode"));
const PasswordReset = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/PasswordReset"));
const PasswordResetVerification = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/PasswordResetVerification"));

// Profile routes
const Profile = lazy(() => import(/* webpackChunkName: "profile" */ "@/pages/Profile"));
const UserProfile = lazy(() => import(/* webpackChunkName: "profile" */ "@/pages/UserProfile"));
const ProfileInfo = lazy(() => import(/* webpackChunkName: "profile" */ "@/components/profile/ProfileInfo"));
const SavedListings = lazy(() => import(/* webpackChunkName: "profile" */ "@/components/profile/SavedListings"));
const MyListings = lazy(() => import(/* webpackChunkName: "profile" */ "@/components/profile/MyListings"));
const ChangePassword = lazy(() => import(/* webpackChunkName: "profile" */ "@/components/profile/ChangePassword"));

// Listing routes
const Search = lazy(() => import(/* webpackChunkName: "listings" */ "@/pages/Search"));
const Vehicles = lazy(() => import(/* webpackChunkName: "listings" */ "@/pages/Vehicles"));
const RealEstate = lazy(() => import(/* webpackChunkName: "listings" */ "@/pages/RealEstate"));
const ListingDetailsRedux = lazy(() => import(/* webpackChunkName: "listings" */ "@/components/listings/edit/ListingDetailsRedux"));
const CreateListing = lazy(() => import(/* webpackChunkName: "listings" */ "@/components/listings/create/CreateListing"));
const EditListing = lazy(() => import(/* webpackChunkName: "listings" */ "@/components/listings/edit/EditListingRedux"));
const ListingSuccess = lazy(() => import(/* webpackChunkName: "listings" */ "@/pages/ListingSuccess"));

// Admin routes
const ContactSubmissions = lazy(() => import(/* webpackChunkName: "admin" */ "@/pages/admin/ContactSubmissions"));
const UsersList = lazy(() => import(/* webpackChunkName: "admin" */ "@/pages/admin/UsersList"));
const Newsletter = lazy(() => import(/* webpackChunkName: "admin" */ "@/pages/admin/Newsletter"));
const AdminReports = lazy(() => import(/* webpackChunkName: "admin" */ "@/pages/admin/ReportsPage"));

// Static pages
const About = lazy(() => import(/* webpackChunkName: "static" */ "@/pages/About"));
const ContactUs = lazy(() => import(/* webpackChunkName: "static" */ "@/pages/ContactUs"));
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "static" */ "@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import(/* webpackChunkName: "static" */ "@/pages/TermsOfService"));

// Other routes
const Messages = lazy(() => import(/* webpackChunkName: "misc" */ "@/pages/Messages"));
const Settings = lazy(() => import(/* webpackChunkName: "misc" */ "@/pages/Settings"));
const PrivateRoute = lazy(() => import(/* webpackChunkName: "auth" */ "@/components/auth/AuthRoute"));

// Vite's import.meta.glob for prefetching
const pages = import.meta.glob([
  '@/pages/**/*.tsx',
  '@/components/**/*.tsx'
]);

// Prefetch routes based on current path
const usePrefetching = () => {
  const location = useLocation();

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        switch (location.pathname) {
          case '/':
            pages['/src/pages/Search.tsx']?.();
            pages['/src/pages/Vehicles.tsx']?.();
            pages['/src/pages/RealEstate.tsx']?.();
            break;
          case '/search':
            pages['/src/components/listings/edit/ListingDetailsRedux.tsx']?.();
            break;
          case '/profile':
            pages['/src/components/profile/MyListings.tsx']?.();
            pages['/src/components/profile/ChangePassword.tsx']?.();
            break;
        }
      });
    }
  }, [location.pathname]);
};

// Skeleton component for listings
const ListingSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
));

const AdminRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
});

const Routes = (): JSX.Element => {
  usePrefetching();
  const location = useLocation();

  const getFallback = () => {
    if (location.pathname.includes("/search") || location.pathname === "/") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <ListingSkeleton key={i} />
          ))}
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  };

  return (
    <Suspense fallback={getFallback()}>
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

          {/* Listing routes */}
          <Route path="/listings">
            <Route index element={<Navigate to="/" replace />} />
            <Route path=":id" element={<ListingDetailsRedux />} />
            <Route 
              path="create" 
              element={
                <PrivateRoute>
                  <CreateListing />
                </PrivateRoute>
              } 
            />
            <Route 
              path="edit/:id" 
              element={
                <PrivateRoute>
                  <EditListing />
                </PrivateRoute>
              } 
            />
          </Route>

          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/realestate" element={<RealEstate />} />
          <Route path="/listingsuccess" element={<ListingSuccess />} />
          
          {/* Profile routes */}
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfileRoutes />
            </PrivateRoute>
          }>
            <Route index element={<ProfileInfo />} />
            <Route path="saved" element={<SavedListings />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="settings" element={<Settings />} />
            <Route path="messages" element={<Messages />} />
          </Route>
          
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/users/:userId" element={<UserProfile />} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminRoutes />
            </AdminRoute>
          }>
            <Route path="contact-submissions" element={<ContactSubmissions />} />
            <Route path="users" element={<UsersList />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Static pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* 404 route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </RouterRoutes>
      </Layout>
    </Suspense>
  );
};

// Profile routes component
const ProfileRoutes = memo(() => {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <Outlet />
    </Suspense>
  );
});

// Admin routes component
const AdminRoutes = memo(() => {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <Outlet />
    </Suspense>
  );
});

export default memo(Routes);