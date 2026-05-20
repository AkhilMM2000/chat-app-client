import React, { useRef, useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
import { Smile, Image as ImageIcon, Send, X, Paperclip, ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageInputProps {

  onSendMessage: (data: { content: string; type: string; mediaUrl: string | null }) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({

  onSendMessage,
  onTypingStart,
  onTypingStop,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // 🧹 Cleanup Preview URL
  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  // 🖱️ Click away listeners
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      setShowMentions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    const lastAtPos = value.lastIndexOf("@", cursorPosition - 1);
    
    setNewMessage(value);
    
    // Check if we just typed @ or are in a word starting with @
    if (lastAtPos !== -1 && (cursorPosition === lastAtPos + 1 || value.substring(lastAtPos, cursorPosition).match(/^@[a-zA-Z]*$/))) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }

    onTypingStart();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleMentionSelect = (mention: string) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const value = newMessage;
    const lastAtPos = value.lastIndexOf("@", cursorPosition - 1);
    
    const newValue = value.substring(0, lastAtPos) + `@${mention} ` + value.substring(cursorPosition);
    setNewMessage(newValue);
    setShowMentions(false);
    
    // Reset focus to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleAIButtonClick = () => {
    if (!newMessage.includes("@assistant")) {
      setNewMessage((prev) => prev + (prev.length > 0 && !prev.endsWith(" ") ? " " : "") + "@assistant ");
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const { data } = await axiosInstance.post("/chat/media/upload-url", {
        fileName: file.name,
        fileType: file.type,
      });

      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      return data.mediaUrl;
    } catch (error) {
      console.error("Upload failed", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    
    let mediaUrl = null;
    let messageType = "text";

    if (selectedFile) {
      mediaUrl = await uploadFile(selectedFile);
      if (!mediaUrl) return; 

      messageType = selectedFile.type.startsWith("image/") ? "image" : "file";
      setSelectedFile(null); 
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    onSendMessage({
      content: newMessage.trim(),
      type: messageType,
      mediaUrl: mediaUrl
    });

    onTypingStop();
    setNewMessage("");
    setShowEmojiPicker(false);
    setShowMentions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentions && (e.key === "Enter" || e.key === "Tab")) {
      e.preventDefault();
      handleMentionSelect("assistant");
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const renderHighlightedText = (text: string) => {
    // Regex to match @assistant (case insensitive) and wrap in a styled pill
    const parts = text.split(/(@assistant)/gi);
    return parts.map((part, i) => {
      if (part.toLowerCase() === "@assistant") {
        return (
          <span 
            key={i} 
            className="px-1.5 py-0.5 mx-[-1px] rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold shadow-[0_0_10px_rgba(20,184,166,0.2)] inline-flex items-center gap-1"
          >
            <ShieldCheck size={12} className="inline" />
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="relative shrink-0">
      {/* 🔮 Mentions Autosuggestion */}
      <AnimatePresence>
        {showMentions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-24 left-4 z-50 w-64 bg-gray-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Suggestions</span>
              <div className="flex items-center gap-1 text-[8px] text-gray-600 font-bold">
                <span className="bg-gray-800 px-1 py-0.5 rounded">ENTER</span>
                <span>TO SELECT</span>
              </div>
            </div>
            <button
              onClick={() => handleMentionSelect("assistant")}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center border border-teal-500/30 group-hover:scale-105 transition-transform shadow-lg">
                <ShieldCheck size={20} className="text-teal-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  Assistant
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-tight">AI Powered Help</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 😃 Emoji Picker */}
      <AnimatePresence mode="wait">
        {showEmojiPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-24 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10"
          >
            <EmojiPicker 
              theme={Theme.DARK} 
              onEmojiClick={onEmojiClick}
              lazyLoadEmojis={true}
              searchPlaceholder="Search emojis..."
              width={350}
              height={450}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🖼️ File Preview */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-4 bg-gray-950/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative group w-16 h-16 bg-gray-800 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <Paperclip size={24} />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white truncate max-w-[200px]">{selectedFile.name}</span>
                <span className="text-xs text-gray-500 font-medium">{(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.split('/')[1].toUpperCase()}</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="p-2 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all active:scale-90"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⌨️ Input Bar */}
      <div className="p-4 border-t border-white/5 bg-gray-900/40 backdrop-blur-2xl flex items-center gap-3">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,.pdf,.doc,.docx"
        />
        
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-white p-2.5 rounded-xl hover:bg-white/5 transition-all active:scale-95"
            disabled={isUploading}
            title="Attach File"
          >
            <ImageIcon size={20} />
          </button>
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              showEmojiPicker ? "text-purple-400 bg-purple-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            disabled={isUploading}
            title="Emojis"
          >
            <Smile size={20} />
          </button>
          <button 
            onClick={handleAIButtonClick}
            className="text-teal-400 hover:text-teal-300 p-2.5 rounded-xl hover:bg-teal-500/10 transition-all active:scale-95"
            disabled={isUploading}
            title="Ask AI Assistant"
          >
            <Sparkles size={20} />
          </button>
        </div>

        <div className="flex-1 relative group overflow-hidden">
          {/* 💎 Ghost Highlighting Layer */}
          <div 
            className="absolute inset-0 pl-4 pr-12 py-3.5 text-sm font-medium pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
            aria-hidden="true"
          >
            {renderHighlightedText(newMessage)}
            {/* Invisible cursor placeholder to match input scroll if needed */}
            <span className="opacity-0">|</span>
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder={isUploading ? "Uploading file..." : "Type a message... (Click ✨ to ask AI)"}
            value={newMessage}
            disabled={isUploading}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-white/5 text-transparent caret-white pl-4 pr-12 py-3.5 rounded-2xl outline-none placeholder-gray-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-purple-500/20 transition-all border border-white/5 shadow-inner relative z-10"
          />
        </div>

        <button
          onClick={() => { void handleSendMessage(); }}
          disabled={isUploading || (!newMessage.trim() && !selectedFile)}
          className={`p-3.5 rounded-2xl transition-all duration-300 shadow-2xl flex items-center justify-center ${
            isUploading || (!newMessage.trim() && !selectedFile)
              ? "bg-gray-800 text-gray-600 grayscale cursor-not-allowed" 
              : "bg-gradient-to-br from-purple-500 to-indigo-600 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 text-white"
          }`}
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
};
