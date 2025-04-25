import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { MessagesAPI } from "@/api/messaging.api";
import type {
  Message,
  Conversation,
  ListingMessageInput,
  MessageEvent,
  ErrorEvent,
} from "@/types/messaging";
import type { User } from "@/types";
import { toast } from "react-toastify";


const Messages: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const { on, off } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);

  // Get recipient and listing IDs from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recipient = params.get('recipientId');
    const listing = params.get('listingId');
    if (recipient) setRecipientId(recipient);
    if (listing) setListingId(listing);
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await MessagesAPI.getConversations();
        if (response.success && response.data) {
          let conversations = response.data.items || [];
          // Normalize conversation data and ensure _id is always present
          conversations = conversations.map(conv => {
            // Use the conversation's actual ID from the backend
            const conversationId = conv._id || conv._id;
            // Debug each conversation
            console.log('Processing conversation:', { original: conv, id: conversationId });
            
            return {
              ...conv,
              _id: conversationId // Use the actual ID
            };
          });
          
          console.log('Normalized conversations:', conversations);
          setConversations(conversations);
          
          if (conversations.length > 0) {
            const firstConversation = conversations[0];
            console.log('Setting active conversation:', firstConversation);
            setActiveConversation(firstConversation);
            
            if (firstConversation._id) {
              await loadMessages(firstConversation._id);
            } else {
              console.error('First conversation has no _id:', firstConversation);
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load conversations";
        setError(errorMessage);
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const loadMessages = async (conversationId: string | undefined) => {
    if (!conversationId) {
      console.error('Cannot load messages: conversationId is undefined');
      return;
    }
    
    try {
      console.log('Loading messages for conversation:', conversationId);
      const response = await MessagesAPI.getMessages(conversationId);
      if (response.success && response.data) {
        const messageList = response.data.items || [];
        console.log('Loaded messages:', messageList.length, 'messages');
        if (messageList.length > 0) {
          console.log('First message:', messageList[0]);
        }
        setCurrentMessages(messageList);
      } else {
        console.log('No messages found or API returned unsuccessful response');
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (data: MessageEvent) => {
      if (data.type === "message" && data.payload) {
        const newMessage = data.payload;
        // Add message to current messages if it's part of the active conversation
        if (activeConversation && (
          (newMessage.senderId === user.id && newMessage.recipientId === activeConversation.participants.find(p => p.id !== user.id)?.id) ||
          (newMessage.recipientId === user.id && newMessage.senderId === activeConversation.participants.find(p => p.id !== user.id)?.id)
        )) {
          setCurrentMessages((prev) => [...prev, newMessage]);
          // Update last message in conversations list
          setConversations((prev) =>
            prev.map((conv) =>
              conv._id === activeConversation._id
                ? { ...conv, lastMessage: newMessage }
                : conv
            )
          );
        }
      }
    };

    const handleNewConversation = (data: { type: string; payload: Conversation }) => {
      if (data.type === "new_conversation" && data.payload) {
        const newConversation = data.payload;
        setConversations((prev) => [newConversation, ...prev]);
        // If this is a new conversation and we're waiting for one, activate it
        if (!activeConversation && newConversation.participants.some((p: User) => p.id === recipientId)) {
          setActiveConversation(newConversation);
          loadMessages(newConversation._id);
        }
      }
    };

    on("message", handleNewMessage);
    on("new_conversation", handleNewConversation);

    return () => {
      off("message", handleNewMessage);
      off("new_conversation", handleNewConversation);
    };
  }, [on, off, user, activeConversation?._id, recipientId]);

  useEffect(() => {
    if (!user) return;

    const handleConnect = () => {
      console.log("Connected to socket server");
    };

    const handleDisconnect = () => {
      console.log("Disconnected from socket server");
    };

    const handleError = (data: ErrorEvent) => {
      const errorMessage =
        data.payload instanceof Error ? data.payload.message : data.payload;
      console.error("Socket error:", errorMessage);
      toast.error(errorMessage);
    };

    on("connect", handleConnect);
    on("disconnect", handleDisconnect);
    on("error", handleError);

    return () => {
      off("connect", handleConnect);
      off("disconnect", handleDisconnect);
      off("error", handleError);
    };
  }, [on, off, user]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user || !recipientId) return;

    try {
      // Check if a conversation already exists for this listing
      let existingConversation = null;
      
      if (listingId) {
        // Find an existing conversation for this listing
        existingConversation = conversations.find(conv => 
          conv.listingId === listingId && 
          conv.participants.some(p => p.id === recipientId)
        );
        
        if (existingConversation) {
          console.log('Found existing conversation for this listing:', existingConversation);
          setActiveConversation(existingConversation);
        }
      }

      // Always send message with the right data
      const messageInput: ListingMessageInput = {
        content: content.trim(),
        recipientId: recipientId,
        listingId: listingId || ""
      };

      const response = await MessagesAPI.sendMessage(messageInput);
      if (response.success && response.data) {
        const newMessage = response.data;
        
        // If we don't have an active conversation yet, create one
        if (!activeConversation && !existingConversation) {
          // Create a new conversation
          const response = await MessagesAPI.createConversation({
            participantIds: [user.id, recipientId],
            initialMessage: content.trim()
          });

          if (response.success && response.data) {
            const newConversation = response.data;
            setActiveConversation(newConversation);
            setConversations((prev) => [newConversation, ...prev]);
            setCurrentMessages([newMessage]);
          }
        } else {
          // Add the new message to the current messages
          setCurrentMessages((prev) => [...prev, newMessage]);
          
          // Update the conversation's last message
          const convId = (activeConversation || existingConversation)?.id || 
                        (activeConversation || existingConversation)?._id;
          
          setConversations((prev) =>
            prev.map((conv) =>
              (conv.id === convId || conv._id === convId)
                ? { ...conv, lastMessage: newMessage }
                : conv
            )
          );
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleConversationSelect = async (conversation: Conversation) => {
    console.log('Selecting conversation:', conversation);
    
    if (!conversation) {
      console.error('Invalid conversation selected:', conversation);
      toast.error('Could not load conversation');
      return;
    }
    
    // Use either id or _id, whichever is available
    const conversationId = conversation.id || conversation._id;
    
    if (!conversationId) {
      console.error('Conversation has no ID:', conversation);
      toast.error('Could not load conversation');
      return;
    }
    
    setActiveConversation(conversation);
    setCurrentMessages([]); // Clear messages while loading
    
    console.log('Loading messages for conversation ID:', conversationId);
    await loadMessages(conversationId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-3 font-bold text-lg border-b border-gray-200">Messages</div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation, index) => {
            // Ensure each conversation has a unique key
            const conversationKey = conversation._id || `conversation-${index}`;
            const otherUser = conversation.participants.find(
              (p) => p.id !== user?.id,
            );
            return (
              <button
                key={conversationKey}
                onClick={() => handleConversationSelect(conversation)}
                className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition ${
                  activeConversation?._id === conversation._id
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <img
                  src={otherUser?.profilePicture || "/default-avatar.png"}
                  alt={otherUser?.username || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {otherUser?.username || "Unknown User"}
                      {otherUser?.id === user?.id && (
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">User</span>
                      )}
                    </p>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {(activeConversation || recipientId) && user ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white">
              <img
                src={activeConversation?.participants.find(p => p.id !== user.id)?.profilePicture || "/default-avatar.png"}
                alt={activeConversation?.participants.find(p => p.id !== user.id)?.username || "User"}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div>
                <div className="font-semibold text-lg">
                  {activeConversation?.participants.find(p => p.id !== user.id)?.username || "New Conversation"}
                </div>
                <div className="text-xs text-green-500">Online</div>
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col space-y-2">
              {currentMessages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${isMe ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'} flex flex-col`}>
                      <span>{msg.content}</span>
                      <span className="text-xs text-gray-400 mt-1 self-end">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Input Bar */}
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <form
                className="flex items-center space-x-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements.namedItem('messageInput') as HTMLInputElement);
                  if (input && input.value.trim()) {
                    await handleSendMessage(input.value);
                    input.value = '';
                  }
                }}
              >
                <input
                  name="messageInput"
                  type="text"
                  autoComplete="off"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
