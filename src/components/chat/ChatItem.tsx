import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Conversation, User } from "@/types";
import type { AuthUser } from "@/types/auth.types";
import { ComponentProps } from "react";

function ChatItem({
  chat,
  chatId,
  participants,
  lastMessageDate,
  user,
  isSelected = false,
}: {
  chat: Conversation;
  chatId: string;
  participants: User;
  lastMessageDate: Date | null;
  user: AuthUser | null;
  isSelected?: boolean;
}) {
  return (
    <div
      className={`flex items-start space-x-3 hover:bg-gray-100/30 cursor-pointer ${isSelected ? 'bg-blue-50' : ''} ${chatId === chat?.id && !isSelected ? 'bg-gray-100' : ''} py-2 px-2 rounded`}
      onClick={(e) => {
        if (isSelected) {
          e.stopPropagation();
        }
      }}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={participants.profilePicture} />
        <AvatarFallback>
          {participants?.username[0]?.toLocaleUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium">
            {participants.name || participants.username}
          </div>

          {lastMessageDate && (
            <div className="text-xs text-gray-400">
              {lastMessageDate.getHours().toString().padStart(2, '0')}:
              {lastMessageDate.getMinutes().toString().padStart(2, '0')}
            </div>
          )}
        </div>
        {/* ON typing */}
        {/* <div className="flex items-center text-xs text-gray-500">
        <Edit className="h-3 w-3 mr-1" />
        Elena is typing...
        <div className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs">
            2
        </div>
        </div> */}
        <div className="flex items-center text-xs text-gray-500">
          <span className="text-xs text-gray-400 mr-1">
            {chat.lastMessage?.senderId === user?.id
              ? "You: "
              : participants.name || participants.username}
          </span>
          {chat.lastMessage?.content}
          {chat.lastMessage?.senderId === user?.id &&
            chat.lastMessage?.read && (
              <div className="ml-auto h-6 w-6">
                <Check className="h-4 w-4 text-green-500" />
              </div>
            )}

          {/* Unread count */}
          {/* <div className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs">
            2
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
export function Check(props: ComponentProps<'svg'>) {
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
