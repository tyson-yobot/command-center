import React from 'react';

const TopNavBar = () => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-r from-[#0d82da] to-[#66ccff] rounded-full flex items-center justify-center">
        <span className="text-black font-bold text-sm">Y</span>
      </div>
      <span className="text-white font-semibold text-lg">YoBot® Command Center</span>
    </div>
    
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 text-sm text-gray-300">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>System Online</span>
      </div>
      <div className="text-sm text-gray-400">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  </div>
);

export default TopNavBar;
