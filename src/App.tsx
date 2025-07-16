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
import { type ReactElement, useEffect, useState, memo, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MessagesProvider } from "./contexts/MessagesContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import Routes from "./routes/Routes";
import { SocketProvider } from "./contexts/SocketContext";
import { API_URL_PRIMARY, API_URL_FALLBACK } from "@/config";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { Helmet } from 'react-helmet-async';


// Optimize font loading and preload critical resources
if (typeof document !== 'undefined') {
  // Preconnect to critical domains with resource hints
  const resourceHints = [
    { rel: 'preconnect', href: new URL(API_URL_PRIMARY).origin, crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: new URL(API_URL_FALLBACK).origin, crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://samsar-backend-production.up.railway.app', crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://maps.googleapis.com', crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    { rel: 'dns-prefetch', href: 'https://maps.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' },
    { rel: 'preload', href: 'https://fonts.googleapis.com/icon?family=Material+Icons', as: 'style' },
  ];

  // Add all resource hints in a single batch
  resourceHints.forEach(({ rel, href, crossOrigin, as }) => {
    const link = document.createElement('link');
    link.rel = rel;
    if (href) link.href = href;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    if (as) link.as = as;
    document.head.appendChild(link);
  });

  // Load non-critical CSS asynchronously
  const loadNonCriticalCSS = () => {
    const links = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/icon?family=Material+Icons',
    ];
    
    links.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print';
      link.onload = () => { link.media = 'all'; };
      document.head.appendChild(link);
    });
  };

  // Load non-critical resources after the initial render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNonCriticalCSS);
  } else {
    loadNonCriticalCSS();
  }

  // Preload critical assets
  import('@/utils/preloadUtils')
    .then(({ preloadCriticalAssets }) => preloadCriticalAssets())
    .catch(console.error);
}

// Simple loading component


// Optimize context providers by combining related ones
const CombinedDataProvider = memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <ListingsProvider>
        <FavoritesProvider>
          <SavedListingsProvider>{children}</SavedListingsProvider>
        </FavoritesProvider>
      </ListingsProvider>
    );
  },
);

// Optimize UI providers
const UIProviders = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <UIProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </UIProvider>
  );
});

// Optimize communication providers
const CommunicationProviders = memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <SocketProvider>
        <MessagesProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </MessagesProvider>
      </SocketProvider>
    );
  },
);

const App: () => ReactElement = () => {
  // Initialize app
  useEffect(() => {
    const init = async () => {
      try {
        await setupAuthDebugger();
      } catch (error) {
        console.error('Failed to initialize auth debugger:', error);
      }
    };
    
    init();
  }, []);

  return (
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
              <Suspense fallback={null}>
              <ErrorBoundary
                fallback={
                  <div className="min-h-screen bg-white p-4">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                      <div className="rounded-lg bg-red-50 p-4">
                        <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
                        <p className="mt-2 text-sm text-red-700">
                          We're having trouble loading the application. Please try refreshing the page.
                        </p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
                        >
                          Refresh Page
                        </button>
                      </div>
                    </div>
                  </div>
                }
              >
                <Routes />
              </ErrorBoundary>
            </Suspense>
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
                style={{ zIndex: 100000 }}
              />
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