import { Activity } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import yobotLogoPath from "@assets/Engage Smarter Logo Transparent.png";

export default function Header() {
  const { isConnected } = useWebSocket();

  return (
    <>
      {/* White Header with Centered Logo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
        <div className="flex items-center justify-center px-4 py-3 relative">
          {/* Centered Logo */}
          <img 
            src={yobotLogoPath} 
            alt="YoBot Logo" 
            className="h-16 w-auto"
          />
          
          {/* Connection Status - Top Right */}
          <div className="absolute right-4 flex items-center space-x-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500 animate-ping shadow-lg shadow-red-500/50'
              }`}
            />
            <span className={`text-sm font-semibold ${
              isConnected ? 'text-green-700' : 'text-red-700'
            }`}>
              {isConnected ? '🟢 LIVE' : '🔴 OFFLINE'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Command Center Title Bar */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-b from-white via-gray-100 to-gray-400 border-b-4 border-gray-600 shadow-xl">
        <div className="px-4 py-2">
          <h1 className="text-center text-3xl font-black tracking-tight drop-shadow-lg">
            <span className="bg-gradient-to-t from-black to-gray-500 bg-clip-text text-transparent font-extrabold">COMMAND CENTER</span>
          </h1>
          {/* Accent stripe */}
          <div className="mt-1 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-full mx-auto w-48"></div>
        </div>
      </div>
    </>
  );
}
