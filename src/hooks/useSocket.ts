import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { logout } from "../services/authService";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    let socketInstance: Socket | null = null;
    let triedRefresh = false;

    const connectSocket = (token: string) => {
      const s = io("http://localhost:5000", {
        auth: { token },
        withCredentials: true,
        autoConnect: true,
        reconnection: false, 
      });

      s.on("connect_error", async (err: any) => {
        if (
          !triedRefresh &&
          ["TOKEN_EXPIRED", "INVALID_TOKEN", "NO_TOKEN"].includes(err.message)
        ) {
          triedRefresh = true;
          console.log(err,'err message')
          try {
            const { data } = await axios.post<{accessToken:string}>(
              `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
              {},
              { withCredentials: true }
            );
        
            localStorage.setItem("accessToken", data.accessToken);
        
            // reconnect with new token
            s.disconnect();
         
            connectSocket(data.accessToken);
          
          } catch {
            console.error("⚠️ Refresh failed → logging out");
            await logout();
            localStorage.removeItem("accessToken");
            window.location.href = "/";
          }
        }
      });

      socketInstance = s;
      setSocket(s);
      return s;
    };

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      connectSocket(accessToken);
    }

    return () => {
      socketInstance?.disconnect();
    };
  }, []);

  return socket;
};
