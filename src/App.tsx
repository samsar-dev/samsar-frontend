import {
  type ReactElement,
  useEffect,
  useState,
  memo,
  Suspense,
  lazy,
  useCallback,
} from "react";

// Core providers - only import what's needed for initial render
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy load ALL heavy components and providers
const ToastContainer = lazy(() =>
  import("react-toastify").then(m => ({
    default: m.ToastContainer,
  }))
);

const ListingsProvider = lazy(() =>
  import("@/contexts/ListingsContext").then(m => ({
    default: m.ListingsProvider,
  }))
);

const FavoritesProvider = lazy(() =>
  import("@/contexts/FavoritesContext").then(m => ({
    default: m.FavoritesProvider,
  }))
);

const UIProvider = lazy(() =>
  import("@/contexts/UIContext").then(m => ({
    default: m.UIProvider,
  }))
);

const NotificationsProvider = lazy(() =>
  import("@/contexts/NotificationsContext").then(m => ({
    default: m.NotificationsProvider,
  }))
);

const SettingsProvider = lazy(() =>
  import("@/contexts/SettingsContext").then(m => ({
    default: m.SettingsProvider,
  }))
);

const MessagesProvider = lazy(() =>
  import("@/contexts/MessagesContext").then(m => ({
    default: m.MessagesProvider,
  }))
);

const SavedListingsProvider = lazy(() =>
  import("./contexts/SavedListingsContext").then(m => ({
    default: m.SavedListingsProvider,
  }))
);

const SocketProvider = lazy(() =>
  import("./contexts/SocketContext").then(m => ({
    default: m.SocketProvider,
  }))
);

const ErrorBoundary = lazy(() =>
  import("@/components/common/ErrorBoundary")
);

// Defer analytics to after app is fully loaded
const SpeedInsights = lazy(() =>
  import("@vercel/speed-insights/react").then((module) => ({
    default: module.SpeedInsights,
  }))
);

const Analytics = lazy(() =>
  import("@vercel/analytics/react").then((module) => ({
    default: module.Analytics,
  }))
);

// Lazy load routes
const Routes = lazy(() => import("./routes/Routes"));

// Lazy load utilities to reduce initial bundle
const LazyMotion = lazy(() =>
  import("framer-motion").then(m => ({ default: m.LazyMotion }))
);

// Defer heavy imports
let domAnimation: any;
let ACTIVE_API_URL: string;

// Initialize resources lazily
const initializeResources = async () => {
  const [{ domAnimation: dom }, { ACTIVE_API_URL: url }] = await Promise.all([
    import("framer-motion"),
    import("@/config")
  ]);
  
  domAnimation = dom;
  ACTIVE_API_URL = url;
  
  // Add resource hints after initialization
  if (typeof document !== "undefined" && ACTIVE_API_URL) {
    const origin = new URL(ACTIVE_API_URL).origin;
    
     
  }
};

// Optimized single provider component with immediate rendering
const AppProviders = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <UIProvider>
      <SettingsProvider>
        <ListingsProvider>
          <FavoritesProvider>
            <SavedListingsProvider>
              <SocketProvider>
                <MessagesProvider>
                  <NotificationsProvider>
                    {children}
                  </NotificationsProvider>
                </MessagesProvider>
              </SocketProvider>
            </SavedListingsProvider>
          </FavoritesProvider>
        </ListingsProvider>
      </SettingsProvider>
    </UIProvider>
  );
});

// Minimal loading component
const MinimalLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Optimized App component with minimal initial bundle
const App: () => ReactElement = () => {
  const [isReady, setIsReady] = useState(false);
  
  // Memoized initialization function
  const initialize = useCallback(async () => {
    try {
      // Initialize resources in parallel
      await Promise.all([
        initializeResources(),
        // Lazy load CSS
        import('react-toastify/dist/ReactToastify.css'),
      ]);
      
      // Initialization complete
      
      setIsReady(true);
    } catch (error) {
      console.error('App initialization error:', error);
      setIsReady(true); // Continue anyway
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isReady) {
    return <MinimalLoader />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProviders>
          <Suspense fallback={<MinimalLoader />}>
            <LazyMotion features={domAnimation}>
              <Routes />
            </LazyMotion>
          </Suspense>
          
          {/* Defer non-critical components */}
          <Suspense fallback={null}>
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
          </Suspense>
          
          {/* Analytics only in production and after everything loads */}
          {process.env.NODE_ENV === 'production' && (
            <Suspense fallback={null}>
              <SpeedInsights />
              <Analytics />
            </Suspense>
          )}
        </AppProviders>
      </AuthProvider>
    </ErrorBoundary>
  );
};

// Lazy load all major components
const HomePage = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const MessagesPage = lazy(() => import("./pages/Messages"));
const ListingDetailPage = lazy(() => import("./pages/ListingSuccess"));
const CreateListingPage = lazy(() => import("./pages/RealEstate"));
const EditListingPage = lazy(() => import("./pages/Vehicles"));
const SearchResultsPage = lazy(() => import("./pages/Search"));
const CategoryPage = lazy(() => import("./pages/RealEstate"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default App;
