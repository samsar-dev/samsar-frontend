import { type ReactElement } from "react";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "sonner";

// Core providers (load synchronously for immediate app context availability)
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { UIProvider } from "@/contexts/UIContext";
import { ListingsProvider } from "@/contexts/ListingsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { MessagesProvider } from "@/contexts/MessagesContext";

// Performance optimization hooks
import { usePrefetchCritical } from "@/hooks/usePrefetchCritical";

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
  // Initialize critical route prefetching
  usePrefetchCritical(4000); // Start prefetching after 4 seconds
  
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
              <SettingsProvider>
                <MessagesProvider>
                  <Layout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes />
                    </Suspense>
                    <Toaster position="top-right" richColors closeButton />
                  </Layout>
                </MessagesProvider>
              </SettingsProvider>
            </ListingsProvider>
          </UIProvider>
        </SocketProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
