import React from "react";

interface TypingIndicatorProps {
  names: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ names }) => {
  if (names.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-800/50 text-sm text-gray-400 max-w-fit animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
      </div>
      <span>
        {names.length === 1
          ? `${names[0]} is typing...`
          : names.length === 2
          ? `${names[0]} and ${names[1]} are typing...`
          : "Multiple people are typing..."}
      </span>
    </div>
  );
};
