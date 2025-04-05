export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export const SOCKET_CONFIG = {
  url: SOCKET_URL,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
} as const;
