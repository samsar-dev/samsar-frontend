// Socket events constants - optimized for tree shaking
export const SOCKET_EVENTS = {
  ALERT: "ALERT",
  REFETCH_CHATS: "REFETCH_CHATS",
  NEW_MESSAGE_ALERT: "NEW_MESSAGE_ALERT",
  NEW_ATTACHMENT: "NEW_ATTACHMENT",
  NEW_MESSAGE: "NEW_MESSAGE",
  PRICE_CHANGE: "PRICE_CHANGE",
  USER_ONLINE_STATUS: "USER_ONLINE_STATUS",
} as const;

// Named exports for backward compatibility (tree-shakable)
export const {
  ALERT,
  REFETCH_CHATS,
  NEW_MESSAGE_ALERT,
  NEW_ATTACHMENT,
  NEW_MESSAGE,
  PRICE_CHANGE,
  USER_ONLINE_STATUS,
} = SOCKET_EVENTS;

// Type for socket event names
export type SocketEventName = keyof typeof SOCKET_EVENTS;
