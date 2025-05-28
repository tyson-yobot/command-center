import { Activity } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import yobotLogoPath from "@assets/Engage Smarter Logo Transparent.png";

export default function Header() {
  const { isConnected } = useWebSocket();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-white via-gray-100 to-gray-400 border-b-4 border-gray-600 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          <img 
            src={yobotLogoPath} 
            alt="YoBot Logo" 
            className="h-16 w-auto"
          />
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight drop-shadow-lg">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-extrabold">COMMAND CENTER</span>
          </h1>
        </div>
        
        {/* Aggressive accent stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800"></div>
        
        {/* Power glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-50"></div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <div 
              className={`w-2 h-2 rounded-full notification-dot ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <button className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <Activity className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
