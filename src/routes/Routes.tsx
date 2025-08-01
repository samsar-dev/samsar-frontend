import { Routes as RouterRoutes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const Home = lazy(() => import("@/pages/Home"));
const Search = lazy(() => import("@/pages/Search"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const RealEstate = lazy(() => import("@/pages/RealEstate"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const Messages = lazy(() => import("@/pages/Messages"));
const ListingSuccess = lazy(() => import("@/pages/ListingSuccess"));
const PasswordReset = lazy(() => import("@/pages/PasswordReset"));
const About = lazy(() => import("@/pages/About"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Suspense fallback={<LoadingSpinner />}><Home /></Suspense>} />
      <Route path="/search" element={<Suspense fallback={<LoadingSpinner />}><Search /></Suspense>} />
      <Route path="/vehicles" element={<Suspense fallback={<LoadingSpinner />}><Vehicles /></Suspense>} />
      <Route path="/real-estate" element={<Suspense fallback={<LoadingSpinner />}><RealEstate /></Suspense>} />
      <Route path="/login" element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<LoadingSpinner />}><Register /></Suspense>} />
      <Route path="/profile" element={<Suspense fallback={<LoadingSpinner />}><Profile /></Suspense>} />
      <Route path="/settings" element={<Suspense fallback={<LoadingSpinner />}><Settings /></Suspense>} />
      <Route path="/messages" element={<Suspense fallback={<LoadingSpinner />}><Messages /></Suspense>} />
      <Route path="/listing-success" element={<Suspense fallback={<LoadingSpinner />}><ListingSuccess /></Suspense>} />
      <Route path="/password-reset" element={<Suspense fallback={<LoadingSpinner />}><PasswordReset /></Suspense>} />
      <Route path="/about" element={<Suspense fallback={<LoadingSpinner />}><About /></Suspense>} />
      <Route path="/contact" element={<Suspense fallback={<LoadingSpinner />}><ContactUs /></Suspense>} />
      <Route path="/privacy" element={<Suspense fallback={<LoadingSpinner />}><PrivacyPolicy /></Suspense>} />
      <Route path="/terms" element={<Suspense fallback={<LoadingSpinner />}><TermsOfService /></Suspense>} />
      <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
    </RouterRoutes>
  );
};

export default Routes;
