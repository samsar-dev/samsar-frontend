import { NotificationType, Notification } from "@/types/notifications";

/**
 * Get the appropriate icon color for a notification based on its type
 */
export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.NEW_MESSAGE:
      return "blue";
    case NotificationType.PRICE_UPDATE:
      return "green";
    case NotificationType.LISTING_SOLD:
      return "orange";
    case NotificationType.LISTING_INTEREST:
      return "indigo";
    case NotificationType.NEW_LISTING_MATCH:
      return "purple";
    case NotificationType.ACCOUNT_WARNING:
      return "red";
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return "yellow";
    case NotificationType.SYSTEM_NOTICE:
      return "gray";
    default:
      return "gray";
  }
};

/**
 * Get the appropriate action for a notification based on its type
 */
export const getNotificationAction = (notification: Notification): { path: string; query?: Record<string, string> } => {
  switch (notification.type) {
    case NotificationType.NEW_MESSAGE:
      return { path: `/messages/${notification.targetId}` };
    case NotificationType.PRICE_UPDATE:
    case NotificationType.LISTING_SOLD:
    case NotificationType.LISTING_INTEREST:
    case NotificationType.LISTING_CREATED:
      return { path: `/listings/${notification.listingId}` };
    case NotificationType.NEW_LISTING_MATCH:
      return { path: `/listings`, query: { match: notification.targetId || "" } };
    case NotificationType.ACCOUNT_WARNING:
      return { path: `/account/settings` };
    case NotificationType.SYSTEM_ANNOUNCEMENT:
    case NotificationType.SYSTEM_NOTICE:
      return { path: `/notifications` };
    default:
      return { path: `/notifications` };
  }
};

/**
 * Get the appropriate icon name for a notification based on its type
 */
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.NEW_MESSAGE:
      return "message";
    case NotificationType.PRICE_UPDATE:
      return "tag";
    case NotificationType.LISTING_SOLD:
      return "check-circle";
    case NotificationType.LISTING_INTEREST:
      return "heart";
    case NotificationType.LISTING_CREATED:
      return "plus-circle";
    case NotificationType.NEW_LISTING_MATCH:
      return "search";
    case NotificationType.ACCOUNT_WARNING:
      return "exclamation";
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return "megaphone";
    case NotificationType.SYSTEM_NOTICE:
      return "info";
    default:
      return "bell";
  }
};

/**
 * Format a notification message with appropriate context
 */
export const formatNotificationMessage = (notification: Notification): string => {
  // If the notification already has a formatted message, use it
  if (notification.message) {
    return notification.message;
  }
  
  // Otherwise, generate a generic message based on the notification type
  switch (notification.type) {
    case NotificationType.NEW_MESSAGE:
      return "You have received a new message";
    case NotificationType.PRICE_UPDATE:
      return "The price of a listing you're interested in has been updated";
    case NotificationType.LISTING_SOLD:
      return "A listing you were interested in has been sold";
    case NotificationType.LISTING_INTEREST:
      return "Someone is interested in your listing";
    case NotificationType.LISTING_CREATED:
      return "A new listing has been created";
    case NotificationType.NEW_LISTING_MATCH:
      return "A new listing matches your saved search criteria";
    case NotificationType.ACCOUNT_WARNING:
      return "There's an important notice about your account";
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return "There's a new system announcement";
    case NotificationType.SYSTEM_NOTICE:
      return "There's a new system notice";
    default:
      return "You have a new notification";
  }
};
