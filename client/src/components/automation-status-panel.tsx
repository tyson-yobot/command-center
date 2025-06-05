import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock, Zap, Database, MessageSquare, FileText, Phone } from 'lucide-react';

interface AutomationStatus {
  name: string;
  status: 'active' | 'pending' | 'error' | 'disabled';
  lastRun: string;
  successRate: number;
  description: string;
  category: string;
}

export default function AutomationStatusPanel() {
  const [automations, setAutomations] = useState<AutomationStatus[]>([
    {
      name: "QA Review System",
      status: "active",
      lastRun: "2 minutes ago",
      successRate: 95,
      description: "GPT-powered call scoring with PDF generation",
      category: "Quality"
    },
    {
      name: "Follow-up SMS Automation",
      status: "active", 
      lastRun: "5 minutes ago",
      successRate: 88,
      description: "Automated SMS follow-ups for missed calls",
      category: "Communication"
    },
    {
      name: "VoiceBot Call Logging",
      status: "pending",
      lastRun: "1 hour ago",
      successRate: 78,
      description: "Comprehensive call transcription and logging",
      category: "Logging"
    },
    {
      name: "Escalation Tracking",
      status: "active",
      lastRun: "10 minutes ago", 
      successRate: 92,
      description: "Automatic escalation detection and routing",
      category: "Quality"
    },
    {
      name: "Lead Scraping Pipeline",
      status: "error",
      lastRun: "3 hours ago",
      successRate: 45,
      description: "Apollo.io and PhantomBuster integration",
      category: "Lead Generation"
    },
    {
      name: "Google Drive PDF Storage",
      status: "active",
      lastRun: "8 minutes ago",
      successRate: 89,
      description: "Automated PDF upload and sharing",
      category: "Storage"
    }
  ]);
  
  const [systemHealth, setSystemHealth] = useState({
    overall: 87,
    activeAutomations: 40,
    totalExecutions: 1247,
    errorRate: 8.3
  });

  const testAutomation = async (name: string) => {
    try {
      let endpoint = '';
      let payload = {};

      switch (name) {
        case "QA Review System":
          endpoint = '/api/qa/review';
          payload = {
            call_id: `TEST-${Date.now()}`,
            agent_name: "Tyson Lerfald",
            phone_number: "+1-555-TEST",
            transcript: "Test call for automation verification",
            qa_comments: "Automated test review",
            flags: "Test",
            review_type: "Automation Test"
          };
          break;
        case "Follow-up SMS Automation":
          endpoint = '/api/followup/sms';
          payload = {
            phone_number: "+1-555-TEST",
            message: "Test SMS from automation system",
            call_id: `TEST-SMS-${Date.now()}`
          };
          break;
        case "VoiceBot Call Logging":
          endpoint = '/api/voicebot/calllog';
          payload = {
            caller_name: "Test User",
            phone: "+1-555-TEST",
            bot_name: "YoBot",
            timestamp: new Date().toISOString(),
            transcript: "Test call logging",
            outcome: "Test Completed",
            escalated: false,
            qa_score: 85
          };
          break;
        default:
          endpoint = '/api/test/complete-pipeline';
          payload = {};
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      alert(`${name} Test Result:\n${result.success ? 'SUCCESS' : 'FAILED'}\n${result.message || JSON.stringify(result)}`);
    } catch (error: any) {
      alert(`${name} Test Error:\n${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Quality': return <Zap className="h-4 w-4" />;
      case 'Communication': return <MessageSquare className="h-4 w-4" />;
      case 'Logging': return <FileText className="h-4 w-4" />;
      case 'Lead Generation': return <Phone className="h-4 w-4" />;
      case 'Storage': return <Database className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Zap className="h-5 w-5 text-blue-500" />
            Automation System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemHealth.overall}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Health</div>
              <Progress value={systemHealth.overall} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemHealth.activeAutomations}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Functions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{systemHealth.totalExecutions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Executions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{systemHealth.errorRate}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {automations.map((automation, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(automation.category)}
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                    {automation.name}
                  </CardTitle>
                </div>
                {getStatusIcon(automation.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(automation.status)}>
                    {automation.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-500">{automation.lastRun}</span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {automation.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="font-medium">{automation.successRate}%</span>
                  </div>
                  <Progress value={automation.successRate} className="h-2" />
                </div>
                
                <Button 
                  onClick={() => testAutomation(automation.name)}
                  size="sm" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Test Function
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Status */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Slack Webhooks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Twilio SMS</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">OpenAI GPT-4</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Airtable API</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Google Drive</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">SendGrid Email</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Apollo.io</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">PhantomBuster</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}