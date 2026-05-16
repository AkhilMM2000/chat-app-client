import React from "react";

interface TypingIndicatorProps {
  names: string[];
}

import { motion, AnimatePresence } from "framer-motion";

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ names }) => {
  return (
    <AnimatePresence>
      {names.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
          className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 text-xs font-bold text-gray-400 max-w-fit shadow-2xl shadow-black/50 overflow-hidden"
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.15 
                }}
                className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]"
              />
            ))}
          </div>
          <span className="tracking-wide">
            {names.length === 1
              ? `${names[0]} is typing...`
              : names.length === 2
              ? `${names[0]} and ${names[1]} are typing...`
              : "Multiple people are typing..."}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
