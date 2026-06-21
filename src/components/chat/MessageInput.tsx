import React, { useRef, useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
import { Smile, Image as ImageIcon, Send, X, Paperclip, ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageInputProps {
  onSendMessage: (data: { content: string; type: string; mediaUrl: string | null }) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    setPreviewUrl(null);
  }, [selectedFile]);

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

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [newMessage]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    const lastAtPos = value.lastIndexOf("@", cursorPosition - 1);

    setNewMessage(value);

    if (
      lastAtPos !== -1 &&
      (cursorPosition === lastAtPos + 1 ||
        /^@[a-zA-Z]*$/.test(value.substring(lastAtPos, cursorPosition)))
    ) {
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
    const insertFrom = lastAtPos === -1 ? cursorPosition : lastAtPos;
    const newValue =
      value.substring(0, insertFrom) +
      `@${mention} ` +
      value.substring(cursorPosition);

    setNewMessage(newValue);
    setShowMentions(false);

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

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
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

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async () => {
    if (disabled) return;
    if (!newMessage.trim() && !selectedFile) return;

    let mediaUrl = null;
    let messageType = "text";

    if (selectedFile) {
      mediaUrl = await uploadFile(selectedFile);
      if (!mediaUrl) return;

      messageType = selectedFile.type.startsWith("image/") ? "image" : "file";
      clearSelectedFile();
    }

    onSendMessage({
      content: newMessage.trim(),
      type: messageType,
      mediaUrl,
    });

    onTypingStop();
    setNewMessage("");
    setShowEmojiPicker(false);
    setShowMentions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && (e.key === "Enter" || e.key === "Tab")) {
      e.preventDefault();
      handleMentionSelect("assistant");
      return;
    }

    const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
    if (e.key === "Enter" && !e.shiftKey && !isMobileViewport) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const isSendDisabled = disabled || isUploading || (!newMessage.trim() && !selectedFile);
  const fileTypeLabel = (selectedFile?.type.split("/")[1] || "file").toUpperCase();

  return (
    <div className="relative shrink-0">
      <AnimatePresence>
        {showMentions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full left-3 right-3 z-50 mb-3 max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-gray-950/95 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:left-4 sm:right-auto sm:w-64"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Suggestions</span>
              <div className="flex items-center gap-1 text-[8px] font-bold text-gray-600">
                <span className="rounded bg-gray-800 px-1 py-0.5">ENTER</span>
                <span>TO SELECT</span>
              </div>
            </div>
            <button
              onClick={() => handleMentionSelect("assistant")}
              className="group flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/20 to-blue-500/20 shadow-lg transition-transform group-hover:scale-105">
                <ShieldCheck size={20} className="text-teal-400" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                  Assistant
                  <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                </span>
                <span className="text-[10px] font-medium tracking-tight text-gray-500">AI Powered Help</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showEmojiPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-full left-3 right-3 z-50 mb-3 max-w-[350px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:left-4 sm:right-auto"
          >
            <EmojiPicker
              theme={Theme.DARK}
              onEmojiClick={onEmojiClick}
              lazyLoadEmojis={true}
              searchPlaceholder="Search emojis..."
              width="100%"
              height={420}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between gap-3 border-t border-white/5 bg-gray-950/90 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4"
          >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gray-800 shadow-lg sm:h-16 sm:w-16">
                {previewUrl ? (
                  <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-500">
                    <Paperclip size={24} />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="max-w-[180px] truncate text-sm font-bold text-white sm:max-w-[320px]">
                  {selectedFile.name}
                </span>
                <span className="truncate text-xs font-medium text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB - {fileTypeLabel}
                </span>
              </div>
            </div>
            <button
              onClick={clearSelectedFile}
              className="rounded-xl bg-gray-800 p-2 text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-400 active:scale-90"
              title="Remove file"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-white/5 bg-gray-900/40 p-3 backdrop-blur-2xl sm:p-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <div className="flex min-w-0 flex-1 items-end gap-2 sm:gap-3">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={disabled ? "Connecting to room..." : isUploading ? "Uploading file..." : "Type a message..."}
              value={newMessage}
              disabled={disabled || isUploading}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="max-h-36 min-h-11 w-full resize-none overflow-y-auto rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium leading-5 text-white shadow-inner outline-none transition-all placeholder:text-gray-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              onClick={() => {
                void handleSendMessage();
              }}
              disabled={isSendDisabled}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-2xl transition-all duration-300 sm:h-12 sm:w-12 ${
                isSendDisabled
                  ? "cursor-not-allowed bg-gray-800 text-gray-600 grayscale"
                  : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white hover:scale-105 hover:shadow-purple-500/40 active:scale-95"
              }`}
              title="Send message"
            >
              {isUploading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          <div className="flex w-full items-center justify-between gap-1 rounded-2xl border border-white/5 bg-white/5 p-1 sm:w-auto sm:justify-start">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-white/5 hover:text-white active:scale-95"
              disabled={disabled || isUploading}
              title="Attach File"
            >
              <ImageIcon size={20} />
            </button>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all active:scale-95 ${
                showEmojiPicker ? "bg-purple-500/10 text-purple-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
              disabled={disabled || isUploading}
              title="Emojis"
            >
              <Smile size={20} />
            </button>
            <button
              onClick={handleAIButtonClick}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-teal-400 transition-all hover:bg-teal-500/10 hover:text-teal-300 active:scale-95"
              disabled={disabled || isUploading}
              title="Ask AI Assistant"
            >
              <Sparkles size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
