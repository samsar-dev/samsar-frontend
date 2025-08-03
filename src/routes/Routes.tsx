import { useRoutes } from "react-router-dom";
import authRoutes from "./AuthRoutes";
import adminRoutes from "./AdminRoutes";
import mainRoutes from "./MainRoutes";
import { privateRoutes } from "./PrivateRoutes";



const Routes = () => {
  // Combine all routes in order of specificity
  // More specific routes should come first
  const routes = [...privateRoutes, ...adminRoutes, ...authRoutes, ...mainRoutes];
  
  // Use the useRoutes hook to render routes
  const element = useRoutes(routes);
  
  return <>{element}</>;
};

export default Routes;
