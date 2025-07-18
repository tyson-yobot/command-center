import React, { useState } from 'react';

const SupportChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-[#0d82da] to-[#66ccff] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <span className="text-white text-xl">💬</span>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-gradient-to-br from-slate-800 to-black border-2 border-[#0d82da] rounded-lg shadow-2xl">
          <div className="p-4 border-b border-[#0d82da]/30">
            <h3 className="text-white font-semibold">Support Chat</h3>
            <p className="text-gray-400 text-sm">How can we help you?</p>
          </div>
          
          <div className="p-4 h-full flex flex-col">
            <div className="flex-1 mb-4">
              <div className="text-gray-300 text-sm">
                Chat functionality coming soon...
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d82da]"
              />
              <button className="bg-[#0d82da] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#66ccff] transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChatWidget;
