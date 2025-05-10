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
import { type ReactElement, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MessagesProvider } from "./contexts/MessagesContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import Routes from "./routes/Routes";
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
    <AuthProvider>
      <SocketProvider>
        <UIProvider>
          <SettingsProvider>
            <FavoritesProvider>
              <ListingsProvider>
                <MessagesProvider>
                  <SavedListingsProvider>
                    <NotificationsProvider>
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
                    </NotificationsProvider>
                  </SavedListingsProvider>
                </MessagesProvider>
              </ListingsProvider>
            </FavoritesProvider>
          </SettingsProvider>
        </UIProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
