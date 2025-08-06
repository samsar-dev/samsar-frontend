import apiClient from "./apiClient";
import type { APIResponse } from "@/types/api";
import type {
  Message,
  ConversationCreateInput,
  ConversationResponse,
  ListingMessageInput,
} from "@/types/messaging";
import type { PaginationParams, PaginatedData } from "@/types/common";

export class MessagesAPI {
  private static readonly BASE_PATH = "/messages";
  private static readonly CONVERSATIONS_PATH = "/messages/conversations";

  static async getConversations(
    params?: PaginationParams,
  ): Promise<APIResponse<PaginatedData<ConversationResponse>>> {
    const response = await apiClient.get(this.CONVERSATIONS_PATH, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    });
    return response.data;
  }

  static async getMessages(
    conversationId: string,
    params?: PaginationParams,
  ): Promise<{
    success: boolean;
    messages?: Message[];
    data?: PaginatedData<Message>;
    error?: string;
  }> {
    const response = await apiClient.get(
      `${this.BASE_PATH}/${conversationId}`,
      {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
        },
      },
    );
    return response.data;
  }

  static async sendMessage(
    messageData: ListingMessageInput,
  ): Promise<APIResponse<Message>> {
    const response = await apiClient.post(this.BASE_PATH, messageData);
    return response.data;
  }

  static async deleteMessage(messageId: string): Promise<APIResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_PATH}/${messageId}`);
    return response.data;
  }

  static async deleteConversation(
    conversationId: string,
  ): Promise<APIResponse<void>> {
    const response = await apiClient.delete(
      `${this.CONVERSATIONS_PATH}/${conversationId}`,
    );
    return response.data;
  }

  static async createConversation(
    data: ConversationCreateInput,
  ): Promise<APIResponse<ConversationResponse>> {
    const response = await apiClient.post(this.CONVERSATIONS_PATH, data);
    return response.data;
  }
}

// Legacy procedural API wrapper for compatibility with existing imports

export const messagesAPI = {
  getConversations: () => apiClient.get("/messages/conversations"),
  getConversation: (id: string) =>
    apiClient.get(`/messages/conversations/${id}`),
  getMessages: (conversationId: string) =>
    apiClient.get(`/messages/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, input: { content: string }) =>
    apiClient.post(`/messages/conversations/${conversationId}/messages`, input),
  createConversation: (input: {
    participantIds: string[];
    initialMessage?: string;
  }) => apiClient.post("/messages/conversations", input),
  markAsRead: (conversationId: string, messageId: string) =>
    apiClient.put(
      `/messages/conversations/${conversationId}/messages/${messageId}/read`,
    ),
  deleteMessage: (conversationId: string, messageId: string) =>
    apiClient.delete(
      `/messages/conversations/${conversationId}/messages/${messageId}`,
    ),
  deleteConversation: (conversationId: string) =>
    apiClient.delete(`/messages/conversations/${conversationId}`),
};
