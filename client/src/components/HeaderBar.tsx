// YoBot® Command Center - Header Bar + Nav Shell (Tailwind + React)
// Final version using white-on-dark full logo with tagline for optimal demo use

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, ChevronDown, LayoutDashboard, MessageSquare, BookOpen, Mic, FileText, Users, FileDown, Bot } from 'lucide-react';
import robotHeadImage from '@assets/A_flat_vector_illustration_features_a_robot_face_i_1750232885253.png';

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
    <div className="w-full bg-[#1e3a8a] shadow-lg z-50 sticky top-0">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-2">
          <img 
            src={robotHeadImage} 
            alt="YoBot Robot Head" 
            className="w-8 h-8"
            onError={(e) => {
              console.log('Image failed to load, showing Bot icon fallback');
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <Bot className="text-white w-10 h-10" style={{ display: 'none' }} />
          <div className="text-white text-xl font-bold">
            YoBot<sup className="text-xs">®</sup> Command Center
          </div>
        </div>

        {/* System Mode Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm">System Mode:</span>
            <span className="text-white text-sm font-medium flex items-center gap-2">
              Test
              {!isLiveMode && <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>}
            </span>
            <Switch 
              checked={isLiveMode}
              onCheckedChange={onModeToggle}
              className="data-[state=checked]:bg-green-500"
            />
            <span className="text-white text-sm font-medium flex items-center gap-2">
              Live
              {isLiveMode && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isLiveMode ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
            }`}>
              {isLiveMode ? 'Production Data' : 'Test Mode'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}