import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Settings, Database, Users, Phone } from 'lucide-react';

interface TestModeSettingsProps {
  onBack: () => void;
}

const TestModeSettings: React.FC<TestModeSettingsProps> = ({ onBack }) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <X className="h-4 w-4" />
        </Button>
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-bold">Test Mode Settings</h2>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Population
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="populate-metrics">Populate Demo Metrics</Label>
              <Switch id="populate-metrics" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="populate-calls">Generate Call Records</Label>
              <Switch id="populate-calls" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="populate-tickets">Create Sample Tickets</Label>
              <Switch id="populate-tickets" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="simulate-activity">Simulate User Activity</Label>
              <Switch id="simulate-activity" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-responses">Auto Chat Responses</Label>
              <Switch id="auto-responses" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Call Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="mock-calls">Mock Active Calls</Label>
              <Switch id="mock-calls" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="call-recordings">Generate Recordings</Label>
              <Switch id="call-recordings" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1">Save Settings</Button>
          <Button variant="outline" className="flex-1">Reset to Default</Button>
        </div>
      </div>
    </div>
  );
};

export default TestModeSettings;