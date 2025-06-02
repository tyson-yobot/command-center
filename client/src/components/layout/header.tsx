import React from "react";
import { Sun, Moon, Mic, Headphones } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import yobotLogoPath from "@assets/Engage Smarter Logo Transparent.png";

export default function Header() {
  const { isConnected } = useWebSocket();
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Dark Header - 2 INCHES EXACTLY */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-slate-800 shadow-lg h-48">
        <div className="h-full flex items-center justify-center px-8 relative">
          
          {/* Voice Input - Absolute Left */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3">
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-green-400" />
                <span className="text-green-300 text-sm font-medium">Voice Input</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-blue-400 rounded" />
                <span className="text-blue-300 text-sm font-medium">Live Chat</span>
              </div>
            </div>
          </div>

          {/* YoBot Command Center - CENTERED */}
          <div className="bg-white rounded-3xl px-20 py-12 shadow-2xl border-4 border-blue-300 flex items-center space-x-10">
            <img 
              src={yobotLogoPath} 
              alt="YoBot" 
              className="h-40 w-auto"
            />
            <div className="flex items-center space-x-2">
              <h1 className="text-7xl font-black text-slate-900 tracking-tight">COMMAND CENTER</h1>
              <span className="text-lg text-slate-500 font-medium">®</span>
            </div>
          </div>
          
          {/* Controls & Reports - Absolute Right */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3">
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <Headphones className="w-5 h-5 text-orange-400" />
                <span className="text-orange-300 text-sm font-medium">Audio Control</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-purple-400 rounded" />
                <span className="text-purple-300 text-sm font-medium">System Status</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-400 rounded" />
                <span className="text-green-300 text-sm font-medium">PDF Reports</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-400 rounded" />
                <span className="text-red-300 text-sm font-medium">Admin Panel</span>
              </div>
            </div>
          </div>
          
          {/* Connection Status & Theme Toggle - Bottom Right */}
          <div className="absolute bottom-4 right-8 flex items-center space-x-2">
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
