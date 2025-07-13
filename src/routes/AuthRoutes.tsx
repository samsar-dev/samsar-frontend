import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { Layout } from "@/components/layout";

// Lazy load auth components
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const VerifyCode = lazy(() => import("@/pages/VerifyCode"));
const PasswordReset = lazy(() => import("@/pages/PasswordReset"));
const PasswordResetVerification = lazy(() => import("@/pages/PasswordResetVerification"));

// Layout wrapper for auth routes
const withLayout = (Component: React.ComponentType) => {
  return (
    <Layout>
      <Component />
    </Layout>
  );
};

const authRoutes: RouteObject[] = [
  {
    path: "/login",
    element: withLayout(Login),
  },
  {
    path: "/register",
    element: withLayout(Register),
  },
  {
    path: "/verify-email",
    element: withLayout(VerifyEmail),
  },
  {
    path: "/verify-code",
    element: withLayout(VerifyCode),
  },
  {
    path: "/reset-password",
    element: withLayout(PasswordReset),
  },
  {
    path: "/reset-password-verification",
    element: withLayout(PasswordResetVerification),
  },
];

export default authRoutes;
