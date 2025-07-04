"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContextMessages } from "@/contexts/MessagesContext";
import type { Conversation } from "@/types";
import type { AuthUser } from "@/types/auth.types";
import { Check, ChevronDown, Edit, Search, Trash2, X } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatItem from "./ChatItem";

function ConversationsList({
  user,
}: {
  user: AuthUser | null;
}) {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  // Debug effect to log state changes
  useEffect(() => {
    console.log('isSelectMode changed:', isSelectMode, 'selectedChats:', Array.from(selectedChats));
  }, [isSelectMode, selectedChats]);
  
  // Toggle selection mode
  const toggleSelectionMode = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggling selection mode, current:', isSelectMode);
    const newMode = !isSelectMode;
    setIsSelectMode(newMode);
    // Clear selection when toggling off
    if (!newMode) {
      setSelectedChats(new Set());
    }
  }, [isSelectMode]);
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { conversations, deleteConversation } = useContextMessages();
  
  // Toggle chat selection with type safety
  const toggleChatSelection = (chatId: string | undefined) => {
    if (!chatId) return;
    
    setSelectedChats(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(chatId)) {
        newSelection.delete(chatId);
      } else {
        newSelection.add(chatId);
      }
      return newSelection;
    });
  };
  
  // Safely add a chat ID to the selection
  const safeAddToSelection = (id: string | undefined) => {
    if (id) {
      toggleChatSelection(id);
    }
  };
  
  // Handle delete selected conversations
  const handleDeleteSelected = async () => {
    // Convert Set to array and filter out any undefined values
    const selectedChatsArray = Array.from(selectedChats).filter((id): id is string => Boolean(id));
    
    if (selectedChatsArray.length === 0 || !window.confirm(`Are you sure you want to delete ${selectedChatsArray.length} conversation(s)?`)) {
      return;
    }
    
    try {
      // Delete each selected conversation
      const deletePromises = selectedChatsArray.map(chatId => 
        deleteConversation(chatId).catch(error => {
          console.error(`Failed to delete conversation ${chatId}:`, error);
          return null; // Continue with other deletions even if one fails
        })
      );
      
      await Promise.all(deletePromises);
      
      // Clear selection and exit select mode
      setSelectedChats(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error('Failed to delete conversations:', error);
      alert('Failed to delete conversations. Please try again.');
    }
  };
  


  // Ensure we have a valid chatId before using it
  const safeChatId = chatId || '';
  
  // Filter out any undefined chat IDs from the selection
  const safeSelectedChats = new Set<string>(
    Array.from(selectedChats).filter((id): id is string => Boolean(id))
  );

  useEffect(() => {
    // getConversations();
    if (conversations.length > 0) {
      setChats(conversations);
    }
  }, [conversations]);

  return (
    <div className="w-1/4 h-full border-r border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">
            Messages <span className="text-gray-400">({chats.length})</span>
            {isSelectMode && (
              <span className="ml-2 text-sm text-gray-500">
                {selectedChats.size} selected
              </span>
            )}
          </h2>
          {isSelectMode ? (
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDeleteSelected}
                disabled={selectedChats.size === 0}
                aria-label="Delete selected"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleSelectionMode}
              className="hover:bg-gray-100"
              aria-label={isSelectMode ? 'Cancel selection' : 'Select messages'}
              data-testid="edit-button"
            >
              {isSelectMode ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          )}
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
                const lastMessageDate = chat.lastMessageAt
                  ? new Date(chat.lastMessageAt)
                  : null;
                return (
                  <div
                    key={chat.id}
                    className={`relative ${isSelectMode ? 'cursor-pointer pl-2' : ''} hover:bg-gray-50 rounded-md`}
                    onClick={(e) => {
                      if (isSelectMode) {
                        e.stopPropagation();
                        toggleChatSelection(chat.id);
                      } else {
                        navigate(`/messages/${chat.id}`);
                      }
                    }}
                  >
                    {isSelectMode && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-50" style={{ marginTop: '1px' }}>
                        <div 
                          className={`flex items-center justify-center h-5 w-5 rounded border ${chat.id && safeSelectedChats.has(chat.id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            safeAddToSelection(chat.id);
                          }}
                        >
                          {chat.id && safeSelectedChats.has(chat.id) && (
                            <Check className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>
                      </div>
                    )}
                    <div className={isSelectMode ? 'pl-10 relative z-0' : 'relative z-0'}>
                      <ChatItem
                        chatId={safeChatId}
                        chat={chat}
                        participants={participants}
                        lastMessageDate={lastMessageDate}
                        user={user}
                        isSelected={Boolean(chat.id && safeSelectedChats.has(chat.id))}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default memo(ConversationsList);
