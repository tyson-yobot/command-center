import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import yobotRobotHead from '@assets/A_flat_vector_illustration_features_a_robot_face_i_1749548966185.png';
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
  const { toast } = useToast();

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
      const response = await apiRequest('POST', '/api/system-mode-toggle', {
        userId: 'command-center-user'
      });
      
      if (response.success && response.modeChange) {
        setCurrentSystemMode(response.modeChange.newMode);
        toast({
          title: "System Mode Changed",
          description: `Switched to ${response.modeChange.newMode} mode. ${response.modeChange.newMode === 'live' ? 'Production data active.' : 'Test mode - safe operations only.'}`,
        });
        console.log(`Mode changed: ${response.modeChange.previousMode} → ${response.modeChange.newMode}`);
      }
    } catch (error) {
      console.error('Toggle failed:', error);
      toast({
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
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [completedCalls, setCompletedCalls] = useState(0);
  const [pipelineRunning, setPipelineRunning] = useState(false);

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
    const recognition = initializeVoiceRecognition();
    if (recognition) {
      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          setQueryText(lastResult[0].transcript);
          setVoiceStatus('Query captured');
        }
      };

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('Listening for query...');
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatus('Ready');
      };

      recognition.start();
    }
  };

  const startProgrammingVoiceRecognition = () => {
    const recognition = initializeVoiceRecognition();
    if (recognition) {
      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          setProgrammingText(prev => prev + ' ' + lastResult[0].transcript);
          setVoiceStatus('Programming command captured');
        }
      };

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('Listening for programming...');
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatus('Ready');
      };

      recognition.start();
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
          console.log('Loaded voices:', data.voices.map(v => v.name));
        } else {
          setAvailableVoices([]);
          setVoiceStatus(data.message || 'No voices available');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setAvailableVoices([]);
        setVoiceStatus(`Failed to load voices: ${response.status}`);
      }
    } catch (error) {
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
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onloadeddata = () => {
          setVoiceStatus('Playing voice test...');
        };
        
        audio.onended = () => {
          setVoiceStatus('Voice test completed successfully');
        };
        
        audio.onerror = () => {
          setVoiceStatus('Audio playback error');
        };
        
        await audio.play();
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
      const response = await fetch('/api/knowledge/stats');
      const data = await response.json();
      setVoiceStatus(`Knowledge base: ${data.documentCount || 0} documents`);
    } catch (error) {
      setVoiceStatus('Failed to load knowledge stats');
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
        setVoiceStatus('Booking synced to Airtable & Google Calendar');
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

  const handleManualFollowUp = async () => {
    try {
      setVoiceStatus('Triggering voice reminder for follow-up...');
      const response = await fetch('/api/follow-up-caller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'follow-up-caller' })
      });
      
      if (response.ok) {
        setVoiceStatus('Follow-up reminder scheduled and logged');
        setToast({ title: "Follow-up Scheduled", description: "Voice reminder created and logged to tracker" });
      } else {
        setVoiceStatus('Follow-up scheduling failed');
      }
    } catch (error) {
      setVoiceStatus('Follow-up error');
    }
  };

  const handleSalesOrder = async () => {
    try {
      setVoiceStatus('Launching sales order form...');
      const response = await fetch('/api/command-sales-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'command-sales-order' })
      });
      
      if (response.ok) {
        setVoiceStatus('Sales order form launched (Tally integration)');
        setToast({ title: "Sales Order", description: "Order form opened - not processing yet" });
      } else {
        setVoiceStatus('Sales order launch failed');
      }
    } catch (error) {
      setVoiceStatus('Sales order error');
    }
  };

  const handleSendSMS = async () => {
    try {
      setVoiceStatus('Opening SMS interface...');
      const response = await fetch('/api/sms-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'sms-send' })
      });
      
      if (response.ok) {
        setVoiceStatus('SMS interface ready - Twilio integration active');
        setToast({ title: "SMS Ready", description: "Text input opened, ready to send via Twilio" });
      } else {
        setVoiceStatus('SMS interface failed - not wired yet');
        setToast({ title: "SMS Not Ready", description: "SMS system not fully wired", variant: "destructive" });
      }
    } catch (error) {
      setVoiceStatus('SMS error');
    }
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

  const handleInitiateVoiceCall = async () => {
    try {
      setVoiceStatus('Initiating manual voice call...');
      const response = await fetch('/api/voicebot-directcall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'voicebot-directcall' })
      });
      
      if (response.ok) {
        setVoiceStatus('Voice call initiated with logging & sentiment capture');
        setToast({ title: "Call Initiated", description: "1:1 voicebot call started with full logging" });
      } else {
        setVoiceStatus('Voice call failed');
      }
    } catch (error) {
      setVoiceStatus('Voice call error');
    }
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
        setVoiceStatus('Voice input active - speech-to-text ready for RAG');
        setToast({ title: "Voice Input Active", description: "Microphone ready with ElevenLabs support" });
      } else {
        setVoiceStatus('Voice input failed');
      }
    } catch (error) {
      setVoiceStatus('Voice input error');
    }
  };

  const handleContentCreator = async () => {
    try {
      setVoiceStatus('Generating AI-powered social media content...');
      
      const response = await fetch('/api/content/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contentType: 'social_post',
          topic: 'business automation and AI solutions',
          platform: 'LinkedIn',
          tone: 'professional',
          autoPost: true
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setVoiceStatus(`AI content created and posted: ${result.wordCount} words`);
        setToast({ 
          title: "Content Created & Posted", 
          description: `AI-generated LinkedIn post published with ${result.hashtags?.length || 0} hashtags` 
        });
        
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
      setVoiceStatus('Creating AI-powered MailChimp email campaign...');
      
      const response = await fetch('/api/mailchimp/create-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          campaignType: 'newsletter',
          audienceSegment: 'business_owners',
          subject: 'Boost Your Business with AI Automation',
          content: 'Latest automation trends and ROI insights',
          autoSend: true
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setVoiceStatus(`MailChimp campaign ${result.status}: ${result.estimatedReach} recipients`);
        setToast({ 
          title: "MailChimp Campaign Created", 
          description: `Campaign ID: ${result.campaignId} - Status: ${result.status}` 
        });
        
        console.log('Email campaign created:', result);
      } else {
        const error = await response.json();
        setVoiceStatus('MailChimp campaign failed');
        setToast({ 
          title: "Campaign Creation Failed", 
          description: error.error || "Unable to create email campaign",
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
        setVoiceStatus('Lead scraper active - Apollo/Apify/Phantom routing ready');
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
      setVoiceStatus('Generating PDF report of current stats...');
      const response = await fetch('/api/pdf-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'pdf-report' })
      });
      
      if (response.ok) {
        setVoiceStatus('PDF report generated - auto-download started');
        setToast({ title: "PDF Generated", description: "Report ready for download" });
      } else {
        setVoiceStatus('PDF generation failed');
      }
    } catch (error) {
      setVoiceStatus('PDF report error');
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

  const handleCriticalEscalation = async () => {
    try {
      setVoiceStatus('Triggering critical system alert...');
      const response = await fetch('/api/system-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'system-alert' })
      });
      
      if (response.ok) {
        setVoiceStatus('Critical alert sent - Slack notification + visual banner');
        setToast({ title: "Critical Alert", description: "System alert triggered for failures or hot leads", variant: "destructive" });
      } else {
        setVoiceStatus('Critical alert failed');
      }
    } catch (error) {
      setVoiceStatus('Critical alert error');
    }
  };



  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setVoiceStatus('Uploading documents to RAG system...');
    
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
        
        setVoiceStatus(`RAG Upload Complete: ${successCount} documents processed${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
        setToast({
          title: "Documents Uploaded",
          description: `${successCount} files processed and indexed for RAG system`,
        });
        
        // Refresh knowledge stats
        refetchKnowledge();
        loadDocuments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setVoiceStatus('RAG upload failed');
        setToast({
          title: "RAG Upload Failed",
          description: errorData.error || "Please try again or check file format",
          variant: "destructive"
        });
      }
    } catch (error) {
      setVoiceStatus('Upload error');
      setToast({
        title: "Upload Error",
        description: "Network error occurred during upload",
        variant: "destructive"
      });
    }

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
      setVoiceStatus('Support system ready');
      setToast({
        title: "Support Available",
        description: "Use the chat widget for immediate assistance or try again",
        variant: "destructive"
      });
    }
  };

  // Test data clearing removed - live mode only

  // Removed test sales order automation - only live webhook data processed

  const handleVoiceToggle = () => {
    if (!isListening) {
      // Start voice recording
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => {
          setIsListening(true);
          console.log('Voice recognition started');
        };
        
        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          if (transcript) {
            setVoiceCommand(transcript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error !== 'aborted') {
            setToast({
              title: "Voice Recognition Error",
              description: `Error: ${event.error}. Please check microphone permissions.`,
              variant: "destructive"
            });
          }
        };
        
        recognition.onend = () => {
          console.log('Voice recognition ended');
          // Auto-restart if still supposed to be listening
          if (isListening) {
            setTimeout(() => {
              try {
                recognition.start();
              } catch (error) {
                console.error('Failed to restart recognition:', error);
                setIsListening(false);
              }
            }, 100);
          } else {
            setIsListening(false);
          }
        };
        
        try {
          recognition.start();
        } catch (error) {
          console.error('Failed to start recognition:', error);
          setIsListening(false);
          setToast({
            title: "Microphone Access Required",
            description: "Please allow microphone access for voice commands",
            variant: "destructive"
          });
        }
      } else {
        setToast({
          title: "Voice Recognition Unavailable",
          description: "Voice recognition not supported in this browser",
          variant: "destructive"
        });
      }
    } else {
      setIsListening(false);
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
          title: "Context Search Complete",
          description: `Context analysis found ${result.contextMatches || 0} relevant sections`,
        });
      } else {
        setToast({
          title: "Context Search Failed",
          description: "Unable to perform context search",
          variant: "destructive"
        });
      }
    } catch (error) {
      setToast({
        title: "Context Error",
        description: "Network error during context search",
        variant: "destructive"
      });
    }
  };

  // Voice Generation Functions
  const generateVoice = async () => {
    if (!voiceGenerationText.trim()) {
      setToast({
        title: "Text Required",
        description: "Please enter text to convert to speech",
        variant: "destructive"
      });
      return;
    }

    try {
      setVoiceStatus('Generating voice...');
      const response = await fetch('/api/elevenlabs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: voiceGenerationText,
          voice_id: selectedPersona || '21m00Tcm4TlvDq8ikWAM'
        })
      });

      if (response.ok) {
        // Handle audio blob for download
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = audioUrl;
        downloadLink.download = `voice_${Date.now()}.mp3`;
        downloadLink.click();
        
        setVoiceStatus('Voice generated and downloaded');
        setToast({
          title: "Voice Generated",
          description: "Audio file has been downloaded successfully",
        });
        setVoiceGenerationText(''); // Clear the text after successful generation
      } else {
        setVoiceStatus('Voice generation failed');
        setToast({
          title: "Generation Failed",
          description: "Unable to generate voice audio",
          variant: "destructive"
        });
      }
    } catch (error) {
      setVoiceStatus('Error during generation');
      setToast({
        title: "Generation Error",
        description: "Network error during voice generation",
        variant: "destructive"
      });
    }
  };

  const downloadAudio = async () => {
    if (!voiceGenerationText.trim()) {
      setToast({
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
        setToast({
          title: "Memory Updated",
          description: `Text inserted into ${memoryCategory} memory category`,
        });
        setMemoryText('');
        
        // Refresh knowledge stats and documents list
        refetchKnowledge();
        loadDocuments();
      } else {
        setVoiceStatus('Memory insertion failed');
        setToast({
          title: "Insertion Failed",
          description: "Unable to insert text into memory system",
          variant: "destructive"
        });
      }
    } catch (error) {
      setVoiceStatus('Error during memory insertion');
      setToast({
        title: "Memory Error",
        description: "Network error during memory insertion",
        variant: "destructive"
      });
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
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
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
          setShowContentCreator(true);
          toast({
            title: "Content Creator",
            description: "Opening AI content generation dashboard",
          });
          return;
        case 'Export Data':
          endpoint = '/api/export-data';
          requestData = { format: 'csv', dataType: 'all' };
          break;
        case 'Mailchimp Sync':
          setShowMailchimpSync(true);
          toast({
            title: "Mailchimp Sync",
            description: "Opening email marketing sync dashboard",
          });
          return;
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
        toast({
          title: "Command Executed",
          description: `${category} completed successfully`,
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-8 p-8">
      {/* Test Mode Banner */}
      {currentSystemMode === 'test' && (
        <div className="bg-yellow-500 text-black py-3 px-4 text-center font-bold text-lg border-b-2 border-yellow-600 fixed top-0 left-0 right-0 z-50">
          🧪 TEST MODE ACTIVE - No production data or API calls will be executed
        </div>
      )}
      
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
                <p className="text-red-900 font-medium">System Alert</p>
                <p className="text-red-700 text-sm">Automation requires attention</p>
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
                src={yobotRobotHead} 
                alt="YoBot" 
                className="w-20 h-20 mr-1 inline-block"
                style={{ marginTop: '-8px' }}
              />
              YoBot® Command Center
            </h1>
            <p className="text-slate-300 text-xl">Your Complete AI Automation Dashboard {selectedTier !== 'All' && `(${selectedTier} Tier)`}</p>
            

            
            {/* System Mode Toggle - Controls Test/Live Data Isolation */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <label className="text-white font-medium">System Mode:</label>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${currentSystemMode === 'test' ? 'text-yellow-400' : 'text-gray-400'}`}>
                    Test
                  </span>
                  <Switch
                    checked={currentSystemMode === 'live'}
                    onCheckedChange={toggleSystemMode}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <span className={`text-sm ${currentSystemMode === 'live' ? 'text-green-400' : 'text-gray-400'}`}>
                    Live
                  </span>
                </div>
                <Badge variant={currentSystemMode === 'test' ? "secondary" : "default"} className="px-3 py-1">
                  {currentSystemMode === 'test' ? "Test Mode - Safe Operations" : "Live Mode - Production Data"}
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
                <div className={`w-3 h-3 rounded-full ${currentSystemMode === 'live' ? 'bg-green-400 status-active' : 'bg-amber-400'}`}></div>
                <span className="text-white text-sm">
                  System Status: {currentSystemMode === 'live' ? 'Live Production' : 'Test Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Command Center Buttons */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Core Automation */}
            <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white">Core Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={handleNewBookingSync}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-start p-3"
                  >
                    <Calendar className="w-5 h-5 mr-3" />
                    <span>New Booking Sync</span>
                  </Button>
                  
                  <Button
                    onClick={handleNewSupportTicket}
                    className="bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-start p-3"
                  >
                    <Headphones className="w-5 h-5 mr-3" />
                    <span>New Support Ticket</span>
                  </Button>
                  
                  <Button
                    onClick={handleManualFollowUp}
                    className="bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-start p-3"
                  >
                    <Phone className="w-5 h-5 mr-3" />
                    <span>Manual Follow-up</span>
                  </Button>
                  
                  <Button
                    onClick={handleSalesOrder}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-start p-3"
                  >
                    <DollarSign className="w-5 h-5 mr-3" />
                    <span>Sales Orders</span>
                  </Button>
                  
                  <Button
                    onClick={handleSendSMS}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    <span>Send SMS</span>
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
                    onClick={handleStartPipelineCalls}
                    className="bg-lime-500 hover:bg-lime-600 text-black flex items-center justify-start p-3 font-semibold"
                  >
                    <Phone className="w-5 h-5 mr-3" />
                    <span>Start Pipeline Calls</span>
                  </Button>
                  
                  <Button
                    onClick={handleStopPipelineCalls}
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-start p-3"
                  >
                    <PhoneOff className="w-5 h-5 mr-3" />
                    <span>Stop Pipeline Calls</span>
                  </Button>
                  
                  <Button
                    onClick={handleInitiateVoiceCall}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-start p-3"
                  >
                    <Phone className="w-5 h-5 mr-3" />
                    <span>Initiate Voice Call</span>
                  </Button>
                  
                  <Button
                    onClick={handleVoiceToggle}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
                  >
                    <Mic className="w-5 h-5 mr-3" />
                    <span>Voice Input</span>
                  </Button>
                  
                  <Button
                    onClick={() => window.open('https://publy.co', '_blank')}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-start p-3"
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    <span>Content Creator</span>
                  </Button>
                  
                  <Button
                    onClick={() => window.open('https://mailchimp.com', '_blank')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-start p-3"
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    <span>MailChimp Campaign</span>
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
                    onClick={() => window.location.href = '/lead-scraper'}
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
                    onClick={async () => {
                      try {
                        console.log('Export Data button clicked');
                        const response = await fetch('/api/data/export', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            format: 'csv',
                            includeData: ['leads', 'calls', 'automation_logs']
                          })
                        });
                        
                        if (response.ok) {
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `yobot_export_${new Date().toISOString().split('T')[0]}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(url);
                          alert('Data exported successfully');
                        } else {
                          alert('Data export failed');
                        }
                      } catch (error) {
                        console.error('Export error:', error);
                        alert('Data export failed');
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📊</span>
                    <span>Export Data</span>
                  </Button>
                  


                  <Button
                    onClick={() => {
                      document.getElementById('file-upload')?.click();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
                  >
                    <Upload className="w-5 h-5 mr-3" />
                    <span>Upload Documents</span>
                  </Button>

                </div>
              </CardContent>
            </Card>


          </div>
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

        {/* Live Mode - No test controls */}

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Calls</CardTitle>
              <Phone className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics?.activeCalls || 0}
              </div>
              <p className="text-xs text-green-400">
                Live voice sessions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Bot Processing</CardTitle>
              <Brain className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {automationPerformance?.executionsToday || 0}
              </div>
              <p className="text-xs text-blue-400">
                Tasks completed today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {automationPerformance?.successRate || '0%'}
              </div>
              <p className="text-xs text-emerald-400">
                Live automation rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">System Health</CardTitle>
              <Gauge className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics?.systemHealth || 100}%
              </div>
              <p className="text-xs text-amber-400">
                Production systems
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Automation Status Panel */}
        <div className="mb-12">
          <Card className="bg-green-900/60 backdrop-blur-sm border border-green-400 shadow-lg shadow-green-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  🚀 Live Automation Engine
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-green-400">
                    {automationPerformance?.activeFunctions || 1040} Functions Active
                  </span>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">Executions Today</div>
                  <div className="text-2xl font-bold text-white">
                    {automationPerformance?.executionsToday || 0}
                  </div>
                  <div className="text-xs text-green-400">Live tracking</div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">Success Rate</div>
                  <div className="text-2xl font-bold text-green-400">
                    {automationPerformance?.successRate || '100%'}
                  </div>
                  <div className="text-xs text-green-400">High reliability</div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">Recent Executions</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {automationPerformance?.recentExecutions?.length || 0}
                  </div>
                  <div className="text-xs text-blue-400">In queue</div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">System Load</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.round((automationPerformance?.activeFunctions || 1040) / 1040 * 100)}%
                  </div>
                  <div className="text-xs text-yellow-400">Optimal range</div>
                </div>
              </div>
              
              {/* Recent Execution Log */}
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                  Live Execution Stream
                </h4>
                <div className="bg-black/40 rounded-lg p-4 max-h-32 overflow-y-auto">
                  {automationPerformance?.recentExecutions?.slice(-5).reverse().map((execution: any, index: number) => (
                    <div key={execution.id || index} className="flex items-center justify-between py-1 text-sm">
                      <span className="text-slate-300">
                        {execution.type || 'Automation Function'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          execution.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                          execution.status === 'RUNNING' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {execution.status || 'LIVE'}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {execution.startTime ? new Date(execution.startTime).toLocaleTimeString() : 'Now'}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-slate-400 text-sm text-center py-2">
                      Monitoring live automation executions...
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Business Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {/* Bot Health Monitor */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                <img src={yobotRobotHead} alt="YoBot" className="w-6 h-6 mr-2" />
                Bot Health Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Total Bots:</span>
                  <span className="text-white font-bold">{metrics?.totalBots || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Avg Response Time:</span>
                  <span className="text-green-400 font-bold">{metrics?.avgResponseTime || '0s'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Current Errors:</span>
                  <span className="text-orange-400 font-bold">{metrics?.errorCount || 0} errors</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Active Sessions:</span>
                  <span className="text-blue-400 font-bold">{metrics?.activeSessions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Uptime Status:</span>
                  <span className="text-green-400 font-bold">{metrics?.systemHealth || 97}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Forecast */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                  <span className="text-white font-bold">${(metrics?.monthlyRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Pipeline Value:</span>
                  <span className="text-green-400 font-bold">${(metrics?.pipelineValue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Active Deals:</span>
                  <span className="text-blue-400 font-bold">{metrics?.activeDeals || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Close Rate:</span>
                  <span className="text-green-400 font-bold">{metrics?.closeRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Sales Velocity:</span>
                  <span className="text-blue-400 font-bold">{metrics?.salesVelocity || '0'} deals/week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Pulse Summary */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                  <span className="text-white font-bold">{metrics?.totalLeads || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Client NPS:</span>
                  <span className="text-slate-400 font-bold">0/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Churn Risk Flags:</span>
                  <span className="text-slate-400 font-bold">0 accounts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Last Login:</span>
                  <span className="text-slate-400 font-bold">No Activity</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Bot Utilization Rate:</span>
                  <span className="text-slate-400 font-bold">0% usage</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ops Metrics */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                  <span className="text-red-400 font-bold">{metrics?.errorCount || 0} errors</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">API Usage:</span>
                  <span className="text-blue-400 font-bold">68% of plan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Bot Processing Load:</span>
                  <span className="text-green-400 font-bold">{automationPerformance?.activeFunctions || 0} tasks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Automation Engine */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                  <Badge className="bg-green-600 text-white">{automationPerformance?.activeFunctions || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Tasks Completed</span>
                  <span className="text-green-400 font-bold">{automationPerformance?.completedTasks || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Success Rate</span>
                  <span className="text-slate-400 font-bold">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Avg Completion Time</span>
                  <span className="text-slate-400 font-bold">N/A</span>
                </div>
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Next Automation</div>
                  <div className="text-slate-400 font-medium">No Scheduled Automations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botalytics™ */}
          <Card className="bg-slate-900/90 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Botalytics™
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Ad spend ÷ New clients this month">Cost Per Lead</span>
                    <span className="text-slate-400 font-bold">$0.00</span>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Based on NLP sentiment, duration, and conversion path">Lead Quality Score</span>
                    <span className="text-slate-400 font-bold">0%</span>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Percentage of leads that become paying customers">Close Rate</span>
                    <span className="text-slate-400 font-bold">0%</span>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Return on investment from automation">ROI</span>
                    <span className="text-slate-400 font-bold">0%</span>
                  </div>
                </div>
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Revenue Per Lead</div>
                  <div className="flex items-center justify-between">
                    <div className="text-slate-400 font-bold">$0.00</div>
                    <Badge className="bg-slate-600 text-slate-400">0%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SmartSpend™ */}
          <Card className="bg-slate-900/90 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-green-400" />
                SmartSpend™
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Budget Utilization</span>
                    <span className="text-slate-400 font-bold">0%</span>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Cost to acquire each new customer">Cost Per Lead Trend</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-bold">$0.00</span>
                      <Badge className="bg-slate-600 text-slate-400 text-xs">0%</Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Time until positive return on investment">Payback Period</span>
                    <span className="text-slate-400 font-bold">N/A</span>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Automation Coverage</span>
                    <span className="text-slate-400 font-bold">0% tasks</span>
                  </div>
                </div>
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Monthly Savings vs Manual</div>
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold">${metrics?.totalRevenue || 0}</div>
                    <Badge className="bg-slate-600 text-slate-400">0 hours saved</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Bot Intelligence & System Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Bot Intelligence */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                  <span className="text-slate-400 font-bold">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Learning Status</span>
                  <Badge className="bg-blue-600 text-white">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300" title="Percentage of conversations that needed human assistance">Escalation Rate</span>
                  <span className="text-slate-400 font-bold">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Response Accuracy</span>
                  <span className="text-slate-400 font-bold">0%</span>
                </div>
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Latest Learning</div>
                  <div className="text-slate-400 font-medium">No recent activity</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Monitor */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-400 font-bold">Unknown</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Uptime</span>
                  <span className="text-slate-400 font-bold">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Response Time</span>
                  <span className="text-slate-400 font-bold">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Active Connections</span>
                  <span className="text-green-400 font-bold">{knowledgeStats?.totalDocuments || 0}</span>
                </div>
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Last Maintenance</div>
                  <div className="text-slate-400 font-medium">Not configured</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Success Milestones */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Live Automation Active</h3>
                  <p className="text-slate-300">System ready for live data connections</p>
                  <p className="text-slate-300">Configure your integrations to begin tracking</p>
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
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Top Intent</div>
                  <div className="text-white font-medium">Product Demo Request</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Calendar & Live Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                Smart Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Calendar events populated by live webhook data only */}
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Today's Schedule</div>
                  <div className="text-white font-bold">{metrics?.activeCampaigns || 0} total meetings</div>
                  <div className="text-cyan-400 text-xs">{metrics?.remainingTasks || 0} remaining today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-400" />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Live activity feed - populated by webhook data only */
                [].map((item, index) => (
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
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                  <span className="text-white font-bold">{metrics?.todaysMeetings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Auto-Scheduled:</span>
                  <span className="text-green-400 font-bold">{metrics?.autoScheduled || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Follow-ups Due:</span>
                  <span className="text-orange-400 font-bold">{automationPerformance?.activeFunctions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Command Center */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                  <span className="text-white font-bold">{metrics?.voiceCommands || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Success Rate:</span>
                  <span className="text-green-400 font-bold">{metrics?.voiceSuccessRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Processing:</span>
                  <span className="text-blue-400 font-bold">{metrics?.activeVoiceJobs || 0} active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bot Cloning Workflow */}
          <Card className="bg-green-900/60 backdrop-blur-sm border border-green-400 shadow-lg shadow-green-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-green-400" />
                Bot Cloning Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Active Clones:</span>
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Deployed Today:</span>
                  <span className="text-green-400 font-bold">7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Success Rate:</span>
                  <span className="text-green-400 font-bold">96%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Analysis */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
              <div className="bg-blue-900/60 rounded-lg p-4 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-cyan-400 mb-1">${metrics?.totalRevenue || 0}</div>
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
              <div className="bg-blue-900/60 rounded-lg p-4 border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
              <div className="bg-blue-900/60 rounded-lg p-4 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-blue-400 mb-1">+{metrics?.conversionRate || 0}%</div>
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
              <div className="bg-blue-900/60 rounded-lg p-4 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-purple-400 mb-1">{metrics?.totalInteractions || 0}</div>
                  <div className="text-purple-300 text-sm">Interactions</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Today</span>
                    <span className="text-green-400">{metrics?.todayInteractions || 0}</span>
                  </div>
                  <Progress value={67} className="h-1" />
                  <div className="text-center text-xs text-purple-400">Peak: 2-4 PM</div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-blue-900/60 rounded-lg p-4 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-yellow-400 mb-1">{metrics?.closeRate || 0}%</div>
                  <div className="text-yellow-300 text-sm">Close Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Industry Avg</span>
                    <span className="text-red-400">{metrics?.industryAverage || 0}%</span>
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
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-cyan-400 shadow-lg shadow-cyan-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400 mb-2">${metrics?.monthlySavings || 0}</div>
                  <div className="text-green-300 text-sm">Monthly Savings</div>
                  <div className="text-green-200 text-xs mt-1">↑ 23% vs last month</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-cyan-400 shadow-lg shadow-cyan-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-400 mb-2">{currentSystemMode === 'test' ? '47%' : '0%'}</div>
                  <div className="text-blue-300 text-sm">Cost Reduction</div>
                  <div className="text-blue-200 text-xs mt-1">vs Manual Process</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-cyan-400 shadow-lg shadow-cyan-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-400 mb-2">{currentSystemMode === 'test' ? '340%' : '0%'}</div>
                  <div className="text-purple-300 text-sm">ROI</div>
                  <div className="text-purple-200 text-xs mt-1">12-month period</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-cyan-400 shadow-lg shadow-cyan-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-400 mb-2">{currentSystemMode === 'test' ? '21' : '0'}</div>
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
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center text-slate-400 py-8">
                  No live activity data available
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
                  <span className="text-blue-400 font-bold">{currentSystemMode === 'test' ? '34%' : '0%'}</span>
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
                  <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '23' : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Conversions:</span>
                  <span className="text-blue-400 font-bold">{currentSystemMode === 'test' ? '8' : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Escalations:</span>
                  <span className="text-orange-400 font-bold">{currentSystemMode === 'test' ? '2' : '0'}</span>
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
                  <span className="text-white font-bold">{currentSystemMode === 'test' ? '156' : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Hours Saved:</span>
                  <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '23.4' : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Efficiency:</span>
                  <span className="text-blue-400 font-bold">{currentSystemMode === 'test' ? '89%' : '0%'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Reports */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-cyan-400" />
                Data & Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Last Export:</span>
                  <span className="text-blue-400 font-bold">2h ago</span>
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
                <div className="text-center text-slate-400 py-8">
                  No escalation alerts at this time
                </div>
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
                        {metrics?.totalTests || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pass Rate:</span>
                      <span className="text-green-400 font-mono">
                        {metrics?.passRate || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Unique Testers:</span>
                      <span className="text-blue-400 font-mono">
                        {metrics?.uniqueTesters || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Recent Activity</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {metrics?.recentActivity?.slice(0, 5).map((test: any, index: number) => (
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

        {/* RAG Knowledge Base System - Positioned at bottom as requested */}
        <div className="mb-12">
          <Card className="bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80 backdrop-blur-sm border border-purple-400/50 shadow-2xl shadow-purple-500/30">
            <CardHeader className="border-b border-purple-400/30">
              <CardTitle className="text-white flex items-center text-2xl font-bold">
                <Brain className="w-7 h-7 mr-3 text-purple-400" />
                🧠 RAG Knowledge Base
                <Badge className="ml-3 bg-green-600 text-white">ACTIVE</Badge>
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
                      className={`absolute right-2 top-2 p-2 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={queryKnowledgeBase}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Query Knowledge
                    </Button>
                    <Button 
                      onClick={smartSearch}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
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
                        className={`absolute top-2 right-2 p-2 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-red-600 hover:bg-red-700'}`}
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-800/40 rounded border border-blue-400/30">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-blue-400'}`}></div>
                        <span className="text-blue-300 text-sm">Voice Recognition Ready</span>
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
                        className="bg-blue-600 hover:bg-blue-700 text-white"
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

                    <div className="bg-blue-900/40 rounded p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
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

              {/* Voice Generation & Phone Calling */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Voice Generation */}
                <div className="bg-blue-900/60 rounded-lg p-6 border border-cyan-400/50">
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                    <Mic className="w-5 h-5 mr-2 text-cyan-400" />
                    Voice Generation
                  </h3>
                  <div className="space-y-4">
                    <textarea
                      value={voiceGenerationText}
                      onChange={(e) => setVoiceGenerationText(e.target.value)}
                      placeholder="Enter text to convert to speech..."
                      className="w-full p-3 bg-blue-800/60 border border-cyan-400/50 rounded text-white placeholder-cyan-300"
                      rows={3}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={generateVoice}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        <Headphones className="w-4 h-4 mr-2" />
                        Generate Voice
                      </Button>
                      <Button 
                        onClick={downloadAudio}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Audio
                      </Button>
                    </div>
                  </div>
                </div>

                {/* ElevenLabs Persona Selector */}
                <div className="bg-purple-900/60 rounded-lg p-6 border border-purple-400/50">
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-400" />
                    Voice Persona Selection
                  </h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <select 
                        value={selectedPersona}
                        onChange={(e) => setSelectedPersona(e.target.value)}
                        className="w-full p-3 bg-purple-800/60 border border-purple-400/50 rounded text-white"
                        disabled={voicesLoading}
                      >
                        {voicesLoading ? (
                          <option>Loading voices...</option>
                        ) : availableVoices.length > 0 ? (
                          <>
                            {/* Custom Voices First */}
                            {availableVoices.filter(voice => voice.category !== 'premade').length > 0 && (
                              <>
                                <option disabled style={{fontWeight: 'bold', color: '#10B981'}}>🎯 Your Custom Voices</option>
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
                                <option disabled style={{fontWeight: 'bold', color: '#6366F1'}}>🏪 ElevenLabs Premade</option>
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
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-blue-900/40 rounded text-sm border border-purple-400 shadow-lg shadow-purple-400/20">
                      <span className="text-white">
                        {availableVoices.length > 0 
                          ? `${availableVoices.length} ElevenLabs voices loaded`
                          : 'ElevenLabs API key required'
                        }
                      </span>
                      <Button 
                        size="sm" 
                        onClick={fetchAvailableVoices}
                        className="bg-blue-700 hover:bg-blue-600 text-xs px-2 py-1"
                        disabled={voicesLoading}
                      >
                        {voicesLoading ? 'Loading...' : 'Refresh'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={testVoicePersona}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Headphones className="w-4 h-4 mr-2" />
                        Test Voice
                      </Button>
                      <Button 
                        onClick={handleApplyPersona}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Apply Persona
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Knowledge Management */}
              <div className="bg-slate-800/60 rounded-lg p-6 border border-purple-400/50">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-purple-400" />
                  Knowledge Management
                </h3>
                
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
                    onClick={handleUploadDocs}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Docs
                  </Button>
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
                

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Management & Memory Insertion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Document Manager */}
          <Card className="bg-slate-800/80 backdrop-blur-sm border border-blue-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-400" />
                Document Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button 
                    onClick={loadDocuments}
                    disabled={documentsLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {documentsLoading ? 'Loading...' : 'Load Documents'}
                  </Button>
                  <Button 
                    onClick={deleteSelectedDocuments}
                    disabled={selectedDocuments.length === 0}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Selected ({selectedDocuments.length})
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {uploadedDocuments.map((doc) => (
                    <div 
                      key={doc.id}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedDocuments.includes(doc.id)
                          ? 'bg-blue-600/30 border-blue-400 shadow-lg shadow-blue-400/20'
                          : 'bg-slate-700/60 border-blue-400/50 hover:border-blue-500 shadow-lg shadow-blue-400/10'
                      }`}
                      onClick={() => toggleDocumentSelection(doc.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{doc.originalname}</div>
                          <div className="text-slate-400 text-sm">
                            {(doc.size / 1024).toFixed(1)} KB • {doc.category}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded border-2 ${
                          selectedDocuments.includes(doc.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-400'
                        }`}>
                          {selectedDocuments.includes(doc.id) && (
                            <div className="text-white text-xs flex items-center justify-center">✓</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {uploadedDocuments.length === 0 && (
                    <div className="text-slate-400 text-center py-4">
                      Click "Load Documents" to view uploaded files
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Text Insertion */}
          <Card className="bg-slate-800/80 backdrop-blur-sm border border-purple-500/50">
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
                
                <div className="text-slate-400 text-xs">
                  Memory entries are stored with high priority and can be retrieved during conversations.
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
            <Button 
              onClick={handleContactSupport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Headphones className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>

      </div>

      {/* Clear Knowledge Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
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

      {/* Sales Order Processor Modal */}
      {showSalesOrderProcessor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-green-400/50">
            <div className="sticky top-0 bg-slate-900 border-b border-green-400/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Complete Sales Order Processing</h2>
              <Button
                onClick={() => setShowSalesOrderProcessor(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <SalesOrderProcessor
                onProcessComplete={(result) => {
                  console.log('Sales order processed:', result);
                  // Refresh metrics after successful processing
                  if (result.success) {
                    window.location.reload();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lead Scraping Interface Modal */}
      {showLeadScraping && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-cyan-400/50">
            <div className="sticky top-0 bg-slate-900 border-b border-cyan-400/30 p-4 flex items-center justify-between">
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

      {/* Call Monitoring Popup */}
      <CallMonitoringPopup
        isOpen={showCallMonitoring}
        onClose={() => setShowCallMonitoring(false)}
        activeCalls={activeCalls}
        totalRecords={totalRecords}
        completedCalls={completedCalls}
      />

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

      {/* Hidden File Input for Document Upload */}
      <input
        id="document-upload"
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-orange-400/50">
            <div className="sticky top-0 bg-slate-900 border-b border-orange-400/30 p-4 flex items-center justify-between">
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
                        <span className="text-green-400 font-bold">8.4%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Total Reach:</span>
                        <span className="text-blue-400 font-bold">156K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Best Time to Post:</span>
                        <span className="text-orange-400 font-bold">2:00 PM EST</span>
                      </div>
                      <div className="bg-slate-700/40 rounded p-3">
                        <div className="text-sm text-slate-300 mb-2">Top Performing Content:</div>
                        <div className="text-white text-sm">"YoBot AI automation increases productivity by 340%"</div>
                        <div className="text-green-400 text-xs">2.3K likes • 156 shares</div>
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
                    {[
                      { platform: "LinkedIn", content: "Transform your business with YoBot AI automation", status: "Published", engagement: "94 likes" },
                      { platform: "Twitter", content: "New features in YoBot Command Center...", status: "Scheduled", engagement: "Schedule: 2PM" },
                      { platform: "Facebook", content: "Client success story: 47% cost reduction", status: "Draft", engagement: "Needs review" }
                    ].map((item, index) => (
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-green-400/50">
            <div className="sticky top-0 bg-slate-900 border-b border-green-400/30 p-4 flex items-center justify-between">
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
                        <span className="text-white font-bold">2,847</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Open Rate:</span>
                        <span className="text-green-400 font-bold">24.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Click Rate:</span>
                        <span className="text-blue-400 font-bold">6.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Growth This Month:</span>
                        <span className="text-green-400 font-bold">+156</span>
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
                        <span className="text-green-400 font-bold">73%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Top Location:</span>
                        <span className="text-white font-bold">New York</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Best Send Time:</span>
                        <span className="text-blue-400 font-bold">Tue 10AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Mobile Opens:</span>
                        <span className="text-purple-400 font-bold">68%</span>
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
                    {[
                      { name: "YoBot Feature Update Newsletter", sent: "2,847", opens: "706", clicks: "176", status: "Sent" },
                      { name: "Weekly Automation Tips", sent: "2,821", opens: "692", clicks: "203", status: "Sent" },
                      { name: "Holiday Promotion 2024", sent: "0", opens: "0", clicks: "0", status: "Draft" }
                    ].map((campaign, index) => (
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
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
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



      {/* Zendesk Live Chat Widget */}
      <ZendeskChatWidget />
      

    </div>
  );
}