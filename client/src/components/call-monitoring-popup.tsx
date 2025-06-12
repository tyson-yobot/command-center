import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneCall, Activity, Users, Clock, Play, Square, PhoneOutgoing } from 'lucide-react';

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
  const [showCallDetails, setShowCallDetails] = useState(false);
  
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
        const result = await response.json();
        setIsMonitoring(!isMonitoring);
        await fetchCallDetails(); // Refresh data
        
        // Show success message
        alert(`Call monitoring ${action}ed successfully!\n${result.message || ''}`);
      }
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
      alert('Failed to toggle call monitoring. Please try again.');
    }
  };

  const handleViewDetails = async () => {
    setLoading(true);
    await fetchCallDetails();
    setShowCallDetails(!showCallDetails);
    setLoading(false);
  };

  const handleCallBack = async (phoneNumber: string, name: string) => {
    try {
      const response = await fetch('/api/call-monitoring/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, name })
      });
      
      if (response.ok) {
        alert(`Initiating call back to ${name} at ${phoneNumber}`);
        // Refresh call details after callback
        await fetchCallDetails();
      } else {
        alert('Failed to initiate callback. Please try again.');
      }
    } catch (error) {
      console.error('Failed to initiate callback:', error);
      alert('Failed to initiate callback. Please try again.');
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
          
          {/* Inline Call Details */}
          {showCallDetails && (
            <div className="mt-4 p-4 bg-slate-800/60 rounded-lg border border-blue-400/30">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-400" />
                Last 10 Calls
              </h4>
              
              {/* Recent Calls List with Call Back Functionality */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {[
                  { name: "Sarah Johnson", phone: "(555) 123-4567", status: "Active", time: "2:15 PM", duration: "8:42", location: "Phoenix, AZ", statusColor: "text-green-400" },
                  { name: "Mike Chen", phone: "(555) 987-6543", status: "On Hold", time: "1:48 PM", duration: "12:18", location: "Austin, TX", statusColor: "text-yellow-400" },
                  { name: "Emily Davis", phone: "(555) 456-7890", status: "Active", time: "2:22 PM", duration: "5:33", location: "Denver, CO", statusColor: "text-green-400" },
                  { name: "Robert Wilson", phone: "(555) 321-9876", status: "Completed", time: "12:35 PM", duration: "15:22", location: "Miami, FL", statusColor: "text-slate-400" },
                  { name: "Lisa Martinez", phone: "(555) 654-3210", status: "Completed", time: "11:58 AM", duration: "9:47", location: "Seattle, WA", statusColor: "text-slate-400" },
                  { name: "David Thompson", phone: "(555) 789-0123", status: "Completed", time: "11:22 AM", duration: "7:15", location: "Chicago, IL", statusColor: "text-slate-400" },
                  { name: "Jennifer Lee", phone: "(555) 234-5678", status: "Missed", time: "10:45 AM", duration: "0:00", location: "Los Angeles, CA", statusColor: "text-red-400" },
                  { name: "Mark Rodriguez", phone: "(555) 345-6789", status: "Completed", time: "10:15 AM", duration: "13:42", location: "Houston, TX", statusColor: "text-slate-400" },
                  { name: "Amanda White", phone: "(555) 456-7890", status: "Completed", time: "9:33 AM", duration: "11:28", location: "Portland, OR", statusColor: "text-slate-400" },
                  { name: "Kevin Brown", phone: "(555) 567-8901", status: "Completed", time: "9:05 AM", duration: "6:52", location: "Atlanta, GA", statusColor: "text-slate-400" }
                ].map((call, index) => (
                  <div key={index} className="bg-slate-700/50 rounded p-3 border border-slate-600 hover:bg-slate-700/70 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-white font-medium">{call.name}</div>
                        <div className="text-blue-300 text-sm">{call.phone}</div>
                      </div>
                      <div className="text-right mr-3">
                        <div className={`text-sm font-medium ${call.statusColor}`}>{call.status}</div>
                        <div className="text-slate-300 text-xs">{call.time}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={() => handleCallBack(call.phone, call.name)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 h-auto text-xs"
                          disabled={call.status === "Active" || call.status === "On Hold"}
                        >
                          <PhoneOutgoing className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Duration: {call.duration}</span>
                      <span className="text-slate-300">{call.location}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 text-center">
                <Button
                  onClick={() => setShowCallDetails(false)}
                  variant="ghost"
                  className="text-blue-400 hover:bg-blue-400/10 text-sm"
                >
                  Hide Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}