import { Activity, Sun, Moon } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import yobotLogoPath from "@assets/Engage Smarter Logo Transparent.png";

export default function Header() {
  const { isConnected } = useWebSocket();
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Dark Header with White Logo Background */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-slate-800 shadow-lg">
        <div className="flex items-center justify-center px-4 py-3 relative">
          {/* Centered Logo with White Background for Brand */}
          <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
            <img 
              src={yobotLogoPath} 
              alt="YoBot Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          {/* Connection Status & Theme Toggle - Top Right */}
          <div className="absolute right-4 flex items-center space-x-3">
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
            <div className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500 animate-ping shadow-lg shadow-red-500/50'
                }`}
              />
              <span className={`text-sm font-semibold ${
                isConnected ? 'text-green-400' : 'text-red-400'
              }`}>
                {isConnected ? '🟢 LIVE' : '🔴 OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Command Center Title Bar */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 border-b-4 border-blue-500 shadow-xl">
        <div className="px-4 py-2">
          <h1 className="text-center text-3xl font-black tracking-tight drop-shadow-lg">
            <span className="bg-gradient-to-t from-white to-blue-200 bg-clip-text text-transparent font-extrabold">COMMAND CENTER</span>
          </h1>
          {/* Accent stripe */}
          <div className="mt-1 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-full mx-auto w-48"></div>
        </div>
      </div>
    </>
  );
}
