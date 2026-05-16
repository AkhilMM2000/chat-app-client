import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { Message } from "../types/messages";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchMessages } from "../services/messages";
import { getCurrentUser } from "../utils/auth";
import { useSocket } from "../hooks/useSocket";
import { TypingIndicator } from "../components/chat/TypingIndicator";
import { MessageList } from "../components/chat/MessageList";
import { MessageInput } from "../components/chat/MessageInput";
import { Sidebar } from "../components/chat/Sidebar";
import { fetchRoomById } from "../services/room";
import type { Participant } from "../types/Room";


const GroupChat:React.FC = () =>  {
  const socket = useSocket();
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const currentUser = getCurrentUser();
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🛡️ Navigation Lock: Prevent leaving via Back button
  useEffect(() => {
    // Push a dummy state to history to capture the first back button click
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (!isLeaving) {
        // Force stay in the room
        window.history.pushState(null, "", window.location.href);
        toast.error("Please use the LEAVE button to exit safely! 🛡️", {
          id: "nav-lock-toast",
          icon: "🔒"
        });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isLeaving]);

  useEffect(() => {
    if (!roomId) return;

    const loadData = async () => {
      try {
        const [messagesData, roomData] = await Promise.all([
          fetchMessages(roomId, 50),
          fetchRoomById(roomId)
        ]);
        setMessages(messagesData.messages);
        if (messagesData.messages.length < 50) setHasMore(false);
        setParticipants(roomData.participants);
      } catch (err) {
        console.error("Failed to fetch room data:", err);
      }
    };

    loadData();
  }, [roomId]);

  const handleLoadMore = async () => {
    if (!messagesContainerRef.current || !hasMore || isLoadingMore || messages.length === 0) return;
    
    setIsLoadingMore(true);
    const oldestMessageId = messages[0].id; 
    
    try {
      const data = await fetchMessages(roomId!, 50, oldestMessageId);
      
      // Retain scroll position BEFORE updating state
      const previousScrollHeight = messagesContainerRef.current.scrollHeight;
      
      setMessages(prev => [...data.messages, ...prev]);
      
      if (data.messages.length < 50) setHasMore(false);

      // Adjust scroll position perfectly after DOM update
      // Using requestAnimationFrame for smoother adjustment
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - previousScrollHeight;
        }
      });
      
    } catch (e) {
      console.error("Failed to fetch older messages:", e);
    } finally {
      setIsLoadingMore(false);
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

    const handleMessagesSeen = (data: { roomId: string; messageIds: string[]; userId: string }) => {
      setMessages(prev => prev.map(msg => {
        if (data.messageIds.includes(msg.id)) {
          const seenSet = new Set(msg.seenBy || []);
          seenSet.add(data.userId);
          const updatedSeenBy = Array.from(seenSet);
          
          // Only update state if the array has actually changed
          if (updatedSeenBy.length !== (msg.seenBy?.length || 0)) {
            return { ...msg, seenBy: updatedSeenBy };
          }
        }
        return msg;
      }));
    };

    socket.on("messageSent", handleMessageSent);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("newMessage", handleNewMessage);

  // Status & Presence
  socket.on("roomJoined", (data: { roomId: string; participants: any[]; onlineUsers: string[] }) => {
    setOnlineUsers(new Set(data.onlineUsers));
    if (data.participants) {
      setParticipants(data.participants.map((p: any) => ({
        id: p.userId || p.id,
        name: p.name,
        profilePic: p.profilePic
      })));
    }
  });

  socket.on("participantJoined", (data: { userId: string; name: string; profilePic?: string }) => {
    setParticipants(prev => {
      if (prev.find(p => p.id === data.userId)) return prev;
      return [...prev, { id: data.userId, name: data.name, profilePic: data.profilePic }];
    });
    setOnlineUsers(prev => new Set(prev).add(data.userId));
  });

  socket.on("USER_PROFILE_UPDATED", (data: { userId: string; name: string; profilePic?: string }) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === data.userId) {
        return { ...p, name: data.name, profilePic: data.profilePic };
      }
      return p;
    }));
  });

  socket.on("userLeft", (data: { userId: string; name: string }) => {
    // Instantly remove from online set so their dot disappears
    setOnlineUsers(prev => {
      const next = new Set(prev);
      next.delete(data.userId);
      return next;
    });
  });

  // Global connect/disconnect
  socket.on("USER_STATUS_CHANGE", (data: { userId: string; status: "online" | "offline"; onlineCount: number }) => {
    setOnlineCount(data.onlineCount);
    // 💡 Performance Fix: We no longer update onlineUsers Set from the global broadcast.
    // This prevents users on the dashboard from "flickering" back to online in this specific room.
  });

  // Typing Indicators
  socket.on("USER_TYPING", (data: { userId: string; name: string; status: "typing" | "idle" }) => {
    setTypingUsers(prev => {
      const next = { ...prev };
      if (data.status === "typing") {
        next[data.userId] = data.name;
      } else {
        delete next[data.userId];
      }
      return next;
    });
  });

    // 🧹 Detailed Cleanup
    return () => {
      socket.off("messageSent", handleMessageSent);
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("roomJoined");
      socket.off("participantJoined");
      socket.off("userLeft");
      socket.off("USER_STATUS_CHANGE");
      socket.off("USER_TYPING");
      socket.off("USER_PROFILE_UPDATED");
    };
  }, [socket, roomId, currentUser]);

  const handleSendMessage = useCallback((data: { content: string; type: string; mediaUrl: string | null }) => {
    if (!socket || !roomId) return;
    socket.emit("sendMessage", {
      roomId,
      ...data
    });
  }, [socket, roomId]);

  const handleTypingStart = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit("TYPING_START", { roomId });
  }, [socket, roomId]);

  const handleTypingStop = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit("TYPING_STOP", { roomId });
  }, [socket, roomId]);

  const handleLeaveRoom = useCallback(() => {
    if (!socket || !roomId || !currentUser) return;
    
    setIsLeaving(true);
    
    // Formal socket notification
    socket.emit("leaveRoom", {
      roomId,
      userId: currentUser.id,
      name: currentUser.name
    });

    toast.success("Leaving room...");
    
    // Redirect to dashboard/rooms
    setTimeout(() => {
      navigate("/room");
    }, 500);
  }, [socket, roomId, currentUser, navigate]);

  // 👁️ Mark as Seen: Debounced logic
  const handleMarkAsSeen = useCallback((messageIds: string[]) => {
    if (!socket || !roomId || !messageIds.length) return;
    socket.emit("markAsSeen", { roomId, messageIds });
  }, [socket, roomId]);

  const typingNames = useMemo(() => Object.values(typingUsers), [typingUsers]);
  const typingIdsSet = useMemo(() => new Set(Object.keys(typingUsers)), [typingUsers]);

useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="relative flex h-screen w-full bg-gray-950 text-white overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] bg-indigo-600/15 blur-[120px] rounded-full" />
      </div>

      <Sidebar 
        participants={participants}
        onlineUsers={onlineUsers}
        typingUsers={typingIdsSet}
        onLeave={handleLeaveRoom}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 relative z-10 bg-gray-950/20 backdrop-blur-[2px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gray-900/60 backdrop-blur-xl h-[73px] shadow-sm shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20 border border-white/10">
              #
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold tracking-tight text-white/90">
                {roomId?.substring(0, 8)}...
              </h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/5 rounded-full border border-green-500/10 w-fit">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{onlineCount} online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 text-white/60 hover:text-white group md:hidden"
          >
            <span className="group-hover:scale-110 transition-transform block">👥</span>
          </button>
        </div>

        <MessageList
          messages={messages}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          onMarkAsSeen={handleMarkAsSeen}
          messagesContainerRef={messagesContainerRef}
          messagesEndRef={messagesEndRef}
        />

        {/* Typing Indicator */}
        <div className="px-6 pb-2">
          <TypingIndicator names={typingNames} />
        </div>

        <MessageInput 
          roomId={roomId || ""}
          onSendMessage={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
        />
      </div>
    </div>
  );
};

export default GroupChat;
