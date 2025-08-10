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
    if (socketRef.current) {
      // Avoid disconnecting during INITIAL connecting phase to prevent premature closure warnings
      if (socketRef.current.connected) {
        try {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        } catch (error) {
          // Silent error handling
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
      return;
    }

    if (!isAuthenticated || !user || !isInitialized) {
      return;
    }

    isConnectingRef.current = true;

    safeSetState(() => {
      setConnectionState("connecting");
      setConnectionError(null);
    });

    try {
      const sessionToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session_token="))
        ?.split("=")[1];

      if (!sessionToken) {
        return;
      }

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
        forceNew: true,
      };

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

      const newSocket = socketIO(ACTIVE_SOCKET_URL, socketConfig);

      newSocket.on("connect", () => {
        isConnectingRef.current = false;

        safeSetState(() => {
          setConnected(true);
          setConnectionState("connected");
          setConnectionError(null);
          setReconnectAttempts(0);
        });
      });

      newSocket.on("disconnect", (reason: string) => {
        safeSetState(() => {
          setConnected(false);
          setConnectionState("disconnected");
        });

        if (reason === "io server disconnect" || reason === "io client disconnect") {}
        else if (isAuthenticated && mountedRef.current) {}
      });

      newSocket.on("connect_error", (error: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.error("Socket connection error", {
            message: error?.message,
            description: error?.description,
            context: error?.context,
            type: error?.type,
          });
        }

        isConnectingRef.current = false;

        const errorMessage = error?.message || "Unknown connection error";

        safeSetState(() => {
          setConnected(false);
          setConnectionState("error");
          setConnectionError(errorMessage);
          setReconnectAttempts((prev) => prev + 1);
        });
      });

      newSocket.on("reconnect", () => {
        safeSetState(() => {
          setReconnectAttempts(0);
        });
      });

      newSocket.on("reconnect_attempt", (attemptNumber: number) => {
        safeSetState(() => {
          setConnectionState("connecting");
          setReconnectAttempts(attemptNumber);
        });
      });

      newSocket.on("reconnect_error", () => {});

      newSocket.on("reconnect_failed", () => {
        safeSetState(() => {
          setConnectionState("error");
          setConnectionError("Failed to reconnect after multiple attempts");
        });
      });

      socketRef.current = newSocket;

      safeSetState(() => {
        setSocket(newSocket);
      });
    } catch (error) {
      isConnectingRef.current = false;

      safeSetState(() => {
        setConnectionState("error");
        setConnectionError("Failed to initialize socket connection");
      });
    }
  }, [isAuthenticated, user, isInitialized, safeSetState, clearReconnectTimer]);

  useEffect(() => {


    if (isAuthenticated && user && isInitialized) {
      if (connectionState === "disconnected" || connectionState === "error") {
        initializeSocket();
      }
    } else {
      // Disconnect if user is not authenticated
      if (socketRef.current) {

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

      mountedRef.current = false;

      // Force cleanup only if socket is connected to avoid premature WebSocket closure warnings
      if (socketRef.current && socketRef.current.connected) {
        try {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        } catch (error) {

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
