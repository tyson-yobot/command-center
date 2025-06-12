import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Phone, Play, Pause, Download, PhoneCall } from 'lucide-react';

interface CallRecord {
  id: string;
  phoneNumber: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'failed';
  timestamp: string;
  recording?: string;
}

interface CallMonitoringPopupProps {
  isOpen: boolean;
  onClose: () => void;
  activeCalls: any[];
  totalRecords: number;
  completedCalls: number;
}

const CallMonitoringPopup: React.FC<CallMonitoringPopupProps> = ({ 
  isOpen, 
  onClose, 
  activeCalls, 
  totalRecords, 
  completedCalls 
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            Call Monitoring Dashboard
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeCalls.length}</div>
              <div className="text-sm text-gray-600">Active Calls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCalls}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalRecords}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Call Activity</h3>
            {activeCalls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active calls at this time
              </div>
            ) : (
              <div className="space-y-2">
                {activeCalls.map((call, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{call.phoneNumber || 'Unknown'}</div>
                        <div className="text-sm text-gray-600">{call.timestamp || 'Now'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(call.status)}>
                        {call.status || 'active'}
                      </Badge>
                      <div className="text-sm">{call.duration || '0:00'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallMonitoringPopup;