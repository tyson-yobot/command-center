// YoBot® Command Center - Header Bar + Nav Shell (Tailwind + React)
// Final version using white-on-dark full logo with tagline for optimal demo use

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, ChevronDown, LayoutDashboard, MessageSquare, BookOpen, Mic, FileText, Users, FileDown, Bot } from 'lucide-react';
// Robot head SVG component
const RobotHead = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" className="logo-icon">
    <defs>
      <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    {/* Antenna */}
    <circle cx="50" cy="15" r="4" fill="#1f2937" />
    <rect x="48" y="15" width="4" height="20" fill="#1f2937" />
    
    {/* Main robot head body */}
    <rect x="20" y="35" width="60" height="45" rx="8" ry="8" fill="#1f2937" stroke="#374151" strokeWidth="2" />
    <rect x="25" y="40" width="50" height="35" rx="5" ry="5" fill="url(#robotGradient)" />
    
    {/* Eyes */}
    <circle cx="35" cy="55" r="5" fill="#000" />
    <circle cx="65" cy="55" r="5" fill="#000" />
    
    {/* Smile */}
    <path d="M 35 70 Q 50 80 65 70" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

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
    <div className="w-full bg-gradient-to-r from-[#0b1627] to-[#071021] shadow-lg z-50 sticky top-0">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-6">
          <div className="header-logo-wrapper">
            <RobotHead />
            <div className="header-title text-white">
              YoBot<sup className="text-xs">®</sup> Command Center
            </div>
          </div>
          
          {/* System Mode Toggle */}
          <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-300">System Mode:</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${!isLiveMode ? 'text-yellow-400 font-semibold' : 'text-gray-400'}`}>Test</span>
              <Switch
                checked={isLiveMode}
                onCheckedChange={onModeToggle}
                className="data-[state=checked]:bg-green-600"
              />
              <span className={`text-sm ${isLiveMode ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>Live</span>
            </div>
            {isLiveMode && (
              <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded">
                Live Mode - Production Data
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-6 text-sm text-gray-300">
          <div className="hover:text-white cursor-pointer flex items-center gap-1"><LayoutDashboard size={16}/> Dashboard</div>
          <div className="hover:text-white cursor-pointer flex items-center gap-1"><Mic size={16}/> Voice Logs</div>
          <div className="hover:text-white cursor-pointer flex items-center gap-1"><BookOpen size={16}/> RAG + Knowledge</div>
          <div className="hover:text-white cursor-pointer flex items-center gap-1"><MessageSquare size={16}/> QA & Scripts</div>
          <div className="hover:text-white cursor-pointer flex items-center gap-1"><FileText size={16}/> Sales / Orders</div>
          <div className="hover:text-white cursor-pointer flex items-center gap-1"><Users size={16}/> Clients</div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button variant="outline" className="text-white border-green-600 hover:bg-green-600">Start Demo</Button>
          <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black"><FileDown size={16} className="mr-1"/> Export</Button>
          <Button variant="outline" className="text-white border-yellow-400 hover:bg-yellow-400 hover:text-black">Reset Demo</Button>

          {/* Profile & Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-white hover:text-gray-200">
              <User className="text-white" size={20}/> {userName} <ChevronDown size={16}/>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f172a] border border-gray-700 text-white">
              <DropdownMenuItem className="hover:bg-slate-800"><Settings size={16} className="mr-2"/> Settings</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-800"><LogOut size={16} className="mr-2"/> Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}