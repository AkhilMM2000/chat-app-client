

const GroupChat:React.FC = () =>  {
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

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Message 1 */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
            A
          </div>
          <div>
            <div className="flex gap-2 items-baseline">
              <p className="font-semibold text-sm">Alex Thompson</p>
              <span className="text-xs text-gray-400">11:47 PM</span>
            </div>
            <div className="mt-1 bg-gray-800 px-4 py-2 rounded-2xl inline-block">
              Hey everyone! Welcome to the group chat 👋
            </div>
          </div>
        </div>

        {/* Message 2 */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
            S
          </div>
          <div>
            <div className="flex gap-2 items-baseline">
              <p className="font-semibold text-sm">Sarah Johnson</p>
              <span className="text-xs text-gray-400">11:52 PM</span>
            </div>
            <div className="mt-1 bg-gray-800 px-4 py-2 rounded-2xl inline-block">
              Thanks for setting this up! This looks amazing ✨
            </div>
          </div>
        </div>

        {/* Message 3 - You */}
        <div className="flex items-start gap-3 justify-end">
          <div className="text-right">
            <div className="flex gap-2 items-baseline justify-end">
              <span className="text-xs text-gray-400">11:57 PM</span>
              <p className="font-semibold text-sm">You</p>
            </div>
            <div className="mt-1 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-2xl inline-block">
              The design is so clean and modern! Love the gradients 💜
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center font-bold">
            Y
          </div>
        </div>

        {/* Message 4 */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold">
            M
          </div>
          <div>
            <div className="flex gap-2 items-baseline">
              <p className="font-semibold text-sm">Mike Chen</p>
              <span className="text-xs text-gray-400">12:02 AM</span>
            </div>
            <div className="mt-1 bg-gray-800 px-4 py-2 rounded-2xl inline-block">
              Absolutely! This feels like a premium messaging app. Great work
              on the animations too 🚀
            </div>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-gray-800 flex items-center gap-3 bg-gray-900/70 backdrop-blur-md">
        <button className="text-gray-400 hover:text-white text-xl">➕</button>
        <input
          type="text"
          placeholder="Message #general"
          className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-2xl outline-none placeholder-gray-500"
        />
        <button className="text-gray-400 hover:text-white text-xl">😊</button>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
          🚀
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
