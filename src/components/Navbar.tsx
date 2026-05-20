import React, { useState } from "react";
import { getCurrentUser } from "../utils/auth";
import { logout } from "../services/authService";
import { LogOut, User, Settings, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./ui/Avatar";
import ProfileModal from "./modals/ProfileModal";

const Navbar: React.FC = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {

    console.log('logout');
    const response = await logout();
    console.log(response,'response logot');
    if (response.success) {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      window.location.href = "/";
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[80] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl px-6 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {/* App Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="text-white fill-white/20" size={20} />
          </div>
          <h1 className="text-white font-black text-xl tracking-tight hidden sm:block">
            Chat<span className="text-purple-400">App</span>
          </h1>
        </div>

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl transition-all duration-300 border ${
              isOpen ? "bg-white/10 border-white/20 shadow-inner" : "hover:bg-white/5 border-transparent"
            }`}
          >
            <Avatar 
              src={user?.profilePic} 
              name={user?.name || "User"} 
              size="md"
              className={isOpen ? "scale-90 transition-transform" : ""}
            />
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-bold text-white leading-none mb-1">{user?.name}</span>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Premium</span>
            </div>
            <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-4 w-60 bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-20"
                >
                  <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col items-center text-center">
                    <Avatar src={user?.profilePic} name={user?.name || "User"} size="lg" className="mb-3" />
                    <span className="text-sm font-bold text-white">{user?.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium tracking-tight">Active Session</span>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
                    >
                      <User size={18} className="text-purple-400" />
                      <span className="text-sm font-bold">Edit Profile</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
                    >
                      <Settings size={18} className="text-blue-400" />
                      <span className="text-sm font-bold">Settings</span>
                    </button>
                    <div className="h-px bg-white/5 my-2 mx-4" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-bold">Logout</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onUpdate={(updatedUser) => setUser(updatedUser)}
      />
    </nav>
  );
};

export default Navbar;
