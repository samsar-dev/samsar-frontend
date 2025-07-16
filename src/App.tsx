import { useEffect, memo, Suspense, lazy, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import only necessary providers directly
import { AuthProvider, ListingsProvider, FavoritesProvider, UIProvider } from "@/contexts";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { MessagesProvider } from "./contexts/MessagesContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import { SocketProvider } from "./contexts/SocketContext";

// Lazy load heavy components with proper type annotations and preloading
const ErrorBoundary = lazy(() => 
  import("@/components/common/ErrorBoundary")
    .then(module => ({ default: module.default }))
);

// Only load analytics in production
const LazyAnalytics = lazy(() => 
  import("@vercel/analytics/react").then(module => ({
    default: () => (process.env.NODE_ENV === 'production' ? <module.Analytics /> : null)
  }))
);

// Lazy load routes with preloading
const Routes = lazy(() => import("./routes/Routes"));

// Preload critical components after initial render
const preloadNonCriticalComponents = () => {
  if (typeof window !== 'undefined') {
    // Preload analytics in the background
    import("@vercel/analytics/react").catch(() => {});
    
    // Preload other non-critical components
    const componentsToPreload = [
      import("@vercel/speed-insights/react"),
      // Add other non-critical components here
    ];
    
    // Use requestIdleCallback to avoid blocking the main thread
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        Promise.allSettled(componentsToPreload);
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        Promise.allSettled(componentsToPreload);
      }, 5000);
    }
  }
};

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

// Optimized provider components with memo and proper typing
type ProviderProps = { children: React.ReactNode };

// Memoized provider components to prevent unnecessary re-renders
const CombinedDataProvider = memo(({ children }: ProviderProps) => {
  return (
    <ListingsProvider>
      <FavoritesProvider>
        <SavedListingsProvider>{children}</SavedListingsProvider>
      </FavoritesProvider>
    </ListingsProvider>
  );
});

const UIProviders = memo(({ children }: ProviderProps) => (
  <UIProvider>
    <SettingsProvider>{children}</SettingsProvider>
  </UIProvider>
));

const CommunicationProviders = memo(({ children }: ProviderProps) => (
  <SocketProvider>
    <MessagesProvider>
      <NotificationsProvider>{children}</NotificationsProvider>
    </MessagesProvider>
  </SocketProvider>
));

// Preload critical resources
const preloadCriticalResources = () => {
  if (typeof document === 'undefined') return;
  
  // Preload critical CSS
  const preloadCriticalCSS = () => {
    const criticalCSS = document.querySelector('style[data-critical-css]');
    if (!criticalCSS) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = '/path/to/critical.css';
    link.onload = () => link.onload = null;
    document.head.appendChild(link);
  };
  
  // Preload web fonts
  const preloadFonts = () => {
    const fontFiles = [
      '/fonts/your-font.woff2',
      // Add other critical font files
    ];
    
    fontFiles.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = font;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  };
  
  // Run preload functions
  preloadCriticalCSS();
  preloadFonts();
};

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize debug tools in development
    if (process.env.NODE_ENV === 'development') {
      setupAuthDebugger();
    }
    
    // Preload critical resources after initial render
    preloadCriticalResources();
    
    // Mark app as initialized
    setIsInitialized(true);
    
    // Preload non-critical components after a delay
    const preloadTimer = setTimeout(preloadNonCriticalComponents, 2000);
    
    return () => clearTimeout(preloadTimer);
  }, []);
  
  // Memoize the toast container config to prevent unnecessary re-renders
  const toastContainer = useMemo(() => (
    <ToastContainer
      position="bottom-right"
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
  ), []);

  if (!isInitialized) {
     
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">We're sorry, but an unexpected error occurred.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }
    >
      <AuthProvider>
        <UIProviders>
          <CommunicationProviders>
            <CombinedDataProvider>
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                }
              >
                <Routes />
                {toastContainer}
                <Suspense fallback={null}>
                  <LazyAnalytics />
                </Suspense>
              </Suspense>
            </CombinedDataProvider>
          </CommunicationProviders>
        </UIProviders>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;