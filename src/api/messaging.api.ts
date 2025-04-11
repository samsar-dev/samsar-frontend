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

  static async getMessages(
    conversationId: string,
    params?: PaginationParams,
  ): Promise<APIResponse<PaginatedData<Message>>> {
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
    const response = await apiClient.post(
      this.BASE_PATH,
      messageData,
    );
    return response.data;
  }

  static async deleteMessage(
    messageId: string,
  ): Promise<APIResponse<void>> {
    const response = await apiClient.delete(
      `${this.BASE_PATH}/${messageId}`,
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
