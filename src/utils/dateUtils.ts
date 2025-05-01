import { formatDistanceToNow, format } from "date-fns";
import { enUS, arSA } from "date-fns/locale";

/**
 * Get relative time string (e.g., "Just now", "1 hour ago", "Yesterday")
 * @param date - Date to format
 * @param locale - Optional locale (default: enUS)
 * @returns Relative time string
 */
export const timeAgo = (
  date: Date | string | number,
  locale: "en" | "ar" = "en",
): string => {
  const dateObj = new Date(date);
  const now = new Date();

  // Handle dates in the future
  if (dateObj > now) {
    return format(dateObj, "PPP", { locale: locale === "en" ? enUS : arSA });
  }

  const minutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return format(dateObj, "PPP", { locale: locale === "en" ? enUS : arSA });
};

/**
 * Get formatted date string (e.g., "May 1, 2025")
 * @param date - Date to format
 * @param locale - Optional locale (default: enUS)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  locale: "en" | "ar" = "en",
): string => {
  return format(new Date(date), "MMMM d, yyyy", {
    locale: locale === "en" ? enUS : arSA,
  });
};

export default {
  timeAgo,
  formatDate,
};
