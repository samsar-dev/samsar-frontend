import { APIResponse, PaginatedData } from "./api";

export type NotificationType = "message" | "listing" | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  listingId?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
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
