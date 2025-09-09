import React, { useState } from "react";
import { getCurrentUser } from "../utils/auth";
import { logout } from "../services/authService";

const Navbar: React.FC = () => {
  const user = getCurrentUser();
  const [isOpen, setIsOpen] = useState(false);

const handleLogout = async () => {
  console.log("logout clicked");
  const response = await logout();

  if (response.success) {
    console.log("Logout success:", response);
    window.location.href = "/";
  } else {
    console.error("Logout error:", response);
  }
};


  return (
     <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl px-4 py-1 flex items-center justify-between z-50 backdrop-blur-sm">
        {/* App Name */}
        <h1 className="text-white font-bold text-2xl tracking-wide drop-shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
          ChatApp
        </h1>

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-3 focus:outline-none hover:bg-white/10 rounded-full px-3 py-2 transition-all duration-300 backdrop-blur-sm"
          >
            <span className="hidden sm:block text-white font-medium drop-shadow-sm">
              {user?.name}
            </span>
            <div className="relative">
              <img
                src="https://cdn.dribbble.com/userupload/13410676/file/original-a939670c7403d8ad7998fda9922537a8.png?resize=1600x1200&vertical=center"
                alt="profile"
                className="w-12 h-12 rounded-full border-3 border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
            </div>
          </button>

          {/* Dropdown Menu */}
          <div className={`absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
          }`}>
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Background overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </nav>
  );
};

export default Navbar;
