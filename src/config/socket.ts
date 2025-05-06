import { ACTIVE_SOCKET_URL } from "@/config";

export const SOCKET_URL = ACTIVE_SOCKET_URL;

export const SOCKET_CONFIG = {
  url: SOCKET_URL,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
} as const;
