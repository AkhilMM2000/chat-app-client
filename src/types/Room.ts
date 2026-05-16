export interface Participant {
  id: string;
  name: string;
  profilePic?: string;
}

export interface GetRoomResponse {
  roomId: string;
  participants: Participant[];
}
