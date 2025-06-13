// YoBot® Command Center - Header Bar + Nav Shell (Tailwind + React)
// Final version using white-on-dark full logo with tagline for optimal demo use

import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, ChevronDown, LayoutDashboard, MessageSquare, BookOpen, Mic, FileText, Users, FileDown, Bot } from 'lucide-react';
// Logo will be handled via public assets

interface HeaderBarProps {
  currentSystemMode?: string;
  userName?: string;
  clientName?: string;
  onModeToggle?: () => void;
}

export default function HeaderBar({ 
  currentSystemMode = 'live', 
  userName = 'Daniel Sharpe',
  clientName = 'AMT66',
  onModeToggle 
}: HeaderBarProps) {
  const isLiveMode = currentSystemMode === 'live';

  return (
    <div className="w-full bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg z-50 sticky top-0">
      <div className="flex flex-col items-center justify-center px-6 py-4">
        {/* Logo & Title - Centered */}
        <div className="flex items-center gap-3 mb-2">
          <Bot className="text-white" size={32} />
          <div className="text-white text-2xl font-bold">
            YoBot<sup className="text-xs">®</sup> Command Center
          </div>
        </div>

        <div className="text-slate-200 text-sm mb-3">Your Complete AI Automation Dashboard</div>

        {/* System Mode Toggle - Centered */}
        <div className="flex items-center gap-3">
          <span className="text-white text-sm">System Mode:</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-200 text-sm">Test</span>
            <div 
              className={`relative inline-flex h-5 w-10 items-center rounded-full cursor-pointer transition-colors ${isLiveMode ? 'bg-green-500' : 'bg-gray-400'}`}
              onClick={onModeToggle}
            >
              <div className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${isLiveMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-slate-200 text-sm">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}