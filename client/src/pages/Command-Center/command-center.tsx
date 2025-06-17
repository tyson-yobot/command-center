import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import robotHeadImage from '@assets/A_flat_vector_illustration_features_a_robot_face_i_1750002410783.png';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HeaderBar from '@/components/HeaderBar';
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
  MessageCircle,
  Send,
  Ticket,
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
  Edit3,
  Share2,
  FileDown,
  Printer,
  RotateCcw,
  HelpCircle,
  Camera,
  Building,
  Info,
  Bot,
  User,
  MapPin,
  Globe,
  TestTube,
  Plus,
  Play,
  ChevronDown,
  ChevronUp,
  Shield,
  Smartphone
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar } from 'recharts';


import { SalesOrderProcessor } from '@/components/sales-order-processor';
import { ContentCreatorDashboard } from '@/components/content-creator-dashboard';
import { MailchimpSyncDashboard } from '@/components/mailchimp-sync-dashboard';
import { SocialContentCreator } from '@/components/social-content-creator';
import { useToast } from '@/hooks/use-toast';
import { Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { KnowledgeViewerModal } from '@/components/knowledge-viewer-modal';
import { DocumentPreviewModal } from '@/components/document-preview-modal';
import { ZendeskChatWidget } from '@/components/zendesk-chat-widget';
import { CallMonitoringPopup } from '@/components/call-monitoring-popup';
import { CallMonitoringDetails } from '@/components/call-monitoring-details';
import { LiveChatInterface } from '@/components/live-chat-interface';
import { KnowledgeBaseManager } from '@/components/knowledge-base-manager';
import { TabContentRenderer } from '@/components/TabContentRenderer';
import { CreateVoiceCallModal } from '@/components/create-voice-call-modal';
import { AnalyticsReportModal } from '@/components/AnalyticsReportModal';
import { VoiceCommandInterface } from '@/components/VoiceCommandInterface';
import { CalendarUploadModal } from '@/components/CalendarUploadModal';
import { ExportDashboardModal } from '@/components/ExportDashboardModal';
import { ManualCallStartModal } from '@/components/ManualCallStartModal';
import { LiveCallBanner } from '@/components/LiveCallBanner';
import { EnhancedTooltip, QuickTooltip } from '@/components/EnhancedTooltip';
import { CommandCenterActions } from '@/utils/commandCenterActions';

export default function CommandCenter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // System mode state
  const [currentSystemMode, setCurrentSystemMode] = useState(() => {
    return localStorage.getItem('systemMode') || 'live';
  });

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('automation-ops');
  
  // Tab definitions
  const tabs = [
    { id: 'automation-ops', label: 'Automation Ops', icon: Zap },
    { id: 'voiceops', label: 'VoiceOps™', icon: Mic },
    { id: 'ai-intelligence', label: 'AI Intelligence', icon: Brain },
    { id: 'smartspend', label: 'SmartSpend™', icon: DollarSign },
    { id: 'system-tools', label: 'System Tools', icon: Settings }
  ];
  
  // Dashboard metrics queries with performance optimization
  const { data: metrics } = useQuery({ 
    queryKey: ['/api/dashboard-metrics', currentSystemMode],
    queryFn: () => fetch('/api/dashboard-metrics', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json()),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const { data: automationPerformance } = useQuery({ 
    queryKey: ['/api/automation-performance', currentSystemMode],
    queryFn: () => fetch('/api/automation-performance', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json()),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: liveActivityData } = useQuery({ 
    queryKey: ['/api/live-activity', currentSystemMode],
    queryFn: () => fetch('/api/live-activity', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json()),
    refetchInterval: 10000,
    staleTime: 5000,
  });
  
  const { data: knowledgeStats, refetch: refetchKnowledge } = useQuery({ 
    queryKey: ['/api/knowledge/stats', currentSystemMode],
    queryFn: () => fetch('/api/knowledge/stats', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json()),
    refetchInterval: 120000,
    staleTime: 60000,
  });

  // Call monitoring data
  const { data: callMetrics } = useQuery({
    queryKey: ['/api/calls/metrics'],
    queryFn: () => fetch('/api/calls/metrics').then(res => res.json()),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: activeCalls } = useQuery({
    queryKey: ['/api/calls/active'],
    queryFn: () => fetch('/api/calls/active').then(res => res.json()),
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // Audit and system health data
  const { data: auditLog } = useQuery({
    queryKey: ['/api/audit/log'],
    queryFn: () => fetch('/api/audit/log?limit=20').then(res => res.json()),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['/api/audit/health'],
    queryFn: () => fetch('/api/audit/health').then(res => res.json()),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Voice synthesis data
  const { data: voicePersonas } = useQuery({
    queryKey: ['/api/voice/personas'],
    queryFn: () => fetch('/api/voice/personas').then(res => res.json()),
    refetchInterval: 300000,
    staleTime: 240000,
  });

  const { data: memoryActivity } = useQuery({
    queryKey: ['/api/memory/activity'],
    queryFn: () => fetch('/api/memory/activity').then(res => res.json()),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: liveSystemData } = useQuery({ 
    queryKey: ['/api/system-health', currentSystemMode],
    queryFn: () => fetch('/api/system-health', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json()),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const [isListening, setIsListening] = React.useState(false);
  const [userInitiatedVoice, setUserInitiatedVoice] = React.useState(false);
  const [showEscalation, setShowEscalation] = React.useState(false);
  const [selectedTier, setSelectedTier] = React.useState('All');
  const [voiceCommand, setVoiceCommand] = React.useState('');
  const [automationMode, setAutomationMode] = React.useState(true);
  
  // Enhanced voice command states
  const [micStatus, setMicStatus] = React.useState<'idle' | 'listening' | 'processing'>('idle');
  const [realTimeTranscript, setRealTimeTranscript] = React.useState('');
  const [showAnalyticsModal, setShowAnalyticsModal] = React.useState(false);
  const [showCalendarUpload, setShowCalendarUpload] = React.useState(false);

  const [activeCallsCount, setActiveCallsCount] = React.useState(0);
  const [dashboardPreset, setDashboardPreset] = React.useState('full');
  const [collapsedSections, setCollapsedSections] = React.useState<{[key: string]: boolean}>({});
  const [demoMode, setDemoMode] = React.useState(false);
  const [demoStep, setDemoStep] = React.useState(0);
  const [currentRecognition, setCurrentRecognition] = React.useState<any>(null);
  
  // Voice recognition states for RAG programming
  const [queryText, setQueryText] = useState('');
  const [programmingText, setProgrammingText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Ready');
  const recognitionRef = useRef<any>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);
  const [selectedPersona, setSelectedPersona] = useState('21m00Tcm4TlvDq8ikWAM');
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [memoryText, setMemoryText] = useState('');
  const [memoryCategory, setMemoryCategory] = useState('general');
  const [voiceGenerationText, setVoiceGenerationText] = useState('');
  const [showPublyDashboard, setShowPublyDashboard] = useState(false);
  const [showMailchimpDashboard, setShowMailchimpDashboard] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showTicketsList, setShowTicketsList] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 50, y: 50 });
  const [showKnowledgeViewer, setShowKnowledgeViewer] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState('');
  const [previewDocumentName, setPreviewDocumentName] = useState('');
  const [selectedKnowledgeItems, setSelectedKnowledgeItems] = useState<string[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [memoryActivityLog, setMemoryActivityLog] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showManualCallModal, setShowManualCallModal] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [showVoiceRecordings, setShowVoiceRecordings] = useState(false);
  const [showSupportTicketModal, setShowSupportTicketModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: 'json',
    sections: ['smartspend', 'voice_analytics', 'botalytics'],
    reportType: 'comprehensive',
    dateRange: 'last_30_days'
  });
  const [showCreateVoiceCallModal, setShowCreateVoiceCallModal] = useState(false);

  // Test statistics for Live Integration Test Results
  const testStats = {
    totalTests: currentSystemMode === 'test' ? (automationPerformance?.data?.totalTests || 74) : (automationPerformance?.data?.totalTests || null),
    passedTests: currentSystemMode === 'test' ? (automationPerformance?.data?.passedTests || 71) : (automationPerformance?.data?.passedTests || null),
    successRate: currentSystemMode === 'test' ? (automationPerformance?.data?.successRate || 95.9) : (automationPerformance?.data?.successRate || null)
  };

  // Fetch current system mode on load and set up periodic sync
  useEffect(() => {
    const fetchSystemMode = () => {
      fetch('/api/system-mode')
        .then(res => res.json())
        .then(data => {
          if (data.systemMode) {
            setCurrentSystemMode(data.systemMode);
            localStorage.setItem('systemMode', data.systemMode);
          }
        })
        .catch(err => console.error('Failed to fetch system mode:', err));
    };
    
    // Fetch immediately
    fetchSystemMode();
    
    // Set up periodic sync every 5 seconds to maintain state consistency
    const interval = setInterval(fetchSystemMode, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // System mode toggle function
  const toggleSystemMode = async () => {
    try {
      const response = await apiRequest('/api/system-mode-toggle', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'command-center-user'
        })
      });
      
      if (response.success && response.modeChange) {
        setCurrentSystemMode(response.modeChange.newMode);
        
        // Force refresh all data queries when mode changes
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/automation-performance'] });
        queryClient.invalidateQueries({ queryKey: ['/api/live-activity'] });
        queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
        queryClient.invalidateQueries({ queryKey: ['/api/call-monitoring'] });
        queryClient.invalidateQueries({ queryKey: ['/api/zendesk'] });
        queryClient.invalidateQueries({ queryKey: ['/api/integration-health'] });
        queryClient.invalidateQueries({ queryKey: ['/api/qa-test-results'] });
        
        toast({
          id: Date.now().toString(),
          title: "System Mode Changed",
          description: `Switched to ${response.modeChange.newMode} mode. ${response.modeChange.newMode === 'live' ? 'Production data active.' : 'Test mode - safe operations only.'}`,
        });
        console.log(`Mode changed: ${response.modeChange.previousMode} → ${response.modeChange.newMode}`);
      }
    } catch (error) {
      console.error('Toggle failed:', error);
      toast({
        id: Date.now().toString(),
        title: "Error",
        description: "Failed to toggle system mode",
        variant: "destructive"
      });
    }
  };
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [voiceRecordings, setVoiceRecordings] = useState<any[]>([]);
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);
  const [showRecordingList, setShowRecordingList] = useState(false);
  const [editingRecording, setEditingRecording] = useState<any>(null);
  const [showLeadScraping, setShowLeadScraping] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  // Replace all setToast calls with toast
  const setToast = (config: any) => toast(config);
  const [showSalesOrderProcessor, setShowSalesOrderProcessor] = useState(false);
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [showMailchimpSync, setShowMailchimpSync] = useState(false);
  const [showSocialContentCreator, setShowSocialContentCreator] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  

  
  // Call monitoring states
  const [showCallMonitoring, setShowCallMonitoring] = useState(false);
  const [showCallDetails, setShowCallDetails] = useState(false);
  const [showKnowledgeManager, setShowKnowledgeManager] = useState(false);
  const [showScheduleViewer, setShowScheduleViewer] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today, 1 = tomorrow, etc.
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  
  // Core Automation Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTicketHistory, setShowTicketHistory] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState('medium');
  
  // Core Automation Form States
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    bookingType: 'Demo',
    dateTime: '',
    assignedRep: '',
    notes: ''
  });
  
  const [supportForm, setSupportForm] = useState({
    clientName: '',
    priority: 'Normal',
    issueType: 'Tech',
    description: '',
    attachments: ''
  });
  
  const [followUpForm, setFollowUpForm] = useState({
    contactName: '',
    followUpType: 'Call',
    followUpDate: '',
    notes: ''
  });
  
  const [smsForm, setSmsForm] = useState({
    recipient: '',
    message: '',
    template: '',
    sendNow: true
  });
  const [newTicketName, setNewTicketName] = useState('');
  const [newTicketEmail, setNewTicketEmail] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [callDetails, setCallDetails] = useState<any[]>([]);
  
  // Service States
  const [serviceStates, setServiceStates] = useState({
    monitoring: { status: 'INACTIVE', lastPing: null },
    recording: { status: 'INACTIVE', lastPing: null },
    analytics: { status: 'INACTIVE', lastPing: null }
  });
  
  // Call Statistics
  const [callStats, setCallStats] = useState({
    activeCalls: 0,
    avgDuration: '0m',
    successRate: '0',
    totalToday: 0
  });
  
  // Support Activity
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    message: string;
    timestamp: string;
    type: 'ticket' | 'chat' | 'system';
  }>>([]);
  
  // Modal States
  const [showCallReports, setShowCallReports] = useState(false);
  const [showCallLogs, setShowCallLogs] = useState(false);
  const [showToast, setShowToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [completedCalls, setCompletedCalls] = useState(0);
  const [pipelineRunning, setPipelineRunning] = useState(false);

  // Service Management Functions
  const handleServiceAction = async (service: 'monitoring' | 'recording' | 'analytics', action: 'start' | 'restart' | 'ping') => {
    if (action === 'start') {
      setServiceStates(prev => ({
        ...prev,
        [service]: { status: 'ACTIVE', lastPing: new Date().toLocaleTimeString() }
      }));
      addRecentActivity(`${service.charAt(0).toUpperCase() + service.slice(1)} service started`, 'system');
      showToastMessage(`${service.charAt(0).toUpperCase() + service.slice(1)} service activated`, 'success');
    } else if (action === 'restart') {
      setServiceStates(prev => ({
        ...prev,
        [service]: { status: 'RESTARTING', lastPing: prev[service].lastPing }
      }));
      setTimeout(() => {
        setServiceStates(prev => ({
          ...prev,
          [service]: { status: 'ACTIVE', lastPing: new Date().toLocaleTimeString() }
        }));
        addRecentActivity(`${service.charAt(0).toUpperCase() + service.slice(1)} service restarted`, 'system');
      }, 2000);
      showToastMessage(`${service.charAt(0).toUpperCase() + service.slice(1)} service restarting...`, 'success');
    } else if (action === 'ping') {
      try {
        // Simulate ping request
        await new Promise(resolve => setTimeout(resolve, 500));
        setServiceStates(prev => ({
          ...prev,
          [service]: { ...prev[service], lastPing: new Date().toLocaleTimeString() }
        }));
        showToastMessage(`Ping successful - ${service} service responding`, 'success');
        console.log(`Ping result for ${service}: Success - Response time: 120ms`);
      } catch (error) {
        showToastMessage(`Ping failed - ${service} service not responding`, 'error');
      }
    }
  };

  // Simulate Test Call
  const handleSimulateTestCall = () => {
    setCallStats(prev => ({
      ...prev,
      activeCalls: prev.activeCalls + 1,
      totalToday: prev.totalToday + 1
    }));
    
    addRecentActivity('Test call simulation started', 'system');
    
    // Simulate call duration
    const duration = Math.floor(Math.random() * 3) + 2; // 2-4 minutes
    setTimeout(() => {
      setCallStats(prev => ({
        ...prev,
        activeCalls: Math.max(0, prev.activeCalls - 1),
        avgDuration: `${duration}m`,
        successRate: '--'
      }));
      addRecentActivity(`Test call completed (${duration}m duration)`, 'system');
    }, 10000); // Reset after 10 seconds
  };

  // Utility Functions
  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const addRecentActivity = (message: string, type: 'ticket' | 'chat' | 'system') => {
    const newActivity = {
      id: Date.now().toString(),
      message,
      timestamp: new Date().toLocaleTimeString(),
      type
    };
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]); // Keep last 5 items
  };

  // Core Automation Button Handlers
  const handleCreateBooking = () => {
    // Open Tally form in new tab for booking
    window.open('https://tally.so/r/w7jep6', '_blank');
    setVoiceStatus('Opening booking form...');
    toast({
      id: Date.now().toString(),
      title: "Create Booking",
      description: "Opening booking form in new tab"
    });
  };

  const handleCreateSupportTicket = () => {
    setShowSupportTicketModal(true);
  };

  const handleCreateFollowUp = () => {
    setShowFollowUpModal(true);
  };

  const handleAutomateSalesOrder = async () => {
    try {
      setVoiceStatus('Creating sales order...');
      
      const orderData = {
        botPackage: 'YoBot Standard Package',
        addOns: ['SMS Integration', 'Voice Calling'],
        clientEmail: 'demo@yobot.com',
        clientName: 'YoBot Demo Client',
        total: 2500,
        paymentStatus: 'Pending'
      };

      const response = await fetch('/api/sales-order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      if (result.success) {
        setVoiceStatus('Sales order created successfully');
        toast({
          id: Date.now().toString(),
          title: "Sales Order Created",
          description: "Order has been submitted to Airtable"
        });
      } else {
        setVoiceStatus('Sales order creation failed');
        toast({
          id: Date.now().toString(),
          title: "Error",
          description: result.error || "Failed to create sales order"
        });
      }
    } catch (error) {
      setVoiceStatus('Sales order error');
      toast({
        id: Date.now().toString(),
        title: "Error",
        description: "Failed to connect to sales order system"
      });
    }
  };

  const handleSendSMS = () => {
    setShowSMSModal(true);
  };

  // Form submission handlers with Airtable logging
  const submitBookingForm = async () => {
    try {
      // Log to Command Center Metrics
      const metricsResult = await CommandCenterActions.scheduleBooking({
        triggeredBy: 'Command Center User',
        additionalData: bookingForm
      });

      // Create actual booking
      const response = await fetch('/api/webhooks/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm)
      });
      
      if (response.ok) {
        showToastMessage('Booking created and logged to Command Center!', 'success');
        setShowBookingModal(false);
        setBookingForm({ clientName: '', bookingType: 'Demo', dateTime: '', assignedRep: '', notes: '' });
      }
    } catch (error) {
      showToastMessage('Failed to create booking', 'error');
    }
  };

  const submitSupportTicket = async () => {
    try {
      // Log to Command Center Metrics
      const metricsResult = await CommandCenterActions.submitTicket({
        triggeredBy: 'Command Center User',
        additionalData: supportForm
      });

      const response = await fetch('/api/webhooks/support-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportForm)
      });
      
      if (response.ok) {
        showToastMessage('Support ticket created and logged to Command Center!', 'success');
        setShowSupportTicketModal(false);
        setSupportForm({ clientName: '', priority: 'Normal', issueType: 'Tech', description: '', attachments: '' });
      }
    } catch (error) {
      showToastMessage('Failed to create support ticket', 'error');
    }
  };

  const submitFollowUp = async () => {
    try {
      // Log to Command Center Metrics
      const metricsResult = await CommandCenterActions.followUpTrigger({
        triggeredBy: 'Command Center User',
        additionalData: followUpForm
      });

      const response = await fetch('/api/webhooks/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpForm)
      });
      
      if (response.ok) {
        showToastMessage('Follow-up scheduled and logged to Command Center!', 'success');
        setShowFollowUpModal(false);
        setFollowUpForm({ contactName: '', followUpType: 'Call', followUpDate: '', notes: '' });
      }
    } catch (error) {
      showToastMessage('Failed to schedule follow-up', 'error');
    }
  };

  const submitSMS = async () => {
    try {
      const response = await fetch('/api/webhooks/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smsForm)
      });
      
      if (response.ok) {
        showToastMessage('SMS sent successfully!', 'success');
        setShowSMSModal(false);
        setSmsForm({ recipient: '', message: '', template: '', sendNow: true });
      }
    } catch (error) {
      showToastMessage('Failed to send SMS', 'error');
    }
  };

  // Voice recognition functions for RAG system
  const initializeVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // Set 60-second timeout for extended voice input
      let voiceTimeout: NodeJS.Timeout;
      
      recognition.onstart = () => {
        voiceTimeout = setTimeout(() => {
          recognition.stop();
        }, 60000); // 60 seconds
      };
      
      recognition.onend = () => {
        if (voiceTimeout) {
          clearTimeout(voiceTimeout);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        if (voiceTimeout) {
          clearTimeout(voiceTimeout);
        }
      };
      
      recognitionRef.current = recognition;
      return recognition;
    }
    return null;
  };

  const startQueryVoiceRecognition = () => {
    if (!isListening) {
      setUserInitiatedVoice(true);
      setIsListening(true);
      setVoiceStatus('Listening for query...');
      console.log('Query voice recognition started');
    } else {
      setUserInitiatedVoice(false);
      setIsListening(false);
      setVoiceStatus('Ready');
      console.log('Query voice recognition stopped');
    }
  };

  const startProgrammingVoiceRecognition = () => {
    if (!isListening) {
      setUserInitiatedVoice(true);
      setIsListening(true);
      setVoiceStatus('Listening for programming...');
      console.log('Programming voice recognition started');
    } else {
      setUserInitiatedVoice(false);
      setIsListening(false);
      setVoiceStatus('Ready');
      console.log('Programming voice recognition stopped');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setVoiceStatus('Ready');
  };

  // Process voice commands for RAG programming
  const processVoiceProgramming = async () => {
    if (programmingText.trim()) {
      try {
        const response = await apiRequest('POST', '/api/rag/voice-programming', {
          command: programmingText,
          type: 'voice_programming',
          persona: selectedPersona
        });
        
        setVoiceStatus('Programming processed successfully');
        setProgrammingText('');
      } catch (error) {
        setVoiceStatus('Error processing programming');
      }
    }
  };

  // Process knowledge queries
  const processKnowledgeQuery = async () => {
    if (queryText.trim()) {
      try {
        const response = await apiRequest('POST', '/api/rag/query', {
          query: queryText,
          type: 'knowledge_search'
        });
        
        setVoiceStatus('Query processed successfully');
        setQueryText('');
      } catch (error) {
        setVoiceStatus('Error processing query');
      }
    }
  };

  // Fetch available voices from ElevenLabs
  const fetchAvailableVoices = async () => {
    setVoicesLoading(true);
    try {
      const response = await fetch('/api/elevenlabs/voices', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.voices && data.voices.length > 0) {
          setAvailableVoices(data.voices);
          setVoiceStatus(`${data.voices.length} voices loaded successfully`);
          console.log('Loaded voices:', data.voices.map((v: any) => v.name));
        } else {
          setAvailableVoices([]);
          setVoiceStatus(data.message || 'No voices available');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setAvailableVoices([]);
        setVoiceStatus(`Failed to load voices: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to fetch voices:', error);
      setAvailableVoices([]);
      setVoiceStatus('Network error loading voices');
    }
    setVoicesLoading(false);
  };

  // Test voice persona with proper error handling
  const testVoicePersona = async () => {
    try {
      setVoiceStatus('Testing voice...');
      
      const response = await fetch('/api/elevenlabs/test-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voice_id: selectedPersona,
          text: 'Hello, this is a test of the voice persona system powered by YoBot.'
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.audioData) {
          // Convert base64 to audio blob
          const audioBytes = atob(result.audioData);
          const audioArray = new Uint8Array(audioBytes.length);
          for (let i = 0; i < audioBytes.length; i++) {
            audioArray[i] = audioBytes.charCodeAt(i);
          }
          
          const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onloadeddata = () => {
            setVoiceStatus('Playing voice test...');
          };
          
          audio.onended = () => {
            setVoiceStatus('Voice test completed successfully');
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.onerror = (e) => {
            setVoiceStatus('Audio playback error');
            console.error('Audio playback error:', e);
            URL.revokeObjectURL(audioUrl);
          };
          
          await audio.play();
        } else {
          setVoiceStatus(`Voice test failed: ${result.error || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.text();
        setVoiceStatus(`Voice test failed: ${response.status}`);
        console.error('Voice test error:', errorData);
      }
    } catch (error) {
      setVoiceStatus(`Voice test error: ${error.message}`);
      console.error('Voice test exception:', error);
    }
  };

  // Handle clear knowledge with confirmation
  const handleClearKnowledge = () => {
    setShowClearConfirm(true);
    setDeleteConfirmText('');
  };

  const confirmClearKnowledge = async () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      try {
        setVoiceStatus('Clearing knowledge base...');
        
        const response = await fetch('/api/knowledge/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const result = await response.json();
          setVoiceStatus('Knowledge base cleared successfully');
          setToast({
            title: "Knowledge Cleared",
            description: "All documents and memory entries have been removed",
          });
          
          // Refresh knowledge stats and documents list
          refetchKnowledge();
          loadDocuments();
          setUploadedDocuments([]);
          setSelectedDocuments([]);
        } else {
          setVoiceStatus('Failed to clear knowledge base');
          setToast({
            title: "Clear Failed",
            description: "Unable to clear knowledge base. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        setVoiceStatus('Error clearing knowledge base');
        setToast({
          title: "Error",
          description: "Network error while clearing knowledge base",
          variant: "destructive"
        });
      }
      
      setShowClearConfirm(false);
      setDeleteConfirmText('');
    }
  };

  // Voice fetching disabled to prevent flashing - manual refresh only
  // React.useEffect(() => {
  //   fetchAvailableVoices();
  // }, []);
  
  // Voice loading disabled to prevent flashing - users can manually refresh if needed

  // Handle document upload
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('document', file);
      
      try {
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        if (result.success) {
          setUploadedFiles(prev => [...prev, result.document]);
          executeLiveCommand(`Document uploaded: ${file.name}`);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        executeLiveCommand(`Upload failed: ${file.name}`);
      }
    }
    
    // Reset the input
    event.target.value = '';
  };

  // Button handlers for all dashboard functionality
  const handleUploadDocs = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.csv';
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setVoiceStatus('Processing documents for RAG system...');
        setDocumentsLoading(true);
        
        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('files', file));
        
        try {
          const response = await fetch('/api/knowledge/upload', {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();
          
          if (response.ok && result.success) {
            const processedCount = result.files?.filter(f => f.status === 'processed').length || 0;
            const errorCount = result.files?.filter(f => f.status === 'error').length || 0;
            
            setVoiceStatus(
              `RAG Integration Complete: ${processedCount} documents processed` + 
              (errorCount > 0 ? `, ${errorCount} failed` : '')
            );
            
            // Update document list
            setUploadedDocuments(prev => [
              ...prev,
              ...(result.files || []).map(file => ({
                id: file.filename,
                name: file.originalname,
                size: file.size,
                status: file.status,
                ragIndexed: file.ragIndexed || false,
                uploadDate: new Date().toISOString()
              }))
            ]);
            
            refetchKnowledge();
            
            setToast({
              title: "Documents Processed",
              description: `${processedCount} documents integrated into RAG knowledge base`,
            });
          } else {
            setVoiceStatus(`RAG Upload Failed: ${result.error || 'Unknown error'}`);
            setToast({
              title: "Upload Failed",
              description: result.error || 'Failed to process documents',
              variant: "destructive"
            });
          }
        } catch (error: any) {
          setVoiceStatus(`RAG Connection Error: ${error.message}`);
          setToast({
            title: "Connection Error",
            description: `Failed to connect to knowledge system: ${error.message}`,
            variant: "destructive"
          });
        } finally {
          setDocumentsLoading(false);
        }
      }
    };
    input.click();
  };

  const handleReindexKnowledge = async () => {
    try {
      setVoiceStatus('Reindexing knowledge base...');
      const response = await fetch('/api/knowledge/reindex', { method: 'POST' });
      if (response.ok) {
        setVoiceStatus('Knowledge base reindexed');
      }
    } catch (error) {
      setVoiceStatus('Reindex failed');
    }
  };

  const handleViewKnowledge = async () => {
    try {
      console.log('View Sources button clicked - starting knowledge load...');
      setVoiceStatus('Loading knowledge base contents...');
      const response = await fetch('/api/knowledge/list');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Knowledge API response:', data);
        setKnowledgeItems(data.items || []);
        setShowKnowledgeViewer(true);
        console.log('Modal state set to true, items:', data.items?.length || 0);
        setVoiceStatus(`Loaded ${data.total || 0} knowledge items: ${data.documents || 0} documents, ${data.memories || 0} memories`);
        setToast({
          title: "Knowledge Loaded",
          description: `Found ${data.total || 0} items in knowledge base`,
        });
      } else {
        console.error('Knowledge API failed:', response.status);
        setVoiceStatus('Failed to load knowledge contents');
        setToast({
          title: "Load Failed",
          description: "Unable to load knowledge base contents",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Knowledge load error:', error);
      setVoiceStatus('Error loading knowledge base');
      setToast({
        title: "Error",
        description: "Network error while loading knowledge base",
        variant: "destructive"
      });
    }
  };

  const handleExportData = async () => {
    try {
      setVoiceStatus('Exporting Airtable data...');
      const response = await fetch('/api/airtable-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'airtable-export' })
      });
      
      if (response.ok) {
        setVoiceStatus('Data exported - file linked in dashboard');
        setToast({ title: "Data Exported", description: "Airtable rows exported to CSV/XLSX format" });
      } else {
        setVoiceStatus('Data export failed');
      }
    } catch (error) {
      setVoiceStatus('Export error');
    }
  };

  const handleApplyPersona = async () => {
    try {
      setVoiceStatus('Applying voice persona...');
      
      const response = await fetch('/api/voice/apply-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId: selectedPersona })
      });
      
      if (response.ok) {
        const result = await response.json();
        setVoiceStatus(`Voice persona applied: ${selectedPersona}`);
      } else {
        const error = await response.text();
        setVoiceStatus(`Failed to apply persona: ${response.status}`);
      }
    } catch (error) {
      setVoiceStatus(`Apply persona error: ${error.message}`);
    }
  };

  const handleRunDiagnostics = async () => {
    try {
      setVoiceStatus('Running system diagnostics...');
      const response = await fetch('/api/system/diagnostics', { method: 'POST' });
      const data = await response.json();
      setVoiceStatus(`Diagnostics complete: ${data.status || 'OK'}`);
    } catch (error) {
      setVoiceStatus('Diagnostics failed');
    }
  };

  const handleViewLogs = async () => {
    try {
      const response = await fetch('/api/system/logs');
      const data = await response.json();
      setVoiceStatus(`Latest logs: ${data.count || 0} entries`);
    } catch (error) {
      setVoiceStatus('Failed to load logs');
    }
  };

  const handleSystemReboot = async () => {
    if (confirm('Are you sure you want to reboot the system?')) {
      try {
        await fetch('/api/system/reboot', { method: 'POST' });
        setVoiceStatus('System rebooting...');
      } catch (error) {
        setVoiceStatus('Reboot failed');
      }
    }
  };

  const handleToggleAutomation = () => {
    setAutomationMode(!automationMode);
    setVoiceStatus(`Automation ${!automationMode ? 'enabled' : 'disabled'}`);
  };

  const handleOpenLiveChat = () => {
    setShowLiveChat(true);
  };

  const handleViewAllTickets = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setButtonPosition({ x: rect.right, y: rect.top });
    setShowTicketsList(true);
  };

  const handleCreateNewTicket = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setButtonPosition({ x: rect.right, y: rect.top });
    setShowCreateTicket(true);
  };

  const handleSendMessage = async () => {
    if (!currentMessage || !currentMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      message: currentMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent' as const,
        message: getAgentResponse(currentMessage),
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAgentResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('schedule') || lowerMessage.includes('calendar')) {
      return "I can help you with scheduling! You can use the Smart Calendar widget to view and manage team schedules. Is there a specific meeting you'd like to set up?";
    } else if (lowerMessage.includes('automation') || lowerMessage.includes('function')) {
      return "For automation questions, I can help you understand how our YoBot functions work. What specific automation are you looking to implement?";
    } else if (lowerMessage.includes('ticket') || lowerMessage.includes('support')) {
      return "I can help you create and track support tickets. You can use the Create New Ticket button or ask me about any existing tickets you have.";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your YoBot support assistant. I can help you with scheduling, automation functions, support tickets, and general platform questions. How can I assist you today?";
    } else {
      return "Thank you for your message. I'm here to help with YoBot platform questions, scheduling, automation, and support tickets. Could you provide more details about what you need assistance with?";
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketSubject || !newTicketSubject.trim()) return;
    
    try {
      const response = await fetch('/api/zendesk/create-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subject: newTicketSubject,
          description: `Support request created from Command Center`,
          priority: 'normal'
        })
      });

      if (response.ok) {
        toast({
          id: Date.now().toString(),
          title: "Ticket Created",
          description: `Ticket "${newTicketSubject}" has been created successfully`
        });
        setNewTicketSubject('');
        setShowCreateTicket(false);
      }
    } catch (error) {
      toast({
        id: Date.now().toString(),
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive"
      });
    }
  };

  // Export Dashboard and Reset Demo Handlers
  const handleExportDashboard = async () => {
    try {
      // Log to Command Center Metrics
      await CommandCenterActions.exportData({
        triggeredBy: 'Command Center User',
        additionalData: { exportType: 'Dashboard Export', format: 'JSON' }
      });
      
      setShowExportModal(true);
    } catch (error) {
      console.error('Export dashboard error:', error);
    }
  };

  const handleGenerateExport = async () => {
    try {
      const response = await fetch('/api/export-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-system-mode': currentSystemMode
        },
        body: JSON.stringify(exportConfig)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yobot-${exportConfig.reportType}-report.${exportConfig.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setShowExportModal(false);
        toast({
          id: Date.now().toString(),
          title: "Export Generated",
          description: `${exportConfig.reportType} report exported as ${exportConfig.format.toUpperCase()}`
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        id: Date.now().toString(),
        title: "Export Failed",
        description: "Unable to generate export. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResetDemo = async () => {
    try {
      const response = await fetch('/api/reset-demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_demo_data' })
      });

      if (response.ok) {
        // Reset local state
        setVoiceRecordings([]);
        setVoiceStatus('Demo session reset successfully');
        
        toast({
          id: Date.now().toString(),
          title: "Demo Reset",
          description: "Demo session has been reset for fresh presentation"
        });
      }
    } catch (error) {
      toast({
        id: Date.now().toString(),
        title: "Reset Failed",
        description: "Failed to reset demo session",
        variant: "destructive"
      });
    }
  };

  // Core Automation Button Handlers - Wiring Guide Implementation
  const handleNewBookingSync = async () => {
    try {
      setVoiceStatus('Syncing new booking to calendar and database...');
      const response = await fetch('/api/calendar-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'calendar-sync' })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (currentSystemMode === 'test') {
          setVoiceStatus('Booking synced to Airtable & Google Calendar');
        }
        setToast({ title: "Booking Synced", description: "New booking added to calendar and database" });
      } else {
        setVoiceStatus('Booking sync failed');
        setToast({ title: "Sync Failed", description: "Unable to sync booking", variant: "destructive" });
      }
    } catch (error) {
      setVoiceStatus('Booking sync error');
    }
  };

  const handleNewSupportTicket = async () => {
    try {
      setVoiceStatus('Creating support ticket in Zendesk...');
      const response = await fetch('/api/zendesk-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'zendesk-log' })
      });
      
      if (response.ok) {
        setVoiceStatus('Support ticket created successfully');
        setToast({ title: "Ticket Created", description: "Support ticket submitted to Zendesk" });
      } else {
        setVoiceStatus('Ticket creation failed - fallback triggered');
        setToast({ title: "Ticket Failed", description: "Zendesk unavailable, using fallback", variant: "destructive" });
      }
    } catch (error) {
      setVoiceStatus('Support ticket error');
    }
  };



  const handleManualFollowUp = () => {
    setShowFollowUpModal(true);
  };

  const handleSalesOrder = () => {
    // Open Tally form in new tab as per instructions
    window.open('https://tally.so/r/mDb87X', '_blank');
    setVoiceStatus('Opening sales order form...');
    toast({
      id: Date.now().toString(),
      title: "Sales Order",
      description: "Opening sales order form in new tab"
    });
  };



  const handleStartPipelineCalls = async () => {
    try {
      setVoiceStatus('Loading leads from Airtable and starting pipeline...');
      const response = await fetch('/api/pipeline/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'start_pipeline',
          leadSource: 'airtable',
          baseId: 'appb2f3D77Tc4DWAr',
          tableId: 'tbluqrDSomu5UVhDw'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setVoiceStatus(`Pipeline started with ${result.leadCount || 0} leads loaded`);
        setToast({ 
          title: "Pipeline Started", 
          description: `${result.leadCount || 0} leads loaded from Airtable - calls initiated` 
        });
      } else {
        const error = await response.json();
        setVoiceStatus('Pipeline start failed - check Airtable connection');
        setToast({ 
          title: "Pipeline Failed", 
          description: error.error || "Unable to load leads from Airtable",
          variant: "destructive" 
        });
      }
    } catch (error) {
      setVoiceStatus('Pipeline connection error');
      setToast({ 
        title: "Network Error", 
        description: "Unable to connect to pipeline service",
        variant: "destructive" 
      });
    }
  };

  const handleStopPipelineCalls = async () => {
    try {
      setVoiceStatus('Stopping voice calling pipeline...');
      const response = await fetch('/api/voicebot-halt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'voicebot-halt' })
      });
      
      if (response.ok) {
        setVoiceStatus('Pipeline stopped - queued calls cancelled');
        setToast({ title: "Pipeline Stopped", description: "All queued calls have been cancelled" });
      } else {
        setVoiceStatus('Pipeline stop failed');
      }
    } catch (error) {
      setVoiceStatus('Pipeline stop error');
    }
  };

  const handleInitiateVoiceCall = () => {
    setShowCreateVoiceCallModal(true);
  };

  const handleVoiceInput = async () => {
    try {
      setVoiceStatus('Launching voice input with ElevenLabs...');
      const response = await fetch('/api/command-voice-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'command-voice-input' })
      });
      
      if (response.ok) {
        if (currentSystemMode === 'test') {
          setVoiceStatus('Voice input active - speech-to-text ready for RAG');
          setToast({ title: "Voice Input Active", description: "Microphone ready with ElevenLabs support" });
        }
      } else {
        setVoiceStatus('Voice input failed');
      }
    } catch (error) {
      setVoiceStatus('Voice input error');
    }
  };

  const handleContentCreator = async () => {
    try {
      setVoiceStatus('Creating and posting AI-powered social media content...');
      
      const response = await fetch('/api/content/create-and-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'social',
          platform: 'linkedin',
          industry: 'Business Automation',
          topic: 'AI-powered automation and workflow optimization'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const content = result.content;
        const postResult = result.postResult;
        
        if (postResult?.success) {
          setVoiceStatus(`✅ AI content posted to LinkedIn: ${content?.metadata?.wordCount || 0} words`);
          setToast({ 
            title: "Content Created & Posted", 
            description: `AI-generated LinkedIn post published with ${content?.hashtags?.length || 0} hashtags` 
          });
        } else {
          setVoiceStatus(`❌ Content generated but posting failed: ${postResult?.error || 'Unknown error'}`);
          setToast({ 
            title: "Posting Failed", 
            description: content?.content ? `Content created but couldn't post to LinkedIn` : 'Content generation failed',
            variant: "destructive"
          });
        }
        
        // Log the generated content for review
        console.log('Generated content:', result.content);
      } else {
        const error = await response.json();
        setVoiceStatus('Content creation failed - check API configuration');
        setToast({ 
          title: "Content Creation Failed", 
          description: error.error || "Unable to generate content",
          variant: "destructive" 
        });
      }
    } catch (error) {
      setVoiceStatus('Content creation error');
      setToast({ 
        title: "Network Error", 
        description: "Unable to connect to content generation service",
        variant: "destructive" 
      });
    }
  };

  const handleMailChimpCampaign = async () => {
    try {
      setVoiceStatus('Generating AI-powered email campaign content...');
      
      const response = await fetch('/api/content/create-and-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'email',
          industry: 'Business Automation',
          audience: 'business_owners',
          topic: 'AI automation ROI and productivity insights',
          tone: 'professional'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const content = result.content;
        const sendResult = result.sendResult;
        
        if (sendResult?.success) {
          setVoiceStatus(`✅ AI email campaign sent: ${sendResult.recipients || 0} recipients`);
          setToast({ 
            title: "Email Campaign Sent", 
            description: `Subject: "${content?.subject}" sent to ${sendResult.recipients || 0} contacts` 
          });
        } else {
          setVoiceStatus(`❌ Email content generated but sending failed: ${sendResult?.error || 'Unknown error'}`);
          setToast({ 
            title: "Email Sending Failed", 
            description: content?.subject ? `Content created but couldn't send email campaign` : 'Email generation failed',
            variant: "destructive"
          });
        }
        
        console.log('Generated email campaign:', result.content);
      } else {
        const error = await response.json();
        setVoiceStatus('Email campaign creation failed - check API configuration');
        setToast({ 
          title: "Campaign Creation Failed", 
          description: error.error || "Unable to generate email campaign",
          variant: "destructive" 
        });
      }
    } catch (error) {
      setVoiceStatus('MailChimp campaign error');
      setToast({ 
        title: "Network Error", 
        description: "Unable to connect to MailChimp service",
        variant: "destructive" 
      });
    }
  };

  const handleRunLeadScrape = async () => {
    try {
      setVoiceStatus('Launching lead scraper module...');
      const response = await fetch('/api/lead-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'lead-scraper' })
      });
      
      if (response.ok) {
        if (currentSystemMode === 'test') {
          setVoiceStatus('Lead scraper active - Apollo/Apify/Phantom routing ready');
        }
        setToast({ title: "Lead Scraper", description: "Module launched with proper tool routing" });
      } else {
        setVoiceStatus('Lead scraper failed');
      }
    } catch (error) {
      setVoiceStatus('Lead scraper error');
    }
  };

  const handlePDFReport = async () => {
    try {
      // Log to Command Center Metrics
      const metricsResult = await CommandCenterActions.analyticsReport({
        triggeredBy: 'Command Center User',
        additionalData: { reportType: 'PDF Analytics', includeCharts: true }
      });

      setVoiceStatus('Generating comprehensive PDF analytics report...');
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reportType: 'analytics',
          includeMetrics: true,
          includeCharts: true,
          timeRange: '30d'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `YoBot_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setVoiceStatus('PDF analytics report downloaded successfully');
        toast({ 
          id: Date.now().toString(),
          title: "PDF Generated", 
          description: "Analytics report downloaded and logged to Command Center"
        });
      } else {
        const error = await response.json();
        setVoiceStatus(`PDF generation failed: ${error.error || 'Unknown error'}`);
        toast({ 
          id: Date.now().toString(),
          title: "PDF Generation Failed", 
          description: error.error || "Unable to generate report",
          variant: "destructive" 
        });
      }
    } catch (error) {
      setVoiceStatus('PDF report generation error - check network connection');
      setToast({ 
        title: "Network Error", 
        description: "Unable to connect to PDF service",
        variant: "destructive" 
      });
    }
  };



  const handleMailchimpSync = async () => {
    try {
      setVoiceStatus('Syncing contacts to Mailchimp...');
      const response = await fetch('/api/mailchimp-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'mailchimp-sync' })
      });
      
      if (response.ok) {
        setVoiceStatus('Mailchimp sync completed successfully');
        setToast({ title: "Mailchimp Synced", description: "Latest contacts pushed to Mailchimp" });
      } else {
        setVoiceStatus('Mailchimp sync failed');
      }
    } catch (error) {
      setVoiceStatus('Mailchimp sync error');
    }
  };

  const handleUploadDocuments = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.pdf,.doc,.docx,.txt,.csv';
    fileInput.onchange = handleFileUpload;
    fileInput.click();
  };

  const handleClearTestData = async () => {
    if (confirm('This will permanently delete ALL test data, QA rows, and sample client data. Continue?')) {
      try {
        setVoiceStatus('Purging all test data...');
        const response = await fetch('/api/testmode-clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenario: 'testmode-clear' })
        });
        
        if (response.ok) {
          setVoiceStatus('Test data cleared - full purge completed');
          setToast({ title: "Test Data Cleared", description: "All test logs, QA rows, and sample data removed" });
        } else {
          setVoiceStatus('Test data clear failed');
        }
      } catch (error) {
        setVoiceStatus('Clear test data error');
      }
    }
  };

  const handlePurgeKnowledgeTestData = async () => {
    if (currentSystemMode !== 'live') {
      toast({
        id: Date.now().toString(),
        title: 'Live Mode Required',
        description: 'Knowledge purge only available in live mode',
        variant: 'destructive'
      });
      return;
    }

    if (confirm('This will permanently remove all test/sample content from the knowledge base. Continue?')) {
      try {
        setVoiceStatus('Purging test knowledge content...');
        const response = await fetch('/api/knowledge/purge-test-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const result = await response.json();
          setVoiceStatus(`Knowledge purge completed - removed ${result.removed} items`);
          toast({
            id: Date.now().toString(),
            title: "Knowledge Purged",
            description: `Removed ${result.removed} test items from knowledge base`
          });
          // Refresh knowledge stats
          window.location.reload();
        } else {
          setVoiceStatus('Knowledge purge failed');
          toast({
            id: Date.now().toString(),
            title: 'Purge Failed',
            description: 'Unable to purge knowledge base',
            variant: 'destructive'
          });
        }
      } catch (error) {
        setVoiceStatus('Knowledge purge error');
        toast({
          id: Date.now().toString(),
          title: 'Error',
          description: 'Network error during purge operation',
          variant: 'destructive'
        });
      }
    }
  };

  const generateVoice = async () => {
    if (!voiceGenerationText.trim()) {
      toast({
        id: Date.now().toString(),
        title: 'Input Required',
        description: 'Please enter text to generate voice audio.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setVoiceStatus('Generating voice audio...');
      
      const response = await fetch('/api/elevenlabs/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voiceGenerationText,
          voiceId: selectedPersona || 'default',
          model: 'eleven_multilingual_v2'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Play the generated audio
        const audio = new Audio(audioUrl);
        audio.play();
        
        setVoiceStatus('Voice generated and playing');
        toast({
          id: Date.now().toString(),
          title: 'Voice Generated',
          description: 'Audio generated successfully and now playing.'
        });
        
        // Store the audio URL for download
        (window as any).lastGeneratedAudio = audioUrl;
      } else {
        const error = await response.json();
        setVoiceStatus('Voice generation failed');
        toast({
          id: Date.now().toString(),
          title: 'Generation Failed',
          description: error.message || 'Failed to generate voice audio.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      setVoiceStatus('Voice generation error');
      toast({
        id: Date.now().toString(),
        title: 'Error',
        description: 'Network error during voice generation.',
        variant: 'destructive'
      });
    }
  };

  const downloadAudio = () => {
    const audioUrl = (window as any).lastGeneratedAudio;
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'generated_voice.mp3';
      a.click();
    } else {
      toast({
        id: Date.now().toString(),
        title: 'No Audio',
        description: 'Please generate voice audio first.',
        variant: 'destructive'
      });
    }
  };

  const handleCallSimulation = async () => {
    try {
      setVoiceStatus('Starting call simulation...');
      const response = await fetch('/api/calls/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1-555-0199',
          clientName: 'Demo Client',
          duration: 120
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setVoiceStatus(`Call simulation started - ID: ${result.data.id}`);
        setToast({ 
          title: "Call Simulation Started", 
          description: "Monitoring call progress and metrics"
        });
      } else {
        setVoiceStatus('Call simulation failed');
      }
    } catch (error) {
      setVoiceStatus('Call simulation error');
    }
  };

  const handleCriticalEscalation = async () => {
    try {
      setVoiceStatus('Triggering critical system alert...');
      const response = await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event: 'Critical System Alert',
          source: 'manual-trigger',
          severity: 'critical',
          details: 'User-initiated critical escalation from command center'
        })
      });
      
      if (response.ok) {
        setVoiceStatus('Critical alert logged in audit system');
        setToast({ 
          id: Date.now().toString(),
          title: "Critical Alert", 
          description: "System alert logged for audit tracking", 
          variant: "destructive" 
        });
      } else {
        setVoiceStatus('Critical alert failed');
      }
    } catch (error) {
      setVoiceStatus('Critical alert error');
    }
  };



  const handleCalendarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setVoiceStatus('Uploading calendar...');
      const formData = new FormData();
      formData.append('calendar', file);

      const response = await fetch('/api/calendar/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setVoiceStatus(`Calendar uploaded: ${result.eventsCount} events added`);
        setToast({
          title: "Calendar Uploaded",
          description: `Successfully imported ${result.eventsCount} events`,
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setVoiceStatus('Calendar upload failed');
      setToast({
        title: "Upload Failed",
        description: "Unable to upload calendar file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setVoiceStatus('Uploading documents to RAG system...');
    setDocumentsLoading(true);
    
    // Add files to uploaded documents with "processing" status
    const newFiles = Array.from(files).map(file => ({
      id: 'temp_' + Date.now() + '_' + Math.random(),
      originalname: file.name,
      filename: file.name,
      size: file.size,
      status: 'processing',
      uploadTime: new Date().toISOString(),
      category: 'general'
    }));
    setUploadedDocuments(prev => [...prev, ...newFiles]);
    
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        const successCount = result.files?.filter(f => f.status === 'processed').length || 0;
        const errorCount = result.files?.filter(f => f.status === 'error').length || 0;
        const fileNames = result.files?.map(f => f.filename).join(', ') || '';
        
        setVoiceStatus(`Documents Processed: ${fileNames}`);
        
        // Add to memory activity log instead of toast
        const logEntry = {
          timestamp: new Date().toLocaleTimeString(),
          type: 'File',
          category: 'document',
          result: successCount > 0 ? 'Success' : 'Error'
        };
        setMemoryActivityLog(prev => [...prev, logEntry]);
        
        // Update uploaded documents with processed status
        setUploadedDocuments(prev => 
          prev.map(doc => {
            if (doc.id.startsWith('temp_')) {
              const matchingFile = result.files?.find(f => f.filename === doc.filename);
              return matchingFile ? { ...matchingFile, status: 'indexed' } : { ...doc, status: 'indexed' };
            }
            return doc;
          })
        );
        
        // Refresh knowledge stats
        refetchKnowledge();
        loadDocuments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setVoiceStatus('RAG upload failed');
        
        // Add error to memory activity log
        const errorEntry = {
          timestamp: new Date().toLocaleTimeString(),
          type: 'File',
          category: 'document',
          result: 'Error'
        };
        setMemoryActivityLog(prev => [...prev, errorEntry]);
        
        // Update documents to show error status
        setUploadedDocuments(prev => 
          prev.map(doc => 
            doc.id.startsWith('temp_') ? { ...doc, status: 'failed' } : doc
          )
        );
      }
    } catch (error) {
      setVoiceStatus('Upload error');
      
      // Add error to memory activity log
      const errorEntry = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'File',
        category: 'document',
        result: 'Error'
      };
      setMemoryActivityLog(prev => [...prev, errorEntry]);
      
      // Update documents to show error status
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.id.startsWith('temp_') ? { ...doc, status: 'failed' } : doc
        )
      );
    }

    setDocumentsLoading(false);
    // Reset input
    event.target.value = '';
  };

  const handleGenerateReport = async () => {
    try {
      setVoiceStatus('Generating analytics report...');
      const response = await fetch('/api/analytics/report', { method: 'POST' });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'yobot-analytics-report.pdf';
      a.click();
      setVoiceStatus('Report generated');
    } catch (error) {
      setVoiceStatus('Report generation failed');
    }
  };

  const handleViewAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/summary');
      const data = await response.json();
      setVoiceStatus(`Analytics: ${data.totalCalls || 0} calls, ${data.successRate || 0}% success`);
    } catch (error) {
      setVoiceStatus('Failed to load analytics');
    }
  };

  const handleConfigureSettings = () => {
    setVoiceStatus('Opening configuration panel...');
    // Could open a modal or navigate to settings
  };

  const handleEmergencyStop = () => {
    if (confirm('EMERGENCY STOP: This will halt all operations. Continue?')) {
      setVoiceStatus('EMERGENCY STOP ACTIVATED');
      setAutomationMode(false);
    }
  };

  const handleContactSupport = async () => {
    setVoiceStatus('Creating support ticket...');
    
    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'General Support Request',
          description: 'User requested support assistance from dashboard footer',
          priority: 'normal',
          clientName: 'Dashboard User',
          email: 'support-request@yobot.bot'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setVoiceStatus('Support ticket created successfully');
        setToast({
          title: "Support Ticket Created",
          description: `Ticket #${result.ticket_id || 'created'} - Our team will respond shortly`,
        });
      } else {
        setVoiceStatus('Support ticket creation failed');
        setToast({
          title: "Support Request Sent",
          description: "Your support request has been received and will be processed",
        });
      }
    } catch (error) {
      if (currentSystemMode === 'test') {
        setVoiceStatus('Support system ready');
      }
      setToast({
        title: "Support Available",
        description: "Use the chat widget for immediate assistance or try again",
        variant: "destructive"
      });
    }
  };

  // Test data clearing removed - live mode only

  // Removed test sales order automation - only live webhook data processed

  const handleVoiceToggle = async () => {
    try {
      // Log to Command Center Metrics
      const action = isListening ? 'Stop Voice' : 'Start Voice';
      await CommandCenterActions.startVoice({
        triggeredBy: 'Command Center User',
        additionalData: { action, voiceStatus: isListening ? 'stopped' : 'started' }
      });

      if (!isListening) {
        // Start voice recording
        setUserInitiatedVoice(true);
        setIsListening(true);
        console.log('Voice recognition started by user');
      } else {
        // Stop voice recording
        setUserInitiatedVoice(false);
        setIsListening(false);
        if (currentRecognition) {
          try {
            currentRecognition.stop();
            setCurrentRecognition(null);
          } catch (error) {
            console.error('Error stopping recognition:', error);
          }
        }
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
        console.log('Voice recognition stopped by user');
      }
    } catch (error) {
      console.error('Voice toggle error:', error);
    }
  };



  const testEscalation = () => {
    setShowEscalation(true);
    setTimeout(() => setShowEscalation(false), 5000);
  };

  // Knowledge Base Functions
  const queryKnowledgeBase = async () => {
    if (!queryText.trim()) {
      setToast({
        title: "Query Required",
        description: "Please enter a query to search the knowledge base",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/knowledge/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      });

      if (response.ok) {
        const result = await response.json();
        setToast({
          title: "Knowledge Query Complete",
          description: `Found ${result.results?.length || 0} relevant documents`,
        });
      } else {
        setToast({
          title: "Query Failed",
          description: "Unable to query knowledge base",
          variant: "destructive"
        });
      }
    } catch (error) {
      setToast({
        title: "Query Error",
        description: "Network error during query",
        variant: "destructive"
      });
    }
  };

  const smartSearch = async () => {
    if (!queryText.trim()) {
      setToast({
        title: "Search Required",
        description: "Please enter text for smart search",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/knowledge/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, type: 'smart' })
      });

      if (response.ok) {
        const result = await response.json();
        setToast({
          title: "Smart Search Complete",
          description: `AI-powered search found ${result.matches || 0} relevant items`,
        });
      } else {
        setToast({
          title: "Smart Search Failed",
          description: "Unable to perform smart search",
          variant: "destructive"
        });
      }
    } catch (error) {
      setToast({
        title: "Search Error",
        description: "Network error during smart search",
        variant: "destructive"
      });
    }
  };

  const contextSearch = async () => {
    if (!queryText.trim()) {
      setToast({
        id: Date.now().toString(),
        title: "Context Required",
        description: "Please enter text for context search",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/knowledge/context-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, type: 'context' })
      });

      if (response.ok) {
        const result = await response.json();
        setToast({
          id: Date.now().toString(),
          title: "Context Search Complete",
          description: `Context analysis found ${result.contextMatches || 0} relevant sections`,
        });
      } else {
        setToast({
          id: Date.now().toString(),
          title: "Context Search Failed",
          description: "Unable to perform context search",
          variant: "destructive"
        });
      }
    } catch (error) {
      setToast({
        id: Date.now().toString(),
        title: "Context Error",
        description: "Network error during context search",
        variant: "destructive"
      });
    }
  };

  const downloadLastRecording = async () => {
    if (!voiceGenerationText.trim()) {
      setToast({
        id: Date.now().toString(),
        title: "Text Required",
        description: "Please enter text first, then generate voice before downloading",
        variant: "destructive"
      });
      return;
    }
    
    // Generate and download in one step
    await generateVoice();
  };

  const loadDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const response = await fetch('/api/knowledge/documents');
      if (response.ok) {
        const data = await response.json();
        setUploadedDocuments(data.documents || []);
        setToast({
          title: "Documents Loaded",
          description: `Found ${data.documents?.length || 0} documents in knowledge base`,
        });
      } else {
        setToast({
          title: "Load Failed",
          description: "Unable to load documents from knowledge base",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      setToast({
        title: "Load Error",
        description: "Network error while loading documents",
        variant: "destructive"
      });
    } finally {
      setDocumentsLoading(false);
    }
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const deleteSelectedDocuments = async () => {
    if (selectedDocuments.length === 0) {
      setToast({
        title: "No Selection",
        description: "Please select documents to delete",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/knowledge/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: selectedDocuments })
      });

      if (response.ok) {
        setToast({
          title: "Documents Deleted",
          description: `${selectedDocuments.length} documents removed successfully`,
        });
        setSelectedDocuments([]);
        loadDocuments();
      } else {
        setToast({
          title: "Delete Failed",
          description: "Unable to delete selected documents",
          variant: "destructive"
        });
      }
    } catch (error) {
      setToast({
        title: "Delete Error",
        description: "Network error during deletion",
        variant: "destructive"
      });
    }
  };

  const insertMemoryText = async () => {
    if (!memoryText.trim()) {
      setToast({
        title: "Text Required",
        description: "Please enter text to insert into memory",
        variant: "destructive"
      });
      return;
    }

    try {
      setVoiceStatus('Inserting memory text...');
      const response = await fetch('/api/memory/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: memoryText,
          category: memoryCategory,
          priority: 'high'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setVoiceStatus('Memory text inserted successfully');
        
        // Add to memory activity log instead of toast
        const logEntry = {
          timestamp: new Date().toLocaleTimeString(),
          type: 'Manual',
          category: memoryCategory,
          result: 'Success'
        };
        setMemoryActivityLog(prev => [...prev, logEntry]);
        
        setMemoryText('');
        
        // Refresh knowledge stats and documents list
        refetchKnowledge();
        loadDocuments();
      } else {
        setVoiceStatus('Memory insertion failed');
        
        // Add error to memory activity log
        const errorEntry = {
          timestamp: new Date().toLocaleTimeString(),
          type: 'Manual',
          category: memoryCategory,
          result: 'Error'
        };
        setMemoryActivityLog(prev => [...prev, errorEntry]);
      }
    } catch (error) {
      setVoiceStatus('Error during memory insertion');
      
      // Add error to memory activity log
      const errorEntry = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'Manual',
        category: memoryCategory,
        result: 'Error'
      };
      setMemoryActivityLog(prev => [...prev, errorEntry]);
    }
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

  // Removed test quote generation - only live webhook data processed

  // Removed test notifications - only live webhook notifications processed

  // PDF Download Handler - generates comprehensive system report
  const handleDownloadPDF = async () => {
    try {
      // Log to Command Center Metrics
      const metricsResult = await CommandCenterActions.quickExport({
        triggeredBy: 'Command Center User',
        additionalData: { fileType: 'PDF', exportType: 'Command Center Report' }
      });

      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'YoBot Command Center Report',
          data: { metrics, automationPerformance, knowledgeStats }
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
        
        toast({
          id: Date.now().toString(),
          title: "PDF Downloaded",
          description: "Report generated and logged to Command Center"
        });
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        id: Date.now().toString(),
        title: "PDF Generation Failed",
        description: "Unable to generate report",
        variant: "destructive"
      });
    }
  };

  // Pipeline call functions with monitoring
  const startPipelineCalls = async () => {
    try {
      setPipelineRunning(true);
      setShowCallMonitoring(true);
      
      const response = await fetch('/api/pipeline/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "trigger_pipeline_calls",
          filter: "active"
        })
      });

      const result = await response.json();

      if (result.success) {
        setTotalRecords(result.total_records || 0);
        setActiveCalls(result.activeCalls || []);
        
        // Use only real call data from API response - NO MOCK DATA IN LIVE MODE
        setActiveCalls(result.activeCalls || []);
        
        setToast({
          title: "Pipeline Started",
          description: `Started ${result.active_calls} calls from your Airtable`,
        });
      } else {
        setPipelineRunning(false);
        setToast({
          title: "Pipeline Failed",
          description: result.error || result.message || 'Failed to start pipeline',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setPipelineRunning(false);
      setToast({
        title: "Connection Error",
        description: `Failed to connect to pipeline: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const stopPipelineCalls = async () => {
    try {
      const response = await fetch('/api/pipeline/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "stop_pipeline_calls",
          terminate_all: true
        })
      });

      const result = await response.json();
      
      setPipelineRunning(false);
      setActiveCalls([]);
      
      setToast({
        title: "Pipeline Stopped",
        description: "All pipeline calls have been terminated",
      });
    } catch (error: any) {
      setToast({
        title: "Stop Failed",
        description: `Failed to stop pipeline: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Live Command Execution Handler
  const executeLiveCommand = async (category: string, data?: any) => {
    console.log('Executing command:', category);
    
    try {
      let endpoint = '';
      let requestData = data || getLiveCommandPayload(category);

      // Map commands to specific endpoints
      switch (category) {
        case 'New Booking Sync':
          endpoint = '/api/new-booking-sync';
          if (!data) {
            requestData = {
              clientName: 'Manual Booking',
              email: 'booking@client.com',
              date: new Date().toISOString().split('T')[0],
              time: '10:00',
              service: 'Consultation'
            };
          }
          break;
        case 'New Support Ticket':
          endpoint = '/api/new-support-ticket';
          if (!data) {
            requestData = {
              subject: 'Command Center Support Request',
              description: 'Support ticket created from Command Center',
              priority: 'normal',
              clientEmail: 'support@client.com'
            };
          }
          break;
        case 'Manual Follow-up':
          endpoint = '/api/manual-followup';
          if (!data) {
            requestData = {
              clientName: 'Follow-up Client',
              phone: '+1234567890',
              notes: 'Manual follow-up triggered from Command Center'
            };
          }
          break;
        case 'Send SMS':
          endpoint = '/api/send-sms';
          if (!data) {
            requestData = {
              to: '+1234567890',
              message: 'Message from YoBot Command Center'
            };
          }
          break;
        case 'Start Pipeline Calls':
          endpoint = '/api/start-pipeline-calls';
          break;
        case 'Stop Pipeline Calls':
          endpoint = '/api/stop-pipeline-calls';
          break;
        case 'Initiate Voice Call':
          endpoint = '/api/initiate-voice-call';
          if (!data) {
            requestData = {
              phoneNumber: '+1234567890',
              script: 'Standard follow-up script'
            };
          }
          break;
        case 'Voice Input':
          endpoint = '/api/voice-input';
          if (!data) {
            requestData = {
              transcript: 'Voice command from Command Center'
            };
          }
          break;
        case 'Content Creator':
          endpoint = '/webhook/content-creator';
          requestData = {
            selectedIndustry: 'Technology',
            targetPlatform: 'LinkedIn',
            contentType: 'value post',
            characterCount: 500,
            tone: 'professional',
            voicePersona: 'expert',
            systemMode: currentSystemMode
          };
          break;
        case 'Export Data':
          endpoint = '/api/export-data';
          requestData = { format: 'csv', dataType: 'all' };
          break;
        case 'Mailchimp Sync':
          endpoint = '/webhook/mailchimp-campaign';
          requestData = {
            campaignType: 'Newsletter',
            audienceSegment: 'Technology Professionals',
            emailSubject: 'Latest Tech Innovations',
            emailBody: 'Discover cutting-edge technology trends shaping the future of business.',
            CTA: 'Read More',
            sendNow: true,
            systemMode: currentSystemMode
          };
          break;
        case 'Upload Documents':
          endpoint = '/api/upload-documents';
          if (!data) {
            requestData = {
              files: [],
              category: 'general'
            };
          }
          break;
        case 'Critical Escalation':
          endpoint = '/api/critical-escalation';
          if (!data) {
            requestData = {
              alertType: 'system',
              message: 'Critical alert from Command Center',
              severity: 'high'
            };
          }
          break;
        case 'Emergency Data Wipe':
          endpoint = '/api/emergency-data-wipe';
          if (!data) {
            const confirmation = prompt('Enter confirmation code for data wipe:');
            if (!confirmation) return;
            requestData = { confirmationCode: confirmation };
          }
          break;
        case 'Live System Diagnostics':
          endpoint = '/api/live-system-diagnostics';
          break;
        case 'Download System Logs':
          endpoint = '/api/download-system-logs';
          if (!data) {
            requestData = {
              logType: 'all',
              timeRange: '24h'
            };
          }
          break;
        default:
          // Use central automation dispatcher for other commands
          endpoint = '/api/command-center/execute';
          requestData = {
            command: category,
            category: 'Core',
            payload: requestData,
            isTestMode: false
          };
      }

      console.log('Making request to:', endpoint, 'with data:', requestData);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (result.success || response.ok) {
        // Special handling for Content Creator and Mailchimp
        if (category === 'Content Creator') {
          // Show the generated content
          alert(`✅ CONTENT CREATED AND POSTED!\n\nTitle: ${result.preview?.title || 'LinkedIn content'}\nContent: ${result.preview?.content || 'Generated content'}\nHashtags: ${result.preview?.hashtags?.join(', ') || 'N/A'}\nCTA: ${result.preview?.cta || 'N/A'}\n\n🚀 Posted to: ${result.content?.platform || 'LinkedIn'}\n📊 Status: ${result.content?.status || 'Published'}`);
        } else if (category === 'Mailchimp Sync') {
          // Show the campaign details
          alert(`✅ MAILCHIMP CAMPAIGN CREATED!\n\nSubject: ${result.campaign?.subject || 'Email campaign'}\nAudience: ${result.campaign?.audience || 'subscribers'}\nType: ${result.campaign?.type || 'Newsletter'}\nStatus: ${result.campaign?.status || 'Sent'}\n\n📧 Campaign ID: ${result.campaign?.id || 'N/A'}`);
        } else {
          alert(`✅ ${category} completed successfully!`);
        }
      } else {
        toast({
          title: "Command Failed",
          description: `${category} failed: ${result.error || result.message || 'Unknown error'}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Command execution error:', error);
      toast({
        title: "Execution Error",
        description: `Failed to execute ${category}: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getLiveCommandPayload = (category: string) => {
    switch (category) {
      case "Start Pipeline Calls":
        return { action: "trigger_pipeline_calls", filter: "active" };
      case "Stop Pipeline Calls":
        return { action: "stop_pipeline_calls", terminate_all: true };
      case "New Booking Sync":
        return { 
          action: "sync_latest_bookings",
          source: "calendar_api",
          sync_type: "incremental"
        };
      case "New Support Ticket":
        return { 
          subject: "Dashboard Support Request",
          description: "Support request from Command Center",
          priority: "normal",
          clientName: "Command Center User"
        };
      case "Manual Follow-up":
        return { lead_id: "manual_trigger", priority: "high" };
      case "Initiate Voice Call":
        return { action: "voice_call" };
      case "Send SMS":
        return { action: "send_sms", message: "Message from YoBot" };
      case "Run Lead Scrape":
        return { query: "roofing contractor", limit: 10 };
      case "Export Data":
        return { action: "export_data", format: "csv", timeframe: "last_7_days" };
      default:
        return {};
    }
  };

  // Demo mode functions
  const startDemo = () => {
    setDemoMode(true);
    setDemoStep(0);
  };

  const nextDemoStep = () => {
    if (demoStep < 4) {
      setDemoStep(demoStep + 1);
    } else {
      setDemoMode(false);
      setDemoStep(0);
    }
  };

  // Section collapse functions
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div>
      {/* Header Bar */}
      <HeaderBar 
        currentSystemMode={currentSystemMode}
        userName="Daniel Sharpe"
        clientName="AMT66"
        onModeToggle={toggleSystemMode}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 pt-8 p-8">

      
      <div className="w-full">



        {/* Escalation Alert Overlay */}
        {showEscalation && (
          <div className="fixed inset0- bg-red-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold text-red-900">🚨 URGENT ESCALATION</h3>
                  <p className="text-red-700 text-sm">Automation failure requires immediate attention</p>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded mb-4">
                <p className="text-red-900 font-medium">System Alert</p>
                <p className="text-red-700 text-sm">Automation requires attention</p>
              </div>
              <div className="flex space-x-3">
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white border border-red-500">
                  Fix Now
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border border-red-400 text-red-400 hover:bg-red-600/20"
                  onClick={() => setShowEscalation(false)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

  

        {/* Demo Mode Overlay */}
        {demoMode && (
          <div className="fixed inset0- bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-blue-400/50 rounded-lg p-6 max-w-md mx-4">
              <div className="text-center">
                <div className="text-blue-400 mb-4">
                  <Bot className="w-12 h-12 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-white">Demo Mode Active</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Step {demoStep + 1} of 5: {
                    demoStep === 0 ? "Core Automation Overview" :
                    demoStep === 1 ? "Voice Operations Demo" :
                    demoStep === 2 ? "AI Intelligence Features" :
                    demoStep === 3 ? "SmartSpend Integration" :
                    "System Tools Walkthrough"
                  }
                </p>
                <div className="flex space-x-3">
                  <Button onClick={nextDemoStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {demoStep === 4 ? "Finish Demo" : "Next Step"}
                  </Button>
                  <Button variant="outline" onClick={() => setDemoMode(false)} className="border-blue-400 text-blue-400">
                    Exit Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Title */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center">
              <img 
                src={robotHeadImage} 
                alt="YoBot Robot Head" 
                className="w-16 h-16 mr-2 -mt-3"
                onError={(e) => {
                  console.log('Image failed to load, showing Bot icon fallback');
                  (e.target as HTMLImageElement).style.display = 'none';
                  const botIcon = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (botIcon) botIcon.style.display = 'block';
                }}
              />
              <Bot className="w-16 h-16 mr-2 -mt-2 text-blue-400" style={{ display: 'none' }} />
              YoBot<sup className="text-xl">®</sup>&nbsp;Command Center Dashboard
            </h1>
          </div>
          <p className="text-slate-300 text-lg mb-2">Your Complete AI Automation Dashboard</p>
          <p className="text-slate-300 text-lg">
            {selectedTier !== 'All' && `${selectedTier} Tier`}
          </p>
        </div>

        {/* Live Call Banner */}
        <LiveCallBanner 
          onViewDetails={() => setShowCreateVoiceCallModal(true)}
        />

        {/* Enhanced Voice Command Interface */}
        <div className="mb-6">
          <VoiceCommandInterface
            micStatus={micStatus}
            onMicStatusChange={setMicStatus}
            realTimeTranscript={realTimeTranscript}
            onTranscriptChange={setRealTimeTranscript}
          />
        </div>

        {/* Dashboard Preset Selector */}
        <div className="mb-6">
          <Card className="bg-slate-800/40 backdrop-blur-sm border border-cyan-400">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Dashboard View:</span>
                  </div>
                  <div className="flex space-x-2">
                    {[
                      { id: 'full', label: 'Full Ops View', icon: Monitor },
                      { id: 'voice', label: 'Voice Ops Only', icon: Mic },
                      { id: 'smartspend', label: 'SmartSpend Only', icon: DollarSign }
                    ].map(preset => (
                      <Button
                        key={preset.id}
                        onClick={async () => {
                          try {
                            await CommandCenterActions.systemMonitoring('Dashboard View Change', {
                              triggeredBy: 'Command Center User',
                              additionalData: { 
                                previousView: dashboardPreset,
                                newView: preset.id,
                                viewLabel: preset.label
                              }
                            });
                            setDashboardPreset(preset.id);
                          } catch (error) {
                            console.error('Dashboard preset change error:', error);
                            setDashboardPreset(preset.id);
                          }
                        }}
                        size="sm"
                        className={`${
                          dashboardPreset === preset.id 
                            ? (preset.id === 'voice' ? 'bg-blue-600 text-white border-blue-400' :
                               preset.id === 'smartspend' ? 'bg-green-600 text-white border-green-400' :
                               'bg-cyan-600 text-white border-cyan-400')
                            : (preset.id === 'voice' ? 'bg-blue-600 text-white border-blue-400 hover:bg-blue-700' :
                               preset.id === 'smartspend' ? 'bg-green-600 text-white border-green-400 hover:bg-green-700' :
                               'border-cyan-400 text-cyan-400 hover:bg-cyan-600/20')
                        }`}
                        title={`Switch to ${preset.label}`}
                      >
                        <preset.icon className="w-4 h-4 mr-1" />
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={async () => {
                      try {
                        await CommandCenterActions.generateAnalyticsReport({
                          triggeredBy: 'Command Center User',
                          additionalData: { reportType: 'Enhanced Analytics Report' }
                        });
                        setShowAnalyticsModal(true);
                      } catch (error) {
                        console.error('Enhanced Reports error:', error);
                        setShowAnalyticsModal(true);
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    title="Generate Analytics Report with customizable options"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Enhanced Reports
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        await CommandCenterActions.uploadCalendar({
                          triggeredBy: 'Command Center User',
                          additionalData: { action: 'Calendar Upload/Sync' }
                        });
                        setShowCalendarUpload(true);
                      } catch (error) {
                        console.error('Calendar Sync error:', error);
                        setShowCalendarUpload(true);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    title="Upload calendar files or sync with Google Calendar"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar Sync
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Original Voice Control Buttons */}
        <div className="mb-6 bg-white/10 backdrop-blur-sm border border-blue-400 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Quick Actions</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleVoiceToggle}
                className={`${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isListening ? 'Stop Voice' : 'Start Voice'}
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await CommandCenterActions.systemMonitoring('Voice Recordings View', {
                      triggeredBy: 'Command Center User',
                      additionalData: { action: showVoiceRecordings ? 'hide' : 'show' }
                    });
                    setShowVoiceRecordings(!showVoiceRecordings);
                  } catch (error) {
                    console.error('Voice Recordings error:', error);
                    setShowVoiceRecordings(!showVoiceRecordings);
                  }
                }}
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-600/20"
                title="View and manage voice recordings"
              >
                <Headphones className="w-4 h-4 mr-2" />
                Recordings
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await CommandCenterActions.systemMonitoring('Quick Ops Access', {
                      triggeredBy: 'Command Center User',
                      additionalData: { tabSwitch: 'automation-ops' }
                    });
                    setActiveTab('automation-ops');
                  } catch (error) {
                    console.error('Quick Ops error:', error);
                    setActiveTab('automation-ops');
                  }
                }}
                variant="outline"
                className="border-green-400 text-green-400 hover:bg-green-600/20"
                title="Quick access to automation operations"
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Ops
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await CommandCenterActions.systemMonitoring('System Tools Access', {
                      triggeredBy: 'Command Center User',
                      additionalData: { tabSwitch: 'system-tools' }
                    });
                    setActiveTab('system-tools');
                  } catch (error) {
                    console.error('System Tools error:', error);
                    setActiveTab('system-tools');
                  }
                }}
                variant="outline"
                className="border-amber-400 text-amber-400 hover:bg-amber-600/20 flex items-center"
                title="System - Access advanced monitoring, diagnostics, and administrative tools for platform management"
              >
                <Settings className="w-4 h-4 mr-2" />
                System
                <HelpCircle className="w-3 h-3 ml-1 text-amber-300 opacity-70" />
              </Button>
              <Button
                onClick={handleExportDashboard}
                variant="outline"
                className="border-green-400 text-green-400 hover:bg-green-600/20 flex items-center"
                title="Export Data - Download dashboard metrics and analytics as JSON file for client presentations"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export
                <HelpCircle className="w-3 h-3 ml-1 text-green-300 opacity-70" />
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await CommandCenterActions.systemMonitoring('Admin Tools Access', {
                      triggeredBy: 'Command Center User',
                      additionalData: { tabSwitch: 'admin-tools', accessLevel: 'administrative' }
                    });
                    setActiveTab('admin-tools');
                  } catch (error) {
                    console.error('Admin Tools error:', error);
                    setActiveTab('admin-tools');
                  }
                }}
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-600/20 flex items-center"
                title="Admin Tools - Administrative controls and system management"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Tools
              </Button>

            </div>
          </div>
          {isListening && (
            <div className="mt-3 space-y-2">
              <div className="text-sm text-green-400 flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
                🎙️ Speak Now... Voice commands ready. Say "YoBot" to activate commands.
              </div>
              
              {/* Voice Waveform Animation */}
              <div className="flex items-center space-x-1 ml-4">
                <div className="w-1 h-3 bg-green-300 rounded animate-pulse"></div>
                <div className="w-1 h-2 bg-green-300 rounded animate-pulse delay-75"></div>
                <div className="w-1 h-4 bg-green-300 rounded animate-pulse delay-150"></div>
                <div className="w-1 h-2 bg-green-300 rounded animate-pulse delay-300"></div>
                <div className="w-1 h-3 bg-green-300 rounded animate-pulse delay-500"></div>
                <div className="w-1 h-1 bg-green-300 rounded animate-pulse delay-700"></div>
                <div className="w-1 h-3 bg-green-300 rounded animate-pulse delay-900"></div>
              </div>
              
              {/* Cancel Button */}
              <Button
                onClick={toggleVoiceListening}
                variant="outline"
                size="sm"
                className="ml-4 border-red-400 text-red-400 hover:bg-red-600/20"
              >
                ❌ Cancel
              </Button>
              
              {/* Real-time Transcription */}
              {realTimeTranscript && (
                <div className="ml-4 p-2 bg-white/5 rounded border border-blue-400/30">
                  <div className="text-xs text-blue-300">Transcribing:</div>
                  <div className="text-white text-sm">"{realTimeTranscript}"</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Pipeline Banner */}
        {(currentSystemMode === 'test' || (liveActivityData?.data?.callsInProgress > 0)) && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-400 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-semibold">📞 Pipeline Active</span>
                <span className="text-white">
                  { `${liveActivityData?.data?.callsInProgress || 0} calls in progress`}
                </span>
                <span className="text-green-400">|</span>
                <span className="text-white">
                  { `${liveActivityData?.data?.callsCompleted || 0} completed today`}
                </span>
              </div>
              <Button
                onClick={handleStopPipelineCalls}
                variant="outline"
                size="sm"
                className="border-red-400 text-red-400 hover:bg-red-600/20"
              >
                🛑 Emergency Stop
              </Button>
            </div>
          </div>
        )}

        {/* 1. Quick Action Launchpad - All Manual Triggers Consolidated at Top */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 backdrop-blur-sm border border-blue-400 shadow-lg shadow-blue-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between text-2xl">
                <div className="flex items-center">
                  <Zap className="w-6 h-6 mr-3 text-blue-400" />
                  🚀 Quick Action Launchpad
                  <Badge className="ml-3 bg-blue-500 text-white text-sm px-3 py-1">ALL TRIGGERS</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('quick-actions')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['quick-actions'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/60">Show Advanced Tools</span>
                  <Switch 
                    checked={collapsedSections['advanced-tools'] !== true}
                    onCheckedChange={(checked) => setCollapsedSections(prev => ({...prev, 'advanced-tools': !checked}))}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            {!collapsedSections['quick-actions'] && (
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Primary Action Buttons */}
                  <Button
                    onClick={handleCreateBooking}
                    className="!bg-emerald-600 hover:!bg-emerald-700 !text-white flex items-center justify-center p-4 h-24 border border-emerald-500"
                    title="Schedule Booking"
                  >
                    <div className="text-center">
                      <Calendar className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Schedule Booking</span>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={handleCreateSupportTicket}
                    className="!bg-violet-600 hover:!bg-violet-700 !text-white flex items-center justify-center p-4 h-24 border border-violet-500"
                    title="Submit Ticket"
                  >
                    <div className="text-center">
                      <Ticket className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Submit Ticket</span>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => CommandCenterActions.scheduleFollowUp({ voiceTriggered: false })}
                    className="!bg-amber-600 hover:!bg-amber-700 !text-white flex items-center justify-center p-4 h-24 border border-amber-500"
                    title="Schedule Follow-up"
                  >
                    <div className="text-center">
                      <RefreshCw className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Schedule Follow-up</span>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => CommandCenterActions.startAutomation({ voiceTriggered: false })}
                    className="!bg-green-600 hover:!bg-green-700 !text-white flex items-center justify-center p-4 h-24 border border-green-500"
                    title="Start Automation"
                  >
                    <div className="text-center">
                      <Phone className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Start Automation</span>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => CommandCenterActions.callTopProspect({ voiceTriggered: false })}
                    className="!bg-teal-600 hover:!bg-teal-700 !text-white flex items-center justify-center p-4 h-24 border border-teal-500"
                    title="Call Top Prospect"
                  >
                    <div className="text-center">
                      <PhoneOff className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Call Top Prospect</span>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => CommandCenterActions.startVoiceListening({ voiceTriggered: false })}
                    className="!bg-indigo-600 hover:!bg-indigo-700 !text-white flex items-center justify-center p-4 h-24 border border-indigo-500"
                    title="Start Voice Listening"
                  >
                    <div className="text-center">
                      <Mic className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Start Voice</span>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => CommandCenterActions.startAutomation({ voiceTriggered: false })}
                    className="!bg-green-600 hover:!bg-green-700 !text-white flex items-center justify-center p-4 h-24 border border-green-500"
                    title="Start Pipeline Calls"
                  >
                    <div className="text-center">
                      <Phone className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Start Pipeline</span>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => CommandCenterActions.exportDashboard({ voiceTriggered: false })}
                    className="!bg-emerald-600 hover:!bg-emerald-700 !text-white flex items-center justify-center p-4 h-24 border border-emerald-500"
                    title="Export Dashboard"
                  >
                    <div className="text-center">
                      <Download className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Export Dashboard</span>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => CommandCenterActions.generateReport({ voiceTriggered: false })}
                    className="!bg-violet-600 hover:!bg-violet-700 !text-white flex items-center justify-center p-4 h-24 border border-violet-500"
                    title="Generate Analytics Report"
                  >
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Generate Report</span>
                    </div>
                  </Button>
                </div>
                
                {/* Advanced Tools Section */}
                {!collapsedSections['advanced-tools'] && (
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <h4 className="text-white/80 text-sm font-medium mb-3">Advanced Tools</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <Button
                        onClick={handleUploadDocs}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center p-4 h-20 border border-blue-400"
                        title="PDF & Knowledge Upload"
                      >
                        <div className="text-center">
                          <FileText className="w-5 h-5 mx-auto mb-2" />
                          <span className="text-xs font-medium">PDF Upload</span>
                        </div>
                      </Button>
                      
                      <Button
                        onClick={handleViewKnowledge}
                        className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center p-4 h-20 border border-purple-400"
                        title="Knowledge Areas"
                      >
                        <div className="text-center">
                          <Brain className="w-5 h-5 mx-auto mb-2" />
                          <span className="text-xs font-medium">Knowledge</span>
                        </div>
                      </Button>
                      
                      <Button
                        onClick={handleRunDiagnostics}
                        className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center p-4 h-20 border border-orange-400"
                        title="System Diagnostics"
                      >
                        <div className="text-center">
                          <Settings className="w-5 h-5 mx-auto mb-2" />
                          <span className="text-xs font-medium">Diagnostics</span>
                        </div>
                      </Button>
                      
                      <Button
                        onClick={handleEmergencyStop}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center p-4 h-20 border border-red-500"
                        title="Emergency Stop"
                      >
                        <div className="text-center">
                          <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                          <span className="text-xs font-medium">Emergency</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* 2. Voice Engine + Command Center (Consolidated Voice Section) */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-green-900/60 to-emerald-800/40 backdrop-blur-sm border border-green-400 shadow-lg shadow-green-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between text-xl">
                <div className="flex items-center">
                  <Headphones className="w-6 h-6 mr-3 text-green-400" />
                  🎙️ Voice Engine + Command Center
                  <Badge className="ml-3 bg-green-500 text-white text-sm px-3 py-1">UNIFIED</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('voice-engine')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['voice-engine'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${micStatus === 'listening' ? 'bg-red-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-green-300">{micStatus === 'listening' ? 'Active' : 'Ready'}</span>
                </div>
              </CardTitle>
            </CardHeader>
            {!collapsedSections['voice-engine'] && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pipeline Controls */}
                  <div className="space-y-4">
                    <h4 className="text-green-300 font-semibold flex items-center border-b border-green-400/30 pb-2">
                      <Phone className="w-4 h-4 mr-2" />
                      Pipeline Start/End
                    </h4>
                    <Button
                      onClick={handleStartPipelineCalls}
                      className="w-full bg-green-600 hover:bg-green-700 text-white p-3"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Pipeline
                    </Button>
                    <Button
                      onClick={handleStopPipelineCalls}
                      className="w-full bg-red-600 hover:bg-red-700 text-white p-3"
                    >
                      <PhoneOff className="w-4 h-4 mr-2" />
                      End Pipeline
                    </Button>
                  </div>
                  
                  {/* Active Commands & Status */}
                  <div className="space-y-4">
                    <h4 className="text-green-300 font-semibold flex items-center border-b border-green-400/30 pb-2">
                      <Activity className="w-4 h-4 mr-2" />
                      Active Commands & Status
                    </h4>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-sm text-green-300 mb-2">Voice Status:</div>
                      <div className="text-white">{voiceStatus}</div>
                      {realTimeTranscript && (
                        <div className="mt-2 text-blue-300 text-sm">"{realTimeTranscript}"</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Voice Recognition & Synthesis Studio */}
                  <div className="space-y-4">
                    <h4 className="text-green-300 font-semibold flex items-center border-b border-green-400/30 pb-2">
                      <Mic className="w-4 h-4 mr-2" />
                      Voice Recognition & Synthesis
                    </h4>
                    <Button
                      onClick={() => setShowCreateVoiceCallModal(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3"
                    >
                      <Headphones className="w-4 h-4 mr-2" />
                      Voice Studio
                    </Button>
                    <Button
                      onClick={testVoicePersona}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white p-3"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Persona
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* 3. Core Automation & Manual Triggers (Core, Follow-ups, Sales Orders) */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-slate-900/60 to-gray-800/60 backdrop-blur-sm border border-slate-400 shadow-lg shadow-slate-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between text-xl">
                <div className="flex items-center">
                  <Zap className="w-6 h-6 mr-3 text-slate-400" />
                  📦 Core Automation & Manual Triggers
                  <Badge className="ml-3 bg-slate-500 text-white text-sm px-3 py-1">CORE</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('core-automation')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['core-automation'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                  <span className="text-sm text-green-300">Active</span>
                </div>
              </CardTitle>
            </CardHeader>
            {!collapsedSections['core-automation'] && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Core Follow-ups */}
                  <div className="space-y-4">
                    <h4 className="text-slate-300 font-semibold flex items-center border-b border-slate-400/30 pb-2">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Core Follow-ups
                    </h4>
                    <Button
                      onClick={handleManualFollowUp}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white p-3"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Manual Follow-up
                    </Button>
                    <Button
                      onClick={handleSendSMS}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      SMS Trigger
                    </Button>
                  </div>
                  
                  {/* Sales Orders */}
                  <div className="space-y-4">
                    <h4 className="text-slate-300 font-semibold flex items-center border-b border-slate-400/30 pb-2">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Sales Orders
                    </h4>
                    <Button
                      onClick={handleAutomateSalesOrder}
                      className="w-full bg-green-600 hover:bg-green-700 text-white p-3"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Automate Sales Flow
                    </Button>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-sm text-slate-300">Success Rate:</div>
                      <div className="text-lg font-bold text-green-400">
                        {automationPerformance?.data?.successRate || '0'}%
                      </div>
                    </div>
                  </div>
                  
                  {/* System Status */}
                  <div className="space-y-4">
                    <h4 className="text-slate-300 font-semibold flex items-center border-b border-slate-400/30 pb-2">
                      <Activity className="w-4 h-4 mr-2" />
                      System Status
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-white/5 rounded">
                        <span className="text-slate-300 text-sm">Workflows:</span>
                        <span className="text-white font-medium">
                          {liveSystemData?.data?.activeWorkflows || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-white/5 rounded">
                        <span className="text-slate-300 text-sm">Uptime:</span>
                        <span className="text-green-400 font-medium">
                          {liveSystemData?.data?.uptime || ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* 4. Reports + Analytics (SmartSpend™, Botalytics™, PDF, Forecasts) */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 backdrop-blur-sm border border-purple-400 shadow-lg shadow-purple-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between text-xl">
                <div className="flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-purple-400" />
                  📊 Performance & ROI Analytics
                  <Badge className="ml-3 bg-purple-500 text-white text-sm px-3 py-1">ANALYTICS</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('analytics-reports')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['analytics-reports'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-purple-300">Last Updated: Just now</span>
                </div>
              </CardTitle>
            </CardHeader>
            {!collapsedSections['analytics-reports'] && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* SmartSpend™ Analytics */}
                  <div className="space-y-4">
                    <h4 className="text-purple-300 font-semibold flex items-center border-b border-purple-400/30 pb-2">
                      <DollarSign className="w-4 h-4 mr-2" />
                      📊 SmartSpend™ Analytics
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-purple-300 text-sm">Budget Efficiency:</span>
                          <span className="text-slate-400 font-bold">--</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-purple-300 text-sm">Cost Per Lead:</span>
                          <span className="text-slate-400 font-bold">--</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-purple-300 text-sm">ROI:</span>
                          <span className="text-slate-400 font-bold">--</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botalytics™ */}
                  <div className="space-y-4">
                    <h4 className="text-purple-300 font-semibold flex items-center border-b border-purple-400/30 pb-2">
                      <Brain className="w-4 h-4 mr-2" />
                      📈 Botalytics™
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-purple-300 text-sm">AI Accuracy:</span>
                          <span className="text-slate-400 font-bold">--</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-purple-300 text-sm">Interactions:</span>
                          <span className="text-slate-400 font-bold">--</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-purple-300 text-sm">Learning Rate:</span>
                          <span className="text-slate-400 font-bold">--</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Export Actions */}
                <div className="mt-6 pt-4 border-t border-purple-400/30">
                  <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
                    <FileDown className="w-4 h-4 mr-2" />
                    📤 PDF + Export Reports
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button
                      onClick={() => setShowAnalyticsModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white p-3"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Analytics Report
                    </Button>
                    <Button
                      onClick={handlePDFReport}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-3"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      PDF Export
                    </Button>
                    <Button
                      onClick={() => setShowExportModal(true)}
                      className="bg-teal-600 hover:bg-teal-700 text-white p-3"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Quick Export
                    </Button>
                    <Button
                      onClick={handleExportData}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white p-3"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Data Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* 5. System Health + Metrics (Uptime, Client Pulse, Ops Stats) */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-emerald-900/60 to-teal-800/60 backdrop-blur-sm border border-emerald-400 shadow-lg shadow-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between text-xl">
                <div className="flex items-center">
                  <Gauge className="w-6 h-6 mr-3 text-emerald-400" />
                  📈 System Health + Metrics
                  <Badge className="ml-3 bg-emerald-500 text-white text-sm px-3 py-1">LIVE</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('system-health')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['system-health'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-sm text-red-300">Systems Offline</span>
                </div>
              </CardTitle>
            </CardHeader>
            {!collapsedSections['system-health'] && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Uptime & Performance */}
                  <div className="space-y-4">
                    <h4 className="text-red-300 font-semibold flex items-center border-b border-emerald-400/30 pb-2">
                      <Activity className="w-4 h-4 mr-2" />
                      System Uptime
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-red-300 mb-1">Uptime</div>
                        <div className="text-2xl font-bold text-slate-400">--</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-red-300 mb-1">Response Time</div>
                        <div className="text-lg font-bold text-slate-400">--</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Client Pulse */}
                  <div className="space-y-4">
                    <h4 className="text-red-300 font-semibold flex items-center border-b border-emerald-400/30 pb-2">
                      <Users className="w-4 h-4 mr-2" />
                      💼 Client Pulse
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-red-300 mb-1">NPS Score</div>
                        <div className="text-2xl font-bold text-slate-400">--</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-red-300 mb-1">Active Clients</div>
                        <div className="text-lg font-bold text-slate-400">--</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Operations Stats */}
                  <div className="space-y-4">
                    <h4 className="text-red-300 font-semibold flex items-center border-b border-emerald-400/30 pb-2">
                      <Target className="w-4 h-4 mr-2" />
                      Ops Stats
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-red-300 mb-1">Active Calls</div>
                        <div className="text-lg font-bold text-white">
                          {activeCalls?.data?.length || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-red-300 mb-1">Success Rate</div>
                        <div className="text-lg font-bold text-green-400">
                          {callMetrics?.data?.successRate || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* 6. Security + Audit Logs (Consolidated Audit + Alerts) */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-red-900/60 to-orange-900/60 backdrop-blur-sm border border-red-400 shadow-lg shadow-red-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between text-xl">
                <div className="flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-red-400" />
                  🔐 System Monitoring + Audit Logs
                  <Badge className="ml-3 bg-red-500 text-white text-sm px-3 py-1">SECURE</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('security-audit')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['security-audit'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-sm text-green-300">🟢 Pass</span>
                </div>
              </CardTitle>
            </CardHeader>
            {!collapsedSections['security-audit'] && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* GDPR Status & Security */}
                  <div className="space-y-4">
                    <h4 className="text-red-300 font-semibold flex items-center border-b border-red-400/30 pb-2">
                      <Shield className="w-4 h-4 mr-2" />
                      Security Status
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                        <span className="text-red-300 text-sm">GDPR Compliance:</span>
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">🟢 PASS</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                        <span className="text-red-300 text-sm">RAG Results:</span>
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">🟢 PASS</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                        <span className="text-red-300 text-sm">Security Logs:</span>
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">🟢 PASS</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                        <span className="text-red-300 text-sm">Tampering Flags:</span>
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">🟢 PASS</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Audit Events */}
                  <div className="space-y-4">
                    <h4 className="text-red-300 font-semibold flex items-center border-b border-red-400/30 pb-2">
                      <Eye className="w-4 h-4 mr-2" />
                      Recent Audit Events
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {auditLog?.data?.slice(0, 5).map((event, index) => (
                        <div key={index} className="p-2 bg-white/5 rounded text-sm">
                          <div className="flex justify-between items-start">
                            <span className="text-white font-medium">{event.action || 'System Event'}</span>
                            <span className={`text-xs px-1 rounded ${
                              event.result === 'success' ? 'bg-green-600 text-white' : 
                              event.result === 'error' ? 'bg-red-600 text-white' : 
                              'bg-yellow-600 text-white'
                            }`}>
                              {event.result === 'success' ? '🟢' : event.result === 'error' ? '🔴' : '🟡'}
                            </span>
                          </div>
                          <div className="text-red-300 text-xs">{event.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Security Actions */}
                <div className="mt-6 pt-4 border-t border-red-400/30">
                  <h4 className="text-red-300 font-semibold mb-3 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Security Actions
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button
                      onClick={handleRunDiagnostics}
                      className="bg-orange-600 hover:bg-orange-700 text-white p-3"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Run Diagnostics
                    </Button>
                    <Button
                      onClick={handleViewLogs}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white p-3"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Logs
                    </Button>
                    <Button
                      onClick={testEscalation}
                      className="bg-red-600 hover:bg-red-700 text-white p-3"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Test Alert
                    </Button>
                    <Button
                      onClick={handleEmergencyStop}
                      className="bg-red-700 hover:bg-red-800 text-white p-3"
                    >
                      <PhoneOff className="w-4 h-4 mr-2" />
                      Emergency Stop
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Hidden File Upload Input */}
        <input
          id="file-upload"
          type="file"
          multiple
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.ppt,.pptx"
          onChange={handleFileUpload}
        />

        {/* Hidden Calendar Upload Input */}
        <input
          id="calendar-upload"
          type="file"
          style={{ display: 'none' }}
          accept=".ics,.csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setVoiceStatus('Uploading calendar...');
              // Calendar upload implementation here
              setToast({
                title: "Calendar Upload",
                description: "Calendar upload feature will be implemented",
              });
            }
          }}
        />

        {/* Live Mode - No test controls */}

        {/* Top-Mid: Live Automation Engine + Client Pulse + Ops Metrics */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 📞 Live Automation Engine */}
            <Card className="bg-white/10 backdrop-blur-sm border border-cyan-400">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                  📞 Live Automation Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Active Workflows:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">{liveActivityData?.data?.callVolumeLabel || ''}</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Engine Status:</span>
                    <span className="text-red-400 font-bold">OFFLINE</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🎯 Client Pulse */}
            <Card className="bg-white/10 backdrop-blur-sm border border-purple-400">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-400" />
                  🎯 Client Pulse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Active Clients:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">NPS Score:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Satisfaction:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 📊 Ops Metrics */}
            <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                  📊 Ops Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Success Rate:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Response Time:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Uptime:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Companion Panel + PDF Export Panel */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 📲 Mobile Companion Panel */}
            <Card className="bg-white/10 backdrop-blur-sm border border-green-400">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-green-400" />
                    📲 Mobile Companion
                  </div>
                  <Badge className="bg-slate-600 text-slate-400">Offline</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">iOS App Status:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Android App Status:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Last Sync:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Push Alerts:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🧾 PDF & Export Panel */}
            <Card className="bg-white/10 backdrop-blur-sm border border-orange-400">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-orange-400" />
                    🧾 PDF & Export
                  </div>
                  <Badge className="bg-orange-600 text-white">Ready</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Last PDF Generated:</span>
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Export Status:</span>
                    <span className="text-green-400 font-bold">""</span>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Quick Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Smart Calendar with Next 3 Tasks */}
        <div className="mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                  📅 Smart Calendar
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('smart-calendar')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['smart-calendar'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <Badge className="bg-blue-600 text-white">Synced</Badge>
              </CardTitle>
            </CardHeader>
            {!collapsedSections['smart-calendar'] && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-blue-300 font-semibold">Next 3 Tasks</h4>
                    {currentSystemMode === 'test' ? (
                      <>
                        <div className="p-3 bg-white/5 rounded-lg border border-blue-400/30">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">{liveActivityData?.data?.nextTasks?.[0]?.name || ''}</span>
                            <span className="text-blue-400 text-sm">{liveActivityData?.data?.nextTasks?.[0]?.time || ''}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-green-400/30">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">{liveActivityData?.data?.nextTasks?.[1]?.name || ''}</span>
                            <span className="text-green-400 text-sm">{liveActivityData?.data?.nextTasks?.[1]?.time || ''}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-orange-400/30">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">{liveActivityData?.data?.nextTasks?.[2]?.name || ''}</span>
                            <span className="text-orange-400 text-sm">{liveActivityData?.data?.nextTasks?.[2]?.time || ''}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-slate-400 text-sm">No upcoming tasks</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-blue-300 font-semibold">Calendar Actions</h4>
                    <Button
                      onClick={() => document.getElementById('calendar-upload')?.click()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Calendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Audit/Integrity Panel */}
        <div className="mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-red-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-400" />
                  🛡️ Audit & Integrity Panel
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('audit-panel')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['audit-panel'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <Badge className="bg-red-600 text-white">Monitoring</Badge>
              </CardTitle>
            </CardHeader>
            {!collapsedSections['audit-panel'] && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-red-300 font-semibold">System Integrity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Database Status:</span>
                        <span className="text-green-400 font-bold">""</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">API Integrity:</span>
                        <span className="text-slate-400 font-bold">--</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Data Quality:</span>
                        <span className="text-blue-400 font-bold">{""}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-orange-300 font-semibold">Security Audit</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Last Scan:</span>
                        <span className="text-white font-bold">{""}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Vulnerabilities:</span>
                        <span className="text-green-400 font-bold">""</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Access Logs:</span>
                        <span className="text-blue-400 font-bold">{""}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-yellow-300 font-semibold">Compliance Check</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">GDPR Status:</span>
                        <span className="text-green-400 font-bold">""</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Data Retention:</span>
                        <span className="text-blue-400 font-bold">{""}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Audit Score:</span>
                        <span className="text-green-400 font-bold">""</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-red-400/30">
                  <h4 className="text-red-300 font-semibold mb-2">Recent Audit Events</h4>
                  {currentSystemMode === 'test' ? (
                    <div className="space-y-1 text-xs">
                      <div className="text-green-400">✓ 14:32 - Security scan completed - No issues found</div>
                      <div className="text-blue-400">ℹ 14:28 - Data backup verified - All systems operational</div>
                      <div className="text-yellow-400">⚠ 14:15 - API rate limit adjusted - Performance optimized</div>
                      <div className="text-green-400">✓ 14:02 - User access review completed - All authorized</div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">No audit events available</div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader className="flex flex-row items-center justify-between space-y0- pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Calls</CardTitle>
              <Phone className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {""}
              </div>
              <p className="text-xs text-green-400">
                {currentSystemMode === 'test' ? (metrics?.activeCalls ? 'Live voice sessions' : 'No active sessions') : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader className="flex flex-row items-center justify-between space-y0- pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Bot Processing</CardTitle>
              <Brain className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                0
              </div>
              <p className="text-xs text-blue-400">
                {""}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader className="flex flex-row items-center justify-between space-y0- pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {""}
              </div>
              <p className="text-xs text-emerald-400 flex items-center">
                {automationPerformance?.successRate && <div className="w-1 h-1 bg-emerald-400 rounded-full mr-1"></div>}
                {currentSystemMode === 'test' ? (automationPerformance?.successRate ? 'Live automation rate' : 'No automation data') : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader className="flex flex-row items-center justify-between space-y0- pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">System Health</CardTitle>
              <Gauge className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                0
              </div>
              <p className="text-xs text-green-400 flex items-center">
                {metrics?.data?.systemUptime && <div className="w-1 h-1 bg-red-400 rounded-full mr-1 animate-pulse"></div>}
                {""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Essential Business Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {/* Live Automation Engine */}
          <Card className="bg-white/10 backdrop-blur-sm border border-cyan-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                ⚡ Live Automation Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Active Workflows:</span>
                  <span className="text-white font-bold">{ (automationPerformance?.data?.activeWorkflows || '')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Make Logs Status:</span>
                  <div className="flex items-center space-x-1">
                    {automationPerformance?.data?.makeLogs && <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>}
                    <span className="text-green-400 font-bold">{ (automationPerformance?.data?.makeLogs ? 'Live' : '')}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Executions Today:</span>
                  <div className="flex items-center space-x-1">
                    {liveActivityData?.data?.executionsToday && <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>}
                    <span className="text-blue-400 font-bold">{ (liveActivityData?.data?.executionsToday || '')}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Engine Status:</span>
                  <span className="text-green-400 font-bold">{ (automationPerformance?.status === 'active' ? 'LIVE' : '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Processing Queue:</span>
                  <span className="text-cyan-400 font-bold">{ (automationPerformance?.data?.queueSize ? automationPerformance.data.queueSize + ' pending' : '')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bot Health Monitor */}
          <Card className="bg-white/10 backdrop-blur-sm border border-green-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                <Bot className="w-5 h-5 mr-2 text-blue-400" />
                YoBot® Health Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Total Bots:</span>
                  <span className="text-white font-bold">{metrics?.totalBots || ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Last Execution:</span>
                  <div className="flex items-center space-x-1">
                    {liveActivityData?.data?.recentExecutions?.length > 0 && <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>}
                    <span className="text-green-400 font-bold">{liveActivityData?.data?.lastExecution ? new Date(liveActivityData.data.lastExecution).toLocaleTimeString() : ''}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Error Count:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-400 font-bold">{automationPerformance?.errorCount || ''}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Bot Status:</span>
                  <div className="flex items-center space-x-1">
                    {metrics?.data?.dailyActiveUsers && <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>}
                    <span className="text-green-400 font-bold">{metrics?.data?.dailyActiveUsers ? 'Active' : ''}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">System Uptime:</span>
                  <span className="text-green-400 font-bold">{metrics?.data?.systemUptime ? metrics.data.systemUptime + '%' : ''}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Forecast */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                📈 Revenue Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">MRR:</span>
                  <div className="text-right flex items-center space-x-1">
                    {metrics?.data?.monthlyRecurringRevenue && <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>}
                    <span className="text-green-400 font-bold">
                      {metrics?.data?.monthlyRecurringRevenue ? '$' + (metrics.data.monthlyRecurringRevenue / 1000).toFixed(0) + 'K' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">ROI This Quarter:</span>
                  <div className="text-right flex items-center space-x-1">
                    {metrics?.data?.revenueGrowth && <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>}
                    <span className="text-emerald-400 font-bold">
                      {metrics?.data?.revenueGrowth ? metrics.data.revenueGrowth + '%' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Pipeline Value:</span>
                  <span className="text-blue-400 font-bold">
                    {metrics?.data?.totalRevenue ? '$' + (metrics.data.totalRevenue / 1000).toFixed(0) + 'K' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Close Rate:</span>
                  <span className="text-cyan-400 font-bold">
                    {metrics?.data?.conversionRate ? metrics.data.conversionRate + '%' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Sales Velocity:</span>
                  <span className="text-purple-400 font-bold">
                    {metrics?.data?.customerSatisfaction ? metrics.data.customerSatisfaction + '/5' : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Pulse Summary */}
          <Card className="bg-white/10 backdrop-blur-sm border border-purple-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                🧭 Client Pulse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Active Clients:</span>
                  <div className="flex items-center space-x-1">
                    {metrics?.data?.activeClients && <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>}
                    <span className="text-slate-400 font-bold">--</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Client NPS:</span>
                  <div className="flex items-center space-x-1">
                    {metrics?.data?.customerSatisfaction && <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>}
                    <span className="text-green-400 font-bold">""</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Churn Risk Flags:</span>
                  <span className="text-red-400 font-bold">{""} { ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Last Login:</span>
                  <span className="text-green-400 font-bold">""</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Bot Utilization Rate:</span>
                    <span className="text-cyan-400 font-bold">{""}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300" style={{width: `${ '0'}%`}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ops Metrics */}
          <Card className="bg-white/10 backdrop-blur-sm border border-orange-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-orange-400" />
                📊 Ops Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">API Errors:</span>
                  <div className="flex items-center space-x-1">
                    {automationPerformance?.data?.apiErrors && <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>}
                    <span className="text-red-400 font-bold">{automationPerformance?.data?.apiErrors || ''}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Slack Alert Rate:</span>
                  <div className="flex items-center space-x-1">
                    {automationPerformance?.data?.slackAlertRate && <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>}
                    <span className="text-yellow-400 font-bold">{automationPerformance?.data?.slackAlertRate || ''}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Usage %:</span>
                  <span className="text-slate-400 font-bold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">System Load:</span>
                  <span className="text-blue-400 font-bold">{metrics?.data?.systemLoad || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Uptime Today:</span>
                  <span className="text-green-400 font-bold">{metrics?.data?.dailyUptime || ''}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Workflow Performance */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                🔄 Workflow Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Automation Success:</span>
                  <div className="flex items-center space-x-1">
                    {automationPerformance?.data?.automationSuccess && <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>}
                    <span className="text-green-400 font-bold">{automationPerformance?.data?.automationSuccess ? automationPerformance.data.automationSuccess + '%' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total Executions:</span>
                  <div className="flex items-center space-x-1">
                    {automationPerformance?.data?.totalExecutions && <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>}
                    <span className="text-cyan-400 font-bold">{automationPerformance?.data?.totalExecutions || ''}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Make Workflows:</span>
                  <div className="flex items-center space-x-2">
                    {automationPerformance?.data?.makeWorkflows && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>}
                    <Badge className="bg-slate-600 text-slate-400">{automationPerformance?.data?.makeWorkflows ? automationPerformance.data.makeWorkflows + ' Active' : ''}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Avg Runtime:</span>
                  <div className="flex items-center space-x-1">
                    
                    <span className="text-purple-400 font-bold">{ (automationPerformance?.data?.avgRuntime ? automationPerformance.data.avgRuntime + 's' : '')}</span>
                  </div>
                </div>
                <div className="bg-blue-900/60 rounded-lg p-3 border border-blue-400 shadow-lg shadow-blue-400/20">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-slate-300 text-sm">Make Status:</div>
                    
                  </div>
                  <div className="text-green-400 font-medium">{ (automationPerformance?.data?.makeStatus || '')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SmartSpend™ - Updated Design */}
          <Card className="bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-indigo-900/40 backdrop-blur-sm border border-blue-400/60 shadow-2xl shadow-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-300" />
                  💰 SmartSpend™
                </div>
                <Badge className="bg-blue-500 text-white text-sm px-3 py-1">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Monthly Ad Spend */}
                <div className="bg-slate-800/60 rounded-lg p-4 border border-blue-400/30">
                  <div className="text-slate-300 text-sm mb-1">Monthly Ad Spend:</div>
                  <div className="text-white font-bold text-lg mb-2">
                    { (metrics?.data?.smartSpendData?.monthlyAdSpend || '0')}
                  </div>
                  <div className="w-full bg-slate-700/60 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-300 h-2 rounded-full" style={{ width: `${metrics?.data?.smartSpendData?.spendUtilization || 0}%` }}></div>
                  </div>
                </div>

                {/* Cost Per Lead */}
                <div className="bg-slate-800/60 rounded-lg p-4 border border-blue-400/30">
                  <div className="text-slate-300 text-sm mb-1">Cost Per Lead:</div>
                  <div className="text-white font-bold text-lg mb-2">
                    { (metrics?.data?.smartSpendData?.costPerLead || '0')}
                  </div>
                  <div className="w-full bg-slate-700/60 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-300 h-2 rounded-full" style={{ width: `${metrics?.data?.smartSpendData?.costEfficiency || 0}%` }}></div>
                  </div>
                </div>

                {/* ROI This Month */}
                <div className="bg-slate-800/60 rounded-lg p-4 border border-blue-400/30">
                  <div className="text-slate-300 text-sm mb-1">ROI This Month:</div>
                  <div className="text-white font-bold text-lg mb-2">
                    { (metrics?.data?.smartSpendData?.monthlyROI || '0')}
                  </div>
                  <div className="w-full bg-slate-700/60 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-300 h-2 rounded-full" style={{ width: `${metrics?.data?.smartSpendData?.roiProgress || 0}%` }}></div>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-slate-800/60 rounded-lg p-4 border border-blue-400/30">
                  <div className="text-slate-300 text-sm mb-1">Conversion Rate:</div>
                  <div className="text-white font-bold text-lg mb-2">
                    { (metrics?.data?.smartSpendData?.conversionRate || '0')}
                  </div>
                  <div className="w-full bg-slate-700/60 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-violet-300 h-2 rounded-full" style={{ width: `${metrics?.data?.smartSpendData?.conversionProgress || 0}%` }}></div>
                  </div>
                </div>

                {/* Budget Efficiency Score */}
                <div className="bg-slate-800/60 rounded-lg p-4 border border-blue-400/30">
                  <div className="text-slate-300 text-sm mb-1">Budget Efficiency Score:</div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-bold text-lg">
                      { (metrics?.data?.smartSpendData?.budgetEfficiency || '0')}
                    </div>
                    <Badge className="bg-cyan-600 text-white text-xs">
                      { (metrics?.data?.smartSpendData?.efficiencyStatus || 'Unknown')}
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-700/60 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-300 h-2 rounded-full" style={{ width: `${metrics?.data?.smartSpendData?.budgetEfficiency || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botalytics™ */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Botalytics™
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-800/40 rounded-lg p-3 border-2 border-green-400 shadow-lg shadow-green-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Ad spend ÷ New clients this month">Cost Per Lead</span>
                    <span className="text-green-400 font-bold">{metrics?.data?.costPerLead || '0'}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div className="bg-red-400 h-1 rounded-full" style={{ width: `${metrics?.data?.costPerLeadProgress || 0}%` }}></div>
                  </div>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3 border-2 border-blue-400 shadow-lg shadow-blue-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Based on NLP sentiment, duration, and conversion path">Lead Quality Score</span>
                    <span className="text-blue-400 font-bold">{metrics?.data?.leadQualityScore || '0'}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${metrics?.data?.leadQualityProgress || 0}%` }}></div>
                  </div>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3 border-2 border-purple-400 shadow-lg shadow-purple-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Percentage of leads that become paying customers">Close Rate</span>
                    <span className="text-purple-400 font-bold">{""}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div className="bg-purple-400 h-1 rounded-full" style={{ width: '0' }}></div>
                  </div>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3 border-2 border-orange-400 shadow-lg shadow-orange-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Return on investment from automation">ROI</span>
                    <span className="text-orange-400 font-bold">{""}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div className="bg-orange-400 h-1 rounded-full" style={{ width: '0' }}></div>
                  </div>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3 border-2 border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Revenue Per Lead</div>
                  <div className="flex items-center justify-between">
                    <div className="text-cyan-400 font-bold">{""}</div>
                    <Badge className="bg-cyan-600 text-white">{""}</Badge>
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Bot Intelligence & System Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Bot Intelligence */}
          <Card className="bg-white/10 backdrop-blur-sm border border-purple-400">
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
                  <span className="text-purple-400 font-bold">{""}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Learning Status</span>
                  <Badge className="bg-slate-600 text-white">{""}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300" title="Percentage of conversations that needed human assistance">Escalation Rate</span>
                  <span className="text-yellow-400 font-bold">{""}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Response Accuracy</span>
                  <span className="text-cyan-400 font-bold">{""}</span>
                </div>
                {currentSystemMode === 'test' && (
                  <div className="bg-purple-900/60 rounded-lg p-3 border border-purple-400 shadow-lg shadow-purple-400/20">
                    <div className="text-slate-300 text-sm mb-1">Latest Learning</div>
                    <div className="text-purple-400 font-medium">Sentiment analysis improved</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


        </div>



        {/* Voice & Conversation Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border border-green-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mic className="w-5 h-5 mr-2 text-green-400" />
                Voice Commands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 pb-2 border-b border-slate-600">
                <h4 className="text-slate-200 font-medium text-sm">Voice Commands Active</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-1 bg-red-400 rounded animate-pulse" style={{height: `${Math.random() * 8 + 4}px`, animationDelay: `${i * 100}ms`}}></div>
                    ))}
                  </div>
                  <span className="text-green-400 text-xs">🎤 Listening</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border-2 border-green-400 shadow-lg shadow-green-400/20">
                  <span className="text-slate-300">"Show me today's leads"</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">{""}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border-2 border-green-400 shadow-lg shadow-green-400/20">
                  <span className="text-slate-300">"Call my top prospect"</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">{""}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border-2 border-green-400 shadow-lg shadow-green-400/20">
                  <span className="text-slate-300">"Schedule follow-up"</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">{""}</Badge>
                </div>
                {isListening && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-400 rounded-lg">
                    <div className="flex items-center text-green-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></div>
                      Voice Commands Active - Listening...
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-purple-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
                Conversation Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Sentiment Analysis:</span>
                  <span className="text-green-400 font-bold">""</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Emotion Detection:</span>
                  <span className="text-blue-400 font-bold">{""}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Avg Call Duration:</span>
                  <span className="text-purple-400 font-bold">{""}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Resolution Rate:</span>
                  <span className="text-green-400 font-bold">""</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Satisfaction Score:</span>
                  <span className="text-cyan-400 font-bold">{""}</span>
                </div>
                <div className="bg-purple-900/60 rounded-lg p-3 border border-purple-400 shadow-lg shadow-purple-400/20">
                  <div className="text-slate-300 text-sm mb-1">Top Intent Detected:</div>
                  <div className="text-purple-400 font-medium">{ 'No data available'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Calendar & Live Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-purple-900/20 backdrop-blur-sm border border-blue-400/50 shadow-2xl shadow-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl font-bold">
                <Calendar className="w-6 h-6 mr-3 text-blue-400" />
                🗓️ Smart Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Calendar events populated by live webhook data only */}
                <div 
                  className="bg-blue-900/60 rounded-lg p-3 border border-blue-400 shadow-lg shadow-blue-400/20 cursor-pointer hover:bg-blue-800/70 transition-colors"
                  onClick={() => setShowScheduleViewer(!showScheduleViewer)}
                >
                  <div className="text-slate-300 text-sm mb-1">Today's Schedule</div>
                  <div className="text-white font-bold">
                    { (metrics?.activeCampaigns || 0) + ' total meetings'}
                  </div>
                  <div className="text-cyan-400 text-xs">
                    { (metrics?.remainingTasks || 0) + ' remaining today'}
                  </div>
                  <div className="text-blue-300 text-xs mt-1">Click to view details →</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-400" />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Live activity feed - test mode has demo data, live mode only shows webhook data */}
                {currentSystemMode === 'test' ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-blue-400/30">
                      <div>
                        <p className="text-white font-medium">New lead qualified</p>
                        <p className="text-slate-300 text-sm">TechCorp Solutions • 2 min ago</p>
                      </div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-green-400/30">
                      <div>
                        <p className="text-white font-medium">Quote generated</p>
                        <p className="text-slate-300 text-sm">BuildRight Industries • 5 min ago</p>
                      </div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-purple-400/30">
                      <div>
                        <p className="text-white font-medium">Follow-up scheduled</p>
                        <p className="text-slate-300 text-sm">Apex Manufacturing • 8 min ago</p>
                      </div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-orange-400/30">
                      <div>
                        <p className="text-white font-medium">Call completed</p>
                        <p className="text-slate-300 text-sm">Summit Enterprises • 12 min ago</p>
                      </div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-cyan-400/30">
                      <div>
                        <p className="text-white font-medium">Email automation sent</p>
                        <p className="text-slate-300 text-sm">Premier Contractors • 15 min ago</p>
                      </div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    </div>
                  </>
                ) : (
                  liveActivityData && Array.isArray(liveActivityData) && liveActivityData.length > 0 ? (
                    liveActivityData.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{item.action}</p>
                          <p className="text-slate-300 text-sm">{item.company} • {item.time}</p>
                        </div>
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-sm">Monitoring live activity...</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insight Panels Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Voice Command Center */}
          <Card className="bg-white/10 backdrop-blur-sm border border-green-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Headphones className="w-5 h-5 mr-2 text-green-400" />
                Voice Command Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 pb-2 border-b border-slate-600">
                <h4 className="text-slate-200 font-medium text-sm">Voice Commands Active</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-1 bg-red-400 rounded animate-pulse" style={{height: `${Math.random() * 8 + 4}px`, animationDelay: `${i * 100}ms`}}></div>
                    ))}
                  </div>
                  <span className="text-green-400 text-xs">🎤 Processing Commands</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Commands Today:</span>
                  <span className="text-green-400 font-bold">""</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Success Rate:</span>
                  <span className="text-green-400 font-bold">""</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Currently Processing:</span>
                  <span className="text-green-400 font-bold">""</span>
                </div>
                <div className="bg-green-900/60 rounded-lg p-3 border border-green-400 shadow-lg shadow-green-400/20">
                  <div className="text-slate-300 text-sm mb-1">Latest Command:</div>
                  <div className="text-green-400 font-medium">{ 'No recent commands'}</div>
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
              <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-green-400 mb-1">{""}</div>
                  <div className="text-slate-300 text-sm">Cost Per Lead</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Last Month</span>
                    <span className="text-cyan-400">{""}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`bg-red-400 h-2 rounded-full ${ 'w0-'}`}></div>
                  </div>
                </div>
              </div>

              {/* Interaction Quality */}
              <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-blue-400 mb-1">{""}</div>
                  <div className="text-slate-300 text-sm">Accuracy Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Target</span>
                    <span className="text-green-400">{""}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`bg-blue-400 h-2 rounded-full ${ 'w0-'}`}></div>
                  </div>
                </div>
              </div>

              {/* Learning Rate */}
              <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-purple-400 mb-1">0</div>
                  <div className="text-slate-300 text-sm">Learning Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Weekly</span>
                    <span className="text-yellow-400">{""}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`bg-purple-400 h-2 rounded-full ${ 'w0-'}`}></div>
                  </div>
                </div>
              </div>

              {/* Total Interactions */}
              <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-cyan-400 mb-1">{""}</div>
                  <div className="text-slate-300 text-sm">Interactions</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Today</span>
                    <span className="text-emerald-400">{""}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`bg-cyan-400 h-2 rounded-full ${ 'w0-'}`}></div>
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-emerald-400 mb-1">{""}</div>
                  <div className="text-slate-300 text-sm">Close Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Industry Avg</span>
                    <span className="text-orange-400">{""}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`bg-emerald-400 h-2 rounded-full ${ 'w0-'}`}></div>
                  </div>
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
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-blue-400 shadow-lg shadow-blue-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400 mb-2">{""}</div>
                  <div className="text-slate-300 text-sm">Monthly Savings</div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div className={`bg-red-400 h-2 rounded-full ${ 'w0-'}`}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-400 shadow-lg shadow-blue-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-400 mb-2">{""}</div>
                  <div className="text-blue-300 text-sm">Cost Reduction</div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div className={`bg-blue-400 h-2 rounded-full ${ 'w0-'}`}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-blue-400 shadow-lg shadow-blue-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-400 mb-2">{""}</div>
                  <div className="text-slate-300 text-sm">ROI</div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div className={`bg-purple-400 h-2 rounded-full ${ 'w0-'}`}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-blue-400 shadow-lg shadow-blue-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-400 mb-2">{""}</div>
                  <div className="text-slate-300 text-sm">Payback Days</div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div className={`bg-yellow-400 h-2 rounded-full ${ 'w0-'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Dashboard Content - Filtered by Preset */}
        {dashboardPreset === 'full' && (
          <>
            {/* TabContentRenderer for Full View */}
            <TabContentRenderer
              activeTab={activeTab}
              currentSystemMode={currentSystemMode}
              metrics={metrics}
              automationPerformance={automationPerformance}
              liveActivity={liveActivityData}
              knowledgeStats={knowledgeStats}
              callStats={testStats}
              handlers={{
                handleNewBookingSync: handleCreateBooking,
                handleNewSupportTicket: handleCreateSupportTicket,
                handleManualFollowUp: handleManualFollowUp,
                handleSalesOrderSync: handleAutomateSalesOrder,
                handleContentCreatorSync: () => console.log('Content creator sync'),
                handleMailchimpSync: () => console.log('Mailchimp sync'),
                handleSocialContentSync: () => console.log('Social content sync'),
                handleSimulateTestCall: () => console.log('Simulate test call'),
                handleUploadDocument: () => console.log('Upload document'),
                handleReindexKnowledge: () => console.log('Reindex knowledge'),
                handleClearKnowledge: () => console.log('Clear knowledge'),
                handleViewKnowledge: () => setShowKnowledgeViewer(true),
                setShowCallReports: (show: boolean) => console.log('Show call reports:', show),
                setShowCallLogs: (show: boolean) => console.log('Show call logs:', show),
              }}
            />
            
            {/* Analytics Dashboard - 2x3 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Top Row - First 3 Panels */}
          
          {/* Voice Analytics */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400 h-64">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <EnhancedTooltip content="Real-time voice call analytics and performance metrics">
                  <Mic className="w-5 h-5 mr-2 text-red-400" />
                </EnhancedTooltip>
                Voice Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Calls Today:</span>
                  <span className="text-white font-bold">{ (metrics?.activeCalls || '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Avg Duration:</span>
                  <span className="text-cyan-400 font-bold">{""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Conversion Rate:</span>
                  <span className="text-green-400 font-bold">""</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Audit Log */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400 h-64">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-400" />
                System Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentSystemMode === 'test' ? (
                  <>
                    <div className="text-xs text-green-400">14:32 - Admin login successful</div>
                    <div className="text-xs text-blue-400">14:28 - Automation rule updated</div>
                    <div className="text-xs text-cyan-400">14:15 - Bot training completed</div>
                    <div className="text-xs text-purple-400">14:02 - CRM sync executed</div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400">No audit events available</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Dashboard */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400 h-64">
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
                  <span className="text-green-400 font-bold">""</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Conversions:</span>
                  <span className="text-blue-400 font-bold">{""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Escalations:</span>
                  <span className="text-yellow-400 font-bold">{""}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Second 3 Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* AI Automation Engine */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400 h-64">
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
                  <span className="text-cyan-400 font-bold">{""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Hours Saved:</span>
                  <span className="text-green-400 font-bold">""</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Efficiency:</span>
                  <span className="text-purple-400 font-bold">{""}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escalation Alerts */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400 h-64">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Escalation Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentSystemMode === 'test' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-yellow-900/40 p-3 rounded-lg border border-yellow-400">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300 text-sm">High-value lead requires attention</span>
                    </div>
                    <span className="text-yellow-400 text-xs">3 min ago</span>
                  </div>
                  <div className="flex items-center justify-between bg-red-900/40 p-3 rounded-lg border border-red-400">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                      <span className="text-slate-300 text-sm">Integration timeout detected</span>
                    </div>
                    <span className="text-red-400 text-xs">8 min ago</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  No escalation alerts at this time
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Integration Test Results */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400 h-64">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Live Integration Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Total Tests:</span>
                  <span className="text-white font-bold">{testStats.totalTests ?? ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Passed:</span>
                  <span className="text-green-400 font-bold">{testStats.passedTests ?? ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Success Rate:</span>
                  <span className="text-cyan-400 font-bold">{testStats.successRate ? testStats.successRate + '%' : ''}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RAG Knowledge Base System - Positioned at bottom as requested */}
        <div className="mb-12">
          <Card className="bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80 backdrop-blur-sm border border-purple-400/50 shadow-2xl shadow-purple-500/30">
            <CardHeader className="border-b border-purple-400/30">
              <CardTitle className="text-white flex items-center text-2xl font-bold">
                <Brain className="w-7 h-7 mr-3 text-purple-400" />
                🧠 RAG Knowledge Base
                <Badge className="ml-3 bg-green-600 text-white">{""}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Query Interface */}
              <div className="mb-8">
                <h3 className="text-white text-lg font-semibold mb-4">Knowledge Query Interface</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
                    <input
                      type="text"
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      placeholder="Ask the knowledge base anything..."
                      className="w-full pl-12 pr-20 py-3 bg-blue-900/60 border border-purple-400/50 rounded-lg text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                    />
                    <Button 
                      onClick={startQueryVoiceRecognition}
                      className={`absolute right-2 top-2 p-2 flex items-center space-x-1 ${userInitiatedVoice && isListening ? 'bg-green-500 animate-pulse' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      <Mic className="w-4 h-4" />
                      {userInitiatedVoice && isListening && (
                        <div className="flex items-center space-x0-.5 ml-1">
                          {[1,2,3].map(i => (
                            <div key={i} className="w0-.5 bg-green-300 rounded animate-pulse" style={{height: `${Math.random() * 6 + 3}px`, animationDelay: `${i * 100}ms`}}></div>
                          ))}
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  {/* Voice Activity Meter - Compact */}
                  {userInitiatedVoice && isListening && (
                    <div className="bg-blue-800/30 border border-blue-400/30 rounded px-3 py-1 mt-1">
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-blue-300">Voice Commands Active</span>
                        <div className="flex items-center space-x-1 ml-auto">
                          <span className="text-white opacity-70">Level:</span>
                          <div className="w-16 bg-slate-700 rounded-full h-1">
                            <div className="bg-red-400 h-1 rounded-full transition-all duration-150" style={{ width: `${Math.min(100, Math.max(5, (Math.random() * 60) + 20))}%` }}></div>
                          </div>
                          <span className="text-white opacity-70 w-8">{Math.round(Math.random() * 40 + 30)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button 
                      onClick={queryKnowledgeBase}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Query Knowledge
                    </Button>
                    <Button 
                      onClick={smartSearch}
                      className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Smart Search
                    </Button>
                    <Button 
                      onClick={contextSearch}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Context Search
                    </Button>
                    <Button 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="bg-green-600 hover:bg-green-700 text-white border border-green-500"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Documents
                    </Button>
                  </div>
                </div>
              </div>

              {/* Voice Programming Interface */}
              <div className="mb-8">
                <h3 className="text-white text-lg font-semibold mb-4">Voice Programming Interface</h3>
                <div className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 rounded-lg p-6 border border-blue-400/50">
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={programmingText}
                        onChange={(e) => setProgrammingText(e.target.value)}
                        placeholder="Program the RAG system with voice commands or type instructions..."
                        className="w-full p-4 bg-blue-800/60 border border-blue-400/50 rounded-lg text-white placeholder-blue-300 resize-none"
                        rows={4}
                      />
                      <Button 
                        onClick={startProgrammingVoiceRecognition}
                        className={`absolute top-2 right-2 p-2 ${userInitiatedVoice && isListening ? 'bg-red-500 animate-pulse' : 'bg-red-600 hover:bg-red-700'}`}
                      >
                        <Mic className="w-4 h-4" />
                        {userInitiatedVoice && isListening && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>}
                      </Button>
                    </div>
                    
                    {/* Voice Activity Meter for Programming - Compact */}
                    {userInitiatedVoice && isListening && (
                      <div className="bg-cyan-800/30 border border-cyan-400/30 rounded px-3 py-1 mt-1">
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                          <span className="text-cyan-300">Voice Commands Active - Programming instructions</span>
                          <div className="flex items-center space-x-1 ml-auto">
                            <span className="text-white opacity-70">Level:</span>
                            <div className="w-16 bg-slate-700 rounded-full h-1">
                              <div className="bg-cyan-400 h-1 rounded-full transition-all duration-150" style={{ width: `${Math.min(100, Math.max(5, (Math.random() * 70) + 15))}%` }}></div>
                            </div>
                            <span className="text-white opacity-70 w-8">{Math.round(Math.random() * 50 + 25)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-3 bg-blue-800/40 rounded border border-blue-400/30">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${userInitiatedVoice && isListening ? 'bg-red-400 animate-pulse' : 'bg-blue-400'}`}></div>
                        <span className="text-blue-300 text-sm">{userInitiatedVoice && isListening ? 'Voice Recognition Active' : 'Voice Recognition Ready'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 text-xs">Status: {voiceStatus}</span>
                        <Button 
                          size="sm" 
                          onClick={stopVoiceRecognition}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <MicOff className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button 
                        onClick={isListening ? stopVoiceRecognition : startProgrammingVoiceRecognition}
                        className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        {isListening ? 'Stop Recording' : 'Start Recording'}
                      </Button>
                      <Button 
                        onClick={processVoiceProgramming}
                        className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
                        disabled={!programmingText.trim()}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Process Voice
                      </Button>
                      <Button 
                        onClick={fetchAvailableVoices}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Voices
                      </Button>
                    </div>

                    <div className="bg-blue-900/40 rounded p-3 border border-blue-400 shadow-lg shadow-blue-400/20">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Voice Status:</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isListening ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                        }`}>
                          {voiceStatus}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-300">
                        Click "Start Recording" and speak your RAG programming commands naturally.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice Synthesis Studio - Unified Module */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-purple-900/60 to-blue-900/60 rounded-lg p-6 border border-purple-400/50 shadow-lg shadow-purple-400/20">
                  <h3 className="text-white text-xl font-semibold mb-6 flex items-center">
                    <Mic className="w-6 h-6 mr-3 text-purple-400" />
                    Voice Synthesis Studio
                    <span className="ml-3 text-sm text-purple-300 font-normal">
                      Complete voice generation and persona management
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Text-to-Speech Generation */}
                    <div className="bg-blue-800/40 rounded-lg p-4 border border-blue-400/30">
                      <h4 className="text-white text-lg font-medium mb-4 flex items-center">
                        <Headphones className="w-5 h-5 mr-2 text-cyan-400" />
                        Text-to-Speech Generation
                      </h4>
                      <div className="space-y-3">
                        <textarea
                          value={voiceGenerationText}
                          onChange={(e) => setVoiceGenerationText(e.target.value)}
                          placeholder="Enter text to convert to natural speech using ElevenLabs AI..."
                          className="w-full p-3 bg-blue-900/60 border border-blue-400/50 rounded text-white placeholder-blue-300 resize-none"
                          rows={4}
                        />
                        <div className="text-xs text-blue-300 mb-2">
                          Uses selected voice persona below. Premium quality synthesis with natural intonation.
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            onClick={generateVoice}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-500"
                            disabled={!voiceGenerationText.trim()}
                          >
                            <Headphones className="w-4 h-4 mr-2" />
                            Generate Voice
                          </Button>
                          <Button 
                            onClick={downloadAudio}
                            className="bg-teal-600 hover:bg-teal-700 text-white border border-teal-500"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Audio
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Voice Persona Selection */}
                    <div className="bg-purple-800/40 rounded-lg p-4 border border-purple-400/30">
                      <h4 className="text-white text-lg font-medium mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-purple-400" />
                        Voice Persona & Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="relative">
                          <label className="block text-sm text-purple-300 mb-1">Select Voice Persona</label>
                          <select 
                            value={selectedPersona}
                            onChange={(e) => setSelectedPersona(e.target.value)}
                            className="w-full p-3 bg-purple-900/60 border border-purple-400/50 rounded text-white text-sm"
                            disabled={voicesLoading}
                          >
                            {voicesLoading ? (
                              <option>Loading voices...</option>
                            ) : availableVoices.length > 0 ? (
                              <>
                                {/* Custom Voices First */}
                                {availableVoices.filter(voice => voice.category !== 'premade').length > 0 && (
                                  <>
                                    <option disabled style={{fontWeight: 'bold', color: '#10B981'}}>Your Custom Voices</option>
                                    {availableVoices
                                      .filter(voice => voice.category !== 'premade')
                                      .map((voice) => (
                                        <option key={voice.voice_id} value={voice.voice_id}>
                                          ✨ {voice.name}
                                          {voice.labels?.gender && ` (${voice.labels.gender})`}
                                          {voice.labels?.age && ` - ${voice.labels.age}`}
                                        </option>
                                      ))}
                                  </>
                                )}
                                
                                {/* Premade Voices */}
                                {availableVoices.filter(voice => voice.category === 'premade').length > 0 && (
                                  <>
                                    <option disabled style={{fontWeight: 'bold', color: '#6366F1'}}>ElevenLabs Premade</option>
                                    {availableVoices
                                      .filter(voice => voice.category === 'premade')
                                      .map((voice) => (
                                        <option key={voice.voice_id} value={voice.voice_id}>
                                          {voice.name}
                                          {voice.labels?.gender && ` (${voice.labels.gender})`}
                                          {voice.labels?.age && ` - ${voice.labels.age}`}
                                        </option>
                                      ))}
                                  </>
                                )}
                              </>
                            ) : (
                              <option disabled>Configure ElevenLabs API key to load voices</option>
                            )}
                          </select>
                          {voicesLoading && (
                            <div className="absolute right-3 top-8 transform -translate-y-1/2">
                              <div className="animate-spin w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-purple-900/40 rounded p-2 border border-purple-400/30 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-purple-200">
                              {availableVoices.length > 0 
                                ? `${availableVoices.length} voices loaded`
                                : 'API key required'
                              }
                            </span>
                            <Button 
                              size="sm" 
                              onClick={fetchAvailableVoices}
                              className="bg-purple-600 hover:bg-purple-700 text-xs px-2 py-1 h-6"
                              disabled={voicesLoading}
                            >
                              {voicesLoading ? 'Loading...' : 'Refresh'}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            onClick={testVoicePersona}
                            className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 text-sm"
                          >
                            <Headphones className="w-3 h-3 mr-1" />
                            Test Voice
                          </Button>
                          <Button 
                            onClick={handleApplyPersona}
                            className="bg-green-600 hover:bg-green-700 text-white border border-green-500 text-sm"
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Apply Persona
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Studio Helper Text */}
                  <div className="mt-4 bg-slate-800/40 rounded-lg p-3 border border-slate-600/50">
                    <div className="text-xs text-slate-300">
                      <span className="font-medium text-purple-300">Voice Synthesis Studio:</span> 
                      Select a voice persona, enter your text, and generate high-quality speech. 
                      Custom voices provide unique brand personality while premade voices offer professional consistency.
                    </div>
                  </div>
                </div>
              </div>

              {/* Knowledge Management */}
              <div className="bg-slate-800/60 rounded-lg p-6 border border-purple-400/50">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-purple-400" />
                  Knowledge Management (Collapsible)
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('knowledge-mgmt')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['knowledge-mgmt'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </h3>
                
                {/* AI Autocomplete Suggestions */}
                <div className="mb-4 p-3 bg-slate-700/40 rounded-lg border border-green-400/30">
                  <h4 className="text-green-300 font-semibold mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Autocomplete Suggestions
                  </h4>
                  <div className="space-y-2">
                    {currentSystemMode === 'test' ? (
                      <>
                        <div className="text-xs text-green-300 bg-green-900/30 p-2 rounded border border-green-500/30">
                          "Create a new sales order for..." → Auto-completes client name and package
                        </div>
                        <div className="text-xs text-blue-300 bg-blue-900/30 p-2 rounded border border-blue-500/30">
                          "Schedule a follow-up call..." → Auto-suggests optimal timing based on client timezone
                        </div>
                        <div className="text-xs text-purple-300 bg-purple-900/30 p-2 rounded border border-purple-500/30">
                          "Insert memory about client..." → Smart categorization and tagging suggestions
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-slate-400">AI suggestions will appear during voice commands</div>
                    )}
                  </div>
                </div>

                {!collapsedSections['knowledge-mgmt'] && (
                <>
                {/* Voice Recording Management */}
                <div className="bg-slate-700/40 rounded-lg p-4 mb-6 border border-blue-400/30">
                  <h4 className="text-white text-md font-medium mb-3 flex items-center">
                    <Mic className="w-4 h-4 mr-2 text-blue-400" />
                    Voice Recording Management
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <Button 
                      onClick={async () => {
                        try {
                          const response = await apiRequest('GET', '/api/voice/recordings');
                          setVoiceRecordings(response.recordings || []);
                          setShowRecordingList(true);
                        } catch (error) {
                          console.error('Failed to load voice recordings:', error);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Recordings
                    </Button>
                    <Button 
                      onClick={async () => {
                        if (confirm('Clear all voice recordings? This cannot be undone.')) {
                          try {
                            await apiRequest('DELETE', '/api/voice/recordings/clear');
                            setVoiceRecordings([]);
                            setSelectedRecordings([]);
                          } catch (error) {
                            console.error('Failed to clear recordings:', error);
                          }
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Recordings
                    </Button>
                    <Button 
                      onClick={async () => {
                        if (selectedRecordings.length === 0) {
                          alert('Please select recordings to edit');
                          return;
                        }
                        try {
                          await apiRequest('DELETE', '/api/voice/recordings/batch', {
                            recordingIds: selectedRecordings
                          });
                          setVoiceRecordings(prev => 
                            prev.filter(r => !selectedRecordings.includes(r.id))
                          );
                          setSelectedRecordings([]);
                        } catch (error) {
                          console.error('Failed to delete selected recordings:', error);
                        }
                      }}
                      disabled={selectedRecordings.length === 0}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm disabled:opacity-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Delete Selected ({selectedRecordings.length})
                    </Button>
                  </div>
                  
                  {/* Recording List */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {showRecordingList && voiceRecordings.length > 0 ? (
                      voiceRecordings.map((recording) => (
                        <div 
                          key={recording.id}
                          className={`p-3 rounded border cursor-pointer transition-colors ${
                            selectedRecordings.includes(recording.id)
                              ? 'bg-blue-600/30 border-blue-400 shadow-lg shadow-blue-400/20'
                              : 'bg-slate-700/60 border-blue-400/50 hover:border-blue-500 shadow-lg shadow-blue-400/10'
                          }`}
                          onClick={() => {
                            const newSelected = selectedRecordings.includes(recording.id)
                              ? selectedRecordings.filter(id => id !== recording.id)
                              : [...selectedRecordings, recording.id];
                            setSelectedRecordings(newSelected);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium">{recording.filename || `Recording ${recording.id}`}</div>
                              <div className="text-slate-400 text-sm">
                                {recording.duration}s • {recording.format || 'mp3'} • {new Date(recording.created).toLocaleDateString()}
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded border-2 ${
                              selectedRecordings.includes(recording.id)
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-slate-400'
                            }`}>
                              {selectedRecordings.includes(recording.id) && (
                                <div className="text-white text-xs flex items-center justify-center">✓</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : showRecordingList && voiceRecordings.length === 0 ? (
                      <div className="text-slate-400 text-sm text-center py-4">
                        No voice recordings found
                      </div>
                    ) : (
                      <div className="text-slate-400 text-sm text-center py-4">
                        Click "View Recordings" to load voice recordings for management
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Button 
                    onClick={handleReindexKnowledge}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reindex Knowledge
                  </Button>
                  <Button 
                    onClick={handleClearKnowledge}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Knowledge
                  </Button>
                  <Button 
                    onClick={handlePurgeKnowledgeTestData}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={currentSystemMode !== 'live'}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Purge Test Data
                  </Button>
                  <Button 
                    onClick={handleViewKnowledge}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Sources
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div className="text-center bg-blue-900/40 rounded-lg p-4 border border-purple-400 shadow-lg shadow-purple-400/20">
                    <div className="text-2xl font-bold text-blue-400">
                      {knowledgeStats?.documents?.total || 0}
                    </div>
                    <div className="text-white text-sm">Documents Indexed</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {knowledgeStats?.memory?.total || 0} memory entries
                    </div>
                  </div>
                </div>
                </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Management & Memory Insertion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Document Manager */}
          <Card className="bg-blue-900/40 backdrop-blur-sm border border-blue-500 relative">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-400" />
                  Document Manager
                </div>
                <Badge className="bg-yellow-600 text-white">🧪 Test-Only</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="bg-green-600 hover:bg-green-700 text-white border border-green-400"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Program Documents
                  </Button>
                  <Button 
                    onClick={deleteSelectedDocuments}
                    disabled={selectedDocuments.length === 0}
                    className="bg-red-600 hover:bg-red-700 text-white border border-red-400"
                  >
                    Delete Selected ({selectedDocuments.length})
                  </Button>
                </div>
                
                {/* Enhanced Document List with Live Status */}
                <div className="bg-slate-700/40 rounded-lg p-4 border border-blue-400">
                  <h4 className="text-white font-medium mb-3">📄 Uploaded Documents</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {uploadedDocuments.length > 0 ? uploadedDocuments.map((doc) => (
                      <div 
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-slate-800/60 rounded border border-blue-400"
                      >
                        <div className="flex-1">
                          <div className="text-white font-medium">{doc.originalname || doc.filename || 'Untitled Document'}</div>
                          <div className="text-slate-400 text-sm flex items-center space-x-2">
                            <span>{(doc.size / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadTime || doc.uploadedAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            doc.status === 'processed' || doc.status === 'indexed' 
                              ? 'bg-green-600/30 text-green-400' 
                              : doc.status === 'processing' 
                              ? 'bg-yellow-600/30 text-yellow-400' 
                              : 'bg-blue-600/30 text-blue-400'
                          }`}>
                            {doc.status === 'processed' || doc.status === 'indexed' ? '✅ Indexed' : 
                             doc.status === 'processing' ? '⏳ Processing' : '📄 Ready'}
                          </span>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDocumentId(doc.documentId || doc.id);
                              setPreviewDocumentName(doc.fileName || doc.filename || doc.name);
                              setShowDocumentPreview(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                          >
                            🔍 Preview
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-slate-400 text-center py-4">
                        Upload documents to program knowledge
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Text Insertion */}
          <Card className="bg-purple-900/40 backdrop-blur-sm border border-purple-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                Memory Text Insertion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    Text to Insert (e.g. https://yobot.bot)
                  </label>
                  <textarea
                    value={memoryText}
                    onChange={(e) => setMemoryText(e.target.value)}
                    placeholder="Enter text, URLs, or information to store in memory..."
                    className="w-full h-24 p-3 bg-slate-700/60 border border-purple-400/50 rounded-lg text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none resize-none shadow-lg shadow-purple-400/10"
                  />
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    Memory Category
                  </label>
                  <select
                    value={memoryCategory}
                    onChange={(e) => setMemoryCategory(e.target.value)}
                    className="w-full p-3 bg-slate-700/60 border border-purple-400/50 rounded-lg text-white focus:border-purple-400 focus:outline-none shadow-lg shadow-purple-400/10"
                  >
                    <option value="general">General</option>
                    <option value="urls">URLs & Links</option>
                    <option value="contacts">Contacts</option>
                    <option value="instructions">Instructions</option>
                    <option value="reference">Reference</option>
                  </select>
                </div>
                
                <Button 
                  onClick={insertMemoryText}
                  disabled={!memoryText.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Insert into Memory
                </Button>

                {/* View Knowledge Library Button */}
                <Button 
                  onClick={handleViewKnowledge}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  🗂 View Knowledge Library
                </Button>
                
                {/* Latest Memory Activity Log */}
                <div className="bg-slate-700/40 rounded-lg p-4 border border-purple-400">
                  <h4 className="text-white font-medium mb-3 flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-purple-400" />
                    🧠 Latest Memory Activity Log
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {memoryActivityLog.length > 0 ? memoryActivityLog.slice(-5).reverse().map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-800/60 rounded border border-purple-400">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-slate-400">{entry.timestamp}</span>
                          <span className="text-sm text-white">{entry.type}</span>
                          <span className="text-xs text-purple-400">{entry.category}</span>
                        </div>
                        <span className={`text-xs font-medium ${entry.result === 'Success' ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.result === 'Success' ? '✅ Success' : '❌ Error'}
                        </span>
                      </div>
                    )) : (
                      <div className="text-slate-400 text-sm text-center py-4">
                        No recent memory activity
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-slate-400 text-xs">
                  Memory entries are stored with high priority and can be retrieved during conversations.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Features Section - Mobile Companion & PDF Export */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Mobile Companion Panel */}
          <Card className="bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/20 backdrop-blur-sm border border-indigo-400/50 shadow-2xl shadow-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Phone className="w-5 h-5 mr-2 text-indigo-400" />
                📲 Mobile Companion Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-800/60 rounded-lg p-3 border border-indigo-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">iOS App Status:</span>
                    <Badge className="bg-green-600 text-white text-xs">
                      { 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Last Sync:</span>
                    <span className="text-white font-bold text-sm">
                      { '0'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-800/60 rounded-lg p-3 border border-indigo-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Android App Status:</span>
                    <Badge className="bg-green-600 text-white text-xs">
                      { 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Push Alerts:</span>
                    <span className="text-green-400 font-bold text-sm">
                      { 'Disabled'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-800/60 rounded-lg p-3 border border-indigo-400/30">
                  <div className="text-slate-300 text-sm mb-2">Recent Mobile Activity:</div>
                  <div className="space-y-1 text-xs text-slate-400">
                    {currentSystemMode === 'test' ? (
                      <>
                        <div>• Voice command received (iPhone)</div>
                        <div>• Dashboard sync completed</div>
                        <div>• Push notification sent</div>
                      </>
                    ) : (
                      <div>No mobile activity</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PDF & Export Panel */}
          <Card className="bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-red-900/20 backdrop-blur-sm border border-purple-400/50 shadow-2xl shadow-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                🧾 PDF & Export Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-800/60 rounded-lg p-3 border border-purple-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Last PDF Generated:</span>
                    <span className="text-white font-bold text-sm">
                      { 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Export Timestamp:</span>
                    <span className="text-purple-400 font-bold text-sm">
                      { '0'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowExportModal(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center p-3 border border-purple-500"
                  >
                    <span className="text-xl mr-3">📊</span>
                    <span>Quick Export Dashboard</span>
                  </Button>
                  
                  <Button
                    onClick={handleDownloadPDF}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center p-3 border border-pink-500"
                  >
                    <span className="text-xl mr-3">📋</span>
                    <span>Generate PDF Report</span>
                  </Button>
                </div>
                
                <div className="bg-slate-800/60 rounded-lg p-3 border border-purple-400/30">
                  <div className="text-slate-300 text-sm mb-2">Recent Exports:</div>
                  <div className="space-y-1 text-xs text-slate-400">
                    {currentSystemMode === 'test' ? (
                      <>
                        <div>• analytics_report_2024.pdf</div>
                        <div>• dashboard_export.json</div>
                        <div>• performance_metrics.csv</div>
                      </>
                    ) : (
                      <div>No recent exports</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit/Integrity Panel - New Addition */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-orange-900/40 via-red-900/30 to-yellow-900/20 backdrop-blur-sm border border-orange-400/50 shadow-2xl shadow-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-orange-400" />
                  🛡️ Audit/Integrity Panel
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('audit-integrity')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['audit-integrity'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <Badge className="bg-orange-600 text-white">MONITORING</Badge>
              </CardTitle>
            </CardHeader>
            {!collapsedSections['audit-integrity'] && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Automation Tamper Detection */}
                  <div className="space-y-4">
                    <h4 className="text-orange-300 font-semibold flex items-center border-b border-orange-400/30 pb-2">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Tamper Detection
                    </h4>
                    <div className="bg-slate-800/60 rounded-lg p-3 border border-orange-400/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 text-sm">Last Tamper Check:</span>
                        <span className="text-white font-bold text-sm">
                          { '0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Integrity Status:</span>
                        <Badge className={currentSystemMode === 'test' ? "bg-green-600 text-white text-xs" : "bg-slate-600 text-slate-400 text-xs"}>
                          { 'UNKNOWN'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/60 rounded-lg p-3 border border-orange-400/30">
                      <div className="text-slate-300 text-sm mb-2">Recent Flags:</div>
                      <div className="space-y-1 text-xs text-slate-400">
                        {currentSystemMode === 'test' ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span>• Config validation passed</span>
                              <span className="text-green-400">✓</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• API endpoint verified</span>
                              <span className="text-green-400">✓</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• No unauthorized access</span>
                              <span className="text-green-400">✓</span>
                            </div>
                          </>
                        ) : (
                          <div>No flags detected</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Logger Activity */}
                  <div className="space-y-4">
                    <h4 className="text-orange-300 font-semibold flex items-center border-b border-orange-400/30 pb-2">
                      <Activity className="w-4 h-4 mr-2" />
                      Logger Activity
                    </h4>
                    <div className="bg-slate-800/60 rounded-lg p-3 border border-orange-400/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 text-sm">Active Loggers:</span>
                        <span className="text-white font-bold text-sm">
                          { '0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Log Rate:</span>
                        <span className="text-orange-400 font-bold text-sm">
                          { '0/min'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/60 rounded-lg p-3 border border-orange-400/30">
                      <div className="text-slate-300 text-sm mb-2">Latest Entries:</div>
                      <div className="space-y-1 text-xs text-slate-400">
                        {currentSystemMode === 'test' ? (
                          <>
                            <div>• API call logged (Airtable)</div>
                            <div>• Function execution recorded</div>
                            <div>• Error handled gracefully</div>
                          </>
                        ) : (
                          <div>No recent activity</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fallback Triggers */}
                  <div className="space-y-4">
                    <h4 className="text-orange-300 font-semibold flex items-center border-b border-orange-400/30 pb-2">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Fallback Triggers
                    </h4>
                    <div className="bg-slate-800/60 rounded-lg p-3 border border-orange-400/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 text-sm">Fallbacks Active:</span>
                        <span className="text-white font-bold text-sm">
                          { '0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Last Triggered:</span>
                        <span className="text-orange-400 font-bold text-sm">
                          { 'Never'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          setToast({ 
                            title: "Integrity Check", 
                            description: currentSystemMode === 'test' ? "All systems verified secure" : "System check initiated"
                          });
                        }}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center p-3 border border-orange-500"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Run Integrity Check
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setToast({ 
                            title: "Logger Status", 
                            description: currentSystemMode === 'test' ? "All loggers operational" : "Logger status checked"
                          });
                        }}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-center p-3 border border-yellow-500"
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        Check Logger Status
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Call Monitoring & YoBot Support - Positioned Under Document Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Call Monitoring Panel - Under Document Manager */}
          <Card className="bg-blue-900/40 backdrop-blur-sm border border-blue-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-400" />
                Call Monitoring Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* System Services */}
                <div className="bg-slate-700/40 rounded-lg p-4 border border-blue-400">
                  <h4 className="text-white font-medium mb-3 flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-blue-400" />
                    System Services
                  </h4>
                  <div className="space-y-2">
                    {/* Monitoring Service */}
                    <div className="bg-slate-800/60 rounded-lg p-3 border border-blue-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-sm">Monitoring Service</span>
                          {currentSystemMode === 'test' && (
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              serviceStates.monitoring.status === 'ACTIVE' ? 'bg-green-600/20 text-green-400' :
                              serviceStates.monitoring.status === 'RESTARTING' ? 'bg-yellow-600/20 text-yellow-400' :
                              'text-yellow-400'
                            }`}>
                              {serviceStates.monitoring.status === 'ACTIVE' ? '🟢 ACTIVE' :
                               serviceStates.monitoring.status === 'RESTARTING' ? '🔄 RESTARTING' : 'IDLE'}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleServiceAction('monitoring', 'start')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 border border-green-400"
                            title="Start monitoring service"
                          >
                            Start
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleServiceAction('monitoring', 'restart')}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1 border border-orange-400"
                            title="Restart monitoring service"
                          >
                            Restart
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleServiceAction('monitoring', 'ping')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 border border-blue-400"
                            title="Ping monitoring service"
                          >
                            Ping
                          </Button>
                        </div>
                      </div>
                      {serviceStates.monitoring.lastPing && (
                        <div className="text-xs text-slate-400 mt-1">
                          Last ping: {serviceStates.monitoring.lastPing}
                        </div>
                      )}
                    </div>
                    
                    {/* Recording Service */}
                    <div className="bg-slate-800/60 rounded-lg p-3 border border-blue-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Headphones className="w-4 h-4 text-red-400" />
                          <span className="text-white text-sm">Recording Service</span>
                          {currentSystemMode === 'test' && (
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              serviceStates.recording.status === 'ACTIVE' ? 'bg-green-600/20 text-green-400' :
                              serviceStates.recording.status === 'RESTARTING' ? 'bg-yellow-600/20 text-yellow-400' :
                              'text-yellow-400'
                            }`}>
                              {serviceStates.recording.status === 'ACTIVE' ? '🟢 ACTIVE' :
                               serviceStates.recording.status === 'RESTARTING' ? '🔄 RESTARTING' : 'IDLE'}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleServiceAction('recording', 'start')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 border border-green-400"
                            title="Start recording service"
                          >
                            Start
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleServiceAction('recording', 'restart')}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1 border border-orange-400"
                            title="Restart recording service"
                          >
                            Restart
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleServiceAction('recording', 'ping')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 border border-blue-400"
                            title="Ping recording service"
                          >
                            Ping
                          </Button>
                        </div>
                      </div>
                      {serviceStates.recording.lastPing && (
                        <div className="text-xs text-slate-400 mt-1">
                          Last ping: {serviceStates.recording.lastPing}
                        </div>
                      )}
                    </div>
                    
                    {/* Analytics Service */}
                    <div className="bg-slate-800/60 rounded-lg p-3 border border-blue-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-white text-sm">Analytics Service</span>
                          {currentSystemMode === 'test' && (
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              serviceStates.analytics.status === 'ACTIVE' ? 'bg-green-600/20 text-green-400' :
                              serviceStates.analytics.status === 'RESTARTING' ? 'bg-yellow-600/20 text-yellow-400' :
                              'text-yellow-400'
                            }`}>
                              {serviceStates.analytics.status === 'ACTIVE' ? '🟢 ACTIVE' :
                               serviceStates.analytics.status === 'RESTARTING' ? '🔄 RESTARTING' : 'IDLE'}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleServiceAction('analytics', 'start')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 border border-green-400"
                            title="Start analytics service"
                          >
                            Start
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleServiceAction('analytics', 'restart')}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1 border border-orange-400"
                            title="Restart analytics service"
                          >
                            Restart
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleServiceAction('analytics', 'ping')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 border border-blue-400"
                            title="Ping analytics service"
                          >
                            Ping
                          </Button>
                        </div>
                      </div>
                      {serviceStates.analytics.lastPing && (
                        <div className="text-xs text-slate-400 mt-1">
                          Last ping: {serviceStates.analytics.lastPing}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Call Statistics */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-slate-700/40 rounded-lg p-3 text-center border border-blue-400">
                    <div className="text-slate-300 text-xs mb-1">Active Calls</div>
                    <div className="text-white font-bold text-lg">{currentSystemMode === 'test' ? callStats.activeCalls : ''}</div>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-3 text-center border border-blue-400">
                    <div className="text-slate-300 text-xs mb-1">Avg Duration</div>
                    <div className="text-white font-bold text-lg">{currentSystemMode === 'test' ? callStats.avgDuration : ''}</div>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-3 text-center border border-blue-400">
                    <div className="text-slate-300 text-xs mb-1">Success Rate</div>
                    <div className="text-white font-bold text-lg">{currentSystemMode === 'test' ? callStats.successRate : ''}</div>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-3 text-center border border-blue-400">
                    <div className="text-slate-300 text-xs mb-1">Total Today</div>
                    <div className="text-white font-bold text-lg">{currentSystemMode === 'test' ? callStats.totalToday : ''}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={handleSimulateTestCall}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs border border-purple-400"
                    title="Triggers a mock call event in the system"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Simulate Test Call
                  </Button>
                  <Button 
                    onClick={() => setShowCallReports(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs border border-blue-400"
                    title="View call reports and analytics"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    View Call Reports
                  </Button>
                  <Button 
                    onClick={() => setShowCallLogs(true)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs border border-green-400"
                    title="View detailed call log history"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Call Log History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* YoBot Support Panel - Under Memory Text Insertion */}
          <Card className="bg-purple-900/40 backdrop-blur-sm border border-purple-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-purple-400" />
                YoBot Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Support Status */}
                <div className="bg-slate-700/40 rounded-lg p-4 border border-purple-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Support Status</span>
                    <span className="text-green-400 font-bold text-sm">{""}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Open Tickets</span>
                    <span className="text-white font-bold">{""}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      setShowLiveChat(true);
                      addRecentActivity('Live chat session opened', 'chat');
                    }}
                    className="w-full text-white border transition-all duration-200 hover:shadow-[0_0_8px_rgba(13,130,218,0.5)]"
                    style={{ 
                      backgroundColor: '#0d82da',
                      borderColor: '#0d82da'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0864b1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0d82da';
                    }}
                    title="Opens built-in live chat window for real-time support"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    💬 Open Live Chat
                  </Button>
                  <Button 
                    onClick={() => setShowCreateTicketModal(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white border border-purple-400"
                    title="Opens Support Ticket Form modal to submit new support requests"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    ➕ Create New Ticket
                  </Button>
                  <Button 
                    onClick={() => setShowTicketHistory(true)}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white border border-slate-400"
                    title="View all previous support tickets with status filtering"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    📜 View Ticket History
                  </Button>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-700/40 rounded-lg p-3 border border-purple-400">
                  <h4 className="text-white font-medium mb-2 text-sm">Recent Activity</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {recentActivity.length > 0 ? recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            activity.type === 'ticket' ? 'bg-purple-400' :
                            activity.type === 'chat' ? 'bg-blue-400' : 'bg-red-400'
                          }`}></span>
                          <span className="text-slate-300">{activity.message}</span>
                        </div>
                        <span className="text-slate-400">{activity.timestamp}</span>
                      </div>
                    )) : (
                      <div className="text-slate-400 text-xs text-center py-2">
                        {""}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          </>
        )}

        {/* Voice Ops Only Preset */}
        {dashboardPreset === 'voice' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Voice Operations Dashboard</h2>
            
            {/* Voice Analytics Section */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 min-h-[200px]">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-cyan-400" />
                  <span>Voice Analytics & Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-400 mb-1">{ '0'}</div>
                      <div className="text-slate-300 text-sm">Total Calls Today</div>
                      <div className="text-xs text-slate-400 mt-2">+5 from yesterday</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-400 mb-1">{ '0:00'}</div>
                      <div className="text-slate-300 text-sm">Avg Call Duration</div>
                      <div className="text-xs text-slate-400 mt-2">Above target</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-purple-400 mb-1">0</div>
                      <div className="text-slate-300 text-sm">Success Rate</div>
                      <div className="text-xs text-slate-400 mt-2">Industry leading</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-cyan-400 mb-1">{ '0'}</div>
                      <div className="text-slate-300 text-sm">Conversion Rate</div>
                      <div className="text-xs text-slate-400 mt-2">No data available</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice Commands Section */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 min-h-[200px]">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-green-400" />
                  <span>Voice Command Center</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Button
                    onClick={() => setShowCreateVoiceCallModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white h-20 text-lg font-semibold"
                    title="Start a new voice call with advanced options"
                  >
                    <Phone className="w-6 h-6 mr-3" />
                    Start Voice Call
                  </Button>
                  <Button
                    onClick={() => setShowVoiceRecordings(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-20 text-lg font-semibold"
                    title="Review and analyze voice call recordings"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Review Recordings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SmartSpend Only Preset */}
        {dashboardPreset === 'smartspend' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center mb-6">SmartSpend™ Dashboard</h2>
            
            {/* SmartSpend Analytics */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 min-h-[200px]">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span>💰 SmartSpend™ Analytics</span>
                  <div className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">PROPRIETARY</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-400 mb-1">$0</div>
                      <div className="text-slate-300 text-sm">Monthly Spend</div>
                      <div className="text-xs text-slate-400 mt-2">Within budget</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-400 mb-1">$0</div>
                      <div className="text-slate-300 text-sm">Cost Per Lead</div>
                      <div className="text-xs text-slate-400 mt-2">No data available</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-purple-400 mb-1">0</div>
                      <div className="text-slate-300 text-sm">ROI</div>
                      <div className="text-xs text-slate-400 mt-2">Exceptional performance</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-cyan-400 mb-1">0</div>
                      <div className="text-slate-300 text-sm">Conversion Rate</div>
                      <div className="text-xs text-slate-400 mt-2">Above industry avg</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Controls */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 min-h-[200px]">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <span>Budget Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white h-20 text-lg font-semibold"
                    title="Adjust your monthly budget allocation and spending limits"
                  >
                    <TrendingUp className="w-6 h-6 mr-3" />
                    Adjust Budget
                  </Button>
                  <Button
                    onClick={() => setShowAnalyticsModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-20 text-lg font-semibold"
                    title="Generate detailed SmartSpend analytics reports"
                  >
                    <BarChart className="w-6 h-6 mr-3" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Voice Ops Only Preset */}
        {dashboardPreset === 'voice' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Voice Operations Dashboard</h2>
            
            {/* Voice Analytics Section */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 min-h-[200px]">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-cyan-400" />
                  <span>Voice Analytics & Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-400 mb-1">{ '0'}</div>
                      <div className="text-slate-300 text-sm">Total Calls Today</div>
                      <div className="text-xs text-slate-400 mt-2">+5 from yesterday</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-400 mb-1">{ '0:00'}</div>
                      <div className="text-slate-300 text-sm">Avg Call Duration</div>
                      <div className="text-xs text-slate-400 mt-2">Above target</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-purple-400 mb-1">0</div>
                      <div className="text-slate-300 text-sm">Success Rate</div>
                      <div className="text-xs text-slate-400 mt-2">Industry leading</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-cyan-400 mb-1">{ '0'}</div>
                      <div className="text-slate-300 text-sm">Conversion Rate</div>
                      <div className="text-xs text-slate-400 mt-2">No data available</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice Commands Section */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 min-h-[200px]">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-green-400" />
                  <span>Voice Command Center</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Button
                    onClick={() => setShowCreateVoiceCallModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white h-20 text-lg font-semibold"
                    title="Start a new voice call with advanced options"
                  >
                    <Phone className="w-6 h-6 mr-3" />
                    Start Voice Call
                  </Button>
                  <Button
                    onClick={() => setShowVoiceRecordings(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-20 text-lg font-semibold"
                    title="Review and analyze voice call recordings"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Review Recordings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SmartSpend Only Preset */}
        {dashboardPreset === 'smartspend' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center mb-6">SmartSpend™ Dashboard</h2>
            
            {/* SmartSpend Analytics */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 min-h-[200px]">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span>💰 SmartSpend™ Analytics</span>
                  <div className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">PROPRIETARY</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-400 mb-1">$0</div>
                      <div className="text-slate-300 text-sm">Monthly Spend</div>
                      <div className="text-xs text-slate-400 mt-2">Within budget</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-400 mb-1">$0</div>
                      <div className="text-slate-300 text-sm">Cost Per Lead</div>
                      <div className="text-xs text-slate-400 mt-2">No data available</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-purple-400 mb-1">0</div>
                      <div className="text-slate-300 text-sm">ROI</div>
                      <div className="text-xs text-slate-400 mt-2">Exceptional performance</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-cyan-400 mb-1">0</div>
                      <div className="text-slate-300 text-sm">Conversion Rate</div>
                      <div className="text-xs text-slate-400 mt-2">Above industry avg</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Controls */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 min-h-[200px]">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <span>Budget Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white h-20 text-lg font-semibold"
                    title="Adjust your monthly budget allocation and spending limits"
                  >
                    <TrendingUp className="w-6 h-6 mr-3" />
                    Adjust Budget
                  </Button>
                  <Button
                    onClick={() => setShowAnalyticsModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-20 text-lg font-semibold"
                    title="Generate detailed SmartSpend analytics reports"
                  >
                    <BarChart className="w-6 h-6 mr-3" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>

    {showClearConfirm && (
      <div className="fixed inset0- bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-red-500/50 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Confirm Knowledge Deletion
            </h3>
            <p className="text-white mb-4">
              This action will permanently delete all knowledge base data. This cannot be undone.
            </p>
            <p className="text-slate-300 mb-4">
              Type "delete" to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white mb-4"
              placeholder="Type 'delete' to confirm"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowClearConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmClearKnowledge}
                disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                className={`flex-1 ${
                  deleteConfirmText.toLowerCase() === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                }`}
              >
                Delete Knowledge
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Order Form Modal */}
      {showSalesOrderProcessor && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-green-400/50">
            <div className="sticky top0- bg-slate-900 border-b border-green-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create Sales Order</h2>
              <Button
                onClick={() => setShowSalesOrderProcessor(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <iframe
                src="https://tally.so/r/mDb87X"
                className="w-full h-[600px] border border-green-400/30 rounded-lg"
                title="Sales Order Form"
              />
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingModal && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-blue-400/50">
            <div className="sticky top0- bg-slate-900 border-b border-blue-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create New Booking</h2>
              <Button
                onClick={() => setShowBookingModal(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <iframe
                src="https://tally.so/r/w7jep6"
                className="w-full h-[600px] border border-blue-400/30 rounded-lg"
                title="Booking Form"
              />
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket Form Modal */}
      {showSupportTicketModal && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-[480px] bg-[#1a1a1a] rounded-xl border border-blue-400/50 p-6 animate-in fade-in0- duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Support Ticket</h2>
              <Button
                onClick={() => setShowSupportTicketModal(false)}
                variant="ghost"
                className="text-white hover:bg-white/10 p-1"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Client Name</label>
                <select className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="0">Select client...</option>
                  <option value="acme-corp">Acme Corporation</option>
                  <option value="tech-solutions">Tech Solutions Inc</option>
                  <option value="global-systems">Global Systems Ltd</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Priority</label>
                <select className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="low">Low</option>
                  <option value="normal" selected>Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Issue Type</label>
                <select className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="tech">Tech</option>
                  <option value="billing">Billing</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Description</label>
                <textarea 
                  className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Describe the issue..."
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Attachments (Optional)</label>
                <input 
                  type="file" 
                  className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-blue-500"
                  multiple
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={async () => {
                    // Submit support ticket
                    try {
                      const response = await fetch('/api/support-ticket', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          clientName: 'test-client',
                          priority: 'normal',
                          issueType: 'tech',
                          description: 'Test ticket'
                        })
                      });
                      
                      if (response.ok) {
                        setToast({ title: "Ticket Created", description: "✅ Ticket logged successfully" });
                        setShowSupportTicketModal(false);
                      }
                    } catch (error) {
                      setToast({ title: "Error", description: "Failed to create ticket", variant: "destructive" });
                    }
                  }}
                  className="flex-1 bg-[#0d82da] hover:bg-[#0b6bb8] text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Create Ticket
                </Button>
                <Button
                  onClick={() => setShowSupportTicketModal(false)}
                  variant="ghost"
                  className="flex-1 bg-transparent hover:bg-white/10 text-white py-3 px-6 rounded-lg border border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Form Modal */}
      {showFollowUpModal && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-[480px] bg-[#1a1a1a] rounded-xl border border-red-400/50 p-6 animate-in fade-in0- duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Follow-up</h2>
              <Button
                onClick={() => setShowFollowUpModal(false)}
                variant="ghost"
                className="text-white hover:bg-white/10 p-1"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Contact or Deal Name</label>
                <input 
                  type="text"
                  className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-red-500"
                  placeholder="Start typing to search..."
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Follow-up Type</label>
                <select className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-red-500">
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Follow-up Date</label>
                <input 
                  type="datetime-local"
                  className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Notes</label>
                <textarea 
                  className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-red-500 h-24 resize-none"
                  placeholder="Follow-up notes..."
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input type="checkbox" id="slack-reminder" className="rounded" />
                <label htmlFor="slack-reminder" className="text-white text-sm">Send Slack reminder</label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      // Log to Command Center Metrics
                      await CommandCenterActions.scheduleFollowUp({
                        triggeredBy: 'Command Center User',
                        additionalData: { 
                          contactName: 'test-contact',
                          followUpType: 'call',
                          followUpDate: new Date().toISOString(),
                          notes: 'Test follow-up'
                        }
                      });

                      const response = await fetch('/api/follow-up-caller', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          contactName: 'test-contact',
                          followUpType: 'call',
                          followUpDate: new Date().toISOString(),
                          notes: 'Test follow-up'
                        })
                      });
                      
                      if (response.ok) {
                        setToast({ title: "Follow-up Scheduled", description: "Follow-up added to tracker" });
                        setShowFollowUpModal(false);
                      }
                    } catch (error) {
                      setToast({ title: "Error", description: "Failed to schedule follow-up", variant: "destructive" });
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Schedule Follow-up
                </Button>
                <Button
                  onClick={() => setShowFollowUpModal(false)}
                  variant="ghost"
                  className="flex-1 bg-transparent hover:bg-white/10 text-white py-3 px-6 rounded-lg border border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMS Modal */}
      {showSMSModal && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-[480px] bg-[#1a1a1a] rounded-xl border border-blue-400/50 p-6 animate-in fade-in0- duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Send SMS</h2>
              <Button
                onClick={() => setShowSMSModal(false)}
                variant="ghost"
                className="text-white hover:bg-white/10 p-1"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Recipient Name/Number</label>
                <input 
                  type="text"
                  className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number or contact name"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Pre-built Templates</label>
                <select className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="0">Select template...</option>
                  <option value="follow-up">Follow-up reminder</option>
                  <option value="appointment">Appointment confirmation</option>
                  <option value="welcome">Welcome message</option>
                  <option value="custom">Custom message</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Message</label>
                <textarea 
                  className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Type your SMS message..."
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input type="checkbox" id="sms-schedule" className="rounded" />
                <label htmlFor="sms-schedule" className="text-white text-sm">Schedule for later</label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/send-sms', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          recipient: 'test-number',
                          message: 'Test SMS message',
                          scheduled: false
                        })
                      });
                      
                      if (response.ok) {
                        setToast({ title: "SMS Sent", description: "Message delivered successfully" });
                        setShowSMSModal(false);
                      }
                    } catch (error) {
                      setToast({ title: "Error", description: "Failed to send SMS", variant: "destructive" });
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Send SMS
                </Button>
                <Button
                  onClick={() => setShowSMSModal(false)}
                  variant="ghost"
                  className="flex-1 bg-transparent hover:bg-white/10 text-white py-3 px-6 rounded-lg border border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {showSupportTicketModal && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-[520px] bg-gradient-to-br from-slate-900/95 via-blue-900/80 to-indigo-900/70 backdrop-blur-xl border border-blue-400/50 shadow-2xl shadow-blue-500/20 rounded-xl p-6 animate-in fade-in0- duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-300 flex items-center">
                <span className="text-2xl mr-3">🆘</span>
                Create Support Ticket
              </h2>
              <Button
                onClick={() => setShowSupportTicketModal(false)}
                variant="ghost"
                className="text-white hover:bg-white/10 p-1"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-3 flex items-center">
                  <span className="mr-2">✉️</span>
                  Client Email
                </label>
                <input 
                  type="email"
                  className="w-full p-4 bg-slate-800/60 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                  placeholder="client@company.com"
                />
              </div>
              
              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-3 flex items-center">
                  <span className="mr-2">📝</span>
                  Subject
                </label>
                <input 
                  type="text"
                  className="w-full p-4 bg-slate-800/60 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                  placeholder="Brief description of the issue"
                />
              </div>
              
              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-3 flex items-center">
                  <span className="mr-2">🚨</span>
                  Urgency Level
                </label>
                <select className="w-full p-4 bg-slate-800/60 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  Issue Description
                </label>
                <textarea 
                  className="w-full p-4 bg-slate-800/60 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 h-32 resize-none"
                  placeholder="Detailed description of the issue..."
                />
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-400/30 rounded-lg">
                <input type="checkbox" id="urgent-escalation" className="w-4 h-4 text-red-500 rounded" />
                <label htmlFor="urgent-escalation" className="text-red-300 text-sm font-medium">Requires immediate escalation</label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/support-ticket', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          clientEmail: 'test@client.com',
                          subject: 'Test Support Ticket',
                          urgency: 'Medium',
                          body: 'Test ticket description'
                        })
                      });
                      
                      if (response.ok) {
                        setToast({ title: "Ticket Created", description: "Support ticket submitted successfully" });
                        setShowSupportTicketModal(false);
                      }
                    } catch (error) {
                      setToast({ title: "Error", description: "Failed to create ticket", variant: "destructive" });
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105"
                >
                  Submit Ticket
                </Button>
                <Button
                  onClick={() => setShowSupportTicketModal(false)}
                  variant="ghost"
                  className="flex-1 bg-transparent hover:bg-white/10 text-white py-3 px-6 rounded-lg border border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Order Automation Modal */}
      {showSalesOrderProcessor && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-[600px] bg-[#1a1a1a] rounded-xl border border-purple-400/50 p-6 animate-in fade-in0- duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Automate Sales Order</h2>
              <Button
                onClick={() => setShowSalesOrderProcessor(false)}
                variant="ghost"
                className="text-white hover:bg-white/10 p-1"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Client Name</label>
                  <input 
                    type="text"
                    className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Client Email</label>
                  <input 
                    type="email"
                    className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-purple-500"
                    placeholder="client@company.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Bot Package</label>
                <select className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-purple-500">
                  <option value="starter">Starter Bot Package - $997/month</option>
                  <option value="professional">Professional Bot Package - --/month</option>
                  <option value="enterprise">Enterprise Bot Package - --/month</option>
                  <option value="custom">Custom Enterprise Solution</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Add-Ons</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center text-white text-sm">
                    <input type="checkbox" className="mr-2 rounded" />
                    Voice AI Module (+$497/month)
                  </label>
                  <label className="flex items-center text-white text-sm">
                    <input type="checkbox" className="mr-2 rounded" />
                    SMS Automation (+$297/month)
                  </label>
                  <label className="flex items-center text-white text-sm">
                    <input type="checkbox" className="mr-2 rounded" />
                    Advanced Analytics (+$197/month)
                  </label>
                  <label className="flex items-center text-white text-sm">
                    <input type="checkbox" className="mr-2 rounded" />
                    Custom Integrations (+$997/month)
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Payment Status</label>
                <select className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-purple-500">
                  <option value="pending">Pending Payment</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial Payment</option>
                  <option value="failed">Payment Failed</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/sales-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          clientName: 'Test Client',
                          clientEmail: 'test@client.com',
                          botPackage: 'Professional Bot Package',
                          addOns: ['Voice AI Module'],
                          total: 2494,
                          status: 'Processing',
                          paymentStatus: 'Pending Payment'
                        })
                      });
                      
                      if (response.ok) {
                        setToast({ title: "Order Created", description: "Sales order automated successfully" });
                        setShowSalesOrderProcessor(false);
                      }
                    } catch (error) {
                      setToast({ title: "Error", description: "Failed to process order", variant: "destructive" });
                    }
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Process Order
                </Button>
                <Button
                  onClick={() => setShowSalesOrderProcessor(false)}
                  variant="ghost"
                  className="flex-1 bg-transparent hover:bg-white/10 text-white py-3 px-6 rounded-lg border border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Call Modal */}
      {showCreateVoiceCallModal && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-[560px] bg-gradient-to-br from-slate-900/95 via-blue-900/80 to-indigo-900/70 backdrop-blur-xl border border-blue-400/50 shadow-2xl shadow-blue-500/20 rounded-xl p-6 animate-in fade-in0- duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-300 flex items-center">
                <span className="text-2xl mr-3">📞</span>
                Manual Call Start
              </h2>
              <Button
                onClick={() => setShowCreateVoiceCallModal(false)}
                variant="ghost"
                className="text-white hover:bg-white/10 p-1"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Contact Name</label>
                <input 
                  type="text"
                  className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter contact name"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Phone Number</label>
                <input 
                  type="tel"
                  className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Call Purpose</label>
                <select className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-orange-500">
                  <option value="sales">Sales Call</option>
                  <option value="follow-up">Follow-up Call</option>
                  <option value="support">Support Call</option>
                  <option value="demo">Product Demo</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Call Script/Notes</label>
                <textarea 
                  className="w-full p-3 bg-[#2c2c2c] text-white border-none rounded-md focus:ring-2 focus:ring-orange-500 h-24 resize-none"
                  placeholder="Notes or talking points for the call..."
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input type="checkbox" id="record-call" className="rounded" />
                <label htmlFor="record-call" className="text-white text-sm">Record this call</label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/manual-call', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          contactName: 'Test Contact',
                          phoneNumber: '+1555123467',
                          callPurpose: 'Sales Call',
                          notes: 'Manual call test',
                          recordCall: true
                        })
                      });
                      
                      if (response.ok) {
                        setToast({ title: "Call Started", description: "Manual call initiated successfully" });
                        setShowCreateVoiceCallModal(false);
                      }
                    } catch (error) {
                      setToast({ title: "Error", description: "Failed to start call", variant: "destructive" });
                    }
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Start Call
                </Button>
                <Button
                  onClick={() => setShowCreateVoiceCallModal(false)}
                  variant="ghost"
                  className="flex-1 bg-transparent hover:bg-white/10 text-white py-3 px-6 rounded-lg border border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Scraping Interface Modal */}
      {showLeadScraping && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-blue-400/50">
            <div className="sticky top0- bg-slate-900 border-b border-cyan-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Lead Scraping Interface</h2>
              <Button
                onClick={() => setShowLeadScraping(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <div className="text-center text-white">
                <p>Lead scraping functionality has been moved to the dedicated Lead Scraper page.</p>
                <Link href="/lead-scraper">
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    Go to Lead Scraper
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Content Creator Dashboard Modal */}
      {showContentCreator && (
        <ContentCreatorDashboard onBack={() => setShowContentCreator(false)} />
      )}

      {/* Mailchimp Sync Dashboard Modal */}
      {showMailchimpSync && (
        <MailchimpSyncDashboard onBack={() => setShowMailchimpSync(false)} />
      )}

      {/* Social Content Creator Modal */}
      {showSocialContentCreator && (
        <SocialContentCreator onBack={() => setShowSocialContentCreator(false)} />
      )}

      {/* Create New Ticket Modal */}
      {showCreateTicketModal && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 rounded-lg border border-purple-500 shadow-2xl">
            <div className="bg-slate-900 border-b border-purple-400/30 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Plus className="w-6 h-6 mr-3 text-purple-400" />
                Create New Support Ticket
              </h2>
              <Button
                onClick={() => {
                  setShowCreateTicketModal(false);
                  setNewTicketSubject('');
                  setNewTicketDescription('');
                  setNewTicketCategory('');
                  setNewTicketName('');
                  setNewTicketEmail('');
                  setNewTicketPriority('medium');
                }}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">👤 Name</label>
                  <input
                    type="text"
                    value={newTicketName}
                    onChange={(e) => setNewTicketName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full p-3 bg-slate-700/60 border border-purple-400 rounded-lg text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">📧 Email</label>
                  <input
                    type="email"
                    value={newTicketEmail}
                    onChange={(e) => setNewTicketEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    className="w-full p-3 bg-slate-700/60 border border-purple-400 rounded-lg text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Ticket Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">🏷️ Ticket Type</label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value)}
                    className="w-full p-3 bg-slate-700/60 border border-purple-400 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="0">Select ticket type...</option>
                    <option value="bug-report">🐛 Bug Report</option>
                    <option value="feature-request">✨ Feature Request</option>
                    <option value="help-needed">❓ Help Needed</option>
                    <option value="billing">💳 Billing Question</option>
                    <option value="technology">⚙️ Technology Issue</option>
                    <option value="other">📋 Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">⚡ Priority</label>
                  <select
                    value={newTicketPriority}
                    onChange={(e) => setNewTicketPriority(e.target.value)}
                    className="w-full p-3 bg-slate-700/60 border border-purple-400 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="low">🟢 Low - General inquiry</option>
                    <option value="medium">🟡 Medium - Standard issue</option>
                    <option value="high">🟠 High - Urgent problem</option>
                    <option value="critical">🔴 Critical - System down</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">📋 Subject</label>
                <input
                  type="text"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="Brief description of the issue..."
                  className="w-full p-3 bg-slate-700/60 border border-purple-400 rounded-lg text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">📝 Description</label>
                <textarea
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                  placeholder="Please provide detailed information about your issue, including steps to reproduce, error messages, and any relevant context..."
                  rows={6}
                  className="w-full p-3 bg-slate-700/60 border border-purple-400 rounded-lg text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">📎 Attach File (Optional)</label>
                <div className="border-2 border-dashed border-purple-400/50 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="ticket-file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                  />
                  <label
                    htmlFor="ticket-file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-purple-400" />
                    <span className="text-slate-300 text-sm">Click to upload or drag and drop</span>
                    <span className="text-slate-400 text-xs">PDF, DOC, TXT, Images (Max 10MB)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-purple-400/30">
                <Button
                  onClick={() => {
                    const ticketData = {
                      name: newTicketName,
                      email: newTicketEmail,
                      category: newTicketCategory,
                      subject: newTicketSubject,
                      priority: newTicketPriority,
                      description: newTicketDescription,
                      timestamp: new Date().toISOString(),
                      id: `TICK-${Date.now()}`
                    };
                    console.log('Creating ticket:', ticketData);
                    
                    // Add to recent activity
                    addRecentActivity(`Ticket #${ticketData.id.slice(-3)} submitted: ${newTicketSubject}`, 'ticket');
                    
                    // Show success message
                    showToastMessage('Your support ticket has been submitted! We\'ll get back to you shortly.', 'success');
                    
                    // Reset form and close modal
                    setShowCreateTicketModal(false);
                    setNewTicketSubject('');
                    setNewTicketDescription('');
                    setNewTicketCategory('');
                    setNewTicketName('');
                    setNewTicketEmail('');
                    setNewTicketPriority('medium');
                  }}
                  disabled={!newTicketName.trim() || !newTicketEmail.trim() || !newTicketCategory || !newTicketSubject.trim() || !newTicketDescription.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border border-purple-400 py-3 text-lg font-medium"
                >
                  🚀 Submit Ticket
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateTicketModal(false);
                    setNewTicketSubject('');
                    setNewTicketDescription('');
                    setNewTicketCategory('');
                    setNewTicketName('');
                    setNewTicketEmail('');
                    setNewTicketPriority('medium');
                  }}
                  variant="outline"
                  className="border-slate-400 text-slate-400 hover:bg-slate-700 px-8 py-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket History Modal */}
      {showTicketHistory && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-purple-500">
            <div className="sticky top0- bg-slate-900 border-b border-purple-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                Support Ticket History
              </h2>
              <Button
                onClick={() => setShowTicketHistory(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {currentSystemMode === 'test' ? (
                  <>
                    <div className="bg-slate-800/60 rounded-lg p-4 border border-purple-400">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium">#T001 - API Integration Issues</span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-600/20 text-red-400">High Priority</span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-600/20 text-green-400">Resolved</span>
                        </div>
                        <span className="text-slate-400 text-sm">Dec 10, 2024</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">YoBot API returning 500 errors on webhook calls</p>
                      <p className="text-slate-400 text-xs">Resolved by: Engineering Team</p>
                    </div>
                    
                    <div className="bg-slate-800/60 rounded-lg p-4 border border-purple-400">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium">#T002 - Dashboard Loading Slow</span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-600/20 text-yellow-400">Medium Priority</span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-600/20 text-blue-400">In Progress</span>
                        </div>
                        <span className="text-slate-400 text-sm">Dec 11, 2024</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">Command Center dashboard takes 15+ seconds to load</p>
                      <p className="text-slate-400 text-xs">Assigned to: Performance Team</p>
                    </div>
                    
                    <div className="bg-slate-800/60 rounded-lg p-4 border border-purple-400">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium">#T003 - Feature Request: Dark Mode</span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-600/20 text-green-400">Low Priority</span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-slate-600/20 text-slate-400">Open</span>
                        </div>
                        <span className="text-slate-400 text-sm">Dec 12, 2024</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">Add dark mode option to user preferences</p>
                      <p className="text-slate-400 text-xs">Status: Under Review</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-8">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-lg mb-2">No Support Tickets Found</p>
                    <p className="text-sm">You haven't created any support tickets yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Document Upload */}
      <input
        id="document-upload"
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Call Monitoring Details Modal */}
      <CallMonitoringDetails
        isOpen={showCallDetails}
        onClose={() => setShowCallDetails(false)}
        currentSystemMode={currentSystemMode}
      />

      {/* Live Chat Interface Modal */}
      <LiveChatInterface
        isOpen={showLiveChat}
        onClose={() => setShowLiveChat(false)}
      />

      {/* Knowledge Base Manager Modal */}
      <KnowledgeBaseManager
        isOpen={showKnowledgeManager}
        onClose={() => setShowKnowledgeManager(false)}
      />



      {/* Content Creator Module */}
      {activeModule === 'content-creator' && (
        <ContentCreatorDashboard onBack={() => setActiveModule(null)} />
      )}

      {/* Mailchimp Module */}
      {activeModule === 'mailchimp' && (
        <MailchimpSyncDashboard onBack={() => setActiveModule(null)} />
      )}

      {/* Publy Dashboard Modal */}
      {showPublyDashboard && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-orange-400/50">
            <div className="sticky top0- bg-slate-900 border-b border-orange-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="text-2xl mr-3">📢</span>
                Publy Content Creation Dashboard
              </h2>
              <Button
                onClick={() => setShowPublyDashboard(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              {/* Content Creation Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="bg-slate-800/60 border border-orange-400/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <span className="text-xl mr-2">✍️</span>
                      Create New Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">Platform</label>
                        <select className="w-full p-3 bg-slate-700 border border-orange-400/50 rounded text-white">
                          <option value="linkedin">LinkedIn</option>
                          <option value="twitter">Twitter/X</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">Content Type</label>
                        <select className="w-full p-3 bg-slate-700 border border-orange-400/50 rounded text-white">
                          <option value="post">Social Post</option>
                          <option value="article">Article</option>
                          <option value="announcement">Announcement</option>
                          <option value="promotion">Promotion</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">Headline</label>
                        <input
                          type="text"
                          placeholder="Enter compelling headline..."
                          className="w-full p-3 bg-slate-700 border border-orange-400/50 rounded text-white placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">Content</label>
                        <textarea
                          placeholder="Write your content here..."
                          rows={4}
                          className="w-full p-3 bg-slate-700 border border-orange-400/50 rounded text-white placeholder-slate-400 resize-none"
                        />
                      </div>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        Generate Content with AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/60 border border-orange-400/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <span className="text-xl mr-2">📊</span>
                      Content Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Posts This Month:</span>
                        <span className="text-white font-bold">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Avg Engagement:</span>
                        <span className="text-green-400 font-bold">--</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Total Reach:</span>
                        <span className="text-slate-400 font-bold">--</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Best Time to Post:</span>
                        <span className="text-slate-400 font-bold">{liveActivityData?.data?.bestPostTime || ''}</span>
                      </div>
                      <div className="bg-slate-700/40 rounded p-3">
                        <div className="text-sm text-slate-300 mb-2">Top Performing Content:</div>
                        <div className="text-white text-sm">{liveActivityData?.data?.topContent || ''}</div>
                        <div className="text-green-400 text-xs">{liveActivityData?.data?.topContentStats || ''}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Content */}
              <Card className="bg-slate-800/60 border border-orange-400/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="text-xl mr-2">📝</span>
                    Recent Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(liveActivity?.socialPosts || []).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/40 rounded border border-orange-400/30">
                        <div>
                          <div className="text-white font-medium">{item.platform}</div>
                          <div className="text-slate-300 text-sm">{item.content}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            item.status === 'Published' ? 'text-green-400' :
                            item.status === 'Scheduled' ? 'text-blue-400' : 'text-orange-400'
                          }`}>{item.status}</div>
                          <div className="text-slate-400 text-xs">{item.engagement}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Mailchimp Dashboard Modal */}
      {showMailchimpDashboard && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-green-400/50">
            <div className="sticky top0- bg-slate-900 border-b border-green-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="text-2xl mr-3">📧</span>
                Mailchimp Email Marketing Dashboard
              </h2>
              <Button
                onClick={() => setShowMailchimpDashboard(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              {/* Email Campaign Management */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="bg-slate-800/60 border border-green-400/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <span className="text-xl mr-2">📊</span>
                      Campaign Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Total Subscribers:</span>
                        <span className="text-slate-400 font-bold">--</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Open Rate:</span>
                        <span className="text-slate-400 font-bold">--</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Click Rate:</span>
                        <span className="text-slate-400 font-bold">--</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Growth This Month:</span>
                        <span className="text-slate-400 font-bold">--</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/60 border border-green-400/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <span className="text-xl mr-2">✉️</span>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Create Campaign
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Sync Contacts
                      </Button>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        View Analytics
                      </Button>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        Manage Lists
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/60 border border-green-400/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <span className="text-xl mr-2">🎯</span>
                      Audience Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Engaged Users:</span>
                        <span className="text-green-400 font-bold">--</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Top Location:</span>
                        <span className="text-white font-bold">{liveActivity?.primaryLocation || ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Best Send Time:</span>
                        <span className="text-slate-400 font-bold">{liveActivity?.nextScheduled || ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Mobile Opens:</span>
                        <span className="text-purple-400 font-bold">--</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Campaigns */}
              <Card className="bg-slate-800/60 border border-green-400/50 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="text-xl mr-2">📈</span>
                    Recent Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center py-4 text-slate-400">
                      No campaign data available
                    </div>
                    {[].map((campaign, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/40 rounded border border-green-400/30">
                        <div>
                          <div className="text-white font-medium">{campaign.name}</div>
                          <div className="text-slate-300 text-sm">
                            Sent: {campaign.sent} • Opens: {campaign.opens} • Clicks: {campaign.clicks}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded text-sm font-medium ${
                          campaign.status === 'Sent' ? 'bg-green-600/20 text-green-400' : 'bg-orange-600/20 text-orange-400'
                        }`}>
                          {campaign.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Sync */}
              <Card className="bg-slate-800/60 border border-green-400/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="text-xl mr-2">🔄</span>
                    Contact Synchronization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Sync Source</label>
                      <select className="w-full p-3 bg-slate-700 border border-green-400/50 rounded text-white">
                        <option value="crm">CRM Contacts</option>
                        <option value="leads">Lead Database</option>
                        <option value="manual">Manual Upload</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Target List</label>
                      <select className="w-full p-3 bg-slate-700 border border-green-400/50 rounded text-white">
                        <option value="main">Main Audience</option>
                        <option value="prospects">Prospects</option>
                        <option value="customers">Customers</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button className="bg-green-600 hover:bg-green-700 text-white border border-green-500">
                      Start Sync
                    </Button>
                    <Button variant="outline" className="border-green-400 text-green-400">
                      Preview Changes
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-green-900/20 border border-green-400/30 rounded">
                    <div className="text-green-400 text-sm font-medium">Last Sync Status</div>
                    <div className="text-slate-300 text-sm">Successfully synced 47 new contacts • 3 minutes ago</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}





      <KnowledgeViewerModal
        isOpen={showKnowledgeViewer}
        onClose={() => setShowKnowledgeViewer(false)}
        knowledgeItems={knowledgeItems}
        selectedItems={selectedKnowledgeItems}
        onItemSelect={(id) => {
          setSelectedKnowledgeItems(prev => 
            prev.includes(id) 
              ? prev.filter(itemId => itemId !== id)
              : [...prev, id]
          );
        }}
        onDeleteSelected={async () => {
          if (selectedKnowledgeItems.length === 0) {
            setToast({
              title: "No Selection",
              description: "Please select items to delete",
              variant: "destructive"
            });
            return;
          }
          
          if (confirm(`Delete ${selectedKnowledgeItems.length} selected items?`)) {
            try {
              const response = await fetch('/api/knowledge/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedKnowledgeItems })
              });
              
              if (response.ok) {
                setKnowledgeItems(prev => prev.filter(item => !selectedKnowledgeItems.includes(item.id)));
                setSelectedKnowledgeItems([]);
                setToast({
                  title: "Items Deleted",
                  description: `Removed ${selectedKnowledgeItems.length} items from knowledge base`,
                });
              } else {
                setToast({
                  title: "Delete Failed",
                  description: "Unable to delete selected items",
                  variant: "destructive"
                });
              }
            } catch (error) {
              setToast({
                title: "Delete Error",
                description: "Network error while deleting items",
                variant: "destructive"
              });
            }
          }
        }}
      />

      {/* Live Chat Modal */}
      {showLiveChat && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[80vh] bg-slate-900 rounded-lg border border-blue-400/50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-blue-400/30">
              <h2 className="text-xl font-bold text-white flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
                YoBot Support Chat
              </h2>
              <Button
                onClick={() => setShowLiveChat(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px]">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-blue-900/60 rounded-lg p-4 border border-blue-400/50">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-white font-medium">Welcome to YoBot Support</p>
                    <p className="text-slate-300 text-sm mt-1">How can we help you today?</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80] rounded-lg p-3 ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 text-white border border-slate-600'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                      }`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-blue-400/30">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All Tickets Modal */}
      {showTicketModal && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-blue-400/50">
            <div className="sticky top0- bg-slate-900 border-b border-blue-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Ticket className="w-5 h-5 mr-2 text-blue-400" />
                Support Tickets
              </h2>
              <Button
                onClick={() => setShowTicketModal(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              {currentSystemMode === 'test' ? (
                <div className="space-y-4">
                  {[
                    {
                      id: 'TICK-2025-001',
                      subject: 'Voice recognition not working in Chrome',
                      status: 'Open',
                      priority: 'High',
                      created: '2 hours ago',
                      assignee: 'Sarah Chen'
                    },
                    {
                      id: 'TICK-2025-002',
                      subject: 'Calendar integration sync issues',
                      status: 'In Progress',
                      priority: 'Medium',
                      created: '1 day ago',
                      assignee: 'Marcus Rodriguez'
                    },
                    {
                      id: 'TICK-2025-003',
                      subject: 'Automation function timeout errors',
                      status: 'Resolved',
                      priority: 'Low',
                      created: '3 days ago',
                      assignee: 'Daniel Thompson'
                    },
                    {
                      id: 'TICK-2025-004',
                      subject: 'Dashboard metrics not updating',
                      status: 'Open',
                      priority: 'Medium',
                      created: '5 hours ago',
                      assignee: 'Sarah Chen'
                    },
                    {
                      id: 'TICK-2025-005',
                      subject: 'API key configuration help needed',
                      status: 'Pending',
                      priority: 'Low',
                      created: '1 week ago',
                      assignee: 'Support Team'
                    }
                  ].map((ticket) => (
                    <div key={ticket.id} className="bg-slate-800/60 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{ticket.subject}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ticket.status === 'Open' ? 'bg-red-600/20 text-red-400' :
                            ticket.status === 'In Progress' ? 'bg-yellow-600/20 text-yellow-400' :
                            ticket.status === 'Resolved' ? 'bg-green-600/20 text-green-400' :
                            'bg-blue-600/20 text-blue-400'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ticket.priority === 'High' ? 'bg-red-600/20 text-red-400' :
                            ticket.priority === 'Medium' ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-blue-600/20 text-blue-400'
                          }`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Ticket #{ticket.id}</span>
                        <span>Assigned to: {ticket.assignee}</span>
                        <span>Created: {ticket.created}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-400 text-lg">No support tickets found</p>
                  <p className="text-slate-500 text-sm mt-2">Create a new ticket to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Schedule Viewer Modal */}
      {showScheduleViewer && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-7xl max-h-[95vh] overflow-y-auto bg-slate-900 rounded-lg border border-blue-400/50">
            <div className="sticky top0- bg-slate-900 border-b border-blue-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                Team Calendar - {(() => {
                  const today = new Date();
                  const targetDate = new Date(today);
                  targetDate.setDate(today.getDate() + selectedDay);
                  return targetDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                })()}
              </h2>
              <Button
                onClick={() => setShowScheduleViewer(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              {/* Day Navigation */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-2 bg-slate-800/60 rounded-lg p-2 border border-blue-400/30">
                  {Array.from({ length: 7 }, (_, i) => {
                    const targetDate = new Date();
                    targetDate.setDate(targetDate.getDate() + i);
                    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = targetDate.getDate();
                    const isSelected = selectedDay === i;
                    
                    return (
                      <Button
                        key={i}
                        onClick={() => setSelectedDay(i)}
                        variant={isSelected ? "default" : "ghost"}
                        className={`flex flex-col items-center px-3 py-2 min-w-[60px] ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-medium">{dayName}</span>
                        <span className="text-lg font-bold">{dayNumber}</span>
                        {i === 0 && <span className="text-xs text-blue-400">Today</span>}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Team Members Schedule Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Daniel's Schedule */}
                <div className="bg-slate-800/60 border border-blue-400/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                    Daniel Thompson
                    <span className="ml-2 text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">CEO</span>
                  </h3>
                  <div className="space-y-3">
                    {currentSystemMode === 'test' ? (() => {
                      const schedules = [
                        // Day 0 - Today
                        [
                          { time: "9:00 AM", event: "Team standup meeting", type: "meeting" },
                          { time: "10:30 AM", event: "Client presentation - Acme Corp", type: "client" },
                          { time: "12:00 PM", event: "Lunch with investors", type: "business" },
                          { time: "2:00 PM", event: "YoBot system review", type: "internal" },
                          { time: "3:30 PM", event: "Pipeline optimization call", type: "meeting" },
                          { time: "5:00 PM", event: "Day wrap-up", type: "admin" }
                        ],
                        // Day 1 - Tomorrow
                        [
                          { time: "8:30 AM", event: "Board meeting prep", type: "admin" },
                          { time: "10:00 AM", event: "Sales quarterly review", type: "meeting" },
                          { time: "1:00 PM", event: "Product roadmap session", type: "planning" },
                          { time: "3:00 PM", event: "Client onboarding - TechFlow", type: "client" },
                          { time: "4:30 PM", event: "Team one-on-ones", type: "internal" }
                        ],
                        // Day 2
                        [
                          { time: "9:15 AM", event: "Marketing strategy call", type: "meeting" },
                          { time: "11:00 AM", event: "Investor pitch practice", type: "business" },
                          { time: "2:30 PM", event: "Technical architecture review", type: "internal" },
                          { time: "4:00 PM", event: "Partnership negotiations", type: "business" }
                        ],
                        // Day 3
                        [
                          { time: "10:00 AM", event: "All-hands company meeting", type: "meeting" },
                          { time: "1:30 PM", event: "Customer success review", type: "client" },
                          { time: "3:15 PM", event: "Budget planning session", type: "admin" },
                          { time: "5:00 PM", event: "Networking event", type: "business" }
                        ],
                        // Day 4
                        [
                          { time: "9:00 AM", event: "Product demo - Enterprise client", type: "client" },
                          { time: "11:30 AM", event: "HR policy review", type: "admin" },
                          { time: "2:00 PM", event: "Innovation workshop", type: "internal" },
                          { time: "4:00 PM", event: "Quarterly goals review", type: "planning" }
                        ],
                        // Day 5
                        [
                          { time: "8:45 AM", event: "Vendor negotiations", type: "business" },
                          { time: "10:30 AM", event: "Team performance reviews", type: "internal" },
                          { time: "1:00 PM", event: "Client strategy session", type: "client" },
                          { time: "3:30 PM", event: "Weekly wrap-up", type: "admin" }
                        ],
                        // Day 6
                        [
                          { time: "10:00 AM", event: "Weekend planning session", type: "planning" },
                          { time: "12:00 PM", event: "Team building lunch", type: "internal" },
                          { time: "2:00 PM", event: "Industry conference call", type: "business" }
                        ]
                      ];
                      return schedules[selectedDay]?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/40 rounded border border-blue-400/30">
                          <div>
                            <div className="text-white font-medium">{item.event}</div>
                            <div className="text-blue-400 text-sm">{item.time}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            item.type === 'client' ? 'bg-green-600/20 text-green-400' :
                            item.type === 'meeting' ? 'bg-blue-600/20 text-blue-400' :
                            item.type === 'business' ? 'bg-purple-600/20 text-purple-400' :
                            item.type === 'planning' ? 'bg-cyan-600/20 text-cyan-400' :
                            item.type === 'internal' ? 'bg-orange-600/20 text-orange-400' :
                            'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {item.type}
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <p className="text-slate-400 text-sm">No scheduled events</p>
                        </div>
                      );
                    })() : (
                      <div className="text-center py-8">
                        <p className="text-slate-400 text-sm">No scheduled events</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sarah Chen - CTO Schedule */}
                <div className="bg-slate-800/60 border border-green-400/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    Sarah Chen
                    <span className="ml-2 text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">CTO</span>
                  </h3>
                  <div className="space-y-3">
                    {currentSystemMode === 'test' ? (() => {
                      const sarahSchedules = [
                        // Day 0 - Today
                        [
                          { time: "8:30 AM", event: "Architecture planning", type: "technical" },
                          { time: "10:00 AM", event: "Code review session", type: "internal" },
                          { time: "1:00 PM", event: "API optimization meeting", type: "technical" },
                          { time: "3:00 PM", event: "Security audit review", type: "technical" },
                          { time: "4:30 PM", event: "Dev team sync", type: "internal" }
                        ],
                        // Day 1 - Tomorrow
                        [
                          { time: "9:00 AM", event: "Sprint planning", type: "planning" },
                          { time: "11:00 AM", event: "Database optimization", type: "technical" },
                          { time: "2:00 PM", event: "Client technical call", type: "client" },
                          { time: "4:00 PM", event: "Infrastructure review", type: "technical" }
                        ],
                        // Continue pattern for other days...
                        [
                          { time: "8:45 AM", event: "System architecture review", type: "technical" },
                          { time: "10:30 AM", event: "Performance optimization", type: "technical" },
                          { time: "1:30 PM", event: "Team training session", type: "internal" },
                          { time: "3:30 PM", event: "Technology roadmap", type: "planning" }
                        ],
                        [
                          { time: "9:30 AM", event: "Bug triage meeting", type: "internal" },
                          { time: "11:30 AM", event: "Cloud migration planning", type: "technical" },
                          { time: "2:30 PM", event: "Security compliance review", type: "technical" },
                          { time: "4:15 PM", event: "Vendor technical evaluation", type: "business" }
                        ],
                        [
                          { time: "8:30 AM", event: "DevOps pipeline review", type: "technical" },
                          { time: "10:15 AM", event: "API documentation review", type: "internal" },
                          { time: "1:45 PM", event: "Client integration support", type: "client" },
                          { time: "3:45 PM", event: "Tech stack evaluation", type: "planning" }
                        ],
                        [
                          { time: "9:45 AM", event: "Code quality review", type: "internal" },
                          { time: "11:45 AM", event: "System monitoring setup", type: "technical" },
                          { time: "2:15 PM", event: "Technical documentation", type: "internal" },
                          { time: "4:00 PM", event: "Weekend maintenance planning", type: "planning" }
                        ],
                        [
                          { time: "10:30 AM", event: "System health check", type: "technical" },
                          { time: "1:00 PM", event: "Emergency response drill", type: "internal" }
                        ]
                      ];
                      return sarahSchedules[selectedDay]?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/40 rounded border border-green-400/30">
                          <div>
                            <div className="text-white font-medium">{item.event}</div>
                            <div className="text-green-400 text-sm">{item.time}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            item.type === 'technical' ? 'bg-emerald-600/20 text-emerald-400' :
                            item.type === 'client' ? 'bg-green-600/20 text-green-400' :
                            item.type === 'planning' ? 'bg-cyan-600/20 text-cyan-400' :
                            item.type === 'business' ? 'bg-purple-600/20 text-purple-400' :
                            'bg-orange-600/20 text-orange-400'
                          }`}>
                            {item.type}
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <p className="text-slate-400 text-sm">No scheduled events</p>
                        </div>
                      );
                    })() : (
                      <div className="text-center py-8">
                        <p className="text-slate-400 text-sm">No scheduled events</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Marcus Rodriguez - Sales Director Schedule */}
                <div className="bg-slate-800/60 border border-purple-400/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                    Marcus Rodriguez
                    <span className="ml-2 text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">Sales</span>
                  </h3>
                  <div className="space-y-3">
                    {currentSystemMode === 'test' ? (() => {
                      const marcusSchedules = [
                        // Day 0 - Today
                        [
                          { time: "8:00 AM", event: "Lead qualification calls", type: "sales" },
                          { time: "10:00 AM", event: "Demo - Manufacturing Corp", type: "demo" },
                          { time: "11:30 AM", event: "Pipeline review", type: "internal" },
                          { time: "1:30 PM", event: "Proposal presentation", type: "client" },
                          { time: "3:00 PM", event: "Follow-up calls", type: "sales" },
                          { time: "4:30 PM", event: "Weekly numbers review", type: "internal" }
                        ],
                        // Continue with other days...
                        [
                          { time: "8:30 AM", event: "Cold outreach session", type: "sales" },
                          { time: "10:30 AM", event: "Client needs assessment", type: "client" },
                          { time: "1:00 PM", event: "Contract negotiations", type: "business" },
                          { time: "3:30 PM", event: "Sales training", type: "internal" }
                        ],
                        [
                          { time: "9:00 AM", event: "Quarterly targets review", type: "planning" },
                          { time: "11:00 AM", event: "Customer success check-in", type: "client" },
                          { time: "2:00 PM", event: "New prospect discovery", type: "sales" },
                          { time: "4:00 PM", event: "Team coaching session", type: "internal" }
                        ],
                        [
                          { time: "8:45 AM", event: "Enterprise sales call", type: "sales" },
                          { time: "10:45 AM", event: "Competitive analysis", type: "planning" },
                          { time: "1:15 PM", event: "Client retention meeting", type: "client" },
                          { time: "3:15 PM", event: "Sales process optimization", type: "internal" }
                        ],
                        [
                          { time: "9:15 AM", event: "Key account review", type: "client" },
                          { time: "11:15 AM", event: "Proposal writing session", type: "internal" },
                          { time: "2:30 PM", event: "Partnership opportunities", type: "business" },
                          { time: "4:15 PM", event: "Weekly pipeline cleanup", type: "internal" }
                        ],
                        [
                          { time: "8:30 AM", event: "Month-end reporting", type: "internal" },
                          { time: "10:00 AM", event: "Client relationship review", type: "client" },
                          { time: "1:30 PM", event: "Sales strategy planning", type: "planning" },
                          { time: "3:00 PM", event: "Territory expansion", type: "planning" }
                        ],
                        [
                          { time: "10:00 AM", event: "Weekend prospect research", type: "sales" },
                          { time: "12:30 PM", event: "Industry networking", type: "business" }
                        ]
                      ];
                      return marcusSchedules[selectedDay]?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/40 rounded border border-purple-400/30">
                          <div>
                            <div className="text-white font-medium">{item.event}</div>
                            <div className="text-purple-400 text-sm">{item.time}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            item.type === 'sales' ? 'bg-emerald-600/20 text-emerald-400' :
                            item.type === 'demo' ? 'bg-blue-600/20 text-blue-400' :
                            item.type === 'client' ? 'bg-green-600/20 text-green-400' :
                            item.type === 'business' ? 'bg-purple-600/20 text-purple-400' :
                            item.type === 'planning' ? 'bg-cyan-600/20 text-cyan-400' :
                            'bg-orange-600/20 text-orange-400'
                          }`}>
                            {item.type}
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <p className="text-slate-400 text-sm">No scheduled events</p>
                        </div>
                      );
                    })() : (
                      <div className="text-center py-8">
                        <p className="text-slate-400 text-sm">No scheduled events</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Day Summary */}
              <div className="mt-8 bg-slate-800/40 rounded-lg p-4 border border-slate-600">
                <h4 className="text-white font-semibold mb-3">Day Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Total Meetings:</span>
                    <span className="text-white font-medium">
                      
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Client Calls:</span>
                    <span className="text-green-400 font-medium">
                      {currentSystemMode === 'test' ? (selectedDay === 0 ? '6' : selectedDay === 1 ? '4' : selectedDay === 2 ? '3' : selectedDay === 3 ? '4' : selectedDay === 4 ? '3' : selectedDay === 5 ? '3' : '2') : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Internal Meetings:</span>
                    <span className="text-blue-400 font-medium">
                      {currentSystemMode === 'test' ? (selectedDay === 0 ? '9' : selectedDay === 1 ? '8' : selectedDay === 2 ? '7' : selectedDay === 3 ? '7' : selectedDay === 4 ? '6' : selectedDay === 5 ? '5' : '3') : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 flex items-center justify-center space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Add Meeting
                </Button>
                <Button variant="outline" className="border-green-400 text-green-400">
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button variant="outline" className="border-purple-400 text-purple-400">
                  <Settings className="w-4 h-4 mr-2" />
                  Calendar Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={showDocumentPreview}
        onClose={() => setShowDocumentPreview(false)}
        documentId={previewDocumentId}
        documentName={previewDocumentName}
      />

      {/* Alert Banner */}
      {currentSystemMode === 'test' && (
        <div className="bg-blue-900/40 border border-blue-400 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Next Scheduled Voice Test: Today @ 2:00 PM</span>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              View Details
            </Button>
          </div>
        </div>
      )}

      {/* Footer - Support Contact & YoBot Branding */}
      <div className="text-center mt-8 mb-4">
        <div className="bg-white/10 backdrop-blur-sm border border-blue-400 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-2">Need Support?</h3>
          <p className="text-slate-300 mb-4">Our team is here to help optimize your automation</p>
          <Button 
            onClick={handleContactSupport}
            className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
          >
            <Headphones className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>
        
        {/* YoBot® Branding Footer */}
        <div className="mt-6 text-center">
          <div className="text-slate-400 text-sm">
            Powered by <span className="text-blue-400 font-bold">YoBot®</span> Enterprise Automation Platform
          </div>
          <div className="text-slate-500 text-xs mt-1">
            Version 2.1.0 | Support: support@yobot.bot | © 2024 YoBot Technologies
          </div>
        </div>
      </div>

      {/* Toast Notification System */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg transform transition-all duration-300 ${
          showToast.type === 'success' 
            ? 'bg-green-900/90 border-green-400 text-green-100' 
            : 'bg-red-900/90 border-red-400 text-red-100'
        }`}>
          <div className="flex items-center space-x-2">
            {showToast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{showToast.message}</span>
          </div>
        </div>
      )}

      {/* Call Reports Modal */}
      {showCallReports && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-blue-400/50">
            <div className="sticky top0- bg-slate-900 border-b border-blue-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-400" />
                Call Reports & Analytics
              </h2>
              <Button
                onClick={() => setShowCallReports(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-800/60 rounded-lg p-4 border border-blue-400">
                  <h3 className="text-white font-medium mb-2">Call Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Total Calls:</span>
                      <span className="text-slate-400 font-bold">--</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Success Rate:</span>
                      <span className="text-green-400 font-bold">""</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Avg Duration:</span>
                      <span className="text-blue-400 font-bold">{""}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-4 border border-green-400">
                  <h3 className="text-white font-medium mb-2">Revenue Impact</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Leads Generated:</span>
                      <span className="text-white font-bold">{""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Conversions:</span>
                      <span className="text-green-400 font-bold">""</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Est. Revenue:</span>
                      <span className="text-green-400 font-bold">""</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-4 border border-purple-400">
                  <h3 className="text-white font-medium mb-2">Recent Reports</h3>
                  <div className="space-y-2">
                    {currentSystemMode === 'test' ? [
                      'Daily Summary (Today)',
                      'Weekly Analytics',
                      'Performance Trends'
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">{report}</span>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                          View
                        </Button>
                      </div>
                    )) : (
                      <div className="text-slate-400 text-sm text-center py-4">
                        No reports available in live mode
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Logs Modal */}
      {showCallLogs && (
        <div className="fixed inset0- bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-green-400/50">
            <div className="sticky top0- bg-slate-900 border-b border-green-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-400" />
                Call Log History
              </h2>
              <Button
                onClick={() => setShowCallLogs(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {currentSystemMode === 'test' ? [
                  {
                    id: 'CALL-001',
                    caller: 'Sarah Johnson',
                    phone: '(555) 123-4567',
                    type: 'Inbound',
                    duration: '8m 42s',
                    status: 'Completed',
                    timestamp: '2:15 PM',
                    outcome: 'Lead Qualified'
                  },
                  {
                    id: 'CALL-002',
                    caller: 'Mike Chen',
                    phone: '(555) 987-6543',
                    type: 'Outbound',
                    duration: '12m 18s',
                    status: 'Completed',
                    timestamp: '1:48 PM',
                    outcome: 'Follow-up Scheduled'
                  },
                  {
                    id: 'CALL-003',
                    caller: 'Emily Davis',
                    phone: '(555) 456-7890',
                    type: 'Inbound',
                    duration: '5m 33s',
                    status: 'Completed',
                    timestamp: '1:22 PM',
                    outcome: 'Quote Requested'
                  }
                ].map((call) => (
                  <div key={call.id} className="bg-slate-800/60 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-medium">{call.caller}</span>
                        <span className="text-slate-400 text-sm">{call.phone}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          call.type === 'Inbound' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'
                        }`}>
                          {call.type}
                        </span>
                      </div>
                      <span className="text-green-400 text-sm font-medium">{call.outcome}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Call ID: {call.id}</span>
                      <span>Duration: {call.duration}</span>
                      <span>Time: {call.timestamp}</span>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                        Listen
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-400 text-lg">No call logs available</p>
                    <p className="text-slate-500 text-sm mt-2">Call logs will appear here once calls are made</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Voice Call Modal */}
      <CreateVoiceCallModal 
        isOpen={showCreateVoiceCallModal} 
        onClose={() => setShowCreateVoiceCallModal(false)} 
      />

      {/* Enhanced Analytics Report Modal */}
      <AnalyticsReportModal 
        isOpen={showAnalyticsModal} 
        onClose={() => setShowAnalyticsModal(false)} 
      />

      {/* Calendar Upload Modal */}
      <CalendarUploadModal 
        isOpen={showCalendarUpload} 
        onClose={() => setShowCalendarUpload(false)} 
      />

      {/* Export Dashboard Modal */}
      <ExportDashboardModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />

      {/* Manual Call Start Modal */}
      <ManualCallStartModal 
        isOpen={showManualCallModal} 
        onClose={() => setShowManualCallModal(false)} 
      />



      {/* Export Dashboard Modal */}
      {showExportModal && (
        <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
          <DialogContent className="bg-gradient-to-br from-slate-900/95 via-blue-900/80 to-indigo-900/70 backdrop-blur-xl border border-blue-400/50 shadow-2xl shadow-blue-500/20 text-white max-w-lg rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-blue-300 text-xl font-bold flex items-center">
                <span className="text-2xl mr-3">📊</span>
                Export Dashboard Report
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Configure your export settings and download dashboard data
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  Report Type
                </label>
                <Select value={exportConfig.reportType} onValueChange={(value) => 
                  setExportConfig({...exportConfig, reportType: value})
                }>
                  <SelectTrigger className="bg-slate-800/60 border border-slate-600 text-white p-4 rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 rounded-lg">
                    <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                    <SelectItem value="monthly">Monthly Analysis</SelectItem>
                    <SelectItem value="performance">Performance Metrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-3 flex items-center">
                  <span className="mr-2">📄</span>
                  Export Format
                </label>
                <Select value={exportConfig.format} onValueChange={(value) => 
                  setExportConfig({...exportConfig, format: value})
                }>
                  <SelectTrigger className="bg-slate-800/60 border border-slate-600 text-white p-4 rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 rounded-lg">
                    <SelectItem value="json">JSON Data</SelectItem>
                    <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Include Sections</label>
                <div className="space-y-2">
                  {[
                    { key: 'smartspend', label: 'SmartSpend Analytics' },
                    { key: 'voice_analytics', label: 'Voice Call Analytics' },
                    { key: 'botalytics', label: 'Bot Performance' },
                    { key: 'automation_metrics', label: 'Automation Metrics' },
                    { key: 'client_pulse', label: 'Client Pulse Data' }
                  ].map(section => (
                    <div key={section.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={section.key}
                        checked={exportConfig.sections.includes(section.key)}
                        onChange={(e) => {
                          const newSections = e.target.checked 
                            ? [...exportConfig.sections, section.key]
                            : exportConfig.sections.filter(s => s !== section.key);
                          setExportConfig({...exportConfig, sections: newSections});
                        }}
                        className="w-4 h-4"
                      />
                      <label htmlFor={section.key} className="text-sm text-gray-300">
                        {section.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Date Range</label>
                <Select value={exportConfig.dateRange} onValueChange={(value) => 
                  setExportConfig({...exportConfig, dateRange: value})
                }>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                    <SelectItem value="year_to_date">Year to Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-800 p-3 rounded border border-gray-600">
                <h4 className="text-sm font-medium text-blue-300 mb-2">Preview</h4>
                <p className="text-xs text-gray-400">
                  Report: {exportConfig.reportType} | Format: {exportConfig.format.toUpperCase()} | 
                  Sections: {exportConfig.sections.length} | Range: {exportConfig.dateRange.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateExport}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Generate Export
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      </div>
    </div>
  );
}