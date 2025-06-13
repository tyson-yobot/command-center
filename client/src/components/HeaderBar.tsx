// YoBot® Command Center - Header Bar + Nav Shell (Tailwind + React)
// This creates a polished top bar and nav system for client and demo use

import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User, Bot, Settings, LogOut, ChevronDown, LayoutDashboard, MessageSquare, BookOpen, Mic, FileText, Users, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    <div className="w-full bg-gradient-to-r from-[#0b1627] to-[#071021] shadow-lg z-50 sticky top-0 border-b border-slate-800">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo & System Mode */}
        <div className="flex items-center gap-4">
          <div className="text-white text-2xl font-bold flex items-center gap-2">
            <Bot className="text-sky-400" size={28} />
            YoBot<sup className="text-xs">®</sup>
          </div>
          
          {/* System Status Badges */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={isLiveMode ? "default" : "secondary"}
              className={`${isLiveMode ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white text-xs px-2 py-1 uppercase`}
            >
              {isLiveMode ? '🟢 Live Mode' : '🧪 Test Mode'}
            </Badge>
            
            {clientName && (
              <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                Client: {clientName}
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-6 text-sm text-gray-300">
          <div className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors duration-200">
            <LayoutDashboard size={16}/> 
            <span>Dashboard</span>
          </div>
          <div className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors duration-200">
            <Mic size={16}/> 
            <span>Voice Ops</span>
          </div>
          <div className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors duration-200">
            <BookOpen size={16}/> 
            <span>Knowledge</span>
          </div>
          <div className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors duration-200">
            <MessageSquare size={16}/> 
            <span>AI Scripts</span>
          </div>
          <div className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors duration-200">
            <FileText size={16}/> 
            <span>Sales</span>
          </div>
          <div className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors duration-200">
            <Users size={16}/> 
            <span>Clients</span>
          </div>
        </div>

        {/* Profile, Notifications & Settings */}
        <div className="flex items-center gap-4">
          {/* System Mode Toggle */}
          {onModeToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={onModeToggle}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Switch to {isLiveMode ? 'Test' : 'Live'}
            </Button>
          )}

          {/* Notifications */}
          <div className="relative cursor-pointer hover:text-gray-200 transition-colors">
            <Bell size={20} className="text-slate-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium">{userName}</span>
              <ChevronDown size={16}/>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f172a] border border-gray-700 text-white min-w-[180px]">
              <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
                <User size={16} className="mr-2"/> 
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
                <Settings size={16} className="mr-2"/> 
                System Config
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer border-t border-gray-700 mt-1 pt-2">
                <LogOut size={16} className="mr-2"/> 
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="bg-slate-900/50 px-6 py-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Bot Status: Active
            </span>
            <span>Last Deploy: 2 hours ago</span>
            <span>Uptime: 99.8%</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Version: 2.4.1</span>
            <span>Environment: {isLiveMode ? 'Production' : 'Development'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}