import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const { data: testMetrics } = useQuery({ queryKey: ['/api/airtable/test-metrics'] });
  const { data: commandCenterMetrics } = useQuery({ queryKey: ['/api/airtable/command-center-metrics'] });
  const [isListening, setIsListening] = React.useState(false);
  const [showEscalation, setShowEscalation] = React.useState(false);
  const [selectedTier, setSelectedTier] = React.useState('All');
  const [voiceCommand, setVoiceCommand] = React.useState('');
  const [automationMode, setAutomationMode] = React.useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);

  const handleVoiceToggle = () => {
    if (!isListening) {
      // Start voice recording
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setVoiceCommand(transcript);
          setIsListening(false);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
          alert('Voice recognition failed. Please try again.');
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.start();
      } else {
        alert('Voice recognition not supported in this browser');
      }
    } else {
      setIsListening(false);
    }
  };

  const testEscalation = () => {
    setShowEscalation(true);
    setTimeout(() => setShowEscalation(false), 5000);
  };

  // Voice Command Handler
  const sendVoiceCommand = async () => {
    if (!voiceCommand.trim()) {
      alert('Please enter a command.');
      return;
    }

    try {
      const res = await fetch('/api/voice/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: voiceCommand,
          user: 'Command Center',
          context: 'YoBot Dashboard',
          priority: 'high',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Command sent to VoiceBot');
        setVoiceCommand('');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      alert('❌ Failed to send voice command');
    }
  };

  // Support Ticket Handler
  const handleSubmitTicket = async () => {
    const subject = prompt('Enter ticket subject:');
    const description = prompt('Describe your issue:');
    
    if (!subject) return;
    
    try {
      const response = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Command Center User',
          email: 'user@company.com',
          subject,
          description: description || '',
          priority: 'Medium'
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('✅ Support ticket created: #' + data.ticket.id);
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      alert('❌ Failed to submit ticket');
    }
  };

  // PDF Download Handler - generates comprehensive system report
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'YoBot Command Center Report',
          data: { metrics, bot, crmData }
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yobot-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  // Live Command Execution Handler
  const executeLiveCommand = async (category: string) => {
    try {
      const payload = getLiveCommandPayload(category);
      
      const response = await fetch('/api/command-center/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          payload
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${category} completed successfully`);
      } else {
        alert(`❌ ${category} failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`❌ Failed to execute ${category}`);
    }
  };

  const getLiveCommandPayload = (category: string) => {
    switch (category) {
      case "New Booking Sync":
        return { action: "sync_latest_bookings" };
      case "New Support Ticket":
        return { action: "create_sample_ticket", priority: "high" };
      case "Manual Follow-up":
        return { lead_id: "manual_trigger", priority: "high" };
      case "Initiate Voice Call":
        return { action: "test_call", number: "+15551234567" };
      case "Send SMS":
        return { action: "send_sms", to: "+15551234567", message: "Test message from YoBot" };
      case "Run Lead Scrape":
        return { query: "roofing contractor", limit: 10 };
      case "Export Data":
        return { action: "export_data", format: "csv", timeframe: "last_7_days" };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-8 p-8">
      <div className="w-full">



        {/* Escalation Alert Overlay */}
        {showEscalation && (
          <div className="fixed inset-0 bg-red-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold text-red-900">🚨 URGENT ESCALATION</h3>
                  <p className="text-red-700 text-sm">Automation failure requires immediate attention</p>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded mb-4">
                <p className="text-red-900 font-medium">Mike Rodriguez - CRM sync failure</p>
                <p className="text-red-700 text-sm">Follow-up sequence stopped 2 hours ago</p>
              </div>
              <div className="flex space-x-3">
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  Fix Now
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
          <div className="text-center mb-6">
            <h1 className="text-6xl font-bold text-white mb-3 flex items-center justify-center">
              <img 
                src={yobotLogo} 
                alt="YoBot Logo" 
                className="w-28 h-28 mr-3 inline-block"
                style={{ marginTop: '-4px' }}
              />
              YoBot® Command Center
            </h1>
            <p className="text-slate-300 text-xl">Your Complete AI Automation Dashboard {selectedTier !== 'All' && `(${selectedTier} Tier)`}</p>
          </div>
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-4">
              {/* Voice Command Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={voiceCommand}
                  onChange={(e) => setVoiceCommand(e.target.value)}
                  placeholder="Enter voice command..."
                  className="px-3 py-2 bg-slate-700 text-white rounded border border-slate-500 w-48"
                  onKeyPress={(e) => e.key === 'Enter' && sendVoiceCommand()}
                />
                <Button
                  onClick={sendVoiceCommand}
                  disabled={!voiceCommand.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Send
                </Button>
              </div>

              <Button
                onClick={handleVoiceToggle}
                className={`${isListening ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25'} text-white border-2 ${isListening ? 'border-red-300' : 'border-blue-300'}`}
              >
                {isListening ? <MicOff className="w-5 h-5 mr-2 text-white" /> : <Mic className="w-5 h-5 mr-2 text-white" />}
                {isListening ? 'Listening...' : 'Voice Input'}
              </Button>
              
              {/* Enhanced Controls */}
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleDownloadPDF}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  PDF Report
                </Button>
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Admin
                </Button>
                <Button 
                  onClick={handleSubmitTicket}
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Submit Ticket
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${bot?.status === 'active' ? 'bg-green-400 status-active' : 'bg-amber-400'}`}></div>
                <span className="text-white text-sm">
                  Bot Status: {bot?.status === 'active' ? 'Online' : 'Standby'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Command Center Buttons */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Core Automation */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Core Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => executeLiveCommand("New Booking Sync")}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📆</span>
                    <span>New Booking Sync</span>
                  </Button>
                  
                  <Button
                    onClick={() => executeLiveCommand("New Support Ticket")}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">🆘</span>
                    <span>New Support Ticket</span>
                  </Button>
                  
                  <Button
                    onClick={() => executeLiveCommand("Manual Follow-up")}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">🚀</span>
                    <span>Manual Follow-up</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Voice & Communication */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Voice & Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => executeLiveCommand("Initiate Voice Call")}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📞</span>
                    <span>Initiate Voice Call</span>
                  </Button>
                  
                  <Button
                    onClick={handleVoiceToggle}
                    className="bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-start p-3"
                  >
                    <Mic className="w-5 h-5 mr-3" />
                    <span>Voice Input</span>
                  </Button>
                  
                  <Button
                    onClick={() => executeLiveCommand("Send SMS")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-start p-3"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    <span>Send SMS</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data & Reports */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Data & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => executeLiveCommand("Run Lead Scrape")}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">🧲</span>
                    <span>Run Lead Scrape</span>
                  </Button>
                  
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-start p-3"
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    <span>PDF Report</span>
                  </Button>
                  
                  <Button
                    onClick={() => executeLiveCommand("Export Data")}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📊</span>
                    <span>Export Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Calls</CardTitle>
              <Phone className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics?.activeCalls || 0}
              </div>
              <p className="text-xs text-green-400">Live voice sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">AI Responses</CardTitle>
              <Brain className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics?.aiResponsesToday || 0}
              </div>
              <p className="text-xs text-blue-400">Generated today</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${(crmData?.pipelineValue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-emerald-400">Active opportunities</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">System Health</CardTitle>
              <Gauge className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics?.systemHealth || 97}%
              </div>
              <p className="text-xs text-amber-400">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Essential Business Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {/* Bot Health Monitor */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                🤖 Bot Health Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Total Bots:</span>
                  <span className="text-white font-bold">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Avg Response Time:</span>
                  <span className="text-green-400 font-bold">1.2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Current Errors:</span>
                  <span className="text-orange-400 font-bold">2 bots impacted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Worst Performer:</span>
                  <span className="text-red-400 font-bold">Email Bot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Uptime Status:</span>
                  <span className="text-green-400 font-bold">✅ 98.7%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Forecast */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                📈 Revenue Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">MRR:</span>
                  <span className="text-white font-bold">$24,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Projected 30d:</span>
                  <span className="text-green-400 font-bold">$31,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Pipeline Deals:</span>
                  <span className="text-blue-400 font-bold">14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Confidence:</span>
                  <span className="text-green-400 font-bold">87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Sales Velocity:</span>
                  <span className="text-blue-400 font-bold">3.2 deals/week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Pulse Summary */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                🧭 Client Pulse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Active Clients:</span>
                  <span className="text-white font-bold">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Client NPS:</span>
                  <span className="text-green-400 font-bold">72/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Churn Risk Flags:</span>
                  <span className="text-orange-400 font-bold">3 accounts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Last Login:</span>
                  <span className="text-blue-400 font-bold">2.1 days ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Bot Utilization Rate:</span>
                  <span className="text-green-400 font-bold">78% usage</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ops Metrics */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-yellow-400" />
                📊 Ops Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Avg Bot Response:</span>
                  <span className="text-green-400 font-bold">1.2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Success Rate:</span>
                  <span className="text-green-400 font-bold">97.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Error Trend (7d):</span>
                  <span className="text-red-400 font-bold">12 errors ↗︎</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">API Usage:</span>
                  <span className="text-blue-400 font-bold">68% of plan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Bot Processing Load:</span>
                  <span className="text-green-400 font-bold">2,847 tasks</span>
                </div>
              </div>
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
                Workflow Performance
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
                  <span className="text-green-400 font-bold">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Success Rate</span>
                  <span className="text-green-400 font-bold">97.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Avg Completion Time</span>
                  <span className="text-blue-400 font-bold">3.2 min</span>
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
                  <span className="text-slate-300" title="Ad spend ÷ New clients this month">Cost Per Lead</span>
                  <span className="text-green-400 font-bold">$42.80</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300" title="Based on NLP sentiment, duration, and conversion path">Lead Quality Score</span>
                  <span className="text-green-400 font-bold">84.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300" title="Percentage of leads that become paying customers">Close Rate</span>
                  <span className="text-green-400 font-bold">28.6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300" title="Return on investment from automation">ROI</span>
                  <span className="text-blue-400 font-bold">340%</span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-300 text-sm mb-1">Revenue Per Lead</div>
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold">$986</div>
                    <Badge className="bg-green-600 text-white">+23%</Badge>
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
                  <span className="text-slate-300">Budget Utilization</span>
                  <span className="text-green-400 font-bold">87.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300" title="Cost to acquire each new customer">Cost Per Lead Trend</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 font-bold">$4.20</span>
                    <Badge className="bg-green-600 text-white text-xs">-18%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300" title="Time until positive return on investment">Payback Period</span>
                  <span className="text-green-400 font-bold">21 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Automation Coverage</span>
                  <span className="text-blue-400 font-bold">78% tasks</span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-300 text-sm mb-1">Monthly Savings vs Manual</div>
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold">$12,840</div>
                    <Badge className="bg-green-600 text-white">384 hours saved</Badge>
                  </div>
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
                AI Assistant Insights
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
                  <span className="text-slate-300" title="Percentage of conversations that needed human assistance">Escalation Rate</span>
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
                System Status (Read-Only)
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

        {/* Customer Success Milestones */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm border border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">🎉 Congratulations! You've saved 247 hours this month</h3>
                  <p className="text-green-300">Your conversion rate is 15% above industry average</p>
                  <p className="text-blue-300">Ready to expand to email automation? Your ROI supports it!</p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Share Results
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Expand Services
                  </Button>
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

        {/* Advanced Intelligence & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {/* Smart Calendar */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                Smart Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Today's Meetings:</span>
                  <span className="text-white font-bold">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Auto-Scheduled:</span>
                  <span className="text-green-400 font-bold">6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Follow-ups Due:</span>
                  <span className="text-orange-400 font-bold">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Command Center */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Headphones className="w-5 h-5 mr-2 text-purple-400" />
                Voice Command Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Commands Today:</span>
                  <span className="text-white font-bold">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Success Rate:</span>
                  <span className="text-green-400 font-bold">94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Processing:</span>
                  <span className="text-blue-400 font-bold">2 active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Analysis */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-green-400" />
                Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Positive:</span>
                  <span className="text-green-400 font-bold">72%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Neutral:</span>
                  <span className="text-slate-400 font-bold">21%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Negative:</span>
                  <span className="text-red-400 font-bold">7%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botalytics™ Performance Dashboard */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>📊 Botalytics™ Metrics</span>
              <div className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">PROPRIETARY</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Cost Per Lead */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-cyan-400 mb-1">$47</div>
                  <div className="text-cyan-300 text-sm">Cost Per Lead</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Last Month</span>
                    <span className="text-green-400">$62</span>
                  </div>
                  <Progress value={76} className="h-1" />
                  <div className="text-center text-xs text-green-400">-24% improvement</div>
                </div>
              </div>

              {/* Interaction Quality */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-green-400 mb-1">96.2%</div>
                  <div className="text-green-300 text-sm">Accuracy Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Target</span>
                    <span className="text-blue-400">95%</span>
                  </div>
                  <Progress value={96} className="h-1" />
                  <div className="text-center text-xs text-green-400">Above target</div>
                </div>
              </div>

              {/* Learning Rate */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-blue-400 mb-1">+12%</div>
                  <div className="text-blue-300 text-sm">Learning Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Weekly</span>
                    <span className="text-green-400">+3%</span>
                  </div>
                  <Progress value={88} className="h-1" />
                  <div className="text-center text-xs text-blue-400">Accelerating</div>
                </div>
              </div>

              {/* Total Interactions */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-purple-400 mb-1">1,247</div>
                  <div className="text-purple-300 text-sm">Interactions</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Today</span>
                    <span className="text-green-400">89</span>
                  </div>
                  <Progress value={67} className="h-1" />
                  <div className="text-center text-xs text-purple-400">Peak: 2-4 PM</div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-yellow-400 mb-1">31.2%</div>
                  <div className="text-yellow-300 text-sm">Close Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Industry Avg</span>
                    <span className="text-red-400">18%</span>
                  </div>
                  <Progress value={82} className="h-1" />
                  <div className="text-center text-xs text-green-400">+73% vs avg</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SmartSpend™ Analytics Dashboard */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span>📈 SmartSpend™ Analytics</span>
              <div className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">PROPRIETARY</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400 mb-2">$127K</div>
                  <div className="text-green-300 text-sm">Monthly Savings</div>
                  <div className="text-green-200 text-xs mt-1">↑ 23% vs last month</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-400 mb-2">47%</div>
                  <div className="text-blue-300 text-sm">Cost Reduction</div>
                  <div className="text-blue-200 text-xs mt-1">vs Manual Process</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-400 mb-2">340%</div>
                  <div className="text-purple-300 text-sm">ROI</div>
                  <div className="text-purple-200 text-xs mt-1">12-month period</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-400 mb-2">21</div>
                  <div className="text-yellow-300 text-sm">Payback Days</div>
                  <div className="text-yellow-200 text-xs mt-1">Industry: 90+ days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity & System Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Live Activity Feed */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded">
                  📞 Call completed: Mike Rodriguez - 4m 32s
                </div>
                <div className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded">
                  ✅ Lead qualified: Sarah Chen - High Priority
                </div>
                <div className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded">
                  🤖 Bot training: Voice model updated +2.3%
                </div>
                <div className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded">
                  💰 Deal closed: TechCorp - $45,000
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Master Data Sync Monitor */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-blue-400" />
                Master Data Sync Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">CRM Sync:</span>
                  <span className="text-green-400 font-bold">✅ Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Airtable:</span>
                  <span className="text-green-400 font-bold">✅ Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Last Sync:</span>
                  <span className="text-white font-bold">2m ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Records:</span>
                  <span className="text-blue-400 font-bold">1,247</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voice & Conversation Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Voice Analytics */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mic className="w-5 h-5 mr-2 text-red-400" />
                Voice Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Calls Today:</span>
                  <span className="text-white font-bold">{metrics?.activeCalls || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Avg Duration:</span>
                  <span className="text-green-400 font-bold">4m 23s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Conversion Rate:</span>
                  <span className="text-blue-400 font-bold">34%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Audit Log */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-400" />
                System Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-slate-400">14:32 - Admin login successful</div>
                <div className="text-xs text-slate-400">14:28 - Automation rule updated</div>
                <div className="text-xs text-slate-400">14:15 - Bot training completed</div>
                <div className="text-xs text-slate-400">14:02 - CRM sync executed</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Dashboard */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-cyan-400" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">New Leads:</span>
                  <span className="text-green-400 font-bold">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Conversions:</span>
                  <span className="text-blue-400 font-bold">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Escalations:</span>
                  <span className="text-orange-400 font-bold">2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI & Automation Engine Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* AI Automation Engine */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                AI Automation Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Tasks Automated:</span>
                  <span className="text-white font-bold">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Hours Saved:</span>
                  <span className="text-green-400 font-bold">23.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Efficiency:</span>
                  <span className="text-blue-400 font-bold">89%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bot Intelligence */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                Bot Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">IQ Score:</span>
                  <span className="text-white font-bold">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Confidence:</span>
                  <span className="text-green-400 font-bold">91%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Training:</span>
                  <span className="text-blue-400 font-bold">Active</span>
                </div>
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

        {/* Integration Test Log - Live Results */}
        <div className="mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Live Integration Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Test Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Tests:</span>
                      <span className="text-white font-mono">
                        {testMetrics?.isAuthenticated ? (testMetrics?.totalTests || 0) : "No Data"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pass Rate:</span>
                      <span className="text-green-400 font-mono">
                        {testMetrics?.isAuthenticated ? `${testMetrics?.passRate || 0}%` : "No Data"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Unique Testers:</span>
                      <span className="text-blue-400 font-mono">
                        {testMetrics?.isAuthenticated ? (testMetrics?.uniqueTesters || 0) : "No Data"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Recent Activity</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {testMetrics?.recentActivity?.slice(0, 5).map((test: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <span className="text-slate-300 text-sm truncate">{test.name}</span>
                        <Badge 
                          variant={test.status === "✅ Pass" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {test.status === "✅ Pass" ? "PASS" : "FAIL"}
                        </Badge>
                      </div>
                    )) || (
                      <div className="text-slate-400 text-sm">No recent test data available</div>
                    )}
                  </div>
                </div>
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