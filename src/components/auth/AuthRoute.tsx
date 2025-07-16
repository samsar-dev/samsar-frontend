import type { PropsWithChildren } from "react";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
 

interface AuthRouteProps {
  roles?: string[];
  redirectTo?: string;
}

const AuthRoute: React.FC<PropsWithChildren<AuthRouteProps>> = ({
  roles = [],
  redirectTo = "/login",
  children,
}) => {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();
  const location = useLocation();

 

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Preserve the full URL including search params and hash
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={redirectTo} state={{ from: returnTo }} replace />;
  }

  // Check role-based access
  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
