import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import axios from "axios";
import { logout } from "../services/authService";

interface SocketContextValue {
  socket: Socket | null;
  connectSocket: (accessToken: string) => Socket;
  disconnectSocket: () => void;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const disconnectSocket = useCallback(() => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;

    currentSocket.removeAllListeners();
    currentSocket.disconnect();
    socketRef.current = null;
    setSocket(null);
  }, []);

  const connectSocket = useCallback((accessToken: string) => {
    const existingSocket = socketRef.current;
    if (existingSocket) {
      existingSocket.auth = { token: accessToken };
      if (!existingSocket.connected) existingSocket.connect();
      return existingSocket;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
    const newSocket = io(socketUrl, {
      auth: { token: accessToken },
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
    });

    let triedRefresh = false;

    newSocket.on("connect", () => {
      triedRefresh = false;
      console.log(`[Socket] Connected with ID ${newSocket.id}`);
    });

    newSocket.on("connect_error", async (error: Error) => {
      if (
        triedRefresh ||
        !["TOKEN_EXPIRED", "INVALID_TOKEN", "NO_TOKEN"].includes(error.message)
      ) {
        return;
      }

      triedRefresh = true;
      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        localStorage.setItem("accessToken", data.accessToken);
        newSocket.auth = { token: data.accessToken };
        newSocket.connect();
      } catch {
        console.error("Socket token refresh failed; logging out");
        await logout();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    newSocket.connect();
    return newSocket;
  }, []);

  useEffect(() => disconnectSocket, [disconnectSocket]);

  const value = useMemo(
    () => ({ socket, connectSocket, disconnectSocket }),
    [socket, connectSocket, disconnectSocket],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
