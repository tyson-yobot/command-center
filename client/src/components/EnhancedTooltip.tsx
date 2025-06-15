import React, { useState, useRef, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Info, AlertCircle, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface EnhancedTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  type?: 'info' | 'warning' | 'success' | 'tip' | 'guide';
  shortcuts?: string[];
  relatedActions?: { label: string; action: () => void }[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  showDelay?: number;
  interactive?: boolean;
}

export function EnhancedTooltip({ 
  children, 
  title, 
  description, 
  type = 'info',
  shortcuts = [],
  relatedActions = [],
  position = 'top',
  showDelay = 300,
  interactive = false
}: EnhancedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!interactive) {
      setIsVisible(false);
      setShowAdvanced(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getTypeIcon = () => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'tip': return <Lightbulb className="w-4 h-4 text-blue-400" />;
      case 'guide': return <ArrowRight className="w-4 h-4 text-purple-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'warning': return 'border-yellow-400 bg-yellow-400/10';
      case 'success': return 'border-green-400 bg-green-400/10';
      case 'tip': return 'border-blue-400 bg-blue-400/10';
      case 'guide': return 'border-purple-400 bg-purple-400/10';
      default: return 'border-slate-400 bg-slate-400/10';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={isVisible} onOpenChange={setIsVisible}>
        <TooltipTrigger 
          asChild
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={position}
          className="p-0 border-0 bg-transparent max-w-sm"
          onMouseEnter={() => interactive && setIsVisible(true)}
          onMouseLeave={() => interactive && handleMouseLeave()}
        >
          <Card className={`${getTypeColor()} border bg-slate-900/95 backdrop-blur-sm shadow-lg`}>
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start space-x-2 mb-2">
                {getTypeIcon()}
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{title}</h4>
                  <p className="text-slate-300 text-xs mt-1">{description}</p>
                </div>
              </div>

              {/* Shortcuts */}
              {shortcuts.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs font-medium">Keyboard Shortcuts</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {shortcuts.map((shortcut, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="text-xs py-0.5 px-1.5 border-slate-500 text-slate-300"
                      >
                        {shortcut}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Actions */}
              {relatedActions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs font-medium">Quick Actions</span>
                  </div>
                  <div className="space-y-1">
                    {relatedActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="w-full text-left text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800/50 rounded px-2 py-1 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Toggle */}
              {(shortcuts.length > 0 || relatedActions.length > 0) && interactive && (
                <div className="mt-3 pt-2 border-t border-slate-600">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Preset tooltip configurations for common use cases
export const TooltipPresets = {
  voiceCommand: {
    title: "Voice Commands",
    description: "Use voice commands to control the dashboard hands-free",
    type: 'tip' as const,
    shortcuts: ['Hold Spacebar', 'Say "Start Pipeline"', 'Say "Scrape Leads"'],
    relatedActions: [
      { label: 'View Voice Command Guide', action: () => console.log('Voice guide') },
      { label: 'Test Microphone', action: () => console.log('Test mic') }
    ]
  },
  
  leadScraper: {
    title: "Lead Scraping",
    description: "Extract leads from Apollo, Apify, and PhantomBuster platforms",
    type: 'guide' as const,
    shortcuts: ['Ctrl + L', 'Enter to Run'],
    relatedActions: [
      { label: 'Configure API Keys', action: () => console.log('Config APIs') },
      { label: 'View Scraped Data', action: () => console.log('View data') }
    ]
  },
  
  pipeline: {
    title: "Automation Pipeline",
    description: "Monitor and control automated workflows and processes",
    type: 'info' as const,
    shortcuts: ['Ctrl + P', 'Space to Pause'],
    relatedActions: [
      { label: 'Start Pipeline', action: () => console.log('Start pipeline') },
      { label: 'View Logs', action: () => console.log('View logs') }
    ]
  },
  
  calendar: {
    title: "Smart Calendar",
    description: "Upload ICS/CSV files or sync with Google Calendar",
    type: 'success' as const,
    shortcuts: ['Ctrl + U', 'Drag & Drop'],
    relatedActions: [
      { label: 'Upload Calendar File', action: () => console.log('Upload') },
      { label: 'Sync Google Calendar', action: () => console.log('Sync') }
    ]
  }
};

// Helper component for quick tooltip application
interface QuickTooltipProps {
  preset: keyof typeof TooltipPresets;
  children: React.ReactNode;
  customTitle?: string;
  customDescription?: string;
}

export function QuickTooltip({ 
  preset, 
  children, 
  customTitle, 
  customDescription 
}: QuickTooltipProps) {
  const config = TooltipPresets[preset];
  
  return (
    <EnhancedTooltip
      {...config}
      title={customTitle || config.title}
      description={customDescription || config.description}
      interactive={true}
    >
      {children}
    </EnhancedTooltip>
  );
}