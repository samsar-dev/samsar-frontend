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
import { type ReactElement, useEffect, useState, memo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MessagesProvider } from "./contexts/MessagesContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import Routes from "./routes/Routes";
import { SocketProvider } from "./contexts/SocketContext";
import { API_URL_PRIMARY, API_URL_FALLBACK } from "@/config";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Add resource hints for external resources
if (typeof document !== 'undefined') {
  // Preconnect to critical domains
  const criticalDomains = [
    new URL(API_URL_PRIMARY).origin,
    new URL(API_URL_FALLBACK).origin,
    'https://samsar-backend-production.up.railway.app',
    'https://maps.googleapis.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  // Use Set to avoid duplicates
  new Set(criticalDomains).forEach(domain => {
    // Preconnect with both preconnect and dns-prefetch for better browser support
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = domain;
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);

    // Add dns-prefetch as fallback
    if (domain.startsWith('http')) {
      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = domain;
      document.head.appendChild(dnsPrefetch);
    }
  });

  // Preload critical assets
  import('@/utils/preloadUtils').then(({ preloadCriticalAssets }) => {
    preloadCriticalAssets();
  });
}

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
  // Initialize immediately without any loading state
  useEffect(() => {
    setupAuthDebugger();
  }, []);

  // Always render the app, let individual components handle their loading states
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
              <ErrorBoundary
                fallback={
                  <div className="min-h-screen bg-white p-4">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                      <div className="rounded-lg bg-red-50 p-4">
                        <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
                        <p className="mt-2 text-sm text-red-700">
                          We're having trouble loading the application. Please try refreshing the page.
                        </p>
                      </div>
                    </div>
                  </div>
                }
              >
                <Routes />
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
              <SpeedInsights />
              <Analytics mode={process.env.NODE_ENV === 'production' ? 'production' : 'development'} />
            </CommunicationProviders>
          </CombinedDataProvider>
        </UIProviders>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;