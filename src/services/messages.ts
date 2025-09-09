
import type { GetMessagesResponse } from "../types/messages"; 
import axiosInstance from "./axiosInstance";

export const fetchMessages = async (roomId: string, limit = 50): Promise<GetMessagesResponse> => {
  const response = await axiosInstance.get<GetMessagesResponse>(`/chat/room/${roomId}/messages`, {
    params: { limit },
  });
  return response.data;
};
