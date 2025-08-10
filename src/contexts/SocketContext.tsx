import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { Socket } from "socket.io-client";
import socketIO from "socket.io-client";

import { useAuth } from "@/hooks/useAuth";
import { ACTIVE_SOCKET_URL, SOCKET_CONFIG } from "@/config";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  connectionError: string | null;
  connectionState: "disconnected" | "connecting" | "connected" | "error";
  reconnectAttempts: number;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  connectionError: null,
  connectionState: "disconnected",
  reconnectAttempts: 0,
});

// Debug logging utility
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[SocketContext ${timestamp}] ${message}`, data || "");
};

// Error logging utility
const errorLog = (message: string, error?: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[SocketContext ${timestamp}] ❌ ${message}`, error || "");
};

export const SocketProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const { user, isAuthenticated, isInitialized } = useAuth();

  // Refs to prevent memory leaks and race conditions
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const mountedRef = useRef(true);

  // Cleanup timer utility
  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
      debugLog("🧹 Cleared reconnect timer");
    }
  }, []);

  // Safe state update utility
  const safeSetState = useCallback((updateFn: () => void) => {
    if (mountedRef.current) {
      updateFn();
    }
  }, []);

  // Disconnect socket utility
  const disconnectSocket = useCallback(() => {
    debugLog("🔌 Disconnecting socket...");

    if (socketRef.current) {
      // Avoid disconnecting during INITIAL connecting phase to prevent premature closure warnings
      if (socketRef.current.connected) {
        try {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
          debugLog("✅ Socket disconnected successfully");
        } catch (error) {
          errorLog("Failed to disconnect socket", error);
        }
      }
      socketRef.current = null;
    }

    clearReconnectTimer();
    isConnectingRef.current = false;

    safeSetState(() => {
      setSocket(null);
      setConnected(false);
      setConnectionState("disconnected");
    });
  }, [clearReconnectTimer, safeSetState]);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (isConnectingRef.current || !mountedRef.current) {
      debugLog("⚠️ Connection already in progress or component unmounted");
      return;
    }

    // Check prerequisites
    if (!isAuthenticated || !user || !isInitialized) {
      debugLog("⚠️ Cannot connect socket - missing prerequisites", {
        isAuthenticated,
        hasUser: !!user,
        isInitialized,
      });
      return;
    }

    debugLog("🚀 Initializing socket connection", {
      url: ACTIVE_SOCKET_URL,
      userId: user.id,
      userName: user.name,
    });

    isConnectingRef.current = true;

    safeSetState(() => {
      setConnectionState("connecting");
      setConnectionError(null);
    });

    try {
      // Get session token from cookies for socket authentication (direct parsing)
      const sessionToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('session_token='))
        ?.split('=')[1];
      
      // Debug all available cookies
      debugLog("🍪 Available cookies", {
        allCookies: document.cookie,
        sessionToken: sessionToken ? `${sessionToken.substring(0, 20)}...` : null,
        hasToken: !!sessionToken,
        tokenLength: sessionToken?.length || 0
      });

      if (!sessionToken) {
        debugLog("⚠️ No session token found - socket connection may fail");
      }

      // Create socket configuration with proper token handling
      const socketConfig: any = {
        ...SOCKET_CONFIG,
        withCredentials: true,
        transportOptions: {
          polling: {
            extraHeaders: {
              ...(document.cookie && { Cookie: document.cookie }),
            },
          },
          websocket: {
            extraHeaders: {
              ...(document.cookie && { Cookie: document.cookie }),
            },
          },
        },
        transports: ["websocket", "polling"],
        forceNew: true, // Force new connection
      };

      // Only add token-related config if we have a valid token
      if (sessionToken) {
        socketConfig.auth = {
          token: `Bearer ${sessionToken}`,
        };
        socketConfig.query = {
          token: `Bearer ${sessionToken}`,
        };
        socketConfig.transportOptions.polling.extraHeaders.Authorization = `Bearer ${sessionToken}`;
        socketConfig.transportOptions.websocket.extraHeaders.Authorization = `Bearer ${sessionToken}`;
      }

      // Create new socket connection with enhanced configuration
      const newSocket = socketIO(ACTIVE_SOCKET_URL, socketConfig);

      // Enhanced event handlers with debugging
      newSocket.on("connect", () => {
        debugLog("✅ Socket connected successfully", {
          socketId: newSocket.id,
          transport: newSocket.io.engine.transport.name,
        });

        isConnectingRef.current = false;

        safeSetState(() => {
          setConnected(true);
          setConnectionState("connected");
          setConnectionError(null);
          setReconnectAttempts(0);
        });
      });

      newSocket.on("disconnect", (reason: string) => {
        debugLog("🔌 Socket disconnected", { reason });

        safeSetState(() => {
          setConnected(false);
          setConnectionState("disconnected");
        });

        // Handle different disconnect reasons
        if (
          reason === "io server disconnect" ||
          reason === "io client disconnect"
        ) {
          debugLog("🔄 Manual disconnect - not attempting reconnection");
        } else if (isAuthenticated && mountedRef.current) {
          debugLog("🔄 Unexpected disconnect - socket will auto-reconnect");
        }
      });

      newSocket.on("connect_error", (error: any) => {
        errorLog("Socket connection error", {
          message: error?.message,
          description: error?.description,
          context: error?.context,
          type: error?.type,
        });

        isConnectingRef.current = false;

        const errorMessage = error?.message || "Unknown connection error";

        safeSetState(() => {
          setConnected(false);
          setConnectionState("error");
          setConnectionError(errorMessage);
          setReconnectAttempts((prev) => prev + 1);
        });
      });

      newSocket.on("reconnect", (attemptNumber: number) => {
        debugLog("🔄 Socket reconnected", { attemptNumber });

        safeSetState(() => {
          setReconnectAttempts(0);
        });
      });

      newSocket.on("reconnect_attempt", (attemptNumber: number) => {
        debugLog("🔄 Socket reconnection attempt", { attemptNumber });

        safeSetState(() => {
          setConnectionState("connecting");
          setReconnectAttempts(attemptNumber);
        });
      });

      newSocket.on("reconnect_error", (error: any) => {
        errorLog("Socket reconnection error", error);
      });

      newSocket.on("reconnect_failed", () => {
        errorLog("Socket reconnection failed after all attempts");

        safeSetState(() => {
          setConnectionState("error");
          setConnectionError("Failed to reconnect after multiple attempts");
        });
      });

      // Store socket reference
      socketRef.current = newSocket;

      safeSetState(() => {
        setSocket(newSocket);
      });
    } catch (error) {
      errorLog("Failed to initialize socket", error);
      isConnectingRef.current = false;

      safeSetState(() => {
        setConnectionState("error");
        setConnectionError("Failed to initialize socket connection");
      });
    }
  }, [isAuthenticated, user, isInitialized, safeSetState, clearReconnectTimer]);

  // Main effect for socket lifecycle management
  useEffect(() => {
    debugLog("🔄 Socket effect triggered", {
      isAuthenticated,
      hasUser: !!user,
      isInitialized,
      currentState: connectionState,
    });

    if (isAuthenticated && user && isInitialized) {
      // Only initialize if not already connected or connecting
      if (connectionState === "disconnected" || connectionState === "error") {
        initializeSocket();
      }
    } else {
      // Disconnect if user is not authenticated
      if (socketRef.current) {
        debugLog("🔌 User not authenticated - disconnecting socket");
        disconnectSocket();
      }
    }

    // No cleanup here to avoid premature disconnects caused by React 18 Strict Mode
    return undefined;
  }, [
    isAuthenticated,
    user,
    isInitialized,
    connectionState,
    initializeSocket,
    disconnectSocket,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      debugLog("🧹 SocketProvider unmounting");
      mountedRef.current = false;

      // Force cleanup only if socket is connected to avoid premature WebSocket closure warnings
      if (socketRef.current && socketRef.current.connected) {
        try {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        } catch (error) {
          errorLog("Error during unmount cleanup", error);
        }
      }

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        connectionError,
        connectionState,
        reconnectAttempts,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketProvider;
