"use client";

import { LoadingSpinner } from "@/api";
import ChatSection from "@/components/chat/ChatSection";
import ConversationsList from "@/components/chat/ConversationsList";
import UserDetails from "@/components/chat/UserDetails";
import { useContextMessages } from "@/contexts/MessagesContext";
import { useMessages } from "@/hooks";
import { useCallback, useState } from "react";

export default function ChatInterface() {
  const [infoOpen, setInfoOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const { isLoading } = useContextMessages();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-screen">
      <div className="mx-auto w-full overflow-hidden rounded-xl bg-white shadow-xl flex">
        {/* Contacts/chats sidebar */}
        <ConversationsList setLoading={setLoading} />

        {/* Main chat area */}
        <ChatSection />

        {/* Right sidebar - group info */}
        {infoOpen && <UserDetails setInfoOpen={setInfoOpen} />}
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
