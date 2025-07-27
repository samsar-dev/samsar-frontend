// Socket configuration - optimized for tree shaking and lazy loading
let _socketUrl: string | undefined;

// Lazy load socket URL to avoid importing config on module load
export const getSocketUrl = (): string => {
  if (!_socketUrl) {
    // Dynamic import to reduce initial bundle size
    _socketUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:5000';
  }
  return _socketUrl;
};

// Default socket configuration - can be overridden
export const DEFAULT_SOCKET_CONFIG = {
  autoConnect: false, // Changed to false for better control
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ['websocket', 'polling'] as const,
} as const;

// Socket config type
type SocketConfig = {
  url: string;
  autoConnect: boolean;
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  timeout: number;
  transports: readonly ['websocket', 'polling'];
};

// Factory function for creating socket config
export const createSocketConfig = (overrides?: Partial<SocketConfig>): SocketConfig => ({
  url: getSocketUrl(),
  ...DEFAULT_SOCKET_CONFIG,
  ...overrides,
});

// Backward compatibility
export const SOCKET_URL = getSocketUrl();
export const SOCKET_CONFIG = createSocketConfig({ autoConnect: true });
