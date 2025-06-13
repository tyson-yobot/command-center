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
    <div className="w-full bg-gradient-to-r from-[#0b1627] to-[#071021] shadow-lg z-50 sticky top-0">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo & System Mode */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-white text-2xl font-bold flex items-center gap-2">
              <Bot className="text-sky-400" size={28} />
              YoBot<sup className="text-xs">®</sup>
            </div>
          </div>
          <span className={`ml-3 text-white text-xs px-2 py-1 rounded-md uppercase ${isLiveMode ? 'bg-green-600' : 'bg-yellow-600'}`}>
            {isLiveMode ? 'Live Mode' : 'Test Mode'}
          </span>
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
          <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black"><FileDown size={16} className="mr-1"/> Export</Button>

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