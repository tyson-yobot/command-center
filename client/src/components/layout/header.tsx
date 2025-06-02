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
        <div className="h-full flex items-center justify-between px-8 relative">
          
          {/* Left Column - Voice Controls */}
          <div className="flex flex-col space-y-3">
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-green-400" />
                <span className="text-green-300 text-sm font-medium">Voice Input</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <Headphones className="w-5 h-5 text-orange-400" />
                <span className="text-orange-300 text-sm font-medium">Audio Control</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-blue-400 rounded" />
                <span className="text-blue-300 text-sm font-medium">Live Chat</span>
              </div>
            </div>
          </div>

          {/* YoBot Command Center - ABSOLUTE CENTER */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-60">
            <div className="bg-white rounded-2xl px-12 py-6 shadow-2xl border-4 border-blue-300 flex items-center space-x-8">
              <img 
                src={yobotLogoPath} 
                alt="YoBot" 
                className="h-32 w-auto"
              />
              <div className="flex items-center space-x-2">
                <h1 className="text-5xl font-black text-slate-900 tracking-tight">COMMAND CENTER</h1>
                <span className="text-base text-slate-500 font-medium">®</span>
              </div>
            </div>
          </div>

          {/* Right Column - Admin Controls */}
          <div className="flex flex-col space-y-3">
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-purple-400 rounded" />
                <span className="text-purple-300 text-sm font-medium">System Status</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-400 rounded" />
                <span className="text-red-300 text-sm font-medium">Alert Monitor</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <div className={`flex items-center space-x-2 px-3 py-2 rounded text-sm ${
                isConnected ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Spacer */}
      <div className="h-48" />
    </>
  );
}