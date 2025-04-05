import apiClient from "./apiClient";
import type {
  APIResponse,
  Message,
  ConversationCreateInput,
  ConversationResponse,
} from "@/types";
import type { ListingMessageInput } from "@/types/messaging";
import type { PaginationParams, PaginatedData } from "@/types/common";

export class MessagesAPI {
  private static readonly BASE_PATH = "/messages";
  private static readonly CONVERSATIONS_PATH = "/conversations";
  private static readonly LISTING_MESSAGES_PATH = "/listings/messages";

  static async getMessages(
    conversationId: string,
    params?: PaginationParams,
  ): Promise<APIResponse<PaginatedData<Message>>> {
    const response = await apiClient.get(
      `${this.BASE_PATH}/${conversationId}/messages`,
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
    const response = await apiClient.post(
      this.LISTING_MESSAGES_PATH,
      messageData,
    );
    return response.data;
  }

  static async deleteMessage(
    conversationId: string,
    messageId: string,
  ): Promise<APIResponse<void>> {
    const response = await apiClient.delete(
      `${this.BASE_PATH}/${conversationId}/messages/${messageId}`,
    );
    return response.data;
  }

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

  static async createConversation(
    data: ConversationCreateInput,
  ): Promise<APIResponse<ConversationResponse>> {
    const response = await apiClient.post(this.CONVERSATIONS_PATH, data);
    return response.data;
  }

  static async markAsRead(
    conversationId: string,
    messageId: string,
  ): Promise<APIResponse<void>> {
    const response = await apiClient.put(
      `${this.BASE_PATH}/${conversationId}/messages/${messageId}/read`,
    );
    return response.data;
  }
}
