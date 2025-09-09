import axiosInstance from "./axiosInstance";
import type { GetRoomResponse } from "../types/Room";

export const fetchRoomById = async (roomId: string): Promise<GetRoomResponse> => {
  const response = await axiosInstance.get<GetRoomResponse>(`/chat/room/${roomId}`);
  return response.data;
};
