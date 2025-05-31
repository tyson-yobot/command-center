import React, { useState } from "react";
import { Activity, Sun, Moon, Settings } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import yobotLogoPath from "@assets/Engage Smarter Logo Transparent.png";

export default function Header() {
  const { isConnected } = useWebSocket();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const handleAdminAccess = () => {
    if (password === "yobot2025") {
      setIsDialogOpen(false);
      setPassword("");
      setError("");
      setLocation("/system-controls");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

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
          
          {/* Admin Access & Connection Status - Top Right */}
          <div className="absolute right-4 flex items-center space-x-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Admin Access</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-password" className="text-slate-300">
                      Enter Admin Password
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
                      className="mt-1 bg-slate-800 border-slate-600 text-white"
                      placeholder="Password"
                    />
                    {error && (
                      <p className="text-red-400 text-sm mt-1">{error}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setPassword("");
                        setError("");
                      }}
                      className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAdminAccess}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Access Control Panel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
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
