import React from "react";
import { Sun, Moon } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import yobotLogoPath from "@assets/Engage Smarter Logo Transparent.png";

export default function Header() {
  const { isConnected } = useWebSocket();
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Dark Header with White Logo Background - Larger */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-slate-800 shadow-lg">
        <div className="flex items-center justify-center px-2 py-4 relative">
          {/* YoBot Command Center Logo - Centered & Large */}
          <div className="bg-white rounded-2xl px-8 py-4 shadow-2xl border-4 border-blue-300">
            <img 
              src={yobotLogoPath} 
              alt="YoBot Command Center" 
              className="h-20 w-auto"
            />
          </div>
          
          {/* Connection Status & Theme Toggle - Absolute Right */}
          <div className="absolute right-2 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-8 w-8 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center space-x-2" title={isConnected ? 'System Online' : 'Connection Lost'}>
              <div 
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-400 status-active' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className={`text-xs font-medium ${
                isConnected ? 'text-green-400' : 'text-amber-400'
              }`}>
                {isConnected ? 'Online' : 'Reconnecting'}
              </span>
            </div>
          </div>
        </div>
      </div>
      

    </>
  );
}
