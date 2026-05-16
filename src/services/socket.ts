import axios from "axios";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export const initSocket = (accessToken: string) => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
  socket = io(socketUrl, {
    auth: { token: accessToken },
    withCredentials: true,
  });

  // handle expired token
  socket.on("connect_error", async (err: Error & { type?: string; message?: string }) => {
    if (err.type === "TOKEN_EXPIRED") {
      try {
        // 1. refresh
        const { data } = await axios.post<{accessToken:string}>(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {}, { withCredentials: true });

        // 2. disconnect old socket
        socket.disconnect();

        // 3. create new socket with fresh token
        const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
        socket = io(socketUrl, {
          auth: { token: data.accessToken },   
          withCredentials: true,
        });

      } catch (refreshErr) {
        console.error("Refresh failed", refreshErr);
      }
    }
  });

  return socket;
};
