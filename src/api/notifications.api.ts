import apiClient from "./apiClient";
import type {
  APIResponse,
  Notification,
  NotificationCreateInput,
  NotificationUpdateInput,
  PaginatedData,
} from "@/types";

const BASE_URL = "/notifications";

export const NotificationsAPI = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<APIResponse<PaginatedData<Notification>>> {
    try {
      const response = await apiClient.get<
        APIResponse<PaginatedData<Notification>>
      >(BASE_URL, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  async getNotification(id: string): Promise<APIResponse<Notification>> {
    try {
      const response = await apiClient.get<APIResponse<Notification>>(
        `${BASE_URL}/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notification:", error);
      throw error;
    }
  },

  async createNotification(
    input: NotificationCreateInput,
  ): Promise<APIResponse<Notification>> {
    try {
      const response = await apiClient.post<APIResponse<Notification>>(
        BASE_URL,
        input,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  async updateNotification(
    id: string,
    input: NotificationUpdateInput,
  ): Promise<APIResponse<Notification>> {
    try {
      const response = await apiClient.put<APIResponse<Notification>>(
        `${BASE_URL}/${id}`,
        input,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating notification:", error);
      throw error;
    }
  },

  async markAsRead(id: string): Promise<APIResponse<Notification>> {
    try {
      const response = await apiClient.put<APIResponse<Notification>>(
        `${BASE_URL}/${id}/read`,
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  async markAllAsRead(): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.put<APIResponse<void>>(
        `${BASE_URL}/read-all`,
      );
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  async deleteNotification(id: string): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.delete<APIResponse<void>>(
        `${BASE_URL}/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  async clearAll(): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.delete<APIResponse<void>>(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      throw error;
    }
  },
};
