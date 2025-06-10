import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Mic, 
  Users, 
  MessageSquare, 
  FileText, 
  Database,
  BarChart3,
  Calendar,
  Bot,
  Zap,
  Target,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
  Phone,
  Mail,
  PieChart,
  Globe,
  Settings,
  Star
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  action: string;
  highlight: string[];
  metrics?: {
    roi?: number;
    leads?: number;
    closeRate?: number;
    timeSaved?: number;
    costPerLead?: number;
    paybackDays?: number;
  };
}

const DEMO_SCRIPT: DemoStep[] = [
  {
    id: 'intro',
    title: 'YoBot® Command Center Overview',
    description: 'Real command center that runs sales, support, reports, lead scraping, voice calls, and ROI — all from one screen. Built to automate every part of your business.',
    duration: 15000,
    action: 'Showcasing unified dashboard',
    highlight: ['dashboard', 'metrics', 'live-feed'],
    metrics: { roi: 340, leads: 1247, closeRate: 23.5, timeSaved: 360 }
  },
  {
    id: 'core-automation',
    title: 'Core Automation Workflows',
    description: 'These buttons eliminate decision fatigue. Booking Sync captures leads, adds to Airtable, assigns reps, sends Slack notifications. Support Ticket creates Zendesk tickets with client details.',
    duration: 25000,
    action: 'Demonstrating booking sync and support workflows',
    highlight: ['booking-sync', 'support-ticket', 'manual-followup', 'sales-orders'],
    metrics: { leads: 156, timeSaved: 45, costPerLead: 2.50 }
  },
  {
    id: 'sales-orders',
    title: 'Sales Order Automation',
    description: 'Complete flow: invoice triggered, Stripe activated, QuickBooks updated, client notified. SMS sends personalized texts using live data tags, fully integrated with Twilio.',
    duration: 20000,
    action: 'Processing sales orders and SMS campaigns',
    highlight: ['sales-orders', 'send-sms', 'stripe-integration'],
    metrics: { roi: 285, closeRate: 31.2, timeSaved: 75 }
  },
  {
    id: 'communication',
    title: 'Voice & Communication Hub',
    description: 'Start Pipeline Calls queues outbound dials through voice engine with personalized data. Voice Input processes commands: "Schedule follow-up with Brian next Thursday" — done.',
    duration: 20000,
    action: 'Activating voice pipeline and command processing',
    highlight: ['voice-pipeline', 'voice-call', 'voice-input'],
    metrics: { leads: 89, closeRate: 28.7, timeSaved: 120 }
  },
  {
    id: 'content-creator',
    title: 'AI Content Creator',
    description: 'Choose format (email, voicemail, social caption), choose voice (professional, casual, high-energy), add your product — get custom, high-converting content in seconds.',
    duration: 30000,
    action: 'Generating personalized content with AI',
    highlight: ['content-creator', 'ai-tools', 'content-formats'],
    metrics: { timeSaved: 180, costPerLead: 1.85 }
  },
  {
    id: 'lead-scraping',
    title: 'Apollo Lead Scraping Engine',
    description: 'Choose Apollo, apply filters: industry, job title, location, phone/email required, company size, tech stack. YoBot® scrapes, deduplicates, scores leads, sends to system. No CSV files, no VAs.',
    duration: 35000,
    action: 'Running comprehensive lead scrape with Apollo',
    highlight: ['lead-scrape', 'apollo-integration', 'data-processing', 'lead-scoring'],
    metrics: { leads: 423, roi: 156, costPerLead: 1.20, timeSaved: 240 }
  },
  {
    id: 'reporting',
    title: 'Automated Reporting & Export',
    description: 'PDF Report compiles selected fields, creates branded Google Docs, exports client-ready PDFs. Export Data syncs to Google Sheets, Airtable. Mailchimp Sync pushes leads to campaign segments.',
    duration: 20000,
    action: 'Generating reports and syncing data',
    highlight: ['pdf-report', 'export-data', 'mailchimp-sync', 'google-sheets'],
    metrics: { timeSaved: 95, roi: 220 }
  },
  {
    id: 'ceo-pitch',
    title: 'The Growth Engine Promise',
    description: 'Replacing your sales assistant, tech VA, cold caller, analytics guy, and scheduling coordinator. Clients save 360+ hours in first 60 days. This isn\'t software — it\'s your growth engine.',
    duration: 25000,
    action: 'Demonstrating comprehensive automation impact',
    highlight: ['complete-system', 'time-savings', 'roi-calculator'],
    metrics: { roi: 450, timeSaved: 360, paybackDays: 12, costPerLead: 0.95 }
  },
  {
    id: 'live-support',
    title: '24/7 Live Support & Handoff',
    description: '24/7 live chat powered by AI triage and human escalation. Customers get immediate answers, smooth handoffs when needed. No form fills, no waiting hours.',
    duration: 15000,
    action: 'Showcasing support automation and escalation',
    highlight: ['live-chat', 'ai-triage', 'escalation', 'support-metrics'],
    metrics: { timeSaved: 95, closeRate: 35.0 }
  },
  {
    id: 'botalytics',
    title: 'Botalytics™ & SmartSpend™ Analytics',
    description: 'ROI % based on revenue vs package cost. Cost per Lead, Lead Quality Score, Close Rate synced from deals, Budget Efficiency, Payback Period. Actionable metrics, not vanity stats.',
    duration: 25000,
    action: 'Analyzing comprehensive performance metrics',
    highlight: ['roi-metrics', 'lead-quality', 'budget-efficiency', 'close-rate', 'payback-calculator'],
    metrics: { roi: 340, closeRate: 28.7, timeSaved: 240, costPerLead: 1.15, paybackDays: 18 }
  },
  {
    id: 'control-features',
    title: 'Advanced Control Bar Features',
    description: 'Live Activity Feed shows everything in motion. Voice Assistant triggers functions hands-free. Memory Text Insertion saves standard responses. Smart Calendar auto-creates tasks. RAG module answers from your knowledge base.',
    duration: 25000,
    action: 'Demonstrating advanced control features',
    highlight: ['activity-feed', 'voice-assistant', 'smart-calendar', 'rag-module', 'memory-text'],
    metrics: { timeSaved: 180, roi: 275 }
  },
  {
    id: 'closing',
    title: 'Your Complete Control Tower',
    description: 'A control tower. A lead engine. A voice agent. A full-service CRM, communicator, and performance dashboard — that works even when you don\'t. This is YoBot®.',
    duration: 20000,
    action: 'Final impact demonstration',
    highlight: ['complete-system', 'final-metrics'],
    metrics: { roi: 450, leads: 2156, closeRate: 35.8, timeSaved: 720, costPerLead: 0.85, paybackDays: 8 }
  }
];

