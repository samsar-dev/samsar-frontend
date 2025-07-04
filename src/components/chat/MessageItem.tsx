import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Message } from "@/types";
import { useContextMessages } from "@/contexts/MessagesContext";
import { Button } from "@/components/ui/button";

interface MessageItemProps {
  message: Message & { conversationId?: string };
  isOwnMessage: boolean;
  conversationId?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
}) => {
  const { deleteMessage } = useContextMessages();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const messageTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Get conversationId from props or message object
    const conversationId = 'conversationId' in props ? 
      (props as any).conversationId : 
      (message as any).conversationId;
      
    if (!conversationId || !message.id || !window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await deleteMessage(conversationId, message.id);
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleting) {
    return null; // Or a loading spinner
  }

  return (
    <div 
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 relative ${
          isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <p className="text-sm pr-6">{message.content}</p>
        <div
          className={`mt-1 text-xs flex items-center ${
            isOwnMessage ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {messageTime}
          {isOwnMessage && message.read && <span className="ml-2">✓✓</span>}
        </div>
        
        {isOwnMessage && isHovered && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="absolute -right-8 top-1/2 -translate-y-1/2 h-6 w-6 text-red-500 hover:bg-red-100 hover:text-red-600"
            title="Delete message"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete message</span>
          </Button>
        )}
      </div>
    </div>
  );
};
