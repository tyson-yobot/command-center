import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LeadScraper from '@/pages/Lead-Scraper/lead-scraper';
import { 
  Zap, Mic, Brain, DollarSign, Settings, Phone, Users, 
  TrendingUp, BarChart3, FileText, Database, Upload, 
  TestTube, Calendar, Bot, Activity, MessageSquare,
  Target, Clock, CheckCircle, AlertTriangle, Bell,
  Search, Mail, RefreshCw, Trash2, Eye, Download,
  Edit, Share2, Camera, Building, User, MapPin, Globe
} from 'lucide-react';

interface TabContentProps {
  activeTab: string;
  currentSystemMode: string;
  metrics: any;
  automationPerformance: any;
  liveActivity: any;
  knowledgeStats: any;
  callStats: any;
  handlers: {
    handleNewBookingSync: () => void;
    handleNewSupportTicket: () => void;
    handleManualFollowUp: () => void;
    handleSalesOrderSync: () => void;
    handleContentCreatorSync: () => void;
    handleMailchimpSync: () => void;
    handleSocialContentSync: () => void;
    handleSimulateTestCall: () => void;
    handleUploadDocument: () => void;
    handleReindexKnowledge: () => void;
    handleClearKnowledge: () => void;
    handleViewKnowledge: () => void;
    setShowCallReports: (show: boolean) => void;
    setShowCallLogs: (show: boolean) => void;
  };
}

