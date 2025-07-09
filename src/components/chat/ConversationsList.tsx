"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContextMessages } from "@/contexts/MessagesContext";
import type { Conversation } from "@/types";
import type { AuthUser } from "@/types/auth.types";
import { Check, ChevronDown, Edit, Search, Trash, X } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatItem from "./ChatItem";

interface ConversationsListProps {
  user: AuthUser | null;
  onConversationSelect: (conversation: Conversation) => void;
}

const ConversationsList = memo(function ConversationsList({
  user,
  onConversationSelect,
}: ConversationsListProps) {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { conversations, deleteConversations } = useContextMessages();

  useEffect(() => {
    // getConversations();
    if (conversations.length > 0) {
      setChats(conversations);
    }
  }, [conversations]);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => !prev);
    if (isSelectMode) {
      setSelectedChats(new Set());
    }
  }, [isSelectMode]);

  const toggleChatSelection = useCallback((chatId: string | undefined) => {
    if (!chatId) return;

    setSelectedChats((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(chatId)) {
        newSelection.delete(chatId);
      } else {
        newSelection.add(chatId);
      }
      return newSelection;
    });
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedChats.size === 0) return;

    try {
      const validIds = Array.from(selectedChats).filter((id): id is string =>
        Boolean(id),
      );
      if (validIds.length === 0) return;

      await deleteConversations(validIds);
      setSelectedChats(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error("Failed to delete conversations:", error);
    }
  }, [deleteConversations, selectedChats]);

  return (
    <div className="w-1/4 h-full border-r border-gray-100 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">
            {isSelectMode ? (
              <span>{selectedChats.size} selected</span>
            ) : (
              <>
                Messages <span className="text-gray-400">({chats.length})</span>
              </>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            {isSelectMode ? (
              <>
                {selectedChats.size > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteSelected}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={toggleSelectMode}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={toggleSelectMode}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
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

        <ScrollArea
          className="flex-1 pr-3"
          style={{ height: "calc(100vh - 12rem)" }}
        >
          <div className="">
            {chats.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-gray-400">
                  No conversations yet
                </div>
              </div>
            ) : (
              chats.map((chat) => {
                const participants = chat.participants.find(
                  (p) => p.id !== user?.id,
                );

                if (!participants) return null;

                const lastMessageDate = chat.lastMessageAt
                  ? new Date(chat.lastMessageAt)
                  : null;

                return (
                  <div
                    key={chat.id}
                    className={`relative ${isSelectMode ? "cursor-pointer" : ""}`}
                    onClick={(e) => {
                      if (isSelectMode) {
                        e.stopPropagation();
                        if (chat.id) {
                          toggleChatSelection(chat.id);
                        }
                      } else if (chat.id) {
                        onConversationSelect(chat);
                        navigate(`/messages/${chat.id}`);
                      }
                    }}
                  >
                    {isSelectMode && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            chat.id && selectedChats.has(chat.id)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {chat.id && selectedChats.has(chat.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    )}
                    <div className={isSelectMode ? "pl-10" : ""}>
                      <ChatItem
                        chatId={chatId || ""}
                        chat={chat}
                        participants={participants}
                        lastMessageDate={lastMessageDate}
                        user={user}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});
export default ConversationsList;
