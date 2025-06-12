import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Clock } from 'lucide-react';

interface CallMonitoringDetailsProps {
  onBack: () => void;
}

const CallMonitoringDetails: React.FC<CallMonitoringDetailsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-blue-800/50">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Phone className="h-5 w-5 text-white" />
        <h2 className="text-xl font-bold text-white">Call Monitoring Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/90 border-gray-600 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-300">
              No active call sessions
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/90 border-gray-600 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-300">
              No recent call activity
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/90 border-gray-600 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Call Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-300">
              No call reports available
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/90 border-gray-600 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Monitoring Service</span>
                <span className="text-red-400 font-medium">Inactive</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Recording Service</span>
                <span className="text-red-400 font-medium">Inactive</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Analytics Service</span>
                <span className="text-red-400 font-medium">Inactive</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { CallMonitoringDetails };