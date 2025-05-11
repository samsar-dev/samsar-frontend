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
import { MessagesProvider } from "./contexts/MessagesContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import Routes from "./routes/Routes";
import SocketProvider from "./contexts/SocketContext";

// Add resource hints for external resources
if (typeof document !== 'undefined') {
  // Preconnect to API server
  const preconnectLink = document.createElement('link');
  preconnectLink.rel = 'preconnect';
  preconnectLink.href = 'https://tijara-backend-production.up.railway.app';
  document.head.appendChild(preconnectLink);
  
  // DNS prefetch
  const dnsPrefetchLink = document.createElement('link');
  dnsPrefetchLink.rel = 'dns-prefetch';
  dnsPrefetchLink.href = 'https://tijara-backend-production.up.railway.app';
  document.head.appendChild(dnsPrefetchLink);
}

// Optimize context providers by combining related ones
const CombinedDataProvider = memo(({ children }: { children: React.ReactNode }) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize providers
    setInitialized(true);
  }, []);

  if (!initialized) {
    return <LoadingSpinner />;
  }

  return (
    <ListingsProvider>
      <FavoritesProvider>
        <SavedListingsProvider>
          {children}
        </SavedListingsProvider>
      </FavoritesProvider>
    </ListingsProvider>
  );
});

// Optimize UI providers
const UIProviders = memo(({ children }: { children: React.ReactNode }) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize providers
    setInitialized(true);
  }, []);

  if (!initialized) {
    return <LoadingSpinner />;
  }

  return (
    <UIProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </UIProvider>
  );
});

// Optimize communication providers
const CommunicationProviders = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <SocketProvider>
      <MessagesProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </MessagesProvider>
    </SocketProvider>
  );
});

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
    <AuthProvider>
      <UIProviders>
        <CombinedDataProvider>
          <CommunicationProviders>
            <Routes />
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
          </CommunicationProviders>
        </CombinedDataProvider>
      </UIProviders>
    </AuthProvider>
  );
};

export default App;
