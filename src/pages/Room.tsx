import React, { useState } from "react";
import { createRoom } from "../services/chatService";
import Button from "../components/ui/Button";
import RoomCreatedModal from "../components/modals/RoomCreate";
import RoomPreviewModal from "../components/modals/JoinRoom";
import { fetchRoomById } from "../services/room";
import type { GetRoomResponse } from "../types/Room";
import toast from "react-hot-toast";
import { useSocket } from "../hooks/useSocket";
import { useNavigate } from "react-router-dom";

const Room: React.FC = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  //for roomjoin modal
  const [isOpen, setIsOpen] = useState(false);
  const [JoinroomId, setJoinRoomId] = useState<string>("");
  const [roomData, setRoomData] = useState<GetRoomResponse | null>(null);
  
  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      const { roomId } = await createRoom();

      setRoomId(roomId);
      setIsModalOpen(true);
    } catch (err: any) {
      if (err.response?.status === 409) {
        import("react-hot-toast").then(({ default: toast }) => {
          toast.error(err.response.data.message || "Room already exists");
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const data = await fetchRoomById(JoinroomId);

      setRoomData(data);
      setIsOpen(true);
    } catch (error) {
      toast.error("❌ Room not found", {
        icon: "🚫",
      });
    }
  };
  const handleJoinRoom = () => {
    if (!roomData || !socket) return;

    socket.emit("joinRoom", { roomId: roomData.roomId });

    socket.once("roomJoined", (data) => {
      toast.success(`🎉 Joined room ${data.roomId}`);

      setIsModalOpen(false);

      navigate(`/chat/${data.roomId}`);
    });

    socket.once("joinRoomError", (err) => {
      toast.error(err.message || "Failed to join room");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 pt-20">
      <div className="max-w-lg mx-auto p-6 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Manage Chat Rooms
        </h1>

        {/* Join Room */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            Join a Room
          </h2>
          <input
            type="text"
            placeholder="🔑 Enter Room ID"
            value={JoinroomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          />
          <Button
            label="Join Room"
            disabled={JoinroomId.length < 14}
            onClick={handlePreview}
            className="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            Join Room
          </Button>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <span className="absolute px-3 bg-white/80 text-gray-600 text-sm font-medium rounded-lg">
            OR
          </span>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        {/* Create Room */}
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            Create a Room
          </h2>
          <Button
            label="Create Room"
            disabled={loading}
            onClick={handleCreateRoom}
          >
            {loading ? "Creating..." : "Create Room"}
          </Button>

          {/* 🎉 Show modal when room is created */}
          {roomId && (
            <RoomCreatedModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              roomId={roomId}
            />
          )}
          <RoomPreviewModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onJoin={handleJoinRoom}
            roomName={`Room ${roomData?.roomId}`}
            participants={roomData?.participants || []}
          />
        </div>
      </div>
    </div>
  );
};

export default Room;
