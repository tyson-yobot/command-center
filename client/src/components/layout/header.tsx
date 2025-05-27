import { Activity } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import yobotLogoPath from "@assets/Engage Smarter Logo Cursive 7 HR no background.png";

export default function Header() {
  const { isConnected } = useWebSocket();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white via-blue-50 to-blue-100 border-b border-blue-200 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          <img 
            src={yobotLogoPath} 
            alt="YoBot Logo" 
            className="h-28 w-auto"
          />
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            YoBot<span className="text-lg align-super">®</span> Command Center
          </h1>
        </div>
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
