import type { Notification } from "@/types/notifications";
import { NotificationType } from "@/types/notifications";

// Color mapping for notifications - optimized for bundle size
const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  [NotificationType.NEW_MESSAGE]: "blue",
  [NotificationType.PRICE_UPDATE]: "green",
  [NotificationType.LISTING_SOLD]: "orange",
  [NotificationType.LISTING_INTEREST]: "indigo",
  [NotificationType.NEW_LISTING_MATCH]: "purple",
  [NotificationType.ACCOUNT_WARNING]: "red",
  [NotificationType.SYSTEM_ANNOUNCEMENT]: "yellow",
  [NotificationType.SYSTEM_NOTICE]: "gray",
  [NotificationType.LISTING_CREATED]: "green",
};

/**
 * Get the appropriate icon color for a notification based on its type
 */
export const getNotificationColor = (type: NotificationType): string =>
  NOTIFICATION_COLORS[type] || "gray";

// Lookup tables for better bundle size and performance
const NOTIFICATION_ACTIONS: Record<
  NotificationType,
  (notification: Notification) => {
    path: string;
    query?: Record<string, string>;
  }
> = {
  [NotificationType.NEW_MESSAGE]: (notification) => ({
    path: `/messages/${notification.targetId}`,
  }),
  [NotificationType.PRICE_UPDATE]: (notification) => ({
    path: `/listings/${notification.listingId}`,
  }),
  [NotificationType.LISTING_SOLD]: (notification) => ({
    path: `/listings/${notification.listingId}`,
  }),
  [NotificationType.LISTING_INTEREST]: (notification) => ({
    path: `/listings/${notification.listingId}`,
  }),
  [NotificationType.LISTING_CREATED]: (notification) => ({
    path: `/listings/${notification.listingId}`,
  }),
  [NotificationType.NEW_LISTING_MATCH]: (notification) => ({
    path: `/listings`,
    query: { match: notification.targetId || "" },
  }),
  [NotificationType.ACCOUNT_WARNING]: () => ({ path: `/account/settings` }),
  [NotificationType.SYSTEM_ANNOUNCEMENT]: () => ({ path: `/notifications` }),
  [NotificationType.SYSTEM_NOTICE]: () => ({ path: `/notifications` }),
};

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  [NotificationType.NEW_MESSAGE]: "message",
  [NotificationType.PRICE_UPDATE]: "price-tag",
  [NotificationType.LISTING_SOLD]: "sold",
  [NotificationType.LISTING_INTEREST]: "heart",
  [NotificationType.LISTING_CREATED]: "plus",
  [NotificationType.NEW_LISTING_MATCH]: "match",
  [NotificationType.ACCOUNT_WARNING]: "warning",
  [NotificationType.SYSTEM_ANNOUNCEMENT]: "announcement",
  [NotificationType.SYSTEM_NOTICE]: "info",
};

/**
 * Get the appropriate action for a notification based on its type
 */
export const getNotificationAction = (
  notification: Notification,
): { path: string; query?: Record<string, string> } => {
  const action = NOTIFICATION_ACTIONS[notification.type];
  return action ? action(notification) : { path: "/notifications" };
};

/**
 * Get the appropriate icon name for a notification based on its type
 */
export const getNotificationIcon = (type: NotificationType): string =>
  NOTIFICATION_ICONS[type] || "info";

/**
 * Format a notification message with appropriate context
 */
export const formatNotificationMessage = (
  notification: Notification,
): string => {
  // Use notification message if provided, otherwise use type-based template
  if (notification.message) {
    return notification.message;
  }

  const baseMessages: Record<NotificationType, string> = {
    [NotificationType.NEW_MESSAGE]: "You have received a new message",
    [NotificationType.PRICE_UPDATE]:
      "The price of a listing you're interested in has been updated",
    [NotificationType.LISTING_SOLD]:
      "A listing you were interested in has been sold",
    [NotificationType.LISTING_INTEREST]:
      "Someone is interested in your listing",
    [NotificationType.LISTING_CREATED]: "A new listing has been created",
    [NotificationType.NEW_LISTING_MATCH]:
      "A new listing matches your saved search criteria",
    [NotificationType.ACCOUNT_WARNING]:
      "There's an important notice about your account",
    [NotificationType.SYSTEM_ANNOUNCEMENT]: "There's a new system announcement",
    [NotificationType.SYSTEM_NOTICE]: "There's a new system notice",
  };

  return baseMessages[notification.type] || "New notification";
};
