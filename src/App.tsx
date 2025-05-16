import ErrorBoundary from "@/components/common/ErrorBoundary";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  AuthProvider,
  FavoritesProvider,
  ListingsProvider,
  UIProvider,
} from "@/contexts";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { setupAuthDebugger } from "@/utils/authDebug";
import { TokenManager } from "@/utils/tokenManager";
import { type ReactElement, useEffect, useState, memo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Speed Insights removed due to error reporting issues
import { MessagesProvider } from "./contexts/MessagesContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import Routes from "./routes/Routes";
import SocketProvider from "./contexts/SocketContext";

// Add resource hints for external resources
if (typeof document !== "undefined") {
  // Preconnect to API server
  const preconnectLink = document.createElement("link");
  preconnectLink.rel = "preconnect";
  preconnectLink.href = "https://tijara-backend-production.up.railway.app";
  document.head.appendChild(preconnectLink);

  // DNS prefetch
  const dnsPrefetchLink = document.createElement("link");
  dnsPrefetchLink.rel = "dns-prefetch";
  dnsPrefetchLink.href = "https://tijara-backend-production.up.railway.app";
  document.head.appendChild(dnsPrefetchLink);
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
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await TokenManager.initialize();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
    setupAuthDebugger();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
                <Routes />
                { /* Speed Insights removed due to error reporting issues */ }
              </ErrorBoundary>
            </CommunicationProviders>
          </CombinedDataProvider>
        </UIProviders>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default memo(App);
