"use client";

import { MessagesAPI } from "@/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NEW_MESSAGE } from "@/constants/socketEvents";
import { useSocket } from "@/contexts/SocketContext";
import type { Conversation, Message, User } from "@/types";
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
    if (!user || !participant || !currentChat || !inputMessage || !receiverId) {
      throw new Error("Data is incomplete for sending message");
    }
    if (!socket) {
      throw new Error("Socket not initialized");
    }
    const soketData: Message = {
      id: `temp-${Date.now()}`, // Add a temporary unique ID for new messages
      content: inputMessage,
      senderId: user?.id,
      recipientId: receiverId,
      conversationId: currentChat.id,
      createdAt: new Date().toISOString(),
    };
    console.log(soketData);

    // Clear input first
    setInputMessage("");

    // Then update messages and emit
    setMessages((prev) => [...prev, soketData]);
    socket.emit(NEW_MESSAGE, soketData);

    scrollBottonFn(); // Scroll to bottom after sending
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
    console.log("Socket initialized", socket);
    if (!socket) {
      throw new Error("Socket not initialized");
    }
    socket.on(NEW_MESSAGE, (message: Message) => {
      console.log("Socket new message response:", message);
      setMessages((prev) => [...prev, message]);
    });
    socket.on("connect_error", (err: any) => {
      console.log("Socket error:", err.message);
    });
  }, [socket]);

  useEffect(() => {
    scrollBottonFn();
  }, [messages]);
  console.log(messages);

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setInfoOpen(true)}
        >
          {/* <Avatar className="h-8 w-8 mr-2">
            <AvatarImage
              src={participant?.profilePicture || "/placeholder.svg"}
            />
            <AvatarFallback>
              {participant?.username?.slice(0, 2).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar> */}
          <h2 className="text-2xl font-semibold">
            {participant?.name || participant?.username}
          </h2>
          {participant?.showOnlineStatus && (
            <Badge variant="outline" className="ml-2 bg-white">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-6 w-px bg-gray-200"></div>
          <Button variant="ghost" size="icon" onClick={() => setInfoOpen(true)}>
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6" key="messages-container">
          {messages?.map((message, index) => (
            <div key={message.id} className="flex flex-col">
              {message.senderId === user?.id ? (
                <UserMessageBubble
                  message={message}
                  user={user}
                  index={index}
                />
              ) : (
                <ParticipantMessageBubble
                  message={message}
                  participant={participant!}
                  index={index}
                />
              )}
            </div>
          ))}
          <div key="scroll-ref" ref={scrollRef} className="w-full"></div>
        </div>
      </ScrollArea>

      {/* Chat input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
            <AvatarFallback>
              {user?.username?.slice(0, 2).toUpperCase() || "ME"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 mx-3 relative">
            <Input
              placeholder="Type Something ..."
              className="pl-12"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div
              className="absolute left-2 bottom-full mb-2"
              ref={emojiPickerRef}
            >
              {showEmojiPicker && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-64">
                  <div className="mb-2 border-b pb-2">
                    <div className="flex overflow-x-auto space-x-2 pb-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Smile className="h-8 w-8 text-gray-500" />
                      </button>
                      {/* Category buttons can be added here */}
                    </div>
                  </div>
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
                      "🤨",
                      "😐",
                      "😑",
                      "😶",
                      "🙄",
                      "😏",
                      "😣",
                      "😥",
                      "😮",
                      "🤐",
                      "😯",
                      "😪",
                      "😫",
                      "😴",
                      "😌",
                      "😛",
                      "😜",
                      "😝",
                      "🤤",
                      "😒",
                      "👍",
                      "👎",
                      "👏",
                      "🙌",
                      "👋",
                      "🤝",
                      "💪",
                      "❤️",
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-8 w-8 text-gray-500" />
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            className="rounded-full bg-blue-500 hover:bg-blue-600"
            onClick={handleSendMessage}
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatSection;

const ParticipantMessageBubble = ({
  message,
  participant,
  index,
}: {
  message: Message;
  participant: User;
  index: number;
}) => {
  return (
    <div className="flex items-start space-x-3">
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={participant?.profilePicture || "/placeholder.svg"} />
        <AvatarFallback>
          {participant?.username?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
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

const UserMessageBubble = ({
  message,
  user,
  index,
}: {
  message: Message;
  user: AuthUser;
  index: number;
}) => {
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
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={user?.profilePicture || ""} />
        <AvatarFallback>
          {user?.username?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
