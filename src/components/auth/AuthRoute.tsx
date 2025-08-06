import type { PropsWithChildren } from "react";
import React, { useEffect, useState } from "react";
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
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const location = useLocation();

  // Check auth status on mount and when auth state changes
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        await checkAuth();
      } finally {
        if (isMounted) {
          setHasCheckedAuth(true);
        }
      }
    };

    if (!isInitialized) {
      verifyAuth();
    } else {
      setHasCheckedAuth(true);
    }

    return () => {
      isMounted = false;
    };
  }, [isInitialized, checkAuth]);

  // Show loading spinner only when we're still checking auth
  if (isLoading || !hasCheckedAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        role="status"
      >
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Preserve the intended destination for after login
    const returnTo = location.pathname + location.search + location.hash;

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
