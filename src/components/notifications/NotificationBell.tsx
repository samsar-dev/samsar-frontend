import { NotificationsAPI } from "@/api/notifications.api";
import { Tooltip } from "@/components/ui";
import { NEW_MESSAGE_ALERT } from "@/constants/socketEvents";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/hooks";
import type { Notification } from "@/types/notifications";
import { timeAgo } from "@/utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaBell } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

interface NotificationBellProps {
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationBell({
  onNotificationClick,
}: NotificationBellProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  console.log("chatId", chatId, location);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await NotificationsAPI.getNotifications();
      if (response.success && response.data?.items) {
        setNotifications(response.data.items);
        setUnreadCount(
          response.data.items.filter((n: Notification) => !n.read).length
        );
        setChatId(location.pathname.split("/")[2]);
      } else if (response.error) {
        console.error("Failed to fetch notifications:", response.error);
        toast.error(response.error);
      }
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error);
      toast.error(error?.error || "Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated, chatId]);

  useEffect(() => {
    if (!socket) {
      console.error("Socket not initialized");
    }
    socket?.on(
      NEW_MESSAGE_ALERT,
      async (data: {
        content: string;
        userId: string;
        relatedId: string;
        read: boolean;
        createdAt: Date;
      }) => {
        console.log("new message alert>>>>>>>>>>>>>", data);
        if (chatId === data.relatedId) {
          try {
            const result = await NotificationsAPI.deleteNotification(
              data.relatedId
            );
            console.log("notification deleted result:", result);
          } catch (error) {
            console.error("Error deleting notification:", error);
            return;
          }
        } else {
          const newNotification: Notification = {
            id: data.relatedId,
            userId: data.userId,
            // user: { id: data.userId },
            type: "message",
            title: "New Message",
            message: data.content,
            createdAt: new Date(data.createdAt).toISOString(),
            // updatedAt: new Date(data.createdAt).toISOString(),
            read: data.read,
          };
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      }
    );
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowNotifications(false);
  }, [location.pathname]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!isAuthenticated) return;

    try {
      if (!notification.read) {
        const response = await NotificationsAPI.markAsRead(notification.id);
        if (response.success) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, read: true } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else if (response.error) {
          toast.error(response.error);
        }
      }

      onNotificationClick?.(notification);
      setShowNotifications(false);
    } catch (error: any) {
      console.error("Failed to mark notification as read:", error);
      toast.error(error?.error || "Failed to update notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await NotificationsAPI.markAllAsRead();
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      } else if (response.error) {
        toast.error(response.error);
      }
    } catch (error: any) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to update notifications");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Tooltip content={t("notifications.title")} position="bottom">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 rounded-lg text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
          aria-label={t("notifications.toggle")}
        >
          <FaBell className="w-5 h-5" />
        </button>
      </Tooltip>
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2 inline-flex items-center justify-center text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2 bg-accent-red dark:bg-accent-red-dark text-blue-500 rounded-full">
          {unreadCount}
        </span>
      )}

      {showNotifications && (
        <div className="absolute right-0 mt-2 max-w-[90vw] sm:w-80 z-[100] overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-border-primary dark:border-border-primary-dark">
          <div className="p-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
              {t("notifications.title")}
            </h3>
            {notifications.length === 0 ? (
              <p className="text-text-muted dark:text-text-muted-dark py-2">
                {t("notifications.empty")}
              </p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-2 hover:bg-background-secondary dark:hover:bg-background-secondary-dark rounded-md cursor-pointer ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {timeAgo(notification.createdAt, "en")}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
              >
                {t("notifications.mark_all_read")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
