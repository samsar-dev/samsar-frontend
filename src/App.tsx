import { type ReactElement, useEffect, useState, memo, Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import providers directly since they're lightweight
import { AuthProvider, ListingsProvider, FavoritesProvider, UIProvider } from "@/contexts";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { MessagesProvider } from "./contexts/MessagesContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import { SocketProvider } from "./contexts/SocketContext";

// Lazy load heavy components with proper type annotations
const ErrorBoundary = lazy(() => 
  import("@/components/common/ErrorBoundary")
    .then(module => ({ default: module.default }))
);

const SpeedInsights = lazy(() => 
  import("@vercel/speed-insights/react")
    .then(module => ({ default: () => <module.SpeedInsights /> }))
);

const Analytics = lazy(() => 
  import("@vercel/analytics/react")
    .then(module => ({ 
      default: () => {
        const isProd = process.env.NODE_ENV === 'production';
        return isProd ? <module.Analytics /> : null;
      }
    }))
);

// Lazy load routes
const Routes = lazy(() => import("./routes/Routes"));

// Import utilities
import { setupAuthDebugger } from "@/utils/authDebug";
import { API_URL_PRIMARY, API_URL_FALLBACK } from "@/config";

// Add resource hints for external resources
if (typeof document !== "undefined") {
  // Preconnect to primary API server
  const preconnectPrimary = document.createElement("link");
  preconnectPrimary.rel = "preconnect";
  preconnectPrimary.href = new URL(API_URL_PRIMARY).origin;
  document.head.appendChild(preconnectPrimary);

  // Preconnect to fallback API server
  const preconnectFallback = document.createElement("link");
  preconnectFallback.rel = "preconnect";
  preconnectFallback.href = new URL(API_URL_FALLBACK).origin;
  document.head.appendChild(preconnectFallback);

  // DNS prefetch for API domains
  const dnsPrefetchLink = document.createElement("link");
  dnsPrefetchLink.rel = "dns-prefetch";
  dnsPrefetchLink.href = "https://samsar-backend-production.up.railway.app";
  document.head.appendChild(dnsPrefetchLink);
}

// Memoized provider components to prevent unnecessary re-renders
const CombinedDataProvider = memo(({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>
    <ListingsProvider>
      <FavoritesProvider>
        <SavedListingsProvider>{children}</SavedListingsProvider>
      </FavoritesProvider>
    </ListingsProvider>
  </Suspense>
));

const UIProviders = memo(({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>
    <UIProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </UIProvider>
  </Suspense>
));

const CommunicationProviders = memo(({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>
    <SocketProvider>
      <MessagesProvider>
        <NotificationsProvider>{children}</NotificationsProvider>
      </MessagesProvider>
    </SocketProvider>
  </Suspense>
));

// Preload critical resources
const preloadResources = () => {
  if (typeof document !== 'undefined') {
    // Preload critical CSS
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'style';
    preloadLink.href = '/path/to/critical.css';
    document.head.appendChild(preloadLink);
  }
};

const App: () => ReactElement = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize critical resources first
        preloadResources();
        
        // Non-critical initialization can happen after first paint
        requestIdleCallback(() => {
          setupAuthDebugger();
        });
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        // Still show app even if initialization fails
        setIsInitialized(true);
      }
    };

    // Use requestIdleCallback to avoid blocking the main thread
    if (window.requestIdleCallback) {
      requestIdleCallback(initializeApp);
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(initializeApp, 0);
    }
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // Log errors to your monitoring service
          console.error("Application error:", error);
          console.error("Component stack:", errorInfo.componentStack);
        }}
      >
        <AuthProvider>
          <UIProviders>
            <CombinedDataProvider>
              <CommunicationProviders>
                <ErrorBoundary
                  fallback={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                      <div className="max-w-md w-full space-y-4 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          Something went wrong with this view
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          We've encountered an error rendering this page. Please
                          try refreshing.
                        </p>
                        <button
                          onClick={() => window.location.reload()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Refresh Page
                        </button>
                      </div>
                    </div>
                  }
                >
                  <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  }>
                    <Routes />
                  </Suspense>
                </ErrorBoundary>
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
                <Suspense fallback={null}>
                  <SpeedInsights />
                  <Analytics />
                </Suspense>
              </CommunicationProviders>
            </CombinedDataProvider>
          </UIProviders>
        </AuthProvider>
      </ErrorBoundary>
    </Suspense>
  );
};

export default App;
