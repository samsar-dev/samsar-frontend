import React from "react";
import type { Message } from "@/types";

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
}) => {
  const messageTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <div
          className={`mt-1 text-xs ${
            isOwnMessage ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {messageTime}
          {isOwnMessage && message.read && <span className="ml-2">✓✓</span>}
        </div>
      </div>
    </div>
  );
};
