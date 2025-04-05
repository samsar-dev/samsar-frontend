import io from "socket.io-client";
import type { UseSocketOptions } from "@/types/socket";
import { SOCKET_URL, SOCKET_CONFIG } from "@/config/socket";

export const connectSocket = (config: Partial<UseSocketOptions> = {}) => {
  return io(config.url ?? SOCKET_URL, {
    autoConnect: config.autoConnect ?? SOCKET_CONFIG.autoConnect,
    reconnection: config.reconnection ?? SOCKET_CONFIG.reconnection,
    reconnectionAttempts:
      config.reconnectionAttempts ?? SOCKET_CONFIG.reconnectionAttempts,
    reconnectionDelay:
      config.reconnectionDelay ?? SOCKET_CONFIG.reconnectionDelay,
    timeout: config.timeout ?? SOCKET_CONFIG.timeout,
    auth: config.auth,
    query: config.query,
  });
};
