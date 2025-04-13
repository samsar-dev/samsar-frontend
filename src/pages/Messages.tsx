import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { MessagesAPI } from "@/api/messaging.api";
import type {
   Message,
   Conversation,
   MessageInput,
   MessageEvent,
   ErrorEvent,
} from "@/types/messaging";
import type { User } from "@/types";
import { ChatBox } from "@/components/chat/ChatBox";
import { toast } from "react-toastify";

interface ChatBoxProps {
   conversation: Conversation;
   messages: Message[];
   onSendMessage: (content: string) => Promise<void>;
   className?: string;
   currentUserId: string;
}

const Messages: React.FC = () => {
   const { user } = useAuth() as { user: User | null };
   const { on, off } = useSocket();
   const [conversations, setConversations] = useState<Conversation[]>([]);
   const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
   const [activeConversation, setActiveConversation] =
      useState<Conversation | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchConversations = async () => {
         try {
            setLoading(true);
            const response = await MessagesAPI.getConversations();
            if (response.success && response.data) {
               const conversationList = response.data.items || [];
               setConversations(conversationList);
               if (conversationList.length > 0) {
                  setActiveConversation(conversationList[0]);
                  await loadMessages(conversationList[0]._id);
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

   const loadMessages = async (conversationId: string) => {
      try {
         const response = await MessagesAPI.getMessages(conversationId);
         if (response.success && response.data) {
            const messageList = response.data.items || [];
            setCurrentMessages(messageList);
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
            setCurrentMessages((prev) => [...prev, newMessage]);
         }
      };

      on("message", handleNewMessage);

      return () => {
         off("message", handleNewMessage);
      };
   }, [on, off, user]);

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
      if (!activeConversation || !content.trim() || !user) return;

      try {
         const messageInput: MessageInput = { content };
         const response = await MessagesAPI.sendMessage(
            activeConversation._id,
            messageInput
         );

         if (response.success && response.data) {
            const newMessage = response.data;
            setCurrentMessages((prev) => [...prev, newMessage]);
         }
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : "Failed to send message";
         toast.error(errorMessage);
         console.error("Error sending message:", error);
      }
   };

   const handleConversationSelect = async (conversation: Conversation) => {
      setActiveConversation(conversation);
      await loadMessages(conversation._id);
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
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
         <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {conversations.map((conversation) => {
               const otherUser = conversation.participants.find(
                  (p) => p._id !== user?._id
               );
               return (
                  <button
                     key={conversation._id}
                     onClick={() => handleConversationSelect(conversation)}
                     className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        activeConversation?._id === conversation._id
                           ? "bg-blue-50 dark:bg-blue-900"
                           : ""
                     }`}
                  >
                     <img
                        src={otherUser?.profilePicture || "/default-avatar.png"}
                        alt={otherUser?.username || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                     />
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                           <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {otherUser?.username || "Unknown User"}
                           </p>
                           {conversation.lastMessage && (
                              <span className="text-xs text-gray-500">
                                 {new Date(
                                    conversation.lastMessage.createdAt
                                 ).toLocaleDateString()}
                              </span>
                           )}
                        </div>
                        {conversation.lastMessage && (
                           <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {conversation.lastMessage.content}
                           </p>
                        )}
                     </div>
                  </button>
               );
            })}
         </div>
         <div className="flex-1">
            {activeConversation && user ? (
               <ChatBox
                  conversation={activeConversation}
                  messages={currentMessages}
                  onSendMessage={handleSendMessage}
                  className="h-full"
                  currentUserId={user._id}
               />
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
