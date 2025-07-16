import { type ReactElement, useEffect, memo, Suspense, lazy } from "react";
import { setupAuthDebugger } from "@/utils/authDebug";
import { ToastContainer } from "react-toastify";
import { ListingsProvider } from "@/contexts/ListingsContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

// Lazy load non-critical components
const ErrorBoundary = lazy(() => import("@/components/common/ErrorBoundary").then(m => ({ default: m.default })));
const AuthProvider = lazy(() => import("@/contexts/AuthContext").then(m => ({ default: m.AuthProvider })));
const UIProvider = lazy(() => import("@/contexts/UIContext").then(m => ({ default: m.UIProvider })));
const NotificationsProvider = lazy(() => import("@/contexts/NotificationsContext").then(m => ({ default: m.NotificationsProvider })));
const SettingsProvider = lazy(() => import("@/contexts/SettingsContext").then(m => ({ default: m.SettingsProvider })));
const MessagesProvider = lazy(() => import("./contexts/MessagesContext").then(m => ({ default: m.MessagesProvider })));
const SavedListingsProvider = lazy(() => import("./contexts/SavedListingsContext").then(m => ({ default: m.SavedListingsProvider })));
const Routes = lazy(() => import("./routes/Routes").then(m => ({ default: m.default })));
const SocketProvider = lazy(() => import("./contexts/SocketContext").then(m => ({ default: m.SocketProvider })));
const SpeedInsights = lazy(() => import("@vercel/speed-insights/react").then(m => ({ default: m.SpeedInsights })));
const Analytics = lazy(() => import("@vercel/analytics/react").then(m => ({ default: m.Analytics })));
const Helmet = lazy(() => import('react-helmet-async').then(m => ({ default: m.Helmet })));

// Import toastify CSS only once
import "react-toastify/dist/ReactToastify.css";

// Preconnect to external resources
if (typeof document !== 'undefined') {
  // Preconnect to Google Fonts
  const preconnectGoogle = document.createElement('link');
  preconnectGoogle.rel = 'preconnect';
  preconnectGoogle.href = 'https://fonts.googleapis.com';
  preconnectGoogle.crossOrigin = 'anonymous';
  document.head.appendChild(preconnectGoogle);
  
  const preconnectGStatic = document.createElement('link');
  preconnectGStatic.rel = 'preconnect';
  preconnectGStatic.href = 'https://fonts.gstatic.com';
  preconnectGStatic.crossOrigin = 'anonymous';
  document.head.appendChild(preconnectGStatic);

  // Load fonts with display=swap
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons&display=swap',
  ];
  
  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => { link.media = 'all'; };
    document.head.appendChild(link);
  });


}

const CombinedDataProvider = memo(({ children }: { children: React.ReactNode }) => (
  <ListingsProvider>
    <FavoritesProvider>
      <SavedListingsProvider>{children}</SavedListingsProvider>
    </FavoritesProvider>
  </ListingsProvider>
));

const UIProviders = memo(({ children }: { children: React.ReactNode }) => (
  <UIProvider>
    <SettingsProvider>{children}</SettingsProvider>
  </UIProvider>
));

const CommunicationProviders = memo(({ children }: { children: React.ReactNode }) => (
  <SocketProvider>
    <MessagesProvider>
      <NotificationsProvider>{children}</NotificationsProvider>
    </MessagesProvider>
  </SocketProvider>
));

const App = (): ReactElement => {
  useEffect(() => {
    // Defer non-critical initialization
    const initAuthDebugger = () => {
      try {
        setupAuthDebugger();
      } catch (error) {
        console.error('Error in setupAuthDebugger:', error);
      }
    };
    
    if (window.requestIdleCallback) {
      window.requestIdleCallback(initAuthDebugger);
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(initAuthDebugger, 0);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <UIProviders>
          <CombinedDataProvider>
            <CommunicationProviders>
              <Suspense fallback={null}>
                <ErrorBoundary>
                  <Routes />
                </ErrorBoundary>
              </Suspense>
              <Suspense fallback={null}>
                <ToastContainer
                  position="top-right"
                  autoClose={4000}
                  hideProgressBar
                  closeOnClick
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                  style={{ zIndex: 100000 }}
                />
              </Suspense>
              <Helmet>
                <meta name="theme-color" content="#ffffff" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
              </Helmet>
              {process.env.NODE_ENV === 'production' && (
                <>
                  <SpeedInsights />
                  <Analytics />
                </>
              )}
            </CommunicationProviders>
          </CombinedDataProvider>
        </UIProviders>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
