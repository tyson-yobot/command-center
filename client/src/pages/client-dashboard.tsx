import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Phone, MessageSquare, FileText, Download, Upload, Users, 
  TrendingUp, Activity, AlertTriangle, Settings, Mic, MicOff,
  Search, Filter, Calendar, DollarSign, Target, BarChart3,
  PlayCircle, StopCircle, Eye, Brain, Zap, PhoneCall
} from 'lucide-react';
import { SocialContentCreator } from '@/components/social-content-creator';
import { MailchimpSyncDashboard } from '@/components/mailchimp-sync-dashboard';

export default function ClientDashboard() {
  const { toast } = useToast();
  
  // State management
  const [isTestMode, setIsTestMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [phoneNotifications, setPhoneNotifications] = useState(true);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [showCallMonitoring, setShowCallMonitoring] = useState(false);
  const [showSocialCreator, setShowSocialCreator] = useState(false);
  const [showMailchimpSync, setShowMailchimpSync] = useState(false);
  const [activeCalls, setActiveCalls] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [completedCalls, setCompletedCalls] = useState(0);
  const [metrics, setMetrics] = useState({});
  const [bot, setBot] = useState({});
  const [crmData, setCrmData] = useState({});

  // Button handlers
  const handleSendSMS = async () => {
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

    try {
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

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

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

  const handleLeadScraping = async () => {
    try {
      const response = await apiRequest('POST', '/api/leads/scrape', {
        query: 'roofing contractor',
        limit: 50,
        mode: isTestMode ? 'test' : 'live'
      });

      if (response.ok) {
        toast({
          title: "Lead Scraping Started",
          description: "Scraping leads from multiple sources",
        });
      }
    } catch (error) {
      toast({
        title: "Scraping Error",
        description: "Failed to start lead scraping",
        variant: "destructive"
      });
    }
  };

  const handleVoiceCall = async () => {
    const phoneNumber = prompt('Enter phone number to call:');
    
    if (!phoneNumber) {
      toast({
        title: "Call Cancelled",
        description: "Phone number is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/calls/initiate', {
        to: phoneNumber,
        mode: isTestMode ? 'test' : 'live'
      });

      if (response.ok) {
        toast({
          title: "Call Initiated",
          description: `Calling ${phoneNumber}`,
        });
      } else {
        toast({
          title: "Call Failed",
          description: "Failed to initiate call",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Call Error",
        description: "Error initiating call",
        variant: "destructive"
      });
    }
  };

  const handleNewBookingSync = async () => {
    try {
      const response = await apiRequest('POST', '/api/bookings/sync', {
        mode: isTestMode ? 'test' : 'live'
      });

      if (response.ok) {
        toast({
          title: "Booking Sync Started",
          description: "Syncing latest bookings",
        });
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync bookings",
        variant: "destructive"
      });
    }
  };

  const handleSupportTicket = async () => {
    try {
      const response = await apiRequest('POST', '/api/support/ticket', {
        subject: "Dashboard Support Request",
        description: "Support request from Command Center",
        priority: "normal"
      });

      if (response.ok) {
        toast({
          title: "Support Ticket Created",
          description: "Our team will respond shortly",
        });
      }
    } catch (error) {
      toast({
        title: "Ticket Error",
        description: "Failed to create support ticket",
        variant: "destructive"
      });
    }
  };

  const handleManualFollowUp = async () => {
    try {
      const response = await apiRequest('POST', '/api/followup/manual', {
        mode: isTestMode ? 'test' : 'live'
      });

      if (response.ok) {
        toast({
          title: "Follow-up Triggered",
          description: "Manual follow-up sequence started",
        });
      }
    } catch (error) {
      toast({
        title: "Follow-up Error",
        description: "Failed to trigger follow-up",
        variant: "destructive"
      });
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/export/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv', timeframe: 'last_7_days' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yobot-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Data Exported",
          description: "CSV file downloaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-8 p-8">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              YoBot Command Center
            </h1>
            <p className="text-slate-300 mt-2">Enterprise Automation Platform</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch checked={isTestMode} onCheckedChange={setIsTestMode} />
              <span className="text-white font-medium">
                {isTestMode ? 'Test Mode' : 'Live Mode'}
              </span>
            </div>
            <Badge variant={isTestMode ? "secondary" : "default"}>
              {isTestMode ? 'TESTING' : 'LIVE'}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Voice Operations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={startPipelineCalls}
                disabled={pipelineRunning}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Pipeline Calls
              </Button>
              <Button 
                onClick={stopPipelineCalls}
                disabled={!pipelineRunning}
                variant="destructive"
                className="w-full"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Pipeline Calls
              </Button>
              <Button onClick={handleVoiceCall} variant="outline" className="w-full">
                <PhoneCall className="w-4 h-4 mr-2" />
                Initiate Voice Call
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Communications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleSendSMS} className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send SMS
              </Button>
              <Button onClick={handleNewBookingSync} className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                New Booking Sync
              </Button>
              <Button onClick={handleSupportTicket} className="w-full">
                <AlertTriangle className="w-4 h-4 mr-2" />
                New Support Ticket
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Data & Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <input
                  type="file"
                  onChange={handleDocumentUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                />
                <Button className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Docs
                </Button>
              </div>
              <Button onClick={handleDownloadPDF} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                onClick={() => setShowSocialCreator(true)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Brain className="w-4 h-4 mr-2" />
                Social Content Creator
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Lead Generation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleLeadScraping} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Run Lead Scrape
              </Button>
              <Button onClick={handleManualFollowUp} className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Manual Follow-up
              </Button>
              <Button onClick={handleExportData} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
                <span className="text-white">Email Notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={phoneNotifications} 
                  onCheckedChange={setPhoneNotifications} 
                />
                <span className="text-white">Phone Notifications</span>
              </div>
              <Button 
                onClick={() => setShowMailchimpSync(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Mailchimp Sync
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Calls</p>
                  <p className="text-2xl font-bold text-white">{activeCalls.length}</p>
                </div>
                <Phone className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">AI Responses</p>
                  <p className="text-2xl font-bold text-white">247</p>
                </div>
                <Brain className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pipeline Value</p>
                  <p className="text-2xl font-bold text-white">$48.2K</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">System Health</p>
                  <p className="text-2xl font-bold text-white">98%</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Records</p>
                  <p className="text-2xl font-bold text-white">{totalRecords}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal Components */}
        {showSocialCreator && (
          <SocialContentCreator 
            onProcessComplete={(result) => {
              setShowSocialCreator(false);
              toast({
                title: "Content Generated",
                description: "Social media content created successfully",
              });
            }}
          />
        )}

        {showMailchimpSync && (
          <MailchimpSyncDashboard 
            isOpen={showMailchimpSync}
            onClose={() => setShowMailchimpSync(false)}
            activeCalls={activeCalls}
            totalRecords={totalRecords}
            completedCalls={completedCalls}
          />
        )}
      </div>
    </div>
  );
}