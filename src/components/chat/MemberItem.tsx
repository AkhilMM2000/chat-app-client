import React from 'react';
import type { Participant } from '../../types/Room';

interface MemberItemProps {
  member: Participant;
  isOnline: boolean;
  isTyping?: boolean;
}

import { motion } from "framer-motion";

import Avatar from '../ui/Avatar';

export const MemberItem: React.FC<MemberItemProps> = ({ member, isOnline, isTyping }) => {
  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group"
    >
      <div className="relative">
        <Avatar 
          src={member.profilePic} 
          name={member.name} 
          size="md" 
          isOnline={isOnline} 
          className="group-hover:rotate-3 transition-transform duration-300"
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-bold text-white/90 truncate tracking-tight">{member.name}</span>
        <div className="flex items-center gap-1.5 min-h-[16px]">
          {isTyping ? (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-black italic text-purple-400 uppercase tracking-widest animate-pulse"
            >
              typing...
            </motion.span>
          ) : (
            <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? "text-green-500" : "text-gray-600"}`}>
              {isOnline ? "Active" : "Offline"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
