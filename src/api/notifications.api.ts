import apiClient from "./apiClient";
import type { APIResponse, PaginatedData } from "@/types";

import type {
  Notification,
  NotificationCreateInput,
  NotificationUpdateInput,
} from "@/types/notifications";

const BASE_URL = "/notifications";

export const NotificationsAPI = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<APIResponse<PaginatedData<Notification>>> {
    try {
      // Use a try-catch block to handle potential API errors
      try {
        const response = await apiClient.get<
          APIResponse<{
            items: Notification[];
            pagination: {
              page: number;
              limit: number;
              total: number;
              pages: number;
            };
          }>
        >(BASE_URL, { params });

        // Debug the response
        console.log("Notifications API response:", response.data);

        const data = response.data;

        if (data.data) {
          // Check if the data structure is as expected
          if (data.data.items && data.data.pagination) {
            // Response has the expected structure
            return {
              success: true,
              data: {
                items: data.data.items,
                page: data.data.pagination.page,
                limit: data.data.pagination.limit,
                total: data.data.pagination.total,
                hasMore: data.data.pagination.total > data.data.pagination.limit,
              },
            };
          } else if (Array.isArray(data.data)) {
            // If the backend accidentally returns a raw array (fallback)
            console.log("Converting array response to expected format");
            return {
              success: true,
              data: {
                items: Array.isArray(data.data) ? data.data : [],
                page: 1,
                limit: 10,
                total: Array.isArray(data.data) ? data.data.length : 0,
                hasMore: false,
              },
            };
          }
        }

        // Default fallback if data structure doesn't match expectations
        console.warn("Unexpected or empty notifications data structure");
        return {
          success: true,
          data: {
            items: [],
            page: 1,
            limit: 10,
            total: 0,
            hasMore: false,
          },
        };
      } catch (apiError: any) {
        // Handle specific API errors
        console.error("API error fetching notifications:", apiError);
        
        // If we get a 500 error, it might be due to backend issues
        // Return an empty successful response instead of throwing
        if (apiError?.response?.status === 500) {
          console.warn("Returning empty notifications due to server error");
          return {
            success: true,
            data: {
              items: [],
              page: 1,
              limit: 10,
              total: 0,
              hasMore: false,
            },
          };
        }
        
        // For other errors, rethrow to be handled by the outer catch
        throw apiError;
      }
    } catch (error) {
      console.error("Error in getNotifications:", error);
      // Return a structured error response instead of throwing
      // Return a structured error response with the correct type
      return {
        success: false,
        error: "Failed to fetch notifications", // Using string type for error as required by APIResponse
        data: {
          items: [],
          page: 1,
          limit: 10,
          total: 0,
          hasMore: false,
        },
      };
    }
  },

  async getNotification(id: string): Promise<APIResponse<Notification>> {
    try {
      const response = await apiClient.get<APIResponse<Notification>>(
        `${BASE_URL}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notification:", error);
      throw error;
    }
  },

  async createNotification(
    input: NotificationCreateInput
  ): Promise<APIResponse<Notification>> {
    try {
      const response = await apiClient.post<APIResponse<Notification>>(
        BASE_URL,
        input
      );
      return response.data;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  async updateNotification(
    id: string,
    input: NotificationUpdateInput
  ): Promise<APIResponse<Notification>> {
    try {
      const response = await apiClient.put<APIResponse<Notification>>(
        `${BASE_URL}/${id}`,
        input
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
        `${BASE_URL}/${id}/read`
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
        `${BASE_URL}/read-all`
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
        `${BASE_URL}/${id}`
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
