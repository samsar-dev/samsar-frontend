import type { PropsWithChildren } from "react";
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface AuthRouteProps {
  roles?: string[];
  redirectTo?: string;
}

const AuthRoute: React.FC<PropsWithChildren<AuthRouteProps>> = ({
  roles = [],
  redirectTo = "/login",
  children,
}) => {
  const { user, isAuthenticated, isLoading, isInitialized, checkAuth } =
    useAuth();
  const location = useLocation();

  // If auth is not initialized, we need to check it
  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  // Show loading spinner while auth is initializing
  if (isLoading || !isInitialized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner
          size="lg"
          label="Loading authentication..."
          ariaLive="polite"
          ariaAtomic={true}
        />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Preserve the full URL including search params and hash
    const returnTo = `${location.pathname}${location.search}${location.hash}`;

    // Create a new Navigate component with the correct state
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{
          from: returnTo,
          redirect: true, // Add flag to indicate this is a redirect
        }}
      />
    );
  }

  // Check role-based access
  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
