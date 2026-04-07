
import type { GetMessagesResponse } from "../types/messages"; 
import axiosInstance from "./axiosInstance";

export const fetchMessages = async (roomId: string, limit = 50, beforeId?: string): Promise<GetMessagesResponse> => {
  const response = await axiosInstance.get<GetMessagesResponse>(`/chat/room/${roomId}/messages`, {
    params: { limit, beforeId },
  });
  return response.data;
};
