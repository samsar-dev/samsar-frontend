import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/contexts/SocketContext";
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
  socket: any; // TODO: Import proper Socket type from your socket client
  toggleNotifications: () => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (
    participantIds: string[],
    initialMessage?: string,
  ) => Promise<string>;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversationId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
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
  const { socket, connected } = useSocket();

  // Delete an entire conversation
  const deleteConversation = async (conversationId: string): Promise<void> => {
    try {
      await messagesAPI.deleteConversation(conversationId);
      
      // Update the UI state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      
      console.log('Successfully deleted conversation:', conversationId);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  };

  // Handle real-time message events
  useEffect(() => {
    if (!socket || !connected) return;

    // Handle new message received
    const handleNewMessage = (newMessage: Message) => {
      setMessages(prevMessages => {
        // Don't add if message already exists
        if (prevMessages.some(msg => msg.id === newMessage.id)) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });

      // Update last message in conversations list
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === newMessage.conversationId) {
            return {
              ...conv,
              lastMessage: newMessage,
              updatedAt: new Date().toISOString()
            };
          }
          return conv;
        }).sort((a, b) => {
          // Sort by most recent message
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });
    };

    // Handle new conversation
    const handleNewConversation = (conversation: Conversation) => {
      setConversations(prev => {
        // Don't add if conversation already exists
        if (prev.some(conv => conv.id === conversation.id)) {
          return prev;
        }
        return [conversation, ...prev];
      });
    };

    // Subscribe to socket events
    socket.on('newMessage', handleNewMessage);
    socket.on('newConversation', handleNewConversation);
    socket.on('messageRead', handleMessageRead);

    // Cleanup
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('newConversation', handleNewConversation);
      socket.off('messageRead', handleMessageRead);
    };
  }, [socket, connected]);

  // Handle message read updates
  const handleMessageRead = (data: { conversationId: string, messageId: string }) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === data.messageId ? { ...msg, read: true } : msg
      )
    );
  };

  // Fetch conversations on mount and when user changes
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
          const sortedConversations = response.data.data?.items?.sort((a: Conversation, b: Conversation) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }) || [];
          setConversations(sortedConversations);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [auth?.user]);

  const sendMessage = async (conversationId: string, content: string) => {
    if (!auth?.user) throw new Error("Must be logged in to send messages");

    try {
      const messageInput = { content };
      const response = await messagesAPI.sendMessage(conversationId, messageInput);
      
      if (response.status === 200 && response.data) {
        const newMessage = response.data;
        
        // Update messages list
        setMessages((prev) =>
          [...prev, newMessage].filter((m): m is Message => m !== null)
        );

        // Update conversation's last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? ({
                  ...conv,
                  lastMessage: newMessage,
                  updatedAt: newMessage.createdAt,
                } as Conversation)
              : conv
          )
        );
        
        return newMessage;
      }
      
      throw new Error("Failed to send message");
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

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
      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg,
        ),
      );
      // Update unread count
      setUnreadMessages((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const deleteMessage = async (conversationId: string, messageId: string) => {
    try {
      await messagesAPI.deleteMessage(conversationId, messageId);
      // Update local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      // If current conversation has this message, update last message
      if (currentConversation?.lastMessage?.id === messageId) {
        const updatedConversations = conversations.map((conv) => {
          if (conv.id === conversationId) {
            const otherMessages = messages.filter((msg) => msg.id !== messageId);
            return {
              ...conv,
              lastMessage: otherMessages[otherMessages.length - 1] || null,
            };
          }
          return conv;
        });
        setConversations(updatedConversations);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
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

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        isLoading,
        unreadMessages,
        socket,
        toggleNotifications,
        sendMessage,
        createConversation,
        markAsRead,
        deleteMessage,
        deleteConversation,
        setCurrentConversation: setCurrentConversationById,
        fetchMessages,
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
