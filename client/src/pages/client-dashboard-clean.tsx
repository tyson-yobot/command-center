import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Phone, 
  MessageSquare, 
  FileText, 
  Mic, 
  MicOff, 
  Upload, 
  Mail, 
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import SocialContentCreator from '@/components/social-content-creator';
import MailchimpSyncDashboard from '@/components/mailchimp-sync-dashboard';

export default function ClientDashboard() {
  // Core state
  const [isTestMode, setTestMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('System ready');
  const [automationMode, setAutomationMode] = useState(true);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [completedCalls, setCompletedCalls] = useState(0);
  
  // Document management
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  
  // Module states
  const [showSocialContentCreator, setShowSocialContentCreator] = useState(false);
  const [showMailchimpSync, setShowMailchimpSync] = useState(false);
  const [showCallMonitoring, setShowCallMonitoring] = useState(false);
  
  const { toast } = useToast();

  // Mock data for demo
  const metrics = {
    activeCalls: 12,
    aiResponsesToday: 247,
    pipelineValue: 89300,
    systemHealth: 98,
    totalBots: 5,
    avgResponseTime: 1.2,
    errorCount: 3,
    activeSessions: 28,
    monthlyRevenue: 125000,
    activeDeals: 42,
    closeRate: 68,
    salesVelocity: 15000
  };

  // Voice recognition setup
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        speechSynthesis.addEventListener('voiceschanged', () => {
          speechSynthesis.getVoices();
        });
      }
    }
  }, []);

  // Core functions
  const handleVoiceToggle = () => {
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    try {
      setIsListening(true);
      setVoiceStatus('Listening...');
      toast({
        title: "Voice Recognition",
        description: "Now listening for commands",
      });
    } catch (error) {
      setIsListening(false);
      setVoiceStatus('Voice recognition not supported');
      toast({
        title: "Voice Error",
        description: "Voice recognition not available",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setVoiceStatus('Ready');
  };

  const sendVoiceCommand = async () => {
    if (!voiceCommand.trim()) return;
    
    try {
      toast({
        title: "Processing Command",
        description: voiceCommand,
      });

      const response = await apiRequest('POST', '/api/voice/command', {
        command: voiceCommand,
        mode: isTestMode ? 'test' : 'live'
      });

      if (response.ok) {
        const result = await response.json();
        setVoiceStatus(result.message || 'Command executed');
        toast({
          title: "Command Executed",
          description: result.message || "Command completed successfully",
        });
      } else {
        toast({
          title: "Command Failed",
          description: "Failed to execute voice command",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Command Error",
        description: "Error processing voice command",
        variant: "destructive"
      });
    }
    
    setVoiceCommand('');
  };

  const executeLiveCommand = async (command: string) => {
    try {
      toast({
        title: "Executing Command",
        description: `Running: ${command}`,
      });

      const response = await apiRequest('POST', '/api/automation/execute', {
        command: command,
        mode: isTestMode ? 'test' : 'live',
        timestamp: new Date().toISOString()
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Command Executed",
          description: result.message || `${command} completed successfully`,
        });
      } else {
        toast({
          title: "Command Failed",
          description: `Failed to execute: ${command}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Execution Error",
        description: `Error executing: ${command}`,
        variant: "destructive"
      });
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setDocumentsLoading(true);
    toast({
      title: "Uploading Documents",
      description: `Processing ${files.length} file(s)...`,
    });

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('category', 'user-upload');

      try {
        const response = await fetch('/api/rag/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          setUploadedDocuments(prev => [...prev, result]);
          toast({
            title: "Document Uploaded",
            description: `${file.name} processed successfully`,
          });
        } else {
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Upload Error",
          description: `Error uploading ${file.name}`,
          variant: "destructive"
        });
      }
    }

    setDocumentsLoading(false);
    event.target.value = '';
  };

  const handleDownloadPDF = async () => {
    try {
      toast({
        title: "Generating PDF",
        description: "Creating your report...",
      });

      const response = await fetch('/api/reports/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'summary', includeMetrics: true })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yobot-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "PDF Generated",
          description: "Report downloaded successfully",
        });
      } else {
        toast({
          title: "PDF Failed",
          description: "Failed to generate PDF report",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "PDF Error",
        description: "Error generating PDF report",
        variant: "destructive"
      });
    }
  };

  const handleSendSMS = async () => {
    try {
      const phoneNumber = prompt('Enter phone number:');
      const message = prompt('Enter message:');
      
      if (!phoneNumber || !message) {
        toast({
          title: "SMS Cancelled",
          description: "Phone number and message are required",
          variant: "destructive"
        });
        return;
      }

      const response = await apiRequest('POST', '/api/sms/send', {
        to: phoneNumber,
        message: message
      });

      if (response.ok) {
        toast({
          title: "SMS Sent",
          description: `Message sent to ${phoneNumber}`,
        });
      } else {
        toast({
          title: "SMS Failed",
          description: "Failed to send SMS message",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "SMS Error",
        description: "Network error sending SMS",
        variant: "destructive"
      });
    }
  };

  const startPipelineCalls = async () => {
    setPipelineRunning(true);
    setShowCallMonitoring(true);
    
    try {
      const response = await apiRequest('POST', '/api/calls/start-pipeline', {
        mode: isTestMode ? 'test' : 'live'
      });
      
      if (response.ok) {
        toast({
          title: "Pipeline Started",
          description: "Voice pipeline is now active",
        });
      }
    } catch (error) {
      setPipelineRunning(false);
      toast({
        title: "Pipeline Error",
        description: "Failed to start pipeline",
        variant: "destructive"
      });
    }
  };

  const stopPipelineCalls = async () => {
    setPipelineRunning(false);
    setActiveCalls([]);
    
    try {
      await apiRequest('POST', '/api/calls/stop-pipeline');
      toast({
        title: "Pipeline Stopped",
        description: "Voice pipeline has been stopped",
      });
    } catch (error) {
      toast({
        title: "Stop Error",
        description: "Error stopping pipeline",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              YoBot Command Center
            </h1>
            <p className="text-slate-300 text-lg">
              Enterprise Automation & Intelligence Platform
            </p>
            
            {/* Global Test/Live Mode Toggle */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <label className="text-white font-medium">System Mode:</label>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${isTestMode ? 'text-yellow-400' : 'text-gray-400'}`}>
                    🧪 Test
                  </span>
                  <Switch
                    checked={!isTestMode}
                    onCheckedChange={(checked) => setTestMode(!checked)}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <span className={`text-sm ${!isTestMode ? 'text-green-400' : 'text-gray-400'}`}>
                    🚀 Live
                  </span>
                </div>
                <Badge variant={isTestMode ? "secondary" : "default"} className="px-3 py-1">
                  {isTestMode ? "Test Mode - Safe Operations" : "Live Mode - Real Operations"}
                </Badge>
              </div>
            </div>
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
                {isListening ? 'Stop Listening' : 'Voice Input'}
              </Button>
            </div>
          </div>
        </div>

        {/* Voice Status */}
        <div className="mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Status:</span>
              <span className={`font-medium ${isListening ? 'text-green-400' : 'text-blue-400'}`}>
                {voiceStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Main Automation Controls */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">Core Automation Functions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Core Automation */}
            <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
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
                    className="bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">🆘</span>
                    <span>New Support Ticket</span>
                  </Button>
                  
                  <Button
                    onClick={() => executeLiveCommand("Manual Follow-up")}
                    className="bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">🚀</span>
                    <span>Manual Follow-up</span>
                  </Button>
                  
                  <Button
                    onClick={() => executeLiveCommand("Sales Orders")}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">💼</span>
                    <span>Sales Orders</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Voice & Communication */}
            <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white">Voice & Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={startPipelineCalls}
                    className="bg-lime-500 hover:bg-lime-600 text-black flex items-center justify-start p-3 font-semibold"
                  >
                    <span className="text-xl mr-3">📞</span>
                    <span>Start Pipeline Calls</span>
                  </Button>
                  
                  <Button
                    onClick={stopPipelineCalls}
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">⏹️</span>
                    <span>Stop Pipeline Calls</span>
                  </Button>
                  
                  <Button
                    onClick={() => executeLiveCommand("Initiate Voice Call")}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📞</span>
                    <span>Initiate Voice Call</span>
                  </Button>
                  
                  <Button
                    onClick={handleVoiceToggle}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
                  >
                    <Mic className="w-5 h-5 mr-3" />
                    <span>Voice Input</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data & Reports */}
            <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white">Data & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => window.location.href = '/lead-scrape'}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">🧲</span>
                    <span>Run Lead Scrape</span>
                  </Button>
                  
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-start p-3"
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    <span>PDF Report</span>
                  </Button>
                  
                  <Button
                    onClick={() => setShowSocialContentCreator(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-start p-3"
                  >
                    <Share2 className="w-5 h-5 mr-3" />
                    <span>Content Creator</span>
                  </Button>
                  
                  <Button
                    onClick={() => setShowMailchimpSync(true)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-start p-3"
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    <span>Mailchimp Sync</span>
                  </Button>
                  
                  <Button
                    onClick={() => document.getElementById('document-upload')?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-start p-3"
                  >
                    <Upload className="w-5 h-5 mr-3" />
                    <span>Upload Documents</span>
                  </Button>
                  
                  <Button
                    onClick={handleSendSMS}
                    className="bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-start p-3"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    <span>Send SMS</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Calls</CardTitle>
              <Phone className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{metrics.activeCalls}</div>
              <p className="text-xs text-slate-300">
                Pipeline running
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-400 shadow-lg shadow-blue-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">AI Responses Today</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{metrics.aiResponsesToday}</div>
              <p className="text-xs text-slate-300">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-yellow-400 shadow-lg shadow-yellow-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">${metrics.pipelineValue.toLocaleString()}</div>
              <p className="text-xs text-slate-300">
                Active opportunities
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-green-400 shadow-lg shadow-green-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">System Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{metrics.systemHealth}%</div>
              <p className="text-xs text-slate-300">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hidden file input */}
        <input
          id="document-upload"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleDocumentUpload}
        />

        {/* Modals */}
        {showSocialContentCreator && (
          <SocialContentCreator 
            onClose={() => setShowSocialContentCreator(false)}
          />
        )}

        {showMailchimpSync && (
          <MailchimpSyncDashboard 
            onClose={() => setShowMailchimpSync(false)}
          />
        )}
      </div>
    </div>
  );
}