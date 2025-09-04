
import React from "react";

const Room: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 pt-20">
      <div className="max-w-lg mx-auto p-6 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Manage Chat Rooms
        </h1>

        {/* Join Room */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Join a Room</h2>
          <input
            type="text"
            placeholder="🔑 Enter Room ID"
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          />
          <button className="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md">
            Join Room
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <span className="absolute px-3 bg-white/80 text-gray-600 text-sm font-medium rounded-lg">
            OR
          </span>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        {/* Create Room */}
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Create a Room</h2>
          <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md">
            🚀 Create New Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;
