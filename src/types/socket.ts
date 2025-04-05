import type { Socket } from "socket.io-client";
import type { Notification } from "./notifications";
import type { Message } from "./messaging";

export type SocketEventType =
  | "connect"
  | "disconnect"
  | "connect_error"
  | "message"
  | "error"
  | "notification:new"
  | "message:new"
  | "message:read";

export interface SocketMessage<T = unknown> {
  event: string;
  data: T;
}

export interface SocketEventData {
  connect: { userId: string; timestamp: number };
  disconnect: { reason: string; timestamp: number };
  connect_error: { error: Error; timestamp: number };
  message: SocketMessage;
  error: { type: "error"; payload: Error | string; timestamp: string };
  "notification:new": Notification;
  "message:new": Message;
  "message:read": { messageId: string };
}

export interface UseSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
  auth?: Record<string, string | number | boolean>;
  query?: Record<string, string>;
}

export interface SocketContextData {
  socket: ClientSocket | null;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: <T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ) => void;
  on: <T extends keyof ServerToClientEvents>(
    event: T,
    handler: ServerToClientEvents[T],
  ) => void;
  off: <T extends keyof ServerToClientEvents>(
    event: T,
    handler: ServerToClientEvents[T],
  ) => void;
}

export interface SocketEvents {
  connect: () => void;
  disconnect: () => void;
  "notification:new": (notification: Notification) => void;
  "message:new": (message: Message) => void;
  "message:read": (messageId: string) => void;
  error: (error: Error) => void;
}

export interface ClientToServerEvents {
  "message:send": (message: Message) => void;
  "message:read": (messageId: string) => void;
  "notification:read": (notificationId: string) => void;
}

export interface ServerToClientEvents {
  "notification:new": (notification: Notification) => void;
  "message:new": (message: Message) => void;
  "message:read": (messageId: string) => void;
  error: (error: Error) => void;
}

export interface SocketClient {
  connect: () => void;
  disconnect: () => void;
  emit: <T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ) => void;
  on: <T extends keyof ServerToClientEvents>(
    event: T,
    handler: ServerToClientEvents[T],
  ) => void;
  off: <T extends keyof ServerToClientEvents>(
    event: T,
    handler: ServerToClientEvents[T],
  ) => void;
}

export type ClientSocket = typeof Socket;
