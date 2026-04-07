import { useEffect, useRef, useState } from "react";
import type { Message } from "../types/messages";
import { useParams } from "react-router-dom";
import { fetchMessages } from "../services/messages";
import { getCurrentUser } from "../utils/auth";
import { useSocket } from "../hooks/useSocket";
import { TypingIndicator } from "../components/chat/TypingIndicator";
import axiosInstance from "../services/axiosInstance";


const GroupChat:React.FC = () =>  {
  const socket = useSocket();
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState(""); // ✅ input state
  const currentUser = getCurrentUser();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const loadMessages = async () => {
      try {
        const data = await fetchMessages(roomId, 50);
        setMessages(data.messages);
        if (data.messages.length < 50) setHasMore(false);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    loadMessages();
  }, [roomId]);

  const handleScroll = async () => {
    if (!messagesContainerRef.current || !hasMore || isLoadingMore) return;
    
    // If scrolled to top
    if (messagesContainerRef.current.scrollTop === 0) {
      if (messages.length === 0) return;
      setIsLoadingMore(true);
      const oldestMessageId = messages[0].id; // The oldest message is first in the array
      
      try {
        const data = await fetchMessages(roomId!, 50, oldestMessageId);
        
        // Retain scroll position
        const previousScrollHeight = messagesContainerRef.current.scrollHeight;
        
        setMessages(prev => [...data.messages, ...prev]);
        
        if (data.messages.length < 50) setHasMore(false);

        // Adjust scroll position perfectly after DOM update
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - previousScrollHeight;
          }
        }, 0);
        
      } catch (e) {
        console.error("Failed to fetch older messages:", e);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };
useEffect(() => {
  if (!roomId || !socket) return;

  // (optional) ensure connection if your hook doesn't auto-connect
  if (!socket.connected) socket.connect();

  // join the room (safe even if already joined; your backend de-dupes)
  socket.emit("joinRoom", { roomId });

  // handlers
  const handleMessageSent = (msg: Message) => {
  
    setMessages(prev => [...prev, msg]);
  };

  const handleNewMessage = (msg: Message) => {
    // append messages from others
    setMessages(prev => [...prev, msg]);
  };

  socket.on("messageSent", handleMessageSent);
  socket.on("newMessage", handleNewMessage);

  // Status & Presence
  socket.on("USER_STATUS_CHANGE", (data: { userId: string; status: "online" | "offline"; onlineCount: number }) => {
    setOnlineCount(data.onlineCount);
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (data.status === "online") newSet.add(data.userId);
      else newSet.delete(data.userId);
      return newSet;
    });
  });

  // Typing Indicators
  socket.on("USER_TYPING", (data: { userId: string; name: string; status: "typing" | "idle" }) => {
    setTypingUsers(prev => {
      if (data.status === "typing") {
        return prev.includes(data.name) ? prev : [...prev, data.name];
      } else {
        return prev.filter(name => name !== data.name);
      }
    });
  });

  return () => {
    socket.off("messageSent", handleMessageSent);
    socket.off("newMessage", handleNewMessage);
    socket.off("USER_STATUS_CHANGE");
    socket.off("USER_TYPING");
  };
}, [socket, roomId]);

const handleTyping = () => {
  if (!socket || !roomId) return;

  socket.emit("TYPING_START", { roomId });

  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

  typingTimeoutRef.current = setTimeout(() => {
    socket.emit("TYPING_STOP", { roomId });
  }, 3000);
};
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      // 1. Get presigned URL
      const { data } = await axiosInstance.post("/chat/media/upload-url", {
        fileName: file.name,
        fileType: file.type,
      });

      // 2. Upload directly to S3
      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
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
    if ((!newMessage.trim() && !selectedFile) || !socket || !roomId) return;
    
    let mediaUrl = null;
    let messageType = "text";

    if (selectedFile) {
      mediaUrl = await uploadFile(selectedFile);
      if (!mediaUrl) return; // if upload fails

      messageType = selectedFile.type.startsWith("image/") ? "image" : "file";
      setSelectedFile(null); // Clear selected file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    socket.emit("sendMessage", {
      roomId,
      content: newMessage.trim() || (mediaUrl ? "Shared an image" : ""),
      type: messageType,
      mediaUrl: mediaUrl
    });

    socket.emit("TYPING_STOP", { roomId });
    setNewMessage(""); 
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-xl font-bold">#</span>
          <h2 className="text-lg font-semibold">{roomId?.substring(0, 8)}...</h2>
          <div className="flex items-center gap-1.5 ml-3 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-[11px] font-bold text-green-500 uppercase tracking-wider">{onlineCount} online</span>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-800 rounded-full">
          <span className="text-gray-300">👥</span>
        </button>
      </div>
