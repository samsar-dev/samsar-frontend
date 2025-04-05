import type { PropsWithChildren } from "react";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AuthRouteProps {
  roles?: string[];
  redirectTo?: string;
}

const AuthRoute: React.FC<PropsWithChildren<AuthRouteProps>> = ({
  roles = [],
  redirectTo = "/login",
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
