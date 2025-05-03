"use client";

import { LoadingSpinner } from "@/api";
import ChatSection from "@/components/chat/ChatSection";
import ConversationsList from "@/components/chat/ConversationsList";
import UserDetails from "@/components/chat/UserDetails";
import { useContextMessages } from "@/contexts/MessagesContext";
import { useAuth, useMessages } from "@/hooks";
import { Conversation } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ChatInterface() {
  const [infoOpen, setInfoOpen] = useState(true);
  const { isLoading, setCurrentConversation, currentConversation } =
    useContextMessages();
  const { chatId } = useParams();
  const { user, isAuthenticated } = useAuth();

  const fetchCurrentConversation = useCallback(async () => {
    try {
      if (!chatId) {
        throw new Error("No chatId provided");
      }
      await setCurrentConversation(chatId);
    } catch (error) {
      console.log(error);
    }
  }, [chatId, currentConversation]);

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

  return (
    <div className="flex h-[calc(100vh-4rem)] w-screen">
      <div className="mx-auto w-full overflow-hidden bg-white flex">
        {/* Contacts/chats sidebar */}
        <ConversationsList user={user} />

        {currentConversation && (
          <div className="w-full overflow-hidden flex">
            {/* Main chat area */}
            <ChatSection />

            {/* Right sidebar - group info */}
            {infoOpen && <UserDetails setInfoOpen={setInfoOpen} />}
          </div>
        )}

        {!currentConversation && (
          <div className="w-full overflow-hidden flex">
            {/* Main chat area */}
            <h1 className=" text-center text-3xl text-gray-600 m-auto">
              No chat selected
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
function Check(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
