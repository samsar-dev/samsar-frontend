import React, { createContext, useContext, useState, useCallback } from "react";
import { NotificationsAPI } from "@/api/notifications.api";
import type { Notification, NotificationFilters } from "@/types/notifications";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";

export interface NotificationsContextType {
   notifications: Notification[];
   loading: boolean;
   error: string | null;
   hasMore: boolean;
   currentPage: number;
   fetchNotifications: (params?: NotificationFilters) => Promise<void>;
   markAsRead: (notificationId: string) => Promise<void>;
   markAllAsRead: () => Promise<void>;
   deleteNotification: (notificationId: string) => Promise<void>;
   clearAllNotifications: () => Promise<void>;
}

export const NotificationsContext =
   createContext<NotificationsContextType | null>(null);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
   children,
}) => {
   const [notifications, setNotifications] = useState<Notification[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [hasMore, setHasMore] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);

   const { isAuthenticated } = useAuth();

   const fetchNotifications = useCallback(
      async (params?: NotificationFilters) => {
         if (!isAuthenticated) {
            setNotifications([]);
            setHasMore(false);
            return;
         }

         try {
            setLoading(true);
            setError(null);

            const page = params?.page || currentPage;
            const response = await NotificationsAPI.getNotifications({
               page,
               limit: params?.limit || 20,
               type: params?.type,
            });

            if (page === 1) {
               setNotifications(response.data.items);
            } else {
               setNotifications((prev) => [...prev, ...response.data.items]);
            }

            setHasMore(response.data.hasMore);
            setCurrentPage(response.data.page);
         } catch (err) {
            setError(
               err instanceof Error
                  ? err.message
                  : "Failed to fetch notifications"
            );
            toast({
               title: "Error",
               description: "Failed to fetch notifications",
               variant: "destructive",
            });
         } finally {
            setLoading(false);
         }
      },
      [isAuthenticated, currentPage]
   );

   const markAsRead = useCallback(async (notificationId: string) => {
      try {
         await NotificationsAPI.markAsRead(notificationId);
         setNotifications((prev) =>
            prev.map((notification) =>
               notification.id === notificationId
                  ? { ...notification, read: true }
                  : notification
            )
         );
      } catch (err) {
         toast({
            title: "Error",
            description: "Failed to mark notification as read",
            variant: "destructive",
         });
         throw err;
      }
   }, []);

   const markAllAsRead = useCallback(async () => {
      try {
         await NotificationsAPI.markAllAsRead();
         setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, read: true }))
         );
      } catch (err) {
         toast({
            title: "Error",
            description: "Failed to mark all notifications as read",
            variant: "destructive",
         });
         throw err;
      }
   }, []);

   const deleteNotification = useCallback(async (notificationId: string) => {
      try {
         await NotificationsAPI.deleteNotification(notificationId);
         setNotifications((prev) =>
            prev.filter((notification) => notification.id !== notificationId)
         );
      } catch (err) {
         toast({
            title: "Error",
            description: "Failed to delete notification",
            variant: "destructive",
         });
         throw err;
      }
   }, []);

   const clearAllNotifications = useCallback(async () => {
      try {
         await NotificationsAPI.clearAll();
         setNotifications([]);
         setHasMore(false);
         setCurrentPage(1);
      } catch (err) {
         toast({
            title: "Error",
            description: "Failed to clear notifications",
            variant: "destructive",
         });
         throw err;
      }
   }, []);

   return (
      <NotificationsContext.Provider
         value={{
            notifications,
            loading,
            error,
            hasMore,
            currentPage,
            fetchNotifications,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAllNotifications,
         }}
      >
         {children}
      </NotificationsContext.Provider>
   );
};

export const useNotifications = () => {
   const context = useContext(NotificationsContext);
   if (!context) {
      throw new Error(
         "useNotifications must be used within a NotificationsProvider"
      );
   }
   return context;
};