<div 
  ref={messagesContainerRef}
  onScroll={handleScroll}
  className="flex-1 p-6 overflow-y-auto space-y-6"
>
  {isLoadingMore && (
    <div className="text-center text-sm text-gray-500 py-2">Loading older messages...</div>
  )}
  {messages.map((msg) => {
    const isYou = msg.senderId === currentUser?.id; 
    const isBot = msg.senderId === "system_ai";
    return (
      <div
        key={msg.id}
        className={`flex items-start gap-3 ${
          isYou ? "justify-end" : ""
        }`}
      >
        {!isYou && (
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ${
              isBot ? "bg-teal-600 border border-teal-400/50 text-xl" : "bg-purple-600"
            }`}>
              {isBot ? "🤖" : msg.senderName.charAt(0).toUpperCase()}
            </div>
            {!isBot && onlineUsers.has(msg.senderId) && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-950 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
            )}
          </div>
        )}
        <div className={isYou ? "text-right" : ""}>
          <div
            className={`flex gap-2 items-baseline ${
              isYou ? "justify-end" : ""
            }`}
          >
            {!isYou && (
              <p className="font-semibold text-sm">{msg.senderName}</p>
            )}
            <span className="text-xs text-gray-400">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
            {isYou && (
              <p className="font-semibold text-sm">You</p>
            )}
          </div>
          <div
            className={`mt-1 px-4 py-2 rounded-2xl inline-block ${
              isYou
                ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20"
                : isBot
                ? "bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-500/20 text-teal-50 shadow-lg shadow-teal-500/5"
                : "bg-gray-800"
            }`}
          >
            {msg.type === "image" && msg.mediaUrl ? (
              <div className="mb-2">
                <img 
                  src={msg.mediaUrl} 
                  alt="uploaded media" 
                  className="max-w-[250px] md:max-w-xs rounded-xl shadow-md border border-white/10" 
                  loading="lazy"
                />
              </div>
            ) : null}
            {msg.content}
          </div>
        </div>
        {isYou && (
          <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center font-bold">
            {msg.senderName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  })}
    <div ref={messagesEndRef} />
</div>


      {/* Typing Indicator */}
      <div className="px-4 pb-2">
        <TypingIndicator names={typingUsers} />
      </div>

      {/* File Preview Area */}
      {selectedFile && (
        <div className="px-4 py-3 bg-gray-900 border-t border-gray-800 flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 flex items-center justify-center rounded-lg border border-gray-700">
              {selectedFile.type.startsWith("image/") ? "🖼️" : "📄"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200 truncate max-w-[200px]">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
          <button 
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-gray-400 hover:text-red-400 transition-colors p-2"
          >
            ❌
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="p-4 border-t border-gray-800 flex items-center gap-3 bg-gray-900/90 backdrop-blur-xl shrink-0">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,.pdf,.doc,.docx"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors active:scale-95"
          disabled={isUploading}
        >
          📎
        </button>
        <div className="flex-1 relative">
           <input
            type="text"
            placeholder={`Message #${roomId?.substring(0, 6)}...`}
            value={newMessage}
            disabled={isUploading}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-800/80 text-white pl-4 pr-10 py-3 rounded-2xl outline-none placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:bg-gray-800 transition-all shadow-inner"
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={isUploading || (!newMessage.trim() && !selectedFile)}
          className={`p-3 rounded-full transition-all duration-300 shadow-lg ${
            isUploading 
              ? "bg-gray-700 cursor-not-allowed animate-pulse" 
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-purple-500/25 hover:scale-105 active:scale-95 text-white"
          }`}
        >
          {isUploading ? "⏳" : "🚀"}
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
