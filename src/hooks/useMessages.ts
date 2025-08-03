import { useState, useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { MessagesAPI } from "@/api/messaging.api";
import type {
  Message,
  Conversation,
  ConversationResponse,
} from "@/types/messaging";

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
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setSelectedConversation: Dispatch<SetStateAction<Conversation | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

// Convert ConversationResponse data to Conversation
const convertToConversation = (
  response: ConversationResponse,
): Conversation => ({
  ...response,
  id: response._id || response.id || "",
  _id: response._id || response.id || "",
});

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await MessagesAPI.getConversations({
        page: 1,
        limit: 20,
      });
      if (response?.data?.items) {
        const conversationsList = response.data.items.map(
          convertToConversation,
        );
        setConversations(conversationsList);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      try {
        setIsLoading(true);
        const response = await MessagesAPI.sendMessage({
          conversationId,
          content,
        } as any); // Temporary cast until we fix the type

        if (response?.data) {
          setMessages((prev) => [...prev, response.data]);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const createConversation = useCallback(
    async (participantIds: string[], _initialMessage?: string) => {
      try {
        setIsLoading(true);
        const response = await MessagesAPI.createConversation({
          participantIds,
        });

        if (response?.data) {
          const newConversation = convertToConversation(response.data);
          setConversations((prev) => [newConversation, ...prev]);
          return newConversation.id || newConversation._id || "";
        }

        throw new Error("Failed to create conversation");
      } catch (error) {
        console.error("Failed to create conversation:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const markAsRead = useCallback(
    async (conversationId: string, messageId: string) => {
      try {
        // Implementation for marking a message as read
        // This would typically be an API call to update the message status
        console.log(
          `Marking message ${messageId} in conversation ${conversationId} as read`,
        );
        // Example API call (uncomment when implemented):
        // await MessagesAPI.updateMessageStatus(conversationId, messageId, 'read');
      } catch (error) {
        console.error("Failed to mark message as read:", error);
        throw error;
      }
    },
    [],
  );

  // Initialize conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    messages,
    conversations,
    selectedConversation,
    isLoading,
    sendMessage,
    createConversation,
    selectConversation,
    markAsRead,
    setMessages,
    setConversations,
    setSelectedConversation,
    setIsLoading,
  };
}
