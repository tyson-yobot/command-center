import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
// Live mode only - no test mode context needed
import { 
  TrendingUp, 
  Phone, 
  PhoneOff,
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
  Gauge,
  Search,
  Mail,
  Database,
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  Download,
  Edit,
  Share2,
  Camera,
  Building,
  MapPin,
  Globe
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
// Using placeholder for logo until asset path is fixed
const yobotLogo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMTQiIGN5PSIxNiIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMjYiIGN5PSIxNiIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE0IDI2IFEyMCAzMCAyNiAyNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==';

import { CallMonitoringPopup } from '@/components/call-monitoring-popup';
import { ZendeskChatWidget } from '@/components/zendesk-chat-widget';
import { SalesOrderProcessor } from '@/components/sales-order-processor';
import { ContentCreatorDashboard } from '@/components/content-creator-dashboard';
import { MailchimpSyncDashboard } from '@/components/mailchimp-sync-dashboard';
import { SocialContentCreator } from '@/components/social-content-creator';
import { useToast } from '@/hooks/use-toast';


export default function CommandCenter() {
  // System mode state
  const [currentSystemMode, setCurrentSystemMode] = useState(() => {
    return localStorage.getItem('systemMode') || 'live';
  });
  
  // Dashboard metrics queries
  const { data: metrics } = useQuery({ 
    queryKey: ['/api/dashboard-metrics', currentSystemMode],
    queryFn: () => fetch('/api/dashboard-metrics', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json())
  });
  
  const { data: automationPerformance } = useQuery({ 
    queryKey: ['/api/automation-performance', currentSystemMode],
    queryFn: () => fetch('/api/automation-performance', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json())
  });
  
  const { data: knowledgeStats, refetch: refetchKnowledge } = useQuery({ 
    queryKey: ['/api/knowledge/stats', currentSystemMode],
    queryFn: () => fetch('/api/knowledge/stats', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json())
  });
  
  const [isListening, setIsListening] = React.useState(false);
  const [showEscalation, setShowEscalation] = React.useState(false);
  const [selectedTier, setSelectedTier] = React.useState('All');
  const [voiceCommand, setVoiceCommand] = React.useState('');
  const [automationMode, setAutomationMode] = React.useState(true);
  
  // Voice recognition states for RAG programming
  const [queryText, setQueryText] = useState('');
  const [programmingText, setProgrammingText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Ready');
  const recognitionRef = useRef(null);
  const [currentView, setCurrentView] = useState('overview');
  const [activeModal, setActiveModal] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalContacts: 15247,
    activeAutomations: 47,
    successRate: 89.2,
    lastUpdate: '2 minutes ago'
  });
  
  const [socialMetrics, setSocialMetrics] = useState({
    posts: 152,
    engagement: 94.7,
    reach: 28500,
    conversions: 34
  });
  
  const [pipelineData, setPipelineData] = useState([
    { stage: 'Lead Capture', count: 234, conversion: 78 },
    { stage: 'Qualification', count: 187, conversion: 65 },
    { stage: 'Demo Scheduled', count: 98, conversion: 52 },
    { stage: 'Proposal Sent', count: 67, conversion: 38 },
    { stage: 'Closed Won', count: 28, conversion: 42 }
  ]);
  
  const [knowledgeData, setKnowledgeData] = useState([
    { id: 1, title: 'Product Specifications', excerpt: 'Complete technical documentation...', relevanceScore: 95, source: 'Product Team', lastModified: '2024-01-15', keyTerms: ['specs', 'technical', 'product'], categories: ['Documentation'], wordCount: 2847 },
    { id: 2, title: 'Customer Onboarding Guide', excerpt: 'Step-by-step process for new customers...', relevanceScore: 88, source: 'Support Team', lastModified: '2024-01-14', keyTerms: ['onboarding', 'customers', 'process'], categories: ['Training'], wordCount: 1923 },
    { id: 3, title: 'API Integration Manual', excerpt: 'Comprehensive guide for API setup...', relevanceScore: 92, source: 'Engineering', lastModified: '2024-01-13', keyTerms: ['API', 'integration', 'setup'], categories: ['Technical'], wordCount: 3156 }
  ]);
  
  const [automationCards, setAutomationCards] = useState([
    {
      id: 1,
      title: 'Smart Lead Qualification',
      description: 'AI-powered lead scoring and routing',
      status: 'active',
      lastRun: '5 min ago',
      successRate: 94,
      totalRuns: 1847,
      category: 'Lead Management'
    },
    {
      id: 2, 
      title: 'Dynamic Content Personalization',
      description: 'Real-time content adaptation based on user behavior',
      status: 'active',
      lastRun: '12 min ago',
      successRate: 87,
      totalRuns: 923,
      category: 'Content'
    },
    {
      id: 3,
      title: 'Intelligent Follow-up Sequencing',
      description: 'Automated email sequences with ML optimization',
      status: 'paused',
      lastRun: '2 hours ago',
      successRate: 76,
      totalRuns: 2156,
      category: 'Communication'
    }
  ]);
  
  const { toast } = useToast();
  
  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setVoiceCommand(transcript);
          
          // Process voice commands for automation control
          if (transcript.toLowerCase().includes('start automation')) {
            setAutomationMode(true);
            toast({
              title: "Voice Command Executed",
              description: "Automation mode enabled",
            });
          } else if (transcript.toLowerCase().includes('stop automation')) {
            setAutomationMode(false);
            toast({
              title: "Voice Command Executed", 
              description: "Automation mode disabled",
            });
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [toast]);
  
  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } else {
      toast({
        title: "Voice Recognition Unavailable",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive"
      });
    }
  };
  
  // System mode toggle
  const toggleSystemMode = async () => {
    try {
      const newMode = currentSystemMode === 'live' ? 'test' : 'live';
      
      const response = await apiRequest('POST', '/api/system-mode', {
        mode: newMode
      });
      
      if (response.success) {
        setCurrentSystemMode(response.systemMode);
        localStorage.setItem('systemMode', response.systemMode);
        
        toast({
          title: "System Mode Changed",
          description: `Switched to ${response.systemMode} mode`,
        });
        
        // Force refresh to ensure clean state
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle system mode",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <img src={yobotLogo} alt="YoBot" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-white">YoBot Command Center</h1>
              <p className="text-sm text-slate-300">Enterprise Automation Hub</p>
            </div>
          </div>
          
          {/* System Mode Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-medium">System Mode:</span>
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${currentSystemMode === 'live' ? 'text-green-400' : 'text-slate-400'}`}>
                  LIVE
                </span>
                <Switch
                  checked={currentSystemMode === 'test'}
                  onCheckedChange={toggleSystemMode}
                  className="data-[state=checked]:bg-orange-500"
                />
                <span className={`text-xs ${currentSystemMode === 'test' ? 'text-orange-400' : 'text-slate-400'}`}>
                  TEST
                </span>
              </div>
              <Badge 
                variant={currentSystemMode === 'live' ? 'default' : 'secondary'}
                className={currentSystemMode === 'live' ? 'bg-green-600' : 'bg-orange-600'}
              >
                {currentSystemMode.toUpperCase()}
              </Badge>
            </div>
            
            {/* Voice Control */}
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={toggleListening}
              className={isListening ? "animate-pulse" : ""}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="pt-20 p-6">
        {/* Navigation Pills */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Monitor },
            { id: 'automations', label: 'Automations', icon: Zap },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'knowledge', label: 'Knowledge', icon: Brain },
            { id: 'monitoring', label: 'Monitoring', icon: Activity }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={currentView === id ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentView(id)}
              className={`${currentView === id ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600'}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
        
        {currentView === 'overview' && (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Leads</p>
                      <p className="text-2xl font-bold text-white">{metrics?.totalLeads || 0}</p>
                      <p className="text-green-400 text-sm flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12% from last week
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Active Automations</p>
                      <p className="text-2xl font-bold text-white">{automationPerformance?.totalFunctions || 1040}</p>
                      <p className="text-blue-400 text-sm">Running smoothly</p>
                    </div>
                    <Zap className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Success Rate</p>
                      <p className="text-2xl font-bold text-white">{automationPerformance?.successRate || '89.2%'}</p>
                      <p className="text-green-400 text-sm">Above target</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Revenue</p>
                      <p className="text-2xl font-bold text-white">$47.2K</p>
                      <p className="text-green-400 text-sm">This month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Center Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Lead Management */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Lead Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setActiveModal('lead-capture')}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Launch Lead Scraper
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                    <Eye className="w-4 h-4 mr-2" />
                    View Pipeline
                  </Button>
                </CardContent>
              </Card>

              {/* Content Creation */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Content Hub
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => setActiveModal('content-creator')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Create Content
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Posts
                  </Button>
                </CardContent>
              </Card>

              {/* Automation Control */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Automation Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Rules
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                    <Activity className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                </CardContent>
              </Card>

              {/* Communication Hub */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Communication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Headphones className="w-4 h-4 mr-2" />
                    Voice Calls
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Campaigns
                  </Button>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync CRM
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Health Check
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                    <FileText className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentView === 'automations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Automation Management</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                New Automation
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automationCards.map((automation) => (
                <Card key={automation.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{automation.title}</CardTitle>
                      <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                        {automation.status}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{automation.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Success Rate</span>
                        <span className="text-white font-medium">{automation.successRate}%</span>
                      </div>
                      <Progress value={automation.successRate} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Last Run: {automation.lastRun}</span>
                        <span className="text-slate-400">Total: {automation.totalRuns}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="w-3 h-3 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Activity className="w-3 h-3 mr-1" />
                          Logs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
            
            {/* Pipeline Overview */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Sales Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineData.map((stage, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium">{stage.stage}</span>
                          <span className="text-slate-400">{stage.count} leads</span>
                        </div>
                        <Progress value={stage.conversion} className="h-2" />
                      </div>
                      <div className="ml-4 text-right">
                        <span className="text-white font-bold">{stage.conversion}%</span>
                        <p className="text-slate-400 text-sm">conversion</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Media Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Social Media Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{socialMetrics.posts}</p>
                      <p className="text-slate-400 text-sm">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{socialMetrics.engagement}%</p>
                      <p className="text-slate-400 text-sm">Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{socialMetrics.reach.toLocaleString()}</p>
                      <p className="text-slate-400 text-sm">Reach</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{socialMetrics.conversions}</p>
                      <p className="text-slate-400 text-sm">Conversions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">API Response Time</span>
                      <span className="text-green-400">120ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Uptime</span>
                      <span className="text-green-400">99.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Active Users</span>
                      <span className="text-white">847</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Data Processed</span>
                      <span className="text-white">2.3TB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === 'knowledge' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Knowledge Base</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-white">{knowledgeStats?.totalDocuments || 0}</p>
                  <p className="text-slate-400">Total Documents</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <Search className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-white">{knowledgeStats?.recentlyAdded || 0}</p>
                  <p className="text-slate-400">Recently Added</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <Brain className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-white">{knowledgeStats?.totalQueries || 0}</p>
                  <p className="text-slate-400">Total Queries</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {knowledgeData.map((item) => (
                <Card key={item.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                        <p className="text-slate-400 text-sm mb-3">{item.excerpt}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.keyTerms.map((term, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {term}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span>Source: {item.source}</span>
                          <span>Modified: {item.lastModified}</span>
                          <span>Words: {item.wordCount}</span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-white font-bold text-lg">{item.relevanceScore}%</div>
                        <div className="text-slate-400 text-xs">Relevance</div>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === 'monitoring' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">System Monitoring</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Live Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {[
                      { time: '09:45', event: 'New lead captured', type: 'success' },
                      { time: '09:42', event: 'Automation completed', type: 'success' },
                      { time: '09:38', event: 'Email campaign sent', type: 'info' },
                      { time: '09:35', event: 'API rate limit warning', type: 'warning' },
                      { time: '09:30', event: 'Backup completed', type: 'success' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <span className="text-slate-400 text-sm">{activity.time}</span>
                        <span className="text-white text-sm">{activity.event}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-200 text-sm font-medium">High API Usage</span>
                      </div>
                      <p className="text-yellow-100 text-xs mt-1">Approaching rate limits for external APIs</p>
                    </div>
                    
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-200 text-sm font-medium">Scheduled Maintenance</span>
                      </div>
                      <p className="text-blue-100 text-xs mt-1">System update planned for tonight at 2 AM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Voice Command Display */}
        {isListening && (
          <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 rounded-lg p-4 max-w-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">Listening...</span>
            </div>
            <p className="text-slate-300 text-sm">{voiceCommand || 'Say something...'}</p>
          </div>
        )}
      </div>

      {/* Modal Components */}
      {activeModal === 'lead-capture' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Lead Scraper</h3>
              <Button variant="ghost" onClick={() => setActiveModal(null)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-slate-300">Configure and launch lead scraping operations.</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Start Scraping
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'content-creator' && (
        <ContentCreatorDashboard onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}