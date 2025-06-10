import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneCall, Activity, Users, Clock, Play, Square } from 'lucide-react';

interface CallDetails {
  activeCalls: Array<{
    id: string;
    client: string;
    duration: string;
    status: string;
  }>;
  todayStats: {
    totalCalls: number;
    averageDuration: string;
    successRate: string;
    conversionRate: string;
  };
  recentCalls: Array<{
    time: string;
    client: string;
    outcome: string;
    duration: string;
  }>;
}

export function CallMonitoringPopup() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCallDetails();
  }, []);

  const fetchCallDetails = async () => {
    try {
      const response = await fetch('/api/call-monitoring/details');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCallDetails(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch call details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleMonitoring = async () => {
    try {
      const action = isMonitoring ? 'stop' : 'start';
      const response = await fetch('/api/call-monitoring/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        setIsMonitoring(!isMonitoring);
        await fetchCallDetails(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
    }
  };

  const handleViewDetails = async () => {
    await fetchCallDetails();
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
              <span>{callDetails?.activeCalls?.length || 0} Active Calls</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-800/50 rounded p-2">
              <div className="flex items-center text-blue-300">
                <PhoneCall className="w-4 h-4 mr-1" />
                <span>Today</span>
              </div>
              <div className="text-white font-semibold">
                {loading ? "..." : callDetails?.todayStats?.totalCalls || 0} calls
              </div>
            </div>
            <div className="bg-slate-800/50 rounded p-2">
              <div className="flex items-center text-green-300">
                <Clock className="w-4 h-4 mr-1" />
                <span>Avg Duration</span>
              </div>
              <div className="text-white font-semibold">
                {loading ? "..." : callDetails?.todayStats?.averageDuration || "0m 0s"}
              </div>
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