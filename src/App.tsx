import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Layout } from "@/components/layout";
import {
  AuthProvider,
  FavoritesProvider,
  ListingsProvider,
  UIProvider,
} from "@/contexts";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { setupAuthDebugger } from "@/utils/authDebug";
import TokenManager from "@/utils/tokenManager";
import { type ReactElement, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MessagesProvider } from "./contexts/MessagesContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import AppRoutes from "./routes/Routes";
import SocketProvider from "./contexts/SocketContext";

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
    <UIProvider>
      <AuthProvider>
        <NotificationsProvider>
          <FavoritesProvider>
            <ListingsProvider>
              <SettingsProvider>
                <SavedListingsProvider>
                  <MessagesProvider>
                    <SocketProvider>
                      <div className="min-h-screen bg-background-primary text-text-primary dark:bg-background-primary-dark dark:text-text-primary-dark">
                        <Layout>
                          <AppRoutes />
                          <ToastContainer />
                        </Layout>
                      </div>
                    </SocketProvider>
                  </MessagesProvider>
                </SavedListingsProvider>
              </SettingsProvider>
            </ListingsProvider>
          </FavoritesProvider>
        </NotificationsProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export default App;
