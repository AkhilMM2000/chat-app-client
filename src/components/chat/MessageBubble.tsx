import React, { memo } from "react";
import { Check, CheckCheck, ShieldCheck } from "lucide-react";
import type { Message } from "../../types/messages";
import { motion } from "framer-motion";
import Avatar from "../ui/Avatar";

interface MessageBubbleProps {
  msg: Message;
  isYou: boolean;
  isBot: boolean;
  isOnline: boolean;
  onMediaLoad?: () => void;
}

const animatedMessages = new Set<string>();

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ msg, isYou, isBot, isOnline, onMediaLoad }) => {

  const shouldAnimate = !animatedMessages.has(msg.id);
  
  React.useEffect(() => {
    if (shouldAnimate) animatedMessages.add(msg.id);
  }, [msg.id, shouldAnimate]);

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 10, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex items-start gap-3 ${
        isYou ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="flex-shrink-0 relative group">
        <Avatar 
          src={isBot ? undefined : msg.senderProfilePic} 
          name={isBot ? "AI" : msg.senderName} 
          size="md"
          isOnline={!isBot && isOnline}
          className="group-hover:rotate-6 transition-transform duration-300"
        />
      </div>

      <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isYou ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          {!isYou && (
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-black uppercase tracking-widest ${isBot ? "text-teal-400" : "text-white/50"}`}>
                {msg.senderName}
              </span>
              {isBot && <ShieldCheck size={12} className="text-teal-400 fill-teal-400/20" />}
            </div>
          )}
          <span className="text-[10px] font-medium text-gray-600">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isYou && <span className="text-xs font-black text-purple-500/80 uppercase tracking-widest">YOU</span>}
        </div>

        <div
          className={`relative px-4 py-3 rounded-2xl shadow-2xl transition-all hover:shadow-black/40 ${
            isYou
              ? "bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-tr-none border border-white/10"
              : isBot
              ? "bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-indigo-500/10 backdrop-blur-md text-teal-50 rounded-tl-none border border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.15)]"
              : "bg-gray-800/80 backdrop-blur-sm text-gray-100 rounded-tl-none border border-white/5"
          }`}
        >
          {isBot && (
            <motion.div 
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 border border-teal-400/20 rounded-2xl pointer-events-none" 
            />
          )}

          {msg.type === "image" && msg.mediaUrl ? (
            <div className="mb-3 overflow-hidden rounded-xl border border-white/10 shadow-inner min-h-[200px] w-full max-w-[250px] bg-white/5 flex items-center justify-center">
              
              <img 
                src={msg.mediaUrl} 
                alt="Shared media" 
                className="max-w-full h-auto object-cover hover:scale-105 transition-transform duration-500" 
                loading="lazy"
                onLoad={onMediaLoad}
              />
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4 mt-1">
            <p className="text-sm shadow-sm leading-relaxed font-medium break-words whitespace-pre-wrap">
              {msg.content}
            </p>
            
            {isYou && !isBot && (
              <div className="flex items-center self-end mb-[-4px]">
                {msg.seenBy && msg.seenBy.length > 0 ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                  >
                    <CheckCheck size={14} strokeWidth={3} />
                  </motion.div>
                ) : (
                  <div className="text-white/40">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = "MessageBubble";
