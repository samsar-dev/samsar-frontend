import io from "socket.io-client";
import type { UseSocketOptions } from "@/types/socket";
import { ACTIVE_SOCKET_URL, SOCKET_CONFIG } from "@/config";

export const connectSocket = (config: Partial<UseSocketOptions> = {}) => {
  const { url, ...restConfig } = config;
  return io(url ?? ACTIVE_SOCKET_URL, {
    ...SOCKET_CONFIG,
    ...restConfig,
  });
};
