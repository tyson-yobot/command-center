import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneCall, Activity, Users, Clock } from 'lucide-react';

export function CallMonitoringPopup() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [activeCallsCount, setActiveCallsCount] = useState(3);
  
  const handleToggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const handleViewDetails = async () => {
    try {
      const response = await fetch('/api/call-monitoring/details');
      if (response.ok) {
        const data = await response.json();
        console.log('Call monitoring details:', data);
      }
    } catch (error) {
      console.error('Failed to fetch call details:', error);
    }
  };

  return (
    <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Phone className="w-5 h-5 mr-2" />
          Call Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge 
              variant={isMonitoring ? "default" : "secondary"} 
              className={isMonitoring ? "bg-green-600 text-white" : "bg-gray-600 text-white"}
            >
              {isMonitoring ? "Active" : "Inactive"}
            </Badge>
            <div className="flex items-center text-white text-sm">
              <Activity className="w-4 h-4 mr-1" />
              <span>{activeCallsCount} Active Calls</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-800/50 rounded p-2">
              <div className="flex items-center text-blue-300">
                <PhoneCall className="w-4 h-4 mr-1" />
                <span>Today</span>
              </div>
              <div className="text-white font-semibold">47 calls</div>
            </div>
            <div className="bg-slate-800/50 rounded p-2">
              <div className="flex items-center text-green-300">
                <Clock className="w-4 h-4 mr-1" />
                <span>Avg Duration</span>
              </div>
              <div className="text-white font-semibold">3m 42s</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={handleViewDetails}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-start p-3"
            >
              <Activity className="w-4 h-4 mr-2" />
              <span>View Call Details</span>
            </Button>
            
            <Button
              onClick={handleToggleMonitoring}
              className={`${isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white flex items-center justify-start p-3`}
            >
              <Phone className="w-4 h-4 mr-2" />
              <span>{isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}