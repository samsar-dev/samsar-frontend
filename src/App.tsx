import { type ReactElement } from "react";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense, useEffect } from "react";

// Core providers (load synchronously for immediate app context availability)
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { UIProvider } from "@/contexts/UIContext";
import { ListingsProvider } from "@/contexts/ListingsContext";

// Layout component (navigation, header, etc.) — must render immediately
import Layout from "@/components/layout/Layout";

// Lazy load routes (to reduce initial JS bundle size)
const Routes = lazy(() => import("./routes/Routes"));

// Minimal non-blocking loader (tiny inline spinner)
const LoadingFallback = () => (
  <div style={{
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    color: "#2563eb",
  }}>
    Loading...
  </div>
);

const App: () => ReactElement = () => {
  // Preload critical routes in background (after initial paint)
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        import("./routes/Routes");
      });
    } else {
      setTimeout(() => import("./routes/Routes"), 1500);
    }
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <SocketProvider>
          <UIProvider>
            <ListingsProvider>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes />
                </Suspense>
              </Layout>
            </ListingsProvider>
          </UIProvider>
        </SocketProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
