import { useContext } from "react";
import type { NotificationsContextType } from "@/contexts/NotificationsContext";
import { NotificationsContext } from "@/contexts/NotificationsContext";

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
};
