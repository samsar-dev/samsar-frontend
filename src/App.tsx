import ErrorBoundary from "@/components/common/ErrorBoundary";
import {
  AuthProvider,
  FavoritesProvider,
  ListingsProvider,
  UIProvider,
} from "@/contexts";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { setupAuthDebugger } from "@/utils/authDebug";
import { type ReactElement, useEffect, memo, Suspense, lazy } from "react";
const ToastContainer = lazy(() => import("react-toastify").then(m => ({ default: m.ToastContainer })));
import "react-toastify/dist/ReactToastify.css";
import { MessagesProvider } from "./contexts/MessagesContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import Routes from "./routes/Routes";
import { SocketProvider } from "./contexts/SocketContext";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { Helmet } from 'react-helmet-async';

// Preconnect to external resources
if (typeof document !== 'undefined') {
  const links = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
  ];
  links.forEach(href => {
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.href = href;
    preload.as = 'style';
    document.head.appendChild(preload);
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = href;
    stylesheet.media = 'print';
    stylesheet.onload = () => { stylesheet.media = 'all'; };
    document.head.appendChild(stylesheet);
  });
  import('@/utils/preloadUtils').then(m => m.preloadCriticalAssets()).catch(console.error);
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
    try {
      setupAuthDebugger();
    } catch (error) {
      console.error('Error in setupAuthDebugger:', error);
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
