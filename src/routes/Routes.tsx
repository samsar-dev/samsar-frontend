import { useRoutes } from "react-router-dom";
import { Suspense } from "react";
import authRoutes from "./AuthRoutes";
import adminRoutes from "./AdminRoutes";
import mainRoutes from "./MainRoutes";
import { privateRoutes } from "./PrivateRoutes";

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const Routes = () => {
  // Combine all routes in order of specificity
  // More specific routes should come first
  const routes = [...privateRoutes, ...adminRoutes, ...authRoutes, ...mainRoutes];
  
  // Use the useRoutes hook to render routes
  const element = useRoutes(routes);
  
  return <>{element}</>;
};

export default Routes;
