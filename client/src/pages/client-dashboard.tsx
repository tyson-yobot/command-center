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
  Bell,
  Zap,
  Calendar,
  Brain,
  Settings,
  Monitor,
  PieChart,
  FileText,
  Gauge
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import yobotLogo from '@assets/A_flat_vector_illustration_features_a_robot_face_i.png';

export default function ClientDashboard() {
  const { data: metrics } = useQuery({ queryKey: ['/api/metrics'] });
  const { data: bot } = useQuery({ queryKey: ['/api/bot'] });
  const { data: crmData } = useQuery({ queryKey: ['/api/crm'] });
  const [isListening, setIsListening] = React.useState(false);
  const [showEscalation, setShowEscalation] = React.useState(false);

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={yobotLogo} 
                alt="YoBot Logo" 
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  YoBot® Command Center
                </h1>
                <p className="text-slate-300">Your Complete AI Automation Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleVoiceToggle}
                className={`${isListening ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25'} text-white border-2 ${isListening ? 'border-red-300' : 'border-blue-300'}`}
              >
                {isListening ? <MicOff className="w-5 h-5 mr-2 text-white" /> : <Mic className="w-5 h-5 mr-2 text-white" />}
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

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Hours Saved</CardTitle>
              <Clock className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics?.hoursSaved || 247}</div>
              <p className="text-xs text-green-400">+15 hours this week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Revenue Captured</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${metrics?.revenueGenerated?.toLocaleString() || '87,340'}</div>
              <p className="text-xs text-green-400">+12.3% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics?.conversations || 23}</div>
              <p className="text-xs text-blue-400">8 high-priority leads</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pipeline Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${crmData?.pipelineValue?.toLocaleString() || '342,750'}</div>
              <p className="text-xs text-purple-400">6 deals closing this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Automation Engine */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Automation Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Active Workflows</span>
                  <Badge className="bg-green-600 text-white">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Tasks Completed</span>
                  <span className="text-green-400 font-bold">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Success Rate</span>
                  <span className="text-green-400 font-bold">98.2%</span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-300 text-sm mb-1">Next Automation</div>
                  <div className="text-white font-medium">Lead Follow-up in 5 min</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botalytics™ */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Botalytics™
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">ROI This Month</span>
                  <span className="text-green-400 font-bold">847%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Conversion Rate</span>
                  <span className="text-green-400 font-bold">24.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Learning Accuracy</span>
                  <span className="text-green-400 font-bold">94.7%</span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-300 text-sm mb-1">Performance Score</div>
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold">Excellent</div>
                    <Badge className="bg-green-600 text-white">A+</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SmartSpend™ */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-green-400" />
                SmartSpend™
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Monthly Savings</span>
                  <span className="text-green-400 font-bold">$12,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Cost Per Lead</span>
                  <span className="text-green-400 font-bold">$23.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Budget Efficiency</span>
                  <span className="text-green-400 font-bold">92%</span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-300 text-sm mb-1">Next Optimization</div>
                  <div className="text-white font-medium">Ad spend reallocation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Bot Intelligence & System Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Bot Intelligence */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                Bot Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Confidence Score</span>
                  <span className="text-green-400 font-bold">94.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Learning Status</span>
                  <Badge className="bg-blue-600 text-white">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Handoff Rate</span>
                  <span className="text-yellow-400 font-bold">5.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Response Accuracy</span>
                  <span className="text-green-400 font-bold">96.1%</span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-300 text-sm mb-1">Latest Learning</div>
                  <div className="text-white font-medium">Product pricing updates</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Monitor */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-cyan-400" />
                System Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">System Health</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 font-bold">Excellent</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Uptime</span>
                  <span className="text-green-400 font-bold">99.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Response Time</span>
                  <span className="text-green-400 font-bold">0.3s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Active Connections</span>
                  <span className="text-green-400 font-bold">847</span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-300 text-sm mb-1">Last Maintenance</div>
                  <div className="text-white font-medium">2 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voice & Conversation Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mic className="w-5 h-5 mr-2" />
                Voice Commands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-300">"Show me today's leads"</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-300">"Call my top prospect"</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-300">"Schedule follow-up"</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">Active</Badge>
                </div>
                {isListening && (
                  <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400 rounded-lg">
                    <div className="flex items-center text-blue-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                      Listening for commands...
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                Conversation Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Sentiment Score</span>
                  <span className="text-green-400 font-bold">87% Positive</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Avg Call Duration</span>
                  <span className="text-blue-400 font-bold">4m 32s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Resolution Rate</span>
                  <span className="text-green-400 font-bold">91.5%</span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-300 text-sm mb-1">Top Intent</div>
                  <div className="text-white font-medium">Product Demo Request</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Calendar & Live Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                Smart Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-green-500/20 border border-green-400 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 font-medium">Demo Call</p>
                      <p className="text-slate-300 text-sm">Sarah Chen - 2:00 PM</p>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Join
                    </Button>
                  </div>
                </div>
                <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 font-medium">Follow-up Call</p>
                      <p className="text-slate-300 text-sm">Mike Wilson - 3:30 PM</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-blue-400 text-blue-400">
                      Prepare
                    </Button>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-300 text-sm mb-1">Auto-scheduled today</div>
                  <div className="text-white font-bold">7 meetings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-400" />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '2 min ago', action: 'New lead captured', company: 'Acme Corp', status: 'success' },
                  { time: '15 min ago', action: 'Meeting scheduled', company: 'TechStart Inc', status: 'success' },
                  { time: '32 min ago', action: 'Follow-up completed', company: 'Global Solutions', status: 'success' },
                  { time: '1 hr ago', action: 'Quote generated', company: 'Innovate LLC', status: 'success' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{item.action}</p>
                      <p className="text-slate-300 text-sm">{item.company} • {item.time}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Escalation Alerts */}
        <div className="mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Escalation Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-400 rounded-lg">
                  <div>
                    <p className="text-green-400 font-medium">Hot Lead Alert</p>
                    <p className="text-slate-300 text-sm">Sarah Chen - Ready to close</p>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    Call
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-500/20 border border-yellow-400 rounded-lg">
                  <div>
                    <p className="text-yellow-400 font-medium">Follow-up Due</p>
                    <p className="text-slate-300 text-sm">Tom Wilson - Demo scheduled</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-400">
                    Review
                  </Button>
                </div>
                <Button 
                  onClick={testEscalation}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Test Critical Escalation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer - Support Contact */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Need Support?</h3>
            <p className="text-slate-300 mb-4">Our team is here to help optimize your automation</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Headphones className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}