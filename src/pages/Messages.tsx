"use client";

import { LoadingSpinner } from "@/api";

import ConversationsList from "@/components/chat/ConversationsList";
import UserDetails from "@/components/chat/UserDetails";
import { useContextMessages } from "@/contexts/MessagesContext";
import { useAuth } from "@/hooks";
import type { Conversation, User } from "@/types";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";

const ChatSection = lazy(() => import("@/components/chat/ChatSection"));
import { useParams } from "react-router-dom";
import { useSocket } from "@/contexts/SocketContext";
import { NEW_MESSAGE } from "@/constants/socketEvents";

export default function ChatInterface() {
  const [infoOpen, setInfoOpen] = useState(true);
  const { isLoading, conversations } = useContextMessages();
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [participant, setParticipant] = useState<User | null>();
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const updateCurrentConversation = useCallback(
    (conversation: Conversation) => {
      setCurrentChat(conversation);
      setParticipant(
        conversation.participants.find((p) => p.id !== user?.id) || null,
      );
    },
    [user],
  );

  const fetchCurrentConversation = useCallback(() => {
    try {
      if (!chatId) {
        setCurrentChat(null);
        setParticipant(null);
        return;
      }

      const conversation = conversations.find((c) => c.id === chatId);
      if (conversation) {
        updateCurrentConversation(conversation);
      }
    } catch (error) {
      console.error("Error fetching current conversation:", error);
      setCurrentChat(null);
      setParticipant(null);
    }
  }, [chatId, conversations, updateCurrentConversation]);

  // Handle real-time updates for conversations and messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      // If the new message is for the current chat, update the last message
      if (currentChat?.id === message.conversationId) {
        setCurrentChat((prev) => ({
          ...prev!,
          lastMessage: message,
          updatedAt: new Date().toISOString(),
        }));
      }
    };

    const handleConversationUpdate = (updatedConversation: Conversation) => {
      // If the updated conversation is the current one, update it
      if (currentChat?.id === updatedConversation.id) {
        updateCurrentConversation(updatedConversation);
      }
    };

    // Listen for new messages and conversation updates
    socket.on(NEW_MESSAGE, handleNewMessage);
    socket.on("conversation:updated", handleConversationUpdate);

    // Clean up event listeners
    return () => {
      socket.off(NEW_MESSAGE, handleNewMessage);
      socket.off("conversation:updated", handleConversationUpdate);
    };
  }, [socket, currentChat, updateCurrentConversation]);

  // Update current conversation when chatId or conversations change
  useEffect(() => {
    fetchCurrentConversation();
  }, [fetchCurrentConversation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Debug logging
  // console.log('Current chat:', currentChat);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-screen bg-white">
      {/* Contacts/chats sidebar */}
      <ConversationsList
        user={user}
        onConversationSelect={(conversation) => {
          updateCurrentConversation(conversation);
        }}
      />

      {currentChat ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Main chat area */}
            <div
              className={`${infoOpen ? "hidden md:block" : "w-full"} flex-1 overflow-hidden`}
            >
                            <Suspense
                fallback={
                  <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                }
              >
                <ChatSection
                  participant={participant}
                  user={user}
                  currentChat={currentChat}
                  setInfoOpen={setInfoOpen}
                />
              </Suspense>
            </div>

            {/* Right sidebar - group info */}
            {infoOpen && (
              <div className="w-full md:w-1/4 border-l border-gray-200 overflow-y-auto">
                <UserDetails
                  participant={participant}
                  setInfoOpen={setInfoOpen}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <h1 className="text-3xl text-gray-400">
            Select a chat to start messaging
          </h1>
        </div>
      )}
    </div>
  );
}
