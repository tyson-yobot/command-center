import React, { useState, useEffect } from 'react';

export default function CommandCenter() {
  const [systemMode, setSystemMode] = useState<'test' | 'live'>('live');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>({});

  useEffect(() => {
    // Get current system mode
    fetch('/api/system-mode')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSystemMode(data.systemMode);
        }
      })
      .catch(err => console.error('Failed to get system mode:', err));

    // Get metrics
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMetrics(data);
        }
      })
      .catch(err => console.error('Failed to get metrics:', err));
  }, []);

  const toggleSystemMode = async () => {
    setIsLoading(true);
    const newMode = systemMode === 'test' ? 'live' : 'test';
    
    try {
      const response = await fetch('/api/system-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: newMode }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSystemMode(newMode);
        // Refresh the page to reload all data with new mode
        window.location.reload();
      } else {
        console.error('Failed to toggle system mode:', data.error);
      }
    } catch (error) {
      console.error('Error toggling system mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-400">YoBot Command Center</h1>
        
        {/* System Mode Toggle */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-400">System Mode:</span>
          <button
            onClick={toggleSystemMode}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              systemMode === 'live'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Switching...' : `${systemMode.toUpperCase()} MODE`}
          </button>
        </div>
      </div>

      {/* Mode Indicator */}
      <div className={`p-4 rounded-lg mb-6 ${
        systemMode === 'live'
          ? 'bg-green-900/30 border border-green-500/50'
          : 'bg-yellow-900/30 border border-yellow-500/50'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            systemMode === 'live' ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <span className="font-medium">
            {systemMode === 'live' 
              ? 'LIVE MODE - Production data isolation active'
              : 'TEST MODE - Simulation data environment'
            }
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/80 border border-blue-500/50 rounded-lg p-6">
          <div className="text-blue-400 text-sm font-medium mb-2">Active Calls</div>
          <div className="text-2xl font-bold">{metrics.activeCalls || 0}</div>
        </div>
        
        <div className="bg-slate-800/80 border border-purple-500/50 rounded-lg p-6">
          <div className="text-purple-400 text-sm font-medium mb-2">AI Responses</div>
          <div className="text-2xl font-bold">{metrics.aiResponsesToday || 0}</div>
        </div>
        
        <div className="bg-slate-800/80 border border-green-500/50 rounded-lg p-6">
          <div className="text-green-400 text-sm font-medium mb-2">Pipeline Value</div>
          <div className="text-2xl font-bold">${(metrics.pipelineValue || 0).toLocaleString()}</div>
        </div>
        
        <div className="bg-slate-800/80 border border-cyan-500/50 rounded-lg p-6">
          <div className="text-cyan-400 text-sm font-medium mb-2">System Health</div>
          <div className="text-2xl font-bold">{metrics.systemHealth || 0}%</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a 
          href="/control-center" 
          className="bg-slate-800/80 border border-blue-500/50 rounded-lg p-6 hover:bg-slate-700/80 transition-colors"
        >
          <div className="text-blue-400 text-lg font-medium mb-2">Control Center</div>
          <div className="text-slate-400 text-sm">System toggles and switches</div>
        </a>
        
        <a 
          href="/lead-scraper" 
          className="bg-slate-800/80 border border-purple-500/50 rounded-lg p-6 hover:bg-slate-700/80 transition-colors"
        >
          <div className="text-purple-400 text-lg font-medium mb-2">Lead Scraper</div>
          <div className="text-slate-400 text-sm">Apollo, Phantom, Apify interface</div>
        </a>
        
        <a 
          href="/mobile" 
          className="bg-slate-800/80 border border-green-500/50 rounded-lg p-6 hover:bg-slate-700/80 transition-colors"
        >
          <div className="text-green-400 text-lg font-medium mb-2">Mobile Interface</div>
          <div className="text-slate-400 text-sm">Responsive UI with card reader</div>
        </a>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-slate-800/80 border border-slate-500/50 rounded-lg p-6">
        <div className="text-white text-lg font-medium mb-4">System Status</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-slate-400 text-sm">Data Isolation</div>
            <div className={`text-sm font-medium ${
              systemMode === 'live' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {systemMode === 'live' ? '✓ Production Protected' : '⚠ Test Environment'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">API Status</div>
            <div className="text-green-400 text-sm font-medium">✓ Connected</div>
          </div>
        </div>
      </div>
    </div>
  );
}