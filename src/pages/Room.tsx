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
import { motion } from "framer-motion";
import { MessageSquare, Zap, Shield } from "lucide-react";

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
    console.log("handleJoinRoom clicked", { roomData, hasSocket: !!socket, connected: socket?.connected });
    if (!roomData || !socket) {
      console.warn("Early return: missing roomData or socket", { roomData, socket });
      return;
    }

    if (!socket.connected) {
      console.warn("Socket is NOT connected! Attempting to connect...");
      socket.connect();
    }

    // Debug all incoming socket events to see if the server responds at all
    socket.onAny((eventName, ...args) => {
      console.log("Incoming socket event:", eventName, args);
    });

    socket.emit("joinRoom", { roomId: roomData.roomId });

    socket.once("roomJoined", (data) => {
      console.log("Room joined successfully!", data);
      toast.success(`🎉 Joined room ${data.roomId}`);

      setIsOpen(false);

      navigate(`/chat/${data.roomId}`);
    });

    socket.once("joinRoomError", (err) => {
      toast.error(err.message || "Failed to join room");
    });
  };

  return (
    <div className="py-24 px-6 relative overflow-hidden">
      {/* Background Orbs for Depth */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/40"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">
              Mission <span className="text-purple-500">Control</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium tracking-wide">Select or establish a secure frequency.</p>
          </div>

          {/* Join Room */}
          <div className="space-y-4 mb-10 relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Frequency ID</label>
              <div className="h-[1px] flex-1 bg-white/5 mx-4" />
            </div>
            <div className="relative group">
              <input
                type="text"
                placeholder="Enter unique room frequency..."
                value={JoinroomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner group-hover:border-white/20 transition-all font-mono text-sm tracking-wider"
              />
            </div>
            <Button
              label="SYNCHRONIZE"
              disabled={JoinroomId.length < 14}
              onClick={handlePreview}
              className={`w-full py-4 rounded-2xl font-black tracking-widest text-xs uppercase shadow-xl transition-all active:scale-95 ${
                JoinroomId.length >= 14 
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/40" 
                : "bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5"
              }`}
            >
              INITIALIZE CONNECTION
            </Button>
          </div>

          <div className="relative flex items-center justify-center my-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5 opacity-50"></div>
            </div>
            <span className="relative z-10 px-6 py-1 bg-gray-900 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] rounded-full border border-white/5">
              OR
            </span>
          </div>

          {/* Create Room */}
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 animate-pulse">
                <Zap size={32} />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest mb-1">Generate Frequency</h2>
                <p className="text-[11px] text-gray-500 font-medium">Create a new private encrypted channel.</p>
              </div>
            </div>
            
            <Button
              label={loading ? "Generating..." : "GENERATE ROOM"}
              disabled={loading}
              onClick={handleCreateRoom}
              className="w-full py-5 bg-white text-black hover:bg-gray-100 font-black tracking-[0.2em] text-xs rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <MessageSquare size={18} />
              )}
              {loading ? "PROCESSING..." : "ESTABLISH CHANNEL"}
            </Button>

            {/* 🎉 Modal Logic */}
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
              roomName={`Channel ${roomData?.roomId?.substring(0, 8)}`}
              participants={roomData?.participants || []}
            />
          </div>
        </motion.div>
        
        {/* Helper Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center justify-center gap-2">
            End-to-End Encryption Enabled <Shield size={10} className="text-teal-500" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Room;
