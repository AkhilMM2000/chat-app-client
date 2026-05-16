import React, { type FC } from "react";
import type { Message } from "../../types/messages";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUser: { id: string } | null;
  onlineUsers: Set<string>;
  isLoadingMore: boolean;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  onLoadMore: () => void;
  onMarkAsSeen: (messageIds: string[]) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

import { AnimatePresence } from "framer-motion";

export const MessageList: FC<MessageListProps> = ({
  messages,
  currentUser,
  onlineUsers,
  isLoadingMore,
  onScroll,
  onLoadMore,
  onMarkAsSeen,
  messagesContainerRef,
  messagesEndRef,
}) => {
  const topSentinelRef = React.useRef<HTMLDivElement | null>(null);

  // ♾️ Infinite Scroll Observer
  React.useEffect(() => {
    if (!topSentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, isLoadingMore]);

  // 👁️ Read Receipt Observer
  React.useEffect(() => {
    if (!messagesContainerRef.current || !currentUser) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const seenIds: string[] = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const msgId = entry.target.getAttribute("data-message-id");
            const senderId = entry.target.getAttribute("data-sender-id");
            const isAlreadySeen = entry.target.getAttribute("data-is-seen") === "true";

            // Only mark as seen if it's NOT our message and NOT already seen by us
            if (msgId && senderId !== currentUser.id && !isAlreadySeen) {
              seenIds.push(msgId);
              // Mark as seen locally to avoid re-triggering before state update
              entry.target.setAttribute("data-is-seen", "true");
            }
          }
        });

        if (seenIds.length > 0) {
          onMarkAsSeen(seenIds);
        }
      },
      { 
        root: messagesContainerRef.current, // 🎯 CRITICAL: Observe relative to the scrollable chat container
        threshold: 0.1 
      }
    );

    const messageElements = messagesContainerRef.current.querySelectorAll("[data-message-id]");
    messageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [messages, currentUser, onMarkAsSeen, messagesContainerRef]);

  return (
    <div
      ref={messagesContainerRef}
      onScroll={onScroll}
      className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth custom-scrollbar"
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Top Sentinel for Infinite Scroll */}
      <div ref={topSentinelRef} className="h-1" />
      
      {isLoadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {messages.map((msg) => {
          const isYou = msg.senderId === currentUser?.id;
          const isBot = msg.senderId === "system_ai";
          const isOnline = onlineUsers.has(msg.senderId);
          const hasSeen = msg.seenBy?.includes(currentUser?.id || "");

          return (
            <div 
              key={msg.id} 
              data-message-id={msg.id} 
              data-sender-id={msg.senderId}
              data-is-seen={hasSeen}
              className="w-full"
            >
            
              <MessageBubble
                msg={msg}
                isYou={isYou}
                isBot={isBot}
                isOnline={isOnline}
              />
            </div>
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} className="h-2" />
    </div>
  );
};