export function TabContentRenderer({ 
  activeTab, 
  currentSystemMode, 
  metrics, 
  automationPerformance, 
  liveActivity, 
  knowledgeStats,
  callStats,
  handlers 
}: TabContentProps) {

  const AutomationOpsContent = () => (
    <div className="space-y-6">
      {/* Live Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-blue-900/40 backdrop-blur-sm border border-blue-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-400" />
              Live Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Status:</span>
                <Badge className="bg-green-600 text-white">ACTIVE</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Uptime:</span>
                <span className="text-white font-bold">99.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Processes:</span>
                <span className="text-blue-400 font-bold">{currentSystemMode === 'test' ? '23 active' : '0 active'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Automation */}
        <Card className="bg-green-900/40 backdrop-blur-sm border border-green-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bot className="w-5 h-5 mr-2 text-green-400" />
              Core Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={handlers.handleNewBookingSync}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
              >
                📅 Create Booking
              </Button>
              <Button
                onClick={handlers.handleNewSupportTicket}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-500"
              >
                🎧 Support Ticket
              </Button>
              <Button
                onClick={handlers.handleManualFollowUp}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white border border-orange-500"
              >
                📧 Follow-up
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Orders */}
        <Card className="bg-purple-900/40 backdrop-blur-sm border border-purple-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-400" />
              Sales Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Today:</span>
                <span className="text-white font-bold">{currentSystemMode === 'test' ? '12' : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Revenue:</span>
                <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '$34.2K' : '$0'}</span>
              </div>
              <Button
                onClick={handlers.handleSalesOrderSync}
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Process Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF Reports */}
      <Card className="bg-orange-900/40 backdrop-blur-sm border border-orange-400">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-orange-400" />
            PDF Reports & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-orange-400">
              <div className="text-slate-300 text-xs mb-1">Reports Generated</div>
              <div className="text-white font-bold text-lg">{currentSystemMode === 'test' ? '47' : '0'}</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-orange-400">
              <div className="text-slate-300 text-xs mb-1">Auto-Scheduled</div>
              <div className="text-white font-bold text-lg">{currentSystemMode === 'test' ? '12' : '0'}</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-orange-400">
              <div className="text-slate-300 text-xs mb-1">Delivered</div>
              <div className="text-white font-bold text-lg">{currentSystemMode === 'test' ? '45' : '0'}</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-orange-400">
              <div className="text-slate-300 text-xs mb-1">Success Rate</div>
              <div className="text-white font-bold text-lg">{currentSystemMode === 'test' ? '95.7%' : '0%'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const VoiceOpsContent = () => (
    <div className="space-y-6">
      {/* Call Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-blue-900/40 backdrop-blur-sm border border-blue-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Phone className="w-5 h-5 mr-2 text-blue-400" />
              Call Monitoring Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Call Statistics */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-700/40 rounded-lg p-3 text-center border border-blue-400">
                  <div className="text-slate-300 text-xs mb-1">Active Calls</div>
                  <div className="text-white font-bold text-lg">{callStats.activeCalls}</div>
                </div>
                <div className="bg-slate-700/40 rounded-lg p-3 text-center border border-blue-400">
                  <div className="text-slate-300 text-xs mb-1">Avg Duration</div>
                  <div className="text-white font-bold text-lg">{callStats.avgDuration}</div>
                </div>
                <div className="bg-slate-700/40 rounded-lg p-3 text-center border border-blue-400">
                  <div className="text-slate-300 text-xs mb-1">Success Rate</div>
                  <div className="text-white font-bold text-lg">{callStats.successRate}</div>
                </div>
                <div className="bg-slate-700/40 rounded-lg p-3 text-center border border-blue-400">
                  <div className="text-slate-300 text-xs mb-1">Total Today</div>
                  <div className="text-white font-bold text-lg">{callStats.totalToday}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={handlers.handleSimulateTestCall}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-400"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Test Call
                </Button>
                <Button 
                  onClick={() => handlers.setShowCallReports(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-400"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Reports
                </Button>
                <Button 
                  onClick={() => handlers.setShowCallLogs(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white border border-green-400"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Logs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Analytics */}
        <Card className="bg-purple-900/40 backdrop-blur-sm border border-purple-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
              Voice Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Sentiment Score:</span>
                <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '8.7/10' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Keywords Detected:</span>
                <span className="text-blue-400 font-bold">{currentSystemMode === 'test' ? '234' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Transcription Accuracy:</span>
                <span className="text-purple-400 font-bold">{currentSystemMode === 'test' ? '96.8%' : ''}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Commands & Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-green-900/40 backdrop-blur-sm border border-green-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mic className="w-5 h-5 mr-2 text-green-400" />
              Voice Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Commands Today:</span>
                <span className="text-white font-bold">{currentSystemMode === 'test' ? '14' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Success Rate:</span>
                <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '92.3%' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Processing:</span>
                <span className="text-blue-400 font-bold">{currentSystemMode === 'test' ? '1 active' : '-- active'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-900/40 backdrop-blur-sm border border-orange-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-400" />
              Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Positive:</span>
                <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '78%' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Neutral:</span>
                <span className="text-blue-400 font-bold">{currentSystemMode === 'test' ? '18%' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Negative:</span>
                <span className="text-red-400 font-bold">{currentSystemMode === 'test' ? '4%' : ''}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const AIIntelligenceContent = () => (
    <div className="space-y-6">
      {/* Assistant Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-cyan-900/40 backdrop-blur-sm border border-cyan-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Brain className="w-5 h-5 mr-2 text-cyan-400" />
              Assistant Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Queries Today:</span>
                <span className="text-white font-bold">{currentSystemMode === 'test' ? '156' : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Accuracy:</span>
                <span className="text-cyan-400 font-bold">{currentSystemMode === 'test' ? '94.2%' : '0%'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Learning Rate:</span>
                <span className="text-blue-400 font-bold">{currentSystemMode === 'test' ? '+12%' : '0%'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-900/40 backdrop-blur-sm border border-indigo-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-400" />
              Smart Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Auto-Scheduled:</span>
                <span className="text-white font-bold">{currentSystemMode === 'test' ? '8' : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Conflicts Resolved:</span>
                <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '3' : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Efficiency:</span>
                <span className="text-indigo-400 font-bold">{currentSystemMode === 'test' ? '87%' : '0%'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pink-900/40 backdrop-blur-sm border border-pink-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-pink-400" />
              Conversation Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Conversations:</span>
                <span className="text-white font-bold">{currentSystemMode === 'test' ? '42' : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Avg Length:</span>
                <span className="text-pink-400 font-bold">{currentSystemMode === 'test' ? '4m 32s' : '0m'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Resolution Rate:</span>
                <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '89%' : '0%'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const SmartSpendContent = () => (
    <div className="space-y-6">
      {/* ROI & Botalytics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-green-900/40 backdrop-blur-sm border border-green-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              ROI Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {currentSystemMode === 'test' ? '247%' : '0%'}
              </div>
              <div className="text-slate-300 text-sm">Monthly ROI</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/40 backdrop-blur-sm border border-blue-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-400" />
              Cost Per Lead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {currentSystemMode === 'test' ? '$8.50' : '$0'}
              </div>
              <div className="text-slate-300 text-sm">This Month</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-900/40 backdrop-blur-sm border border-purple-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" />
              Budget Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {currentSystemMode === 'test' ? '73%' : '0%'}
              </div>
              <div className="text-slate-300 text-sm">Budget Used</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-900/40 backdrop-blur-sm border border-orange-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-400" />
              Efficiency Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {currentSystemMode === 'test' ? '94%' : '0%'}
              </div>
              <div className="text-slate-300 text-sm">Overall</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const SystemToolsContent = () => (
    <div className="space-y-6">
      {/* RAG Studio */}
      <Card className="bg-amber-900/40 backdrop-blur-sm border border-amber-400">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="w-5 h-5 mr-2 text-amber-400" />
            RAG Studio & Knowledge Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={handlers.handleUploadDocument}
                className="bg-green-600 hover:bg-green-700 text-white border border-green-400"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
              <Button 
                onClick={handlers.handleReindexKnowledge}
                className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-400"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reindex
              </Button>
              <Button 
                onClick={handlers.handleViewKnowledge}
                className="bg-amber-600 hover:bg-amber-700 text-white border border-amber-400"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Sources
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/60 rounded-lg p-4 border border-amber-400">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {knowledgeStats?.documents?.total || 0}
                  </div>
                  <div className="text-white text-sm">Documents Indexed</div>
                </div>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-4 border border-amber-400">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {knowledgeStats?.memory?.total || 0}
                  </div>
                  <div className="text-white text-sm">Memory Entries</div>
                </div>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-4 border border-amber-400">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {currentSystemMode === 'test' ? '98.5%' : '0%'}
                  </div>
                  <div className="text-white text-sm">Index Health</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-red-900/40 backdrop-blur-sm border border-red-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Escalation Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Active Alerts:</span>
                <span className="text-red-400 font-bold">{currentSystemMode === 'test' ? '2' : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Resolved Today:</span>
                <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '5' : '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-slate-400" />
              Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Entries Today:</span>
                <span className="text-white font-bold">{currentSystemMode === 'test' ? '847' : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Anomalies:</span>
                <span className="text-yellow-400 font-bold">{currentSystemMode === 'test' ? '1' : '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-400">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TestTube className="w-5 h-5 mr-2 text-emerald-400" />
              Test Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Tests Run:</span>
                <span className="text-white font-bold">{currentSystemMode === 'test' ? '234' : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Success Rate:</span>
                <span className="text-emerald-400 font-bold">{currentSystemMode === 'test' ? '97.8%' : '0%'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Lead Scraper Content Component
  const LeadScraperContent = () => (
    <div className="space-y-6">
      <LeadScraper />
    </div>
  );

  // Render content based on active tab
  switch (activeTab) {
    case 'automation-ops':
      return <AutomationOpsContent />;
    case 'voiceops':
      return <VoiceOpsContent />;
    case 'ai-intelligence':
      return <AIIntelligenceContent />;
    case 'smartspend':
      return <SmartSpendContent />;
    case 'lead-scraper':
      return <LeadScraperContent />;
    case 'system-tools':
      return <SystemToolsContent />;
    default:
      return <AutomationOpsContent />;
  }
}