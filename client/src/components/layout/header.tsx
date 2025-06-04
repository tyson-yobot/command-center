import React from "react";
import { Sun, Moon, Mic, Headphones, Phone, Users, FileText, Zap, Settings } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import yobotLogoPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";

export default function Header() {
  const { isConnected } = useWebSocket();
  const { theme, setTheme } = useTheme();

  const handleCallPipeline = () => {
    console.log("Call Pipeline triggered");
  };

  const handleClientSync = () => {
    console.log("Client Sync triggered");
  };

  const handleReportGen = () => {
    console.log("Report Generation triggered");
  };

  const handleAutoFlow = () => {
    console.log("Auto Flow triggered");
  };

  return (
    <>
      {/* Dark Header - Professional Layout */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-slate-800 shadow-lg h-48 relative">
        
        {/* Centered YoBot Command Center Logo */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-[60]">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex justify-center">
              <img 
                src={yobotLogoPath} 
                alt="YoBot" 
                className="h-10 w-auto"
              />
            </div>
            <div className="flex justify-center">
              <h2 className="text-lg font-bold text-white tracking-wide text-center">Command Center</h2>
            </div>
          </div>
        </div>

        <div className="h-full flex items-center justify-between px-8 pt-20">
          
          {/* Left Section - Command Center Action Buttons */}
          <div className="flex space-x-4">
            <Button
              onClick={handleCallPipeline}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Call Pipeline</span>
            </Button>
            
            <Button
              onClick={handleClientSync}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Client Sync</span>
            </Button>

            <Button
              onClick={handleReportGen}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Report Gen</span>
            </Button>

            <Button
              onClick={handleAutoFlow}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Auto Flow</span>
            </Button>
          </div>

          {/* Right Section - Status Controls */}
          <div className="flex items-center space-x-4">
            <div className="bg-slate-800/70 rounded-lg px-4 py-2 border border-slate-600">
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm font-medium">Voice Ready</span>
              </div>
            </div>
            
            <div className="bg-slate-800/70 rounded-lg px-4 py-2 border border-slate-600">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">System Status</span>
              </div>
            </div>

            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm border ${
              isConnected 
                ? 'bg-green-900/30 text-green-300 border-green-600/50' 
                : 'bg-red-900/30 text-red-300 border-red-600/50'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Spacer */}
      <div className="h-48" />
    </>
  );
}