import ErrorBoundary from "@/components/common/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ListingsProvider } from "@/contexts/ListingsContext";
import { UIProvider } from "@/contexts/UIContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { MessagesProvider } from "@/contexts/MessagesContext";
import { SavedListingsProvider } from "@/contexts/SavedListingsContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { type ReactElement, useEffect, memo, Suspense, lazy } from "react";
import { Helmet } from 'react-helmet-async';
import { createRoot } from "react-dom/client";

// Initialize React before lazy loading
if (typeof document !== 'undefined') {
  const container = document.getElementById('root');
  if (container) {
    createRoot(container);
  }
}

// Lazy load non-critical components
const ToastContainer = lazy(() => import("react-toastify").then(m => ({ default: m.ToastContainer })));
const SpeedInsights = lazy(() => import("@vercel/speed-insights/react").then(m => ({ default: m.SpeedInsights })));
const Analytics = lazy(() => import("@vercel/analytics/react").then(m => ({ default: m.Analytics })));
const Routes = lazy(() => import("./routes/Routes").then(m => ({ default: m.default })));

// Import CSS with proper base URL
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/static/assets/index.css';
  link.as = 'style';
  link.onload = () => {
    link.rel = 'stylesheet';
  };
  document.head.appendChild(link);
}

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

  // Load critical assets with lower priority
  requestIdleCallback(() => {
    import('@/utils/preloadUtils')
      .then(m => m.preloadCriticalAssets())
      .catch(console.error);
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
    // Initialize auth debugger in idle callback
    const initAuthDebugger = () => {
      try {
        // @ts-ignore - This will be available in production
        setupAuthDebugger();
      } catch (error) {
        console.error('Error in setupAuthDebugger:', error);
      }
    };

    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      window.requestIdleCallback(initAuthDebugger);
    } else {
      setTimeout(initAuthDebugger, 0);
    }
  }, []);

  return (
    <>
      <AuthProvider>
        <UIProvider>
          <CombinedDataProvider>
            <CommunicationProviders>
              <Suspense fallback={null}>
                <Routes />
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
                <link rel="icon" type="image/svg+xml" href="/static/assets/favicon.svg" />
                <link rel="apple-touch-icon" href="/static/assets/apple-touch-icon.png" />
                <meta name="description" content="سمسار - سوق السيارات والعقارات الأول في سوريا" />
                <meta name="keywords" content="سمسار, سوق السيارات, عقارات سوريا, سيارات مستعملة, سيارات جديدة" />
                <meta property="og:title" content="سمسار - سوق السيارات والعقارات الأول في سوريا" />
                <meta property="og:description" content="سمسار - سوق السيارات والعقارات الأول في سوريا" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://samsar.app" />
                <meta property="og:image" content="/static/assets/og-image.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="سمسار - سوق السيارات والعقارات الأول في سوريا" />
                <meta name="twitter:description" content="سمسار - سوق السيارات والعقارات الأول في سوريا" />
                <meta name="twitter:image" content="/static/assets/og-image.png" />
              </Helmet>
              {process.env.NODE_ENV === 'production' && (
                <>
                  <SpeedInsights />
                  <Analytics />
                </>
              )}
            </CommunicationProviders>
          </CombinedDataProvider>
        </UIProvider>
      </AuthProvider>
    </>
  );
};

export default App;
