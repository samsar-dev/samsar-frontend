import { createContext, useContext, useState, useEffect } from "react";
import type { Socket } from "socket.io-client";
import socketIO from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { SOCKET_URL, SOCKET_CONFIG } from "@/config/socket";

interface SocketContextType {
  socket: typeof Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const SocketProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = socketIO(SOCKET_URL, {
        ...SOCKET_CONFIG,
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      newSocket.on("connect", () => {
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
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
