import { type ReactElement, useEffect } from "react";
import { Layout } from "@/components/layout";
import {
  AuthProvider,
  UIProvider,
  ListingsProvider,
  FavoritesProvider,
} from "@/contexts";
import { SettingsProvider } from "@/contexts/SettingsContext";
import TokenManager from "@/utils/tokenManager"; // Adjust the path as necessary
import AppRoutes from "./routes/Routes";

const App: () => ReactElement = () => {
  useEffect(() => {
    // Initialize authentication on app start
    TokenManager.initialize().catch(console.error);
  }, []);

  return (
    <UIProvider>
      <AuthProvider>
        <FavoritesProvider>
          <ListingsProvider>
            <SettingsProvider>
              <div className="min-h-screen bg-background-primary text-text-primary dark:bg-background-primary-dark dark:text-text-primary-dark">
                <Layout>
                  <AppRoutes />
                </Layout>
              </div>
            </SettingsProvider>
          </ListingsProvider>
        </FavoritesProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export default App;
