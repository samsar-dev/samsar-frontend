import { useState, useCallback } from "react";
import { MessagesAPI } from "@/api/messaging.api";
import type {
  Message,
  Conversation,
  ConversationCreateInput,
  ConversationResponse,
} from "@/types";

interface UseMessagesReturn {
  messages: Message[];
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (
    participantIds: string[],
    initialMessage?: string,
  ) => Promise<string>;
  selectConversation: (conversation: Conversation) => void;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
}

// Convert ConversationResponse data to Conversation
const convertToConversation = (
  response: ConversationResponse,
): Conversation | null => {
  if (!response.data) return null;
  return {
    _id: response.data._id,
    participants: response.data.participants,
    lastMessage: response.data.lastMessage,
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
  };
};

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      try {
        const response = await MessagesAPI.sendMessage(conversationId, {
          content,
        });
        if (response.success && response.data) {
          setMessages((prev) => [...prev, response.data]);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    },
    [],
  );

  const createConversation = useCallback(
    async (
      participantIds: string[],
      initialMessage?: string,
    ): Promise<string> => {
      try {
        const input: ConversationCreateInput = {
          participantIds,
          initialMessage,
        };

        const response = await MessagesAPI.createConversation(input);
        const newConversation = convertToConversation(response);

        if (newConversation) {
          setConversations((prev) => [...prev, newConversation]);
          return newConversation._id;
        }
        throw new Error("Failed to create conversation");
      } catch (error) {
        console.error("Failed to create conversation:", error);
        throw error;
      }
    },
    [],
  );

  const markAsRead = useCallback(
    async (conversationId: string, messageId: string) => {
      try {
        await MessagesAPI.markAsRead(conversationId, messageId);
      } catch (error) {
        console.error("Failed to mark message as read:", error);
        throw error;
      }
    },
    [],
  );

  return {
    messages,
    conversations,
    selectedConversation,
    isLoading,
    sendMessage,
    createConversation,
    selectConversation,
    markAsRead,
  };
}
