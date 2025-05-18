import { NotificationsAPI } from "@/api/notifications.api";
import { Tooltip } from "@/components/ui";
import { NEW_MESSAGE_ALERT, PRICE_CHANGE } from "@/constants/socketEvents";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/hooks";
import type {
  Notification,
  PriceUpdateNotification,
} from "@/types/notifications";
import { NotificationType } from "@/types/notifications";
import { timeAgo } from "@/utils/dateUtils";
import {
  getNotificationColor,
  formatNotificationMessage,
} from "@/utils/notificationUtils";
import { set } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBell,
  FaEnvelope,
  FaTag,
  FaCheckCircle,
  FaHeart,
  FaPlusCircle,
  FaSearch,
  FaExclamationTriangle,
  FaBullhorn,
  FaInfoCircle,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface NotificationBellProps {
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationBell({
  onNotificationClick,
}: NotificationBellProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { socket, connected, connectionError } = useSocket();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await NotificationsAPI.getNotifications();
      if (response.success && response.data?.items) {
        setNotifications(response.data.items);
      } else if (response.error) {
        console.error("Failed to fetch notifications:", response.error);
        // Simply display a generic error message to avoid type issues
        toast.error("Failed to load notifications");
      }
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error);
      // Provide a more user-friendly error message
      const errorMessage =
        error?.response?.status === 500
          ? "Server error: Unable to load notifications at this time"
          : error?.error || "Failed to load notifications";
      toast.error(errorMessage);
      // Initialize with empty data to prevent UI errors
      setNotifications([]);
    }
  };
  console.log("chatId", location.pathname.split("/")[2]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!isAuthenticated) return;

    try {
      // Mark notification as read
      const response = await NotificationsAPI.markAsRead(notification.id);

      if (response.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n,
          ),
        );

        // Call the onNotificationClick callback if provided
        if (onNotificationClick) {
          onNotificationClick(notification);
        } else {
          // Navigate based on notification type
          switch (notification.type) {
            case NotificationType.NEW_MESSAGE:
              if (notification.targetId) {
                navigate(`/messages/${notification.targetId}`);
              } else {
                navigate("/messages");
              }
              break;
            case NotificationType.PRICE_UPDATE:
            case NotificationType.LISTING_SOLD:
            case NotificationType.LISTING_INTEREST:
            case NotificationType.LISTING_CREATED:
              if (notification.listingId) {
                // Remove 'cma' prefix if it exists
                const listingId = notification.listingId.replace("cma", "");
                // Remove '/public' from the path if it exists
                const path = notification.listingId.includes("/public/")
                  ? notification.listingId.replace("/public/", "/")
                  : notification.listingId;
                navigate(`/listings/${path}`);
              } else {
                navigate("/listings");
              }
              break;
            case NotificationType.NEW_LISTING_MATCH:
              navigate("/listings?match=true");
              break;
            case NotificationType.ACCOUNT_WARNING:
              navigate("/account/settings");
              break;
            case NotificationType.SYSTEM_ANNOUNCEMENT:
            case NotificationType.SYSTEM_NOTICE:
              // Stay on the current page, notification details are already shown
              break;
            default:
              // Default behavior
              break;
          }
        }
      }

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

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    // Only set up socket listeners if socket is available and connected
    if (!socket || !connected) {
      console.log("Socket not yet initialized or not connected, waiting...");
      return;
    }

    // Log connection error if any
    if (connectionError) {
      console.warn("Socket connection error:", connectionError);
      return;
    }

    // Set up the event listener for new message alerts
    const handleNewMessageAlert = async (data: {
      id: string;
      content: string;
      userId: string;
      type: string;
      relatedId: string;
      read: boolean;
      createdAt: string;
    }) => {
      console.log("new message alert received:", data);
      console.log("chatId", location.pathname.split("/")[2]);

      // If user is in the chat related to this notification, delete it
      if (location.pathname.split("/")[2] === data.relatedId) {
        try {
          const result = await NotificationsAPI.deleteNotification(
            data.relatedId,
          );
          console.log("notification deleted result:", result);
          return;
        } catch (error) {
          console.error("Error deleting notification:", error);
          return;
        }
      }

      // Otherwise, create a new notification
      const newNotification: Notification = {
        id: data.relatedId,
        userId: data.userId,
        type: NotificationType.NEW_MESSAGE,
        title: "New Message",
        message: data.content,
        createdAt: data.createdAt,
        read: data.read,
      };

      console.log("Adding new notification:", newNotification);
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleNewMessagePriceChange = (data: PriceUpdateNotification) => {
      console.log("new price change alert received:", data);
      const newNotification: Notification = {
        id: data.id,
        userId: data.userId,
        type: data.type,
        createdAt: data.createdAt.toString(),
        read: data.read,
        title: data.title,
        message: data.content,
        updatedAt: data.createdAt.toString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    };

    // Register the event listener
    socket.on(NEW_MESSAGE_ALERT, handleNewMessageAlert);

    // Fetch notification of favorites listing price is down
    socket.on(PRICE_CHANGE, handleNewMessagePriceChange);

    // Clean up the event listener when component unmounts or socket changes
    return () => {
      socket.off(NEW_MESSAGE_ALERT, handleNewMessageAlert);
      socket.off(PRICE_CHANGE, handleNewMessagePriceChange);
    };
  }, [socket, location.pathname]);

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

  useEffect(() => {
    setUnreadCount(notifications?.filter((n) => !n.read)?.length);
  }, [notifications]);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Tooltip
        content="Notifications"
        position="bottom"
        className="cursor-pointer"
      >
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
              Notifications
            </h3>
            {notifications.length === 0 ? (
              <p className="text-text-muted dark:text-text-muted-dark py-2">
                No notifications
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
                      <div className="flex-shrink-0 mr-2 mt-1">
                        {(() => {
                          // Get the color based on notification type
                          const color = getNotificationColor(notification.type);

                          // Select the appropriate icon based on notification type
                          let Icon;
                          switch (notification.type) {
                            case NotificationType.NEW_MESSAGE:
                              Icon = FaEnvelope;
                              break;
                            case NotificationType.PRICE_UPDATE:
                              Icon = FaTag;
                              break;
                            case NotificationType.LISTING_SOLD:
                              Icon = FaCheckCircle;
                              break;
                            case NotificationType.LISTING_INTEREST:
                              Icon = FaHeart;
                              break;
                            case NotificationType.LISTING_CREATED:
                              Icon = FaPlusCircle;
                              break;
                            case NotificationType.NEW_LISTING_MATCH:
                              Icon = FaSearch;
                              break;
                            case NotificationType.ACCOUNT_WARNING:
                              Icon = FaExclamationTriangle;
                              break;
                            case NotificationType.SYSTEM_ANNOUNCEMENT:
                              Icon = FaBullhorn;
                              break;
                            case NotificationType.SYSTEM_NOTICE:
                              Icon = FaInfoCircle;
                              break;
                            default:
                              Icon = FaBell;
                          }

                          return (
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-${color}-100 dark:bg-${color}-800`}
                            >
                              <Icon
                                className={`w-3 h-3 text-${color}-500 dark:text-${color}-300`}
                              />
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {notification.title ||
                            t(
                              `notification.types.${notification.type.toLowerCase()}`,
                            )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatNotificationMessage(notification).length > 50
                            ? `${formatNotificationMessage(notification).substring(0, 50)}...`
                            : formatNotificationMessage(notification)}
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
                Mark all as read
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
