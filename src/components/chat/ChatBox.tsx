import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { FixedSizeList as VirtualList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

type AutoSizerProps = {
  height: number;
  width: number;
};
import type { ListChildComponentProps } from "react-window";
import type { User } from "@/types/user";
import type { Conversation } from "@/types";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface ChatBoxProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  currentUserId: string;
  className?: string;
}

export function ChatBox({
  conversation,
  messages,
  onSendMessage,
  currentUserId,
  className = "",
}: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim()) return;

      try {
        await onSendMessage(newMessage);
        setNewMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [onSendMessage, newMessage, currentUserId],
  );

  const otherUser = useMemo(
    () =>
      conversation.participants.find(
        (user: User) => user.id !== currentUserId,
      ) as User,
    [conversation.participants, currentUserId],
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center p-4 border-b">
        <img
          src={otherUser.profilePicture || "/default-avatar.png"}
          alt={otherUser.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-3">
          <h3 className="font-semibold">{otherUser.name}</h3>
          <p className="text-sm text-gray-500">{otherUser.username}</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div style={{ height: "100%" }}>
          <AutoSizer>
            {({ height, width }: AutoSizerProps) => (
              <VirtualList
                height={height}
                width={width}
                itemCount={messages.length}
                itemSize={80}
                itemData={{
                  messages,
                  currentUserId,
                  messagesEndRef: messages.length - 1,
                }}
              >
                {({
                  index,
                  style,
                  data,
                }: ListChildComponentProps<{
                  messages: Message[];
                  currentUserId: string;
                  messagesEndRef: number;
                }>) => {
                  const message = data.messages[index];
                  const isCurrentUser = message.senderId === data.currentUserId;
                  const isLastMessage = index === data.messages.length - 1;

                  return (
                    <div style={style}>
                      <div
                        key={message.id}
                        className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        ref={isLastMessage ? messagesEndRef : undefined}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isCurrentUser
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p>{message.content}</p>
                          <span className="text-xs opacity-75">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </VirtualList>
            )}
          </AutoSizer>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
