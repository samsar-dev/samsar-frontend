"use client";

import { LoadingSpinner } from "@/api";
import ChatSection from "@/components/chat/ChatSection";
import ConversationsList from "@/components/chat/ConversationsList";
import UserDetails from "@/components/chat/UserDetails";
import { useContextMessages } from "@/contexts/MessagesContext";
import { useAuth } from "@/hooks";
import type { Conversation, User } from "@/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ChatInterface() {
  const [infoOpen, setInfoOpen] = useState(true);
  const {
    isLoading,
    setCurrentConversation,
    currentConversation,
    conversations,
  } = useContextMessages();
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [participant, setParticipant] = useState<User | null>();
  const { chatId } = useParams();
  const { user } = useAuth();

  const fetchCurrentConversation = () => {
    try {
      if (!chatId) {
        throw new Error("No chatId provided");
      }
      const conversation = conversations.find((c) => c.id === chatId);
      if (conversation) {
        setCurrentChat(conversation);

        setParticipant(
          conversation.participants.find((p) => p.id !== user?.id) || null,
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCurrentConversation();
  }, [isLoading, conversations, chatId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  console.log(currentChat);
  console.log(currentConversation);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-screen">
      <div className="mx-auto w-full overflow-hidden bg-white flex">
        {/* Contacts/chats sidebar */}
        <ConversationsList user={user} />

        {currentChat && (
          <div className="w-full overflow-hidden flex">
            {/* Main chat area */}
            <ChatSection
              participant={participant}
              user={user}
              currentChat={currentChat}
              setInfoOpen={setInfoOpen}
            />

            {/* Right sidebar - group info */}
            {infoOpen && (
              <UserDetails
                participant={participant}
                setInfoOpen={setInfoOpen}
              />
            )}
          </div>
        )}

        {!currentChat && (
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
function Check(props: React.SVGProps<SVGSVGElement>) {
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