export default function DemoMode() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [highlightedElements, setHighlightedElements] = useState<string[]>([]);
  const [totalDemoProgress, setTotalDemoProgress] = useState(0);

  const currentDemoStep = DEMO_SCRIPT[currentStep];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < DEMO_SCRIPT.length) {
      const step = DEMO_SCRIPT[currentStep];
      setHighlightedElements(step.highlight);
      
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (step.duration / 100));
          
          if (newProgress >= 100) {
            if (currentStep < DEMO_SCRIPT.length - 1) {
              setCurrentStep(currentStep + 1);
              setProgress(0);
              setTotalDemoProgress(((currentStep + 1) / DEMO_SCRIPT.length) * 100);
            } else {
              setIsPlaying(false);
              setProgress(100);
              setTotalDemoProgress(100);
            }
          }
          
          return Math.min(newProgress, 100);
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    setTotalDemoProgress(0);
    setHighlightedElements([]);
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setTotalDemoProgress((stepIndex / DEMO_SCRIPT.length) * 100);
    setHighlightedElements(DEMO_SCRIPT[stepIndex].highlight);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      
      {/* Demo Header with Branding */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="h-10 w-10 text-blue-600" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    YoBot® Command Center
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">CEO Demo Edition</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="destructive" className="animate-pulse">
                    LIVE DEMO
                  </Badge>
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    12-15 MIN PRESENTATION
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Demo Progress</div>
                <div className="text-lg font-bold text-blue-600">{Math.round(totalDemoProgress)}%</div>
              </div>
              
              <Button
                onClick={handlePlay}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                {isPlaying ? 'Pause Demo' : 'Start Demo'}
              </Button>
              
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="border-gray-300"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="mt-4">
            <Progress value={totalDemoProgress} className="h-3 bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Demo Navigation & Metrics Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Demo Steps */}
            <Card className="border-2 border-blue-200 dark:border-blue-700">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Demo Script</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {DEMO_SCRIPT.map((step, index) => (
                    <div
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        index === currentStep
                          ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 shadow-md'
                          : index < currentStep
                          ? 'bg-green-50 dark:bg-green-900/30 border-green-300'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {index < currentStep ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : index === currentStep ? (
                            <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {step.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {Math.round(step.duration / 1000)}s • {step.action}
                          </div>
                        </div>
                      </div>
                      
                      {index === currentStep && (
                        <div className="mt-2">
                          <Progress value={progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live Performance Metrics */}
            {currentDemoStep?.metrics && (
              <Card className="border-2 border-green-200 dark:border-green-700">
                <CardHeader className="bg-green-50 dark:bg-green-900/30">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Live Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {currentDemoStep.metrics.roi && (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">ROI</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">{currentDemoStep.metrics.roi}%</span>
                    </div>
                  )}
                  
                  {currentDemoStep.metrics.leads && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Leads Generated</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">{currentDemoStep.metrics.leads.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {currentDemoStep.metrics.closeRate && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Close Rate</span>
                      </div>
                      <span className="text-xl font-bold text-purple-600">{currentDemoStep.metrics.closeRate}%</span>
                    </div>
                  )}
                  
                  {currentDemoStep.metrics.timeSaved && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Time Saved</span>
                      </div>
                      <span className="text-xl font-bold text-orange-600">{currentDemoStep.metrics.timeSaved}h</span>
                    </div>
                  )}
                  
                  {currentDemoStep.metrics.costPerLead && (
                    <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium">Cost per Lead</span>
                      </div>
                      <span className="text-xl font-bold text-indigo-600">${currentDemoStep.metrics.costPerLead}</span>
                    </div>
                  )}
                  
                  {currentDemoStep.metrics.paybackDays && (
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Payback Period</span>
                      </div>
                      <span className="text-xl font-bold text-red-600">{currentDemoStep.metrics.paybackDays} days</span>
                    </div>
                  )}
                  
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Demo Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Current Demo Step Display */}
            <Card className="border-2 border-blue-300 dark:border-blue-600 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {currentStep + 1}
                    </div>
                    <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
                      {currentDemoStep?.title}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="border-blue-400 text-blue-700 bg-white">
                    {currentDemoStep?.action}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentDemoStep?.description}
                </p>
              </CardContent>
            </Card>

            {/* Interactive Command Center Interface */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-6 w-6" />
                  <span>Live Command Center Interface</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    INTERACTIVE
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Core Automation Grid */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-yellow-600" />
                    <span>Core Automation</span>
                    {highlightedElements.some(el => ['booking-sync', 'support-ticket', 'manual-followup', 'sales-orders'].includes(el)) && (
                      <Badge variant="destructive" className="animate-pulse">ACTIVE</Badge>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'booking-sync', label: 'Booking Sync', icon: Calendar, color: 'blue' },
                      { id: 'support-ticket', label: 'Support Ticket', icon: MessageSquare, color: 'green' },
                      { id: 'manual-followup', label: 'Manual Follow-up', icon: Clock, color: 'orange' },
                      { id: 'sales-orders', label: 'Sales Orders', icon: DollarSign, color: 'purple' }
                    ].map((button) => (
                      <Button
                        key={button.id}
                        variant={highlightedElements.includes(button.id) ? "default" : "outline"}
                        className={`h-20 transition-all duration-300 ${
                          highlightedElements.includes(button.id) 
                            ? `bg-${button.color}-600 hover:bg-${button.color}-700 text-white shadow-xl ring-4 ring-${button.color}-300 transform scale-105` 
                            : 'hover:shadow-lg'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <button.icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{button.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Communication Hub */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center space-x-2">
                    <Mic className="h-6 w-6 text-green-600" />
                    <span>Communication Hub</span>
                    {highlightedElements.some(el => ['voice-pipeline', 'voice-call', 'voice-input', 'send-sms'].includes(el)) && (
                      <Badge variant="destructive" className="animate-pulse">ACTIVE</Badge>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'voice-pipeline', label: 'Voice Pipeline', icon: Users, color: 'green' },
                      { id: 'voice-call', label: 'Voice Call', icon: Phone, color: 'blue' },
                      { id: 'voice-input', label: 'Voice Input', icon: Mic, color: 'indigo' },
                      { id: 'send-sms', label: 'Send SMS', icon: MessageSquare, color: 'pink' }
                    ].map((button) => (
                      <Button
                        key={button.id}
                        variant={highlightedElements.includes(button.id) ? "default" : "outline"}
                        className={`h-20 transition-all duration-300 ${
                          highlightedElements.includes(button.id) 
                            ? `bg-${button.color}-600 hover:bg-${button.color}-700 text-white shadow-xl ring-4 ring-${button.color}-300 transform scale-105` 
                            : 'hover:shadow-lg'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <button.icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{button.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Lead Generation & Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center space-x-2">
                    <Target className="h-6 w-6 text-purple-600" />
                    <span>Lead Generation & Content</span>
                    {highlightedElements.some(el => ['content-creator', 'lead-scrape', 'pdf-report', 'export-data'].includes(el)) && (
                      <Badge variant="destructive" className="animate-pulse">ACTIVE</Badge>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'content-creator', label: 'Content Creator', icon: FileText, color: 'purple' },
                      { id: 'lead-scrape', label: 'Apollo Scrape', icon: Globe, color: 'blue' },
                      { id: 'pdf-report', label: 'PDF Report', icon: FileText, color: 'red' },
                      { id: 'export-data', label: 'Export Data', icon: Database, color: 'gray' }
                    ].map((button) => (
                      <Button
                        key={button.id}
                        variant={highlightedElements.includes(button.id) ? "default" : "outline"}
                        className={`h-20 transition-all duration-300 ${
                          highlightedElements.includes(button.id) 
                            ? `bg-${button.color}-600 hover:bg-${button.color}-700 text-white shadow-xl ring-4 ring-${button.color}-300 transform scale-105` 
                            : 'hover:shadow-lg'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <button.icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{button.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Advanced Analytics */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center space-x-2">
                    <PieChart className="h-6 w-6 text-indigo-600" />
                    <span>Botalytics™ & SmartSpend™</span>
                    {highlightedElements.some(el => ['roi-metrics', 'lead-quality', 'budget-efficiency'].includes(el)) && (
                      <Badge variant="destructive" className="animate-pulse">ANALYZING</Badge>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { id: 'roi-metrics', label: 'ROI Calculator', icon: TrendingUp, color: 'green' },
                      { id: 'lead-quality', label: 'Lead Quality Score', icon: Star, color: 'yellow' },
                      { id: 'budget-efficiency', label: 'Budget Efficiency', icon: DollarSign, color: 'blue' }
                    ].map((button) => (
                      <Button
                        key={button.id}
                        variant={highlightedElements.includes(button.id) ? "default" : "outline"}
                        className={`h-20 transition-all duration-300 ${
                          highlightedElements.includes(button.id) 
                            ? `bg-${button.color}-600 hover:bg-${button.color}-700 text-white shadow-xl ring-4 ring-${button.color}-300 transform scale-105` 
                            : 'hover:shadow-lg'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <button.icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{button.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className={`rounded-xl p-6 transition-all duration-300 ${
                  highlightedElements.includes('activity-feed') 
                    ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-400' 
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}>
                  <h4 className="font-semibold mb-4 flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Live Activity Feed</span>
                    {highlightedElements.includes('activity-feed') && (
                      <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                    )}
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="flex-1">Apollo lead scrape completed: 423 qualified leads imported with 94% accuracy</span>
                      <span className="text-xs text-gray-500">2 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3 text-blue-600">
                      <Phone className="h-4 w-4" />
                      <span className="flex-1">Voice pipeline initiated: 89 calls queued with personalized scripts</span>
                      <span className="text-xs text-gray-500">5 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3 text-purple-600">
                      <FileText className="h-4 w-4" />
                      <span className="flex-1">PDF report generated for Johnson Industries - $12,500 ROI tracked</span>
                      <span className="text-xs text-gray-500">8 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3 text-orange-600">
                      <MessageSquare className="h-4 w-4" />
                      <span className="flex-1">SMS campaign deployed: 156 personalized messages sent via Twilio</span>
                      <span className="text-xs text-gray-500">12 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3 text-indigo-600">
                      <Mail className="h-4 w-4" />
                      <span className="flex-1">Mailchimp sync completed: 347 leads segmented into targeted campaigns</span>
                      <span className="text-xs text-gray-500">15 min ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}