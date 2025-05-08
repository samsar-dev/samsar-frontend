import { APIResponse, PaginatedData } from "./api";
import { User } from "./user";

// Match backend enum values for consistent type handling
export enum NotificationType {
  NEW_MESSAGE = "NEW_MESSAGE",
  LISTING_INTEREST = "LISTING_INTEREST",
  PRICE_UPDATE = "PRICE_UPDATE",
  LISTING_SOLD = "LISTING_SOLD",
  SYSTEM_NOTICE = "SYSTEM_NOTICE",
  LISTING_CREATED = "LISTING_CREATED",
  NEW_LISTING_MATCH = "NEW_LISTING_MATCH",
  ACCOUNT_WARNING = "ACCOUNT_WARNING",
  SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
}

export interface Notification {
  id: string;
  userId: string;
  user?: User;
  type: NotificationType;
  title: string;
  message: string;
  listingId?: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  targetId?: string;
  targetType?: string;
}

export interface NotificationCreateInput {
  type: NotificationType;
  title: string;
  message: string;
  targetId?: string;
  targetType?: string;
}

export interface NotificationUpdateInput {
  read?: boolean;
  title?: string;
  message?: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: NotificationType;
  read?: boolean;
}

export interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  className?: string;
}

export interface NotificationResponse extends APIResponse<Notification> {}

export interface NotificationsResponse
  extends APIResponse<PaginatedData<Notification>> {}
