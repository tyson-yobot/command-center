// YoBot® Command Center - Header Bar + Nav Shell (Tailwind + React)
// Final version using white-on-dark full logo with tagline for optimal demo use

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, ChevronDown, LayoutDashboard, MessageSquare, BookOpen, Mic, FileText, Users, FileDown, Bot } from 'lucide-react';
import robotHeadImage from '@assets/A_flat_vector_illustration_features_a_robot_face_i_1749784150776.png';

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
            <img 
              src={robotHeadImage} 
              alt="YoBot Robot Head" 
              className="logo-icon"
              onError={(e) => {
                console.log('Image failed to load, using fallback');
                e.currentTarget.style.display = 'none';
              }}
            />
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