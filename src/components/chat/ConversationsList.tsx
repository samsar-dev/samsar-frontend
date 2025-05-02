"use client";

import { LoadingSpinner, MessagesAPI } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks";
import type { Conversation } from "@/types";
import { ChevronDown, Edit, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatItem from "./ChatItem";

function ConversationsList() {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { chatId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);
      if (!isAuthenticated || !user) {
        navigate("/login");
        return;
      }
      try {
        const response = await MessagesAPI.getConversations();
        if (!response.data) {
          throw new Error("Failed to fetch conversations");
        }
        const data = response.data;
        setChats(data.items);
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    getConversations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
}
export default ConversationsList;
