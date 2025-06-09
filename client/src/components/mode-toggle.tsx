import React, { useState, useEffect } from "react";
import { Settings, TestTube, Zap, AlertCircle } from "lucide-react";

interface ModeToggleProps {
  onModeChange?: (mode: 'test' | 'live') => void;
}

export default function ModeToggle({ onModeChange }: ModeToggleProps) {
  const [currentMode, setCurrentMode] = useState<'test' | 'live'>('live');
  const [isLoading, setIsLoading] = useState(false);

  // DISABLED to stop API polling
  // useEffect(() => {
  //   // Get current mode from server
  //   fetch('/api/system-mode')
  //     .then(res => res.json())
  //     .then(data => {
  //       setCurrentMode(data.systemMode);
  //       onModeChange?.(data.systemMode);
  //     })
  //     .catch(console.error);
  // }, [onModeChange]);

  const handleModeChange = async (newMode: 'test' | 'live') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
      
      if (response.ok) {
        setCurrentMode(newMode);
        onModeChange?.(newMode);
      }
    } catch (error) {
      console.error('Failed to change mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <Settings className="w-5 h-5 text-slate-300" />
          <span className="text-sm font-semibold text-slate-200">System Mode</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('test')}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              currentMode === 'test'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            <TestTube className="w-4 h-4" />
            Test Mode
          </button>
          
          <button
            onClick={() => handleModeChange('live')}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              currentMode === 'live'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            Live Mode
          </button>
        </div>
        
        <div className="mt-3 text-xs text-slate-400">
          {currentMode === 'test' ? (
            <div className="flex items-center gap-1">
              <TestTube className="w-3 h-3" />
              Using test data for all operations
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-orange-400" />
              Live API calls active
            </div>
          )}
        </div>
      </div>
    </div>
  );
}