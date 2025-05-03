"use client";

import { MessagesAPI } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth, useMessages } from "@/hooks";
import type { Conversation } from "@/types";
import { ChevronDown, Edit, Search } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { memo, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatItem from "./ChatItem";
import { useContextMessages } from "@/contexts/MessagesContext";

const ConversationsList = memo(function ConversationsList({
  setLoading,
}: {
  setLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<Conversation[]>([]);
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { conversations } = useContextMessages();
  console.log(conversations);

  // const getConversations = useCallback(async () => {
  //   if (!isAuthenticated || !user) {
  //     navigate("/login");
  //     return;
  //   }
  //   try {
  //     setIsLoading(true);
  //     const response = await MessagesAPI.getConversations();
  //     if (!response.data.items) {
  //       throw new Error("Failed to fetch conversations");
  //     }
  //     setChats(response.data.items);
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Failed to fetch conversations:", error);
  //     setIsLoading(false);
  //   }
  // }, [isAuthenticated, user, conversations]); // ✅ All deps included

  useEffect(() => {
    // getConversations();
    if (conversations.success) {
      setChats(conversations?.data?.items || []);
    }
  }, [conversations]); // ✅ Effect depends on stable getConversations

  return (
    <div className="w-1/4 h-full border-r border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">
            Message <span className="text-gray-400">(12)</span>
          </h2>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-9 pr-9 py-2 text-sm rounded-md"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7"
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)] flex-1 pr-3">
          <div className="">
            {chats.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-gray-400">
                  No conversations yet
                </div>
              </div>
            )}
            {chats.length > 0 &&
              chats?.map((chat) => {
                const participants = chat.participants.filter(
                  (_i) => _i.id !== user?.id
                )[0];
                console.log(participants);
                const lastMessageDate = chat.lastMessageAt
                  ? new Date(chat.lastMessageAt)
                  : null;
                return (
                  <ChatItem
                    key={chat.id}
                    chatId={chatId || ""}
                    chat={chat}
                    participants={participants}
                    lastMessageDate={lastMessageDate}
                    user={user}
                  />
                );
              })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});
export default ConversationsList;
