// Export hooks and providers
export { UIProvider, useUI } from "./UIContext";
export { AuthProvider } from "./AuthContext";
export { NotificationsProvider } from "./NotificationsContext";
export { useNotifications } from "@/hooks/useNotifications";
export { FavoritesProvider, useFavorites } from "./FavoritesContext";
export { ListingsProvider, useListings } from "./ListingsContext";
export { MessagesProvider, useMessages } from "./MessagesContext";
export { ReportsProvider } from "./ReportsContext";
export { useReports } from "@/hooks/useReports";

// Combined provider for all contexts
import type { ReactNode } from "react";
import { UIProvider } from "./UIContext";
import { AuthProvider } from "./AuthContext";
import { NotificationsProvider } from "./NotificationsContext";
import { FavoritesProvider } from "./FavoritesContext";
import { ListingsProvider } from "./ListingsContext";
import { MessagesProvider } from "./MessagesContext";
import { ReportsProvider } from "./ReportsContext";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <UIProvider>
      <AuthProvider>
        <NotificationsProvider>
          <FavoritesProvider>
            <ListingsProvider>
              <MessagesProvider>
                <ReportsProvider>{children}</ReportsProvider>
              </MessagesProvider>
            </ListingsProvider>
          </FavoritesProvider>
        </NotificationsProvider>
      </AuthProvider>
    </UIProvider>
  );
};
