import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import type {
  Message,
  Conversation,
  MessageInput,
  ConversationCreateInput,
} from "@/types";
import { messagesAPI } from "@/api";

export interface MessagesContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  unreadMessages: number;
  toggleNotifications: () => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (
    participantIds: string[],
    initialMessage?: string,
  ) => Promise<string>;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
  setCurrentConversation: (conversationId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  deleteConversations: (conversationIds: string[]) => Promise<void>;
}

export const MessagesContext = createContext<MessagesContextType | null>(null);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!auth?.user) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await messagesAPI.getConversations();
        if (response.status === 200 && response.data) {
          setConversations(response.data.data?.items);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [auth?.user]);

  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const response = await messagesAPI.getMessages(conversationId);
      if (response.data) {
        const messages = response.data.items || [];
        setMessages(messages);
        // Update unread messages count
        const unreadCount = messages.filter((msg: Message) => !msg.read).length;
        setUnreadMessages(unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!auth?.user) throw new Error("Must be logged in to send messages");

    try {
      const messageInput: MessageInput = { content };
      const response = await messagesAPI.sendMessage(
        conversationId,
        messageInput,
      );

      if (response.status === 200 && response.data) {
        setMessages((prev) =>
          [...prev, response.data].filter((m): m is Message => m !== null),
        );

        // Update conversation's last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? ({
                  ...conv,
                  lastMessage: response.data,
                  updatedAt: response.data.createdAt,
                } as Conversation)
              : conv,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  const createConversation = async (
    participantIds: string[],
    initialMessage?: string,
  ) => {
    if (!auth?.user)
      throw new Error("Must be logged in to create conversations");

    try {
      const input: ConversationCreateInput = {
        participantIds,
        initialMessage,
      };

      const response = await messagesAPI.createConversation(input);
      if (response.status === 200 && response.data) {
        // Only add non-null conversations
        setConversations((prev) =>
          [...prev, response.data].filter((c): c is Conversation => c !== null),
        );
        return response.data?.id;
      }
      throw new Error("Failed to create conversation");
    } catch (error) {
      console.error("Failed to create conversation:", error);
      throw error;
    }
  };

  const markAsRead = async (conversationId: string, messageId: string) => {
    try {
      await messagesAPI.markAsRead(conversationId, messageId);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, read: true } : message,
        ),
      );

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      throw error;
    }
  };

  const setCurrentConversationById = async (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      await fetchMessages(conversationId);
      if (
        conversation.lastMessage &&
        !conversation.lastMessage.read &&
        conversation.lastMessage.id
      ) {
        await markAsRead(conversationId, conversation.lastMessage.id);
      }
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
    // Update unread messages count when notifications are toggled
    if (notificationsEnabled) {
      setUnreadMessages(0);
    }
  };

  const deleteConversations = useCallback(
    async (conversationIds: string[]) => {
      try {
        // Filter out any undefined or invalid IDs and ensure they are strings
        const validIds = conversationIds.filter(
          (id): id is string => Boolean(id) && typeof id === "string",
        );

        if (validIds.length === 0) return;

        // Optimistically update the UI
        setConversations((prev) =>
          prev.filter((conv) => conv && conv.id && !validIds.includes(conv.id)),
        );

        // If current conversation is being deleted, clear it
        if (
          currentConversation?.id &&
          validIds.includes(currentConversation.id)
        ) {
          setCurrentConversation(null);
          setMessages([]);
        }

        // Delete each conversation directly using the deleteConversation endpoint
        await Promise.all(
          validIds.map(async (id) => {
            try {
              await messagesAPI.deleteConversation(id);
            } catch (error: unknown) {
              console.error(`Failed to delete conversation ${id}:`, error);
              // Continue with other deletions even if one fails
              return null;
            }
          }),
        );

        // Re-fetch conversations to ensure consistency
        const response = await messagesAPI.getConversations();
        if (response.data?.data?.items) {
          setConversations(response.data.data.items);
        }
      } catch (error) {
        console.error("Failed to delete conversations:", error);
        // Re-fetch conversations to revert optimistic update
        const response = await messagesAPI.getConversations();
        if (response.data?.data?.items) {
          setConversations(response.data.data.items);
        }
        throw error;
      }
    },
    [currentConversation],
  );

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        isLoading,
        unreadMessages,
        toggleNotifications,
        sendMessage,
        createConversation,
        markAsRead,
        setCurrentConversation: setCurrentConversationById,
        fetchMessages,
        deleteConversations,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useContextMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};
