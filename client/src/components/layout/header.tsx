import { Activity } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import yobotLogoPath from "@assets/logo_256x256.png";

export default function Header() {
  const { isConnected } = useWebSocket();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <img 
            src={yobotLogoPath} 
            alt="YoBot Logo" 
            className="w-8 h-8"
          />
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              YoBot® Command Center
            </h1>
            <p className="text-xs text-muted-foreground">
              Engage Smarter, Not Harder
            </p>
          </div>
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
