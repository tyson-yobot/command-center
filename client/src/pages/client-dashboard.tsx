import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Phone, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  Activity,
  MessageSquare,
  Target,
  BarChart3,
  Headphones,
  Mic,
  MicOff,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function ClientDashboard() {
  const { data: metrics } = useQuery({ queryKey: ['/api/metrics'] });
  const { data: bot } = useQuery({ queryKey: ['/api/bot'] });
  const { data: crmData } = useQuery({ queryKey: ['/api/crm'] });
  const [isListening, setIsListening] = React.useState(false);
  const [showEscalation, setShowEscalation] = React.useState(false);

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Voice command functionality for customers
    if (!isListening) {
      setTimeout(() => setIsListening(false), 3000);
    }
  };

  const testEscalation = () => {
    setShowEscalation(true);
    setTimeout(() => setShowEscalation(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Escalation Alert Overlay */}
        {showEscalation && (
          <div className="fixed inset-0 bg-red-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold text-red-900">🚨 URGENT ESCALATION</h3>
                  <p className="text-red-700 text-sm">High-value client needs immediate attention</p>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded mb-4">
                <p className="text-red-900 font-medium">Mike Rodriguez - $125,000 deal at risk</p>
                <p className="text-red-700 text-sm">Requires immediate callback within 15 minutes</p>
              </div>
              <div className="flex space-x-3">
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  Call Now
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowEscalation(false)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header - Clean Client Branding */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Your YoBot® Performance Dashboard
              </h1>
              <p className="text-slate-300">Real-time insights into your AI automation ROI</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleVoiceToggle}
                className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isListening ? 'Listening...' : 'Voice Command'}
              </Button>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${bot?.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-white text-sm">
                  Bot Status: {bot?.status === 'active' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Metrics - Client View Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-green-400" />
                <span>Calls Handled Today</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics?.callsToday || 0}</div>
              <div className="text-green-400 text-xs flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{metrics?.callsChange || 0} from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2 text-sm">
                <Target className="w-4 h-4 text-blue-400" />
                <span>Conversions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics?.conversions || 0}</div>
              <div className="text-blue-400 text-xs flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{metrics?.conversionsChange || 0} this week
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-purple-400" />
                <span>New Leads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics?.newLeads || 0}</div>
              <div className="text-purple-400 text-xs flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{metrics?.leadsChange || 0} this month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span>Pipeline Value</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{crmData?.pipelineValue || '$0'}</div>
              <div className="text-green-400 text-xs">Active opportunities</div>
            </CardContent>
          </Card>
        </div>

        {/* ROI Tracker - Client Focused */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span>ROI Tracker</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-green-400 text-2xl font-bold">127</div>
                  <div className="text-slate-300 text-sm">Hours Saved</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-blue-400 text-2xl font-bold">$15,200</div>
                  <div className="text-slate-300 text-sm">Revenue Captured</div>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300 text-sm">Cost Savings This Month</span>
                  <span className="text-green-400 font-bold">$8,450</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>Bot Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Uptime</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 font-bold">99.7%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Response Time</span>
                <span className="text-green-400 font-bold">0.3s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Success Rate</span>
                <span className="text-green-400 font-bold">94.2%</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-300 text-sm mb-1">Lead Conversion Rate</div>
                <div className="flex items-center justify-between">
                  <div className="text-white font-bold">24.3%</div>
                  <Badge className="bg-green-600 text-white">+3.2%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed - Sanitized for Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '2 min ago', action: 'New lead captured', company: 'Acme Corp', status: 'success' },
                  { time: '15 min ago', action: 'Meeting scheduled', company: 'TechStart Inc', status: 'success' },
                  { time: '32 min ago', action: 'Follow-up completed', company: 'Global Solutions', status: 'success' },
                  { time: '1 hr ago', action: 'Quote generated', company: 'Innovate LLC', status: 'success' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <div>
                        <div className="text-white text-sm">{activity.action}</div>
                        <div className="text-slate-400 text-xs">{activity.company}</div>
                      </div>
                    </div>
                    <div className="text-slate-400 text-xs">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Headphones className="w-5 h-5 text-orange-400" />
                <span>Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-slate-300 text-sm mb-4">
                Need help with your YoBot automation?
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Contact YoBot Support
              </Button>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-300 text-xs mb-1">Response Time</div>
                <div className="text-green-400 font-bold">&lt; 2 hours</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}