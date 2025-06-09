import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { useModeContext } from '../App';
import { Monitor, Settings, Search, Maximize2, Minimize2 } from 'lucide-react';
import ClientDashboard from './client-dashboard';
import ControlCenter from './control-center';
import LeadScrapingPage from './lead-scraping-page';

export default function MultiView() {
  const { isTestMode, setTestMode } = useModeContext();
  const [expandedView, setExpandedView] = useState<string | null>(null);

  if (expandedView) {
    const renderExpandedView = () => {
      switch (expandedView) {
        case 'command':
          return <ClientDashboard />;
        case 'control':
          return <ControlCenter />;
        case 'lead':
          return <LeadScrapingPage />;
        default:
          return null;
      }
    };

    return (
      <div className="relative">
        <Button
          onClick={() => setExpandedView(null)}
          className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Back to Multi-View
        </Button>
        {renderExpandedView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-white mb-2">
            YoBot® Multi-View Dashboard
          </h1>
          <p className="text-slate-300 text-lg">All Three Screens in One View</p>
          
          {/* Global Test/Live Mode Toggle */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
              <label className="text-white font-medium">System Mode:</label>
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${isTestMode ? 'text-yellow-400' : 'text-gray-400'}`}>
                  🧪 Test
                </span>
                <Switch
                  checked={!isTestMode}
                  onCheckedChange={(checked) => setTestMode(!checked)}
                  className="data-[state=checked]:bg-green-500"
                />
                <span className={`text-sm ${!isTestMode ? 'text-green-400' : 'text-gray-400'}`}>
                  🚀 Live
                </span>
              </div>
              <Badge variant={isTestMode ? "secondary" : "default"} className="px-3 py-1">
                {isTestMode ? "Test Mode - Safe Operations" : "Live Mode - Real Operations"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Three Panel Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        
        {/* Command Center Panel */}
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-400 flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Command Center
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setExpandedView('command')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-full overflow-hidden">
            <div className="h-full overflow-y-auto" style={{ maxHeight: '600px' }}>
              <div className="transform scale-50 origin-top-left w-[200%] h-[200%]">
                <ClientDashboard />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Center Panel */}
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-400 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Control Center
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setExpandedView('control')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-full overflow-hidden">
            <div className="h-full overflow-y-auto" style={{ maxHeight: '600px' }}>
              <div className="transform scale-50 origin-top-left w-[200%] h-[200%]">
                <ControlCenter />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Scraper Panel */}
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-400 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Lead Scraper
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setExpandedView('lead')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-full overflow-hidden">
            <div className="h-full overflow-y-auto" style={{ maxHeight: '600px' }}>
              <div className="transform scale-50 origin-top-left w-[200%] h-[200%]">
                <LeadScrapingPage />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-4 right-4 flex space-x-2">
        <Button
          onClick={() => window.open('/command-center', '_blank')}
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          Open Command Center
        </Button>
        <Button
          onClick={() => window.open('/control-center', '_blank')}
          className="bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          Open Control Center
        </Button>
        <Button
          onClick={() => window.open('/lead-scraper', '_blank')}
          className="bg-green-600 hover:bg-green-700"
          size="sm"
        >
          Open Lead Scraper
        </Button>
      </div>
    </div>
  );
}