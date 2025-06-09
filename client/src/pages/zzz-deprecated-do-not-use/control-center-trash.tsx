import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Settings, 
  Monitor, 
  Search, 
  ArrowLeft,
  Activity,
  Database,
  Phone,
  Mail,
  MessageSquare,
  Bot,
  Calendar,
  DollarSign,
  BarChart,
  Users,
  Zap
} from 'lucide-react';

export default function ControlCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 pt-8 p-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-6xl font-bold text-white mb-3 flex items-center justify-center">
              <Settings className="w-16 h-16 mr-4 text-purple-400" />
              YoBot® Control Center
            </h1>
            <p className="text-slate-300 text-xl">System Configuration & Toggle Dashboard</p>
            
            {/* Navigation Menu */}
            <div className="flex justify-center mt-4 mb-6">
              <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
                <Link href="/command-center">
                  <Button 
                    variant="outline" 
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Command Center
                  </Button>
                </Link>
                <Link href="/control-center">
                  <Button 
                    variant="outline" 
                    className="bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Control Center
                  </Button>
                </Link>
                <Link href="/lead-scraper">
                  <Button 
                    variant="outline" 
                    className="bg-green-600 hover:bg-green-700 text-white border-green-500"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Lead Scraper
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* System Controls */}
          <Card className="bg-purple-900/60 backdrop-blur-sm border border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                System Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white">VoiceBot Engine</span>
                  <Badge className="bg-green-500">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Call Processing</span>
                  <Badge className="bg-green-500">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">SMS Engine</span>
                  <Badge className="bg-green-500">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Email Automation</span>
                  <Badge className="bg-green-500">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Lead Scraping</span>
                  <Badge className="bg-yellow-500">STANDBY</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Controls */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Integration Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white">Airtable Sync</span>
                  <Badge className="bg-green-500">CONNECTED</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">HubSpot CRM</span>
                  <Badge className="bg-green-500">CONNECTED</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">QuickBooks</span>
                  <Badge className="bg-green-500">CONNECTED</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Slack Alerts</span>
                  <Badge className="bg-green-500">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Webhook Receivers</span>
                  <Badge className="bg-green-500">LISTENING</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Monitor */}
          <Card className="bg-indigo-900/60 backdrop-blur-sm border border-indigo-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart className="w-5 h-5 mr-2" />
                Performance Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white">System Uptime</span>
                  <Badge className="bg-green-500">99.8%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">API Response</span>
                  <Badge className="bg-green-500">180ms</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Active Functions</span>
                  <Badge className="bg-blue-500">1040</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Error Rate</span>
                  <Badge className="bg-green-500">0.2%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Memory Usage</span>
                  <Badge className="bg-yellow-500">67%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Settings className="w-4 h-4 mr-2" />
            Advanced Settings
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Zap className="w-4 h-4 mr-2" />
            Emergency Stop
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Activity className="w-4 h-4 mr-2" />
            System Health Check
          </Button>
        </div>

      </div>
    </div>
  );
}