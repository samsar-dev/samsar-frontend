import { type ReactElement, useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import {
  AuthProvider,
  UIProvider,
  ListingsProvider,
  FavoritesProvider,
} from "@/contexts";
import { SettingsProvider } from "@/contexts/SettingsContext";
import TokenManager from "@/utils/tokenManager";
import { setupAuthDebugger } from "@/utils/authDebug";
import AppRoutes from "./routes/Routes";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  return (
    <UIProvider>
      <AuthProvider>
        <NotificationsProvider>
          <FavoritesProvider>
            <ListingsProvider>
              <SettingsProvider>
                <SavedListingsProvider>
                  <div className="min-h-screen bg-background-primary text-text-primary dark:bg-background-primary-dark dark:text-text-primary-dark">
                    <Layout>
                      <AppRoutes />
                      <ToastContainer />
                    </Layout>
                  </div>
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
