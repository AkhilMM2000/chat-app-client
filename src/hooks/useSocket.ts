import { useContext, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used inside SocketProvider");
  }
  return context;
};

export const useSocket = () => {
  const { socket, connectSocket } = useSocketContext();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && !socket) connectSocket(accessToken);
  }, [socket, connectSocket]);

  return socket;
};
