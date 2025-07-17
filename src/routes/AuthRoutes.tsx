import { lazy, memo, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import { Layout } from "@/components/layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";

// Optimized loading component for auth pages
const AuthLoading = memo(() => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" label="Loading..." />
  </div>
));
AuthLoading.displayName = 'AuthLoading';

// Enhanced lazy loading for auth components
const createAuthComponent = (importFn: () => Promise<{ default: React.ComponentType<any> }>, chunkName?: string) => {
  const LazyComponent = lazy(importFn);
  
  // Add preload method
  (LazyComponent as any).preload = importFn;
  
  return LazyComponent;
};

// Auth components with priority-based loading
const Login = createAuthComponent(() => import("@/pages/Login"), "login");
const Register = createAuthComponent(() => import("@/pages/Register"), "register");
const VerifyEmail = createAuthComponent(() => import("@/pages/VerifyEmail"), "verify-email");
const VerifyCode = createAuthComponent(() => import("@/pages/VerifyCode"), "verify-code");
const PasswordReset = createAuthComponent(() => import("@/pages/PasswordReset"), "password-reset");
const PasswordResetVerification = createAuthComponent(() => import("@/pages/PasswordResetVerification"), "password-reset-verification");

// Memoized layout wrapper for auth routes
const withLayout = memo((Component: React.ComponentType) => {
  const WrappedComponent = memo(() => (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<AuthLoading />}>
          <Component />
        </Suspense>
      </Layout>
    </ErrorBoundary>
  ));
  WrappedComponent.displayName = `withAuthLayout(${Component.displayName || Component.name})`;
  return <WrappedComponent />;
});

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
