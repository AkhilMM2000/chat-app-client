import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md px-6 py-3 flex items-center justify-between z-50">

      {/* App Name */}
      <h1 className="text-white font-bold text-xl tracking-wide">ChatApp</h1>

      {/* Profile Section */}
      <div className="flex items-center space-x-3">
        <span className="hidden sm:block text-white font-medium">
          Akhil Manoj
        </span>
        <img
          src="https://via.placeholder.com/40"
          alt="profile"
          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
        />
      </div>
    </nav>
  );
};

export default Navbar;
