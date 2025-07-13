import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Lazy load auth components
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const VerifyCode = lazy(() => import("@/pages/VerifyCode"));
const PasswordReset = lazy(() => import("@/pages/PasswordReset"));
const PasswordResetVerification = lazy(() => import("@/pages/PasswordResetVerification"));

const authRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/verify-code",
    element: <VerifyCode />,
  },
  {
    path: "/reset-password",
    element: <PasswordReset />,
  },
  {
    path: "/reset-password-verification",
    element: <PasswordResetVerification />,
  },
];

export default authRoutes;
