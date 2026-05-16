import React, { useState } from 'react';
import type { Participant } from '../../types/Room';
import { MemberItem } from './MemberItem';
import { getCurrentUser } from '../../utils/auth';
import Avatar from '../ui/Avatar';
import { Edit3 } from 'lucide-react';
import ProfileModal from '../modals/ProfileModal';

interface SidebarProps {
  participants: Participant[];
  onlineUsers: Set<string>;
  typingUsers: Set<string>;
  onLeave: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ participants, onlineUsers, typingUsers, onLeave, isOpen, onClose }) => {
  const [user, setUser] = useState(getCurrentUser());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 
        w-[320px] lg:w-[380px] flex flex-col 
        border-r border-white/5 bg-[#0f172a] md:bg-gray-900/40 backdrop-blur-2xl shadow-2xl shrink-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
      <div className="flex items-center justify-between p-4 border-b border-white/5 h-[73px] bg-white/[0.02]">
        <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">
          <span className="text-purple-500 mr-2">/</span>Room
        </h2>
        <button 
          onClick={onLeave}
          className="px-4 py-2 text-xs font-bold text-red-400 hover:text-white border border-red-500/20 hover:bg-red-500/80 rounded-xl transition-all shadow-lg active:scale-95 text-center"
        >
          LEAVE
        </button>
      </div>
      
      <div className="px-5 py-4 border-b border-white/5 bg-black/20 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center justify-between">
        <span>Participants</span>
        <span className="bg-purple-500/10 text-purple-400 py-0.5 px-2.5 rounded-lg border border-purple-500/20">{participants.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {participants.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mt-4 animate-pulse">Loading members...</div>
        ) : (
          participants.map(member => (
            <MemberItem 
              key={member.id} 
              member={member} 
              isOnline={onlineUsers.has(member.id)} 
              isTyping={typingUsers.has(member.id)}
            />
          ))
        )}
        
      </div>

      {/* User info at bottom */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profilePic} name={user?.name || "User"} size="sm" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">{user?.name}</span>
              <span className="text-[10px] text-gray-500 font-medium">My Profile</span>
            </div>
          </div>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit3 size={16} />
          </button>
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onUpdate={(updatedUser) => setUser(updatedUser)}
      />
    </div>
    </>
  );
};
