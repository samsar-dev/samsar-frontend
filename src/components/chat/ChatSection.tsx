"use client";

import { MessagesAPI } from "@/api/messaging.api";
import OptimizedAvatar from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NEW_MESSAGE } from "@/constants/socketEvents";
import { useSocket } from "@/contexts/SocketContext";
import type { Conversation, Message } from "@/types/messaging";
import type { User } from "@/types/user";
import type { AuthUser } from "@/types/auth.types";
import {
  ImageIcon,
  MoreHorizontal,
  Paperclip,
  Send,
  Smile,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";

function ChatSection({
  currentChat,
  user,
  participant,
  setInfoOpen,
}: {
  currentChat: Conversation;
  user: AuthUser | null;
  participant: User | null | undefined;
  setInfoOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const scrollBottonFn = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendMessage = async () => {
    const receiverId = participant?.id;
    if (
      !user ||
      !participant ||
      !currentChat?.id ||
      !inputMessage.trim() ||
      !receiverId
    ) {
      console.error("Cannot send message: Missing required data");
      return;
    }

    if (!socket) {
      console.error("Cannot send message: Socket not initialized");
      return;
    }

    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const messageData: Message = {
      id: tempMessageId,
      content: inputMessage.trim(),
      senderId: user.id,
      recipientId: receiverId,
      conversationId: currentChat.id,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    // Optimistically update the UI
    setMessages((prev) => [...prev, messageData]);
    setInputMessage("");
    scrollBottonFn();

    try {
      // Send the message via API
      const response = await MessagesAPI.sendMessage({
        content: messageData.content,
        recipientId: messageData.recipientId,
        // The API expects listingId, not conversationId
        listingId: currentChat.listingId || "",
      });

      // Update the message with the server response
      if (response.data) {
        // The response data is the message itself, not wrapped in a data property
        const sentMessage = response.data as Message;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessageId ? { ...sentMessage, status: "sent" } : msg,
          ),
        );

        // Emit socket event with the sent message
        socket.emit(NEW_MESSAGE, {
          ...sentMessage,
          status: "sent",
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Update message status to failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId
            ? { ...msg, status: "failed" as const }
            : msg,
        ),
      );
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!user) {
          navigate("/login");
          throw new Error("User not Authenticated");
        }
        if (!currentChat.id) {
          throw new Error("No chatId provided");
        }
        const response = await MessagesAPI.getMessages(currentChat.id);
        console.log(response);
        if (!response.messages) throw new Error("Failed to fetch messages");
        setMessages(response.messages);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMessages();
  }, [currentChat]);

  useEffect(() => {
    if (!socket) {
      console.warn("Socket not initialized");
      return;
    }

    console.log("Socket initialized", socket);

    const handleNewMessage = (message: Message) => {
      console.log("New message received:", message);
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        if (
          !prev.some(
            (m) =>
              m.id === message.id ||
              (m.content === message.content &&
                m.senderId === message.senderId &&
                Math.abs(
                  new Date(m.createdAt).getTime() -
                    new Date(message.createdAt).getTime(),
                ) < 1000),
          )
        ) {
          return [...prev, message];
        }
        return prev;
      });
    };

    const handleConversationUpdate = (updatedConversation: Conversation) => {
      console.log("Conversation updated:", updatedConversation);
      // This will trigger a re-render of the parent component with the updated conversation
    };

    // Listen for new messages in this conversation
    const conversationEvent = `conversation:${currentChat.id}`;
    socket.on(conversationEvent, handleNewMessage);

    // Also listen to global new message event
    socket.on(NEW_MESSAGE, (message: Message) => {
      // Only process if the message belongs to the current conversation
      if (message.conversationId === currentChat.id) {
        handleNewMessage(message);
      }
    });

    // Listen for conversation updates
    socket.on("conversation:updated", (updatedConversation: Conversation) => {
      // Only update if it's the current conversation
      if (updatedConversation.id === currentChat.id) {
        handleConversationUpdate(updatedConversation);
      }
    });
    socket.on("connect_error", (err: any) => {
      console.error("Socket connection error:", err.message);
    });

    // Clean up event listeners
    return () => {
      socket.off(conversationEvent, handleNewMessage);
      socket.off(NEW_MESSAGE, handleNewMessage);
      socket.off("conversation:updated", handleConversationUpdate);
      socket.off("connect_error");
    };
  }, [socket, currentChat.id]);

  // Scroll to bottom when messages change or conversation changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollBottonFn();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, currentChat.id]);
  console.log(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setInfoOpen(true)}
        >
          <h2 className="text-2xl font-semibold">
            {participant?.name || participant?.username}
          </h2>
          {participant?.showOnlineStatus && (
            <Badge variant="outline" className="ml-2 bg-white">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setInfoOpen((prev) => !prev)}
          aria-label="Toggle user details"
        >
          <MoreHorizontal className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6" key="messages-container">
            {messages?.map((message) => (
              <div key={message.id} className="flex flex-col">
                {message.senderId === user?.id ? (
                  <UserMessageBubble message={message} user={user} />
                ) : (
                  <ParticipantMessageBubble
                    message={message}
                    participant={participant!}
                  />
                )}
              </div>
            ))}
            <div key="scroll-ref" ref={scrollRef} className="w-full"></div>
          </div>
        </ScrollArea>
      </div>

      {/* Chat input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Type a message..."
              className="pr-12 pl-4 py-5 rounded-full border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>

            {showEmojiPicker && (
              <div
                className="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-64 z-10"
                ref={emojiPickerRef}
              >
                <div className="grid grid-cols-8 gap-1">
                  {[
                    "😀",
                    "😁",
                    "😂",
                    "🤣",
                    "😃",
                    "😄",
                    "😅",
                    "😆",
                    "😉",
                    "😊",
                    "😋",
                    "😎",
                    "😍",
                    "😘",
                    "😗",
                    "😙",
                    "😚",
                    "🙂",
                    "🤗",
                    "🤔",
                  ].map((emoji, index) => (
                    <button
                      key={index}
                      className="p-1 hover:bg-gray-100 rounded text-xl"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 flex-shrink-0"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatSection;

interface ParticipantMessageBubbleProps {
  message: Message;
  participant: User;
}

const ParticipantMessageBubble = ({
  message,
  participant,
}: ParticipantMessageBubbleProps) => {
  return (
    <div className="flex items-start space-x-3">
      <OptimizedAvatar
        src={participant?.profilePicture}
        fallback={participant?.username}
        size="md"
        className="h-8 w-8"
      />
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <div className="font-medium">
            {participant?.name || participant?.username}
          </div>
          <div className="text-xs text-gray-400 ml-2">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {/* <Button variant="ghost" size="icon" className="ml-auto h-6 w-6">
            <MoreHorizontal className="h-4 w-4" />
          </Button> */}
        </div>
        <div className="bg-gray-100 p-3 rounded-lg inline-block max-w-md">
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  );
};

interface UserMessageBubbleProps {
  message: Message;
  user: AuthUser;
}

const UserMessageBubble = ({ message, user }: UserMessageBubbleProps) => {
  return (
    <div className="flex justify-end space-x-2">
      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-2 max-w-md">
          <div className="text-xs text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="font-medium">You</div>
        </div>
        <div className="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-md">
          <p>{message.content}</p>
        </div>
      </div>
      <OptimizedAvatar
        src={user?.profilePicture}
        fallback={user?.username || 'U'}
        size="md"
        className="h-8 w-8"
      />
    </div>
  );
};
