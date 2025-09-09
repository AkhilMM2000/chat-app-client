import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Participant {
  id?: string;
  name: string;
}

interface RoomPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
  roomName: string;
  participants?: Participant[];
}

const RoomPreviewModal: React.FC<RoomPreviewModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  roomName,
  participants = [],
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md mx-4 rounded-3xl shadow-2xl overflow-hidden bg-[#1e1f2e]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/20 text-white text-lg">
                  💬
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{roomName}</h2>
                  <p className="text-sm text-green-200">
                    ● {participants.length} participants
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
     
            {/* Participants List */}
            <div className="px-6 py-4">
              <h3 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                👥 Active Members
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {participants.length > 0 ? (
                  participants.map((p, index) => (
                    <div
                      key={p.id ?? index}
                      className="flex items-center gap-4 p-3 rounded-xl bg-[#2b2c40] border border-white/10"
                    >
                      {/* Avatar */}
                      <div className="relative w-12 h-12 flex items-center justify-center rounded-xl text-white font-bold text-lg bg-gradient-to-tr from-pink-500 to-purple-600">
                        {p.name?.charAt(0).toUpperCase()}
                        {/* Status Dot */}
                        <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 border-2 border-[#2b2c40] rounded-full"></span>
                      </div>
                      {/* Name */}
                      <span className="text-white font-medium">{p.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">
                    No participants yet
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-[#262738]">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={onJoin}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition flex items-center gap-2"
              >
                Join Room 💬
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoomPreviewModal;
