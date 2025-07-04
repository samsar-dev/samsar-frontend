import type { User } from "./user";
import type { APIResponse, PaginatedData } from "./api";
import {
  LanguageCode,
  ThemeType,
  ReportType,
  ReportStatus,
  ReportReason,
} from "./enums";
import { NotificationType } from "./notifications";

// Base Types
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id?: string;
  listingId?: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  read?: boolean;
  conversationId?: string;
  status?: MessageStatus;
}

export interface Conversation {
  _id?: string;
  id?: string; // Backend might return id instead of _id
  participants: User[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  listingId?: string; // The listing associated with this conversation
  lastMessageAt?: string; // When the last message was sent
}

// Request Types
export interface MessageInput {
  content: string;
}

export interface ListingMessageInput {
  listingId: string;
  content: string;
  recipientId: string;
}

export interface ConversationCreateInput {
  participantIds: string[];
  initialMessage?: string;
}

export interface MessageCreateInput {
  conversationId: string;
  content: string;
  attachments?: File[];
  listingId?: string;
}

export interface MessageUpdateInput {
  read?: boolean;
}

// Response Types with API Wrapper
export interface MessageResponse extends Omit<APIResponse<Message>, "data"> {
  data: ({ id: string } & Message) | null;
}

export interface MessagesResponse extends Omit<APIResponse<Message[]>, "data"> {
  data: Message[] | null;
}

export interface ConversationResponse extends Conversation {
  // ConversationResponse extends the base Conversation interface
  // with any additional fields that might be returned by the API
}

export interface ConversationsResponse
  extends Omit<APIResponse<Conversation[]>, "data"> {
  data: Conversation[] | null;
}

// Component Props Types
export interface MessageItemProps {
  message: Message;
  isOwn?: boolean;
  showTime?: boolean;
  className?: string;
}

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  className?: string;
}

export interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedId?: string;
  onSelect?: (conversation: Conversation) => void;
  className?: string;
}

export interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface MessageComposerProps extends MessageInputProps {
  conversationId: string;
  replyTo?: Message;
  onCancelReply?: () => void;
}

export interface MessagesContainerProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  className?: string;
}

// Socket Message Types
export interface SocketMessage<T> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface MessageEvent {
  type: "message";
  payload: Message;
}

export interface ErrorEvent {
  type: "error";
  payload: Error | string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationCreateInput {
  userId: string;
  type: NotificationType;
  content: string;
}

export interface Report {
  _id: string;
  type: ReportType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  listingId?: string;
}

export interface ReportCreateRequest {
  type: ReportType;
  targetId: string;
  reason: string;
  userId?: string;
  listingId?: string;
}
