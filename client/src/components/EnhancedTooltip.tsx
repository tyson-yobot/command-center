import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

export function EnhancedTooltip({ 
  children, 
  content, 
  side = 'top',
  delay = 300 
}: EnhancedTooltipProps) {
  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="bg-slate-800 border border-slate-600 text-white text-sm max-w-xs px-3 py-2"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}