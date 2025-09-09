export interface Participant {
  id: string;
  name: string;
}

export interface GetRoomResponse {
  roomId: string;
  participants: Participant[];
}
