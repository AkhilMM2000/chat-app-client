import type { CreateRoomResponse } from "../types/ChatRoom";
import axiosInstance from "./axiosInstance";

export const createRoom = async (): Promise<CreateRoomResponse> => {
  const response = await axiosInstance.post<CreateRoomResponse>("/chat/room");
  return response.data;
};