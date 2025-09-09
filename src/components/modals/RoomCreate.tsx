import { X, Copy, Share2, CheckCircle2, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

interface RoomCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

const RoomCreatedModal = ({ isOpen, onClose, roomId }: RoomCreatedModalProps) => {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 🎉 Show confetti for 3 seconds when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 📐 Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join my room",
        text: `Here’s the room ID: ${roomId}`,
      });
    } else {
      alert("Sharing is not supported in this browser.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 🎊 Confetti */}
          {showConfetti && (
            <Confetti width={windowSize.width} height={windowSize.height} />
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <X size={20} />
              </button>
              <CheckCircle2 size={40} className="mx-auto text-white mb-2" />
              <h2 className="text-2xl font-bold text-white">Room Created!</h2>
              <p className="text-sm text-white/90">Your room is ready to use</p>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 font-semibold mb-2 text-center">
                Room ID
              </p>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 mb-3">
                <span className="font-mono text-gray-800 text-lg">{roomId}</span>
              </div>
              <p className="text-sm text-gray-500 text-center mb-4">
                Share this ID with others to let them join your room
              </p>

              {/* Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <Copy size={16} />
                  {copied ? "Copied!" : "Copy ID"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>

              {/* Quick Tip */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Info size={18} className="text-blue-600 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Quick Tip:</span> Keep this room ID safe. 
                  Anyone with this ID can join your room.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoomCreatedModal;
