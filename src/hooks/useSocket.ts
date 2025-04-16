import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { Manager } from "socket.io-client";
import { useAuth } from "./useAuth";

export interface UseSocketResult {
  socket: typeof Socket | null;
  isConnected: boolean;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
}

export const useSocket = (): UseSocketResult => {
  const socketRef = useRef<typeof Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const manager = new Manager("https://tijara-backend-production.up.railway.app", {
        auth: {
          token: localStorage.getItem("token"),
        },
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        secure: true,
        path: "/socket.io/"
      });

      const socket = manager.socket("/");

      socket.on("connect", () => {
        console.log("Socket connected");
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("error", (error: Error) => {
        console.error("Socket error:", error);
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [user]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    on: (event, callback) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback);
      }
    },
    off: (event, callback) => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    },
    emit: (event, ...args) => {
      if (socketRef.current) {
        socketRef.current.emit(event, ...args);
      }
    },
  };
};
