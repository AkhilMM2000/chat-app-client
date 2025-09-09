import { useEffect, useRef, useState } from "react";
import type { Message } from "../types/messages";
import { useParams } from "react-router-dom";
import { fetchMessages } from "../services/messages";
import { getCurrentUser } from "../utils/auth";
import { useSocket } from "../hooks/useSocket";


const GroupChat:React.FC = () =>  {
  const socket = useSocket();
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState(""); // ✅ input state
  const currentUser = getCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const loadMessages = async () => {
      try {
        const data = await fetchMessages(roomId, 50);
        setMessages(data.messages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    loadMessages();
  }, [roomId]);
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

  
  return () => {
    socket.off("messageSent", handleMessageSent);
    socket.off("newMessage", handleNewMessage);
  };
}, [socket, roomId]);
 const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !roomId) return;
 
    socket.emit("sendMessage", {
      roomId,
      content: newMessage,
    });

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
          <h2 className="text-lg font-semibold">general</h2>
          <span className="ml-2 text-sm text-gray-400">4 online</span>
        </div>
        <button className="p-2 hover:bg-gray-800 rounded-full">
          <span className="text-gray-300">👥</span>
        </button>
      </div>
<div className="flex-1 p-6 overflow-y-auto space-y-6">
  {messages.map((msg) => {
    const isYou = msg.senderId ===currentUser?.id; // we'll get current user id from auth/session
    return (
      <div
        key={msg.id}
        className={`flex items-start gap-3 ${
          isYou ? "justify-end" : ""
        }`}
      >
        {!isYou && (
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
            {msg.senderName.charAt(0).toUpperCase()}
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
                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                : "bg-gray-800"
            }`}
          >
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


      {/* Input Box */}
      <div className="p-4 border-t border-gray-800 flex items-center gap-3 bg-gray-900/70 backdrop-blur-md">
        <button className="text-gray-400 hover:text-white text-xl">➕</button>
           <input
          type="text"
          placeholder={`Message #${roomId}`}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-2xl outline-none placeholder-gray-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full"
        >
          🚀
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
