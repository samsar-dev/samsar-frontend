import { memo } from "react";
import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AuthRouteProps {
  roles?: string[];
  redirectTo?: string;
}

const AuthRouteComponent: React.FC<PropsWithChildren<AuthRouteProps>> = ({
  roles = [],
  redirectTo = "/login",
  children,
}) => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // Show nothing while initializing - parent Suspense will handle loading state
  if (!isInitialized) {
    return null;
  }

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

// Memoize the component to prevent unnecessary re-renders
export const AuthRoute = memo(AuthRouteComponent);

export default AuthRoute;
