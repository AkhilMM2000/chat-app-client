export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface GetMessagesResponse {
  roomId: string;
  messages: Message[];
}
