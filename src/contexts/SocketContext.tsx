import { createContext, useContext, useState, useEffect } from "react";
import type { Socket } from "socket.io-client";
import socketIO from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { SOCKET_URL, SOCKET_CONFIG } from "@/config/socket";

interface SocketContextType {
  socket: typeof Socket | null;
  connected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  connectionError: null,
});

export const SocketProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    let newSocket: any = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const initializeSocket = () => {
      if (!isAuthenticated || !user) {
        return;
      }

      // Clear any previous connection error
      setConnectionError(null);

      try {
        console.log("Initializing socket connection to:", SOCKET_URL);

        // Create new socket connection
        newSocket = socketIO(SOCKET_URL, {
          auth: {
            token: "Bearer " + localStorage.getItem("token"),
          },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
        });

        // Set up event handlers
        newSocket.on("connect", () => {
          setConnected(true);
          setConnectionError(null);
          console.log("Socket connected");
        });

        newSocket.on("disconnect", (reason: string) => {
          setConnected(false);
          console.log(`Socket disconnected: ${reason}`);

          // If disconnected due to transport close, try to reconnect
          if (reason === "transport close" && isAuthenticated) {
            console.log("Attempting to reconnect socket...");
          }
        });

        newSocket.on("connect_error", (error: any) => {
          setConnected(false);
          const errorMessage = error?.message || "Unknown connection error";
          setConnectionError(errorMessage);
          console.error("Socket connection error:", error);
        });

        // Save the socket instance
        setSocket(newSocket);
      } catch (error) {
        console.error("Error initializing socket:", error);
        setConnectionError("Failed to initialize socket connection");
      }
    };

    // Initialize socket
    initializeSocket();

    // Cleanup function
    return () => {
      if (newSocket) {
        console.log("Cleaning up socket connection");
        newSocket.disconnect();
        setSocket(null);
      }

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, connected, connectionError }}>
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
