// Lightweight date utilities - eliminates heavy date-fns dependency

/**
 * Get relative time string (e.g., "Just now", "1 hour ago", "Yesterday")
 * @param date - Date to format
 * @param locale - Optional locale (default: en)
 * @returns Relative time string
 */
export const timeAgo = (
  date: Date | string | number,
  locale: "en" | "ar" = "en",
): string => {
  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  // Handle future dates
  if (diffMs < 0) {
    return formatDate(dateObj, locale);
  }

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Use simple relative strings to avoid heavy dependencies
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return formatDate(dateObj, locale);
};

/**
 * Get formatted date string (e.g., "May 1, 2025")
 * @param date - Date to format
 * @param locale - Optional locale (default: en)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  locale: "en" | "ar" = "en",
): string => {
  const dateObj = new Date(date);
  
  // Use native Intl.DateTimeFormat for better performance and smaller bundle
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
};

/**
 * Get simple date string (e.g., "05/01/2025")
 * @param date - Date to format
 * @returns Simple date string
 */
export const formatSimpleDate = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString();
};

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date | string | number): boolean => {
  const dateObj = new Date(date);
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

export default {
  timeAgo,
  formatDate,
  formatSimpleDate,
  isToday,
};
