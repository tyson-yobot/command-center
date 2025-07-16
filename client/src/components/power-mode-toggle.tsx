import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Crown, 
  Settings, 
  Eye, 
  BarChart3,
  Activity,
  Users,
  Shield,
  Zap
} from 'lucide-react';

interface PowerModeProps {
  onModeChange: (mode: 'ceo' | 'ops') => void;
  currentMode: 'ceo' | 'ops';
}

export default function PowerModeToggle({ onModeChange, currentMode }: PowerModeProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const modes = {
    ceo: {
      title: '💼 CEO View',
      description: 'Executive dashboard with topline metrics and KPIs',
      features: [
        'Revenue & ROI tracking',
        'High-level performance metrics', 
        'Strategic insights only',
        'Clean executive interface'
      ],
      color: 'from-purple-600 to-indigo-600',
      icon: Crown
    },
    ops: {
      title: '🔧 Operations Mode',
      description: 'Full control panel with detailed logs and system access',
      features: [
        'Complete system diagnostics',
        'Bot deployment controls',
        'Real-time log monitoring',
        'Emergency protocols, access'
      ],
      color: 'from-blue-600 to-cyan-600',
      icon: Settings
    }
  };

  return (
    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Power Mode Control
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Dark Mode</span>
              <Switch 
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
            
            <Badge 
              variant={currentMode === 'ceo' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {currentMode.toUpperCase()} MODE
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(modes).map(([key, mode]) => {
            const Icon = mode.icon;
            const isActive = currentMode === key;
            
            return (
              <div
                key={key}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                onClick={() => onModeChange(key as 'ceo' | 'ops')}
              >
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${mode.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{mode.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mode.description}
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-1">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <div className="h-1 w-1 bg-gray-400 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  size="sm" 
                  variant={isActive ? 'default' : 'outline'}
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onModeChange(key as 'ceo' | 'ops');
                  }}
                >
                  {isActive ? 'Active Mode' : `Switch to ${mode.title}`}
                </Button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Eye className="h-5 w-5" />
            <span className="font-medium">Smart Interface Adaptation</span>
          </div>
          <p className="text-green-600 dark:text-green-400 mt-2 text-sm">
            The dashboard automatically adjusts complexity, data visibility, and control access based on your selected mode. 
            Switch anytime to match your current needs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}