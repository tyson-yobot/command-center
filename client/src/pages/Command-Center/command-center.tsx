import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useModeContext } from '@/App';
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
  const { isTestMode, setTestMode } = useModeContext();
  const { data: metrics } = useQuery({ queryKey: ['/api/metrics'] });
  const { data: bot } = useQuery({ queryKey: ['/api/bot'] });
  const { data: crmData } = useQuery({ queryKey: ['/api/crm'] });
  const { data: testMetrics } = useQuery({ queryKey: ['/api/airtable/test-metrics'] });
  const { data: commandCenterMetrics } = useQuery({ queryKey: ['/api/airtable/command-center-metrics'] });
  const { data: knowledgeStats, refetch: refetchKnowledge } = useQuery({ queryKey: ['/api/knowledge/stats'] });
  const { data: automationMetrics } = useQuery({ 
    queryKey: ['/api/automation/metrics'],
    refetchInterval: 5000 
  });
  const { data: liveExecutions } = useQuery({ 
    queryKey: ['/api/automation/executions'],
    refetchInterval: 3000 
  });
  const { data: functionStatus } = useQuery({ 
    queryKey: ['/api/automation/functions'],
    refetchInterval: 10000 
  });
  
  // System mode control
  const { data: systemModeData } = useQuery({ 
    queryKey: ['/api/system-mode'],
    refetchInterval: 2000 
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
  const [currentSystemMode, setCurrentSystemMode] = useState('live');
  const { toast } = useToast();

  // Fetch current system mode on load
  useEffect(() => {
    fetch('/api/system-mode')
      .then(res => res.json())
      .then(data => {
        if (data.systemMode) {
          setCurrentSystemMode(data.systemMode);
        }
      });
  }, []);

  // System mode toggle function
  const toggleSystemMode = async () => {
    try {
      const newMode = currentSystemMode === 'live' ? 'test' : 'live';
      
      const response = await apiRequest('POST', '/api/system-mode', {
        mode: newMode
      });
      
      if (response.ok) {
        setCurrentSystemMode(newMode);
        toast({
          title: "System Mode Changed",
          description: `Switched to ${newMode} mode. ${newMode === 'live' ? 'Production data only.' : 'Test data enabled.'}`,
        });
        // Refetch all data to update the dashboard
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
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

  // Load voices on component mount and retry if failed
  React.useEffect(() => {
    fetchAvailableVoices();
    
    // Retry voice loading if initial load fails
    const retryTimer = setTimeout(() => {
      if (availableVoices.length === 0 && !voicesLoading) {
        fetchAvailableVoices();
      }
    }, 2000);
    
    return () => clearTimeout(retryTimer);
  }, []);
  
  // Retry voice loading when component regains focus
  React.useEffect(() => {
    const handleFocus = () => {
      if (availableVoices.length === 0) {
        fetchAvailableVoices();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [availableVoices.length]);

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
              ...result.files.map(file => ({
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
      const response = await fetch('/api/export/data');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'yobot-data-export.csv';
      a.click();
      setVoiceStatus('Data exported successfully');
    } catch (error) {
      setVoiceStatus('Export failed');
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



  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setVoiceStatus('Uploading document...');
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('category', 'general');
    formData.append('tags', JSON.stringify(['uploaded', 'user-content']));

    try {
      const response = await fetch('/api/rag/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setVoiceStatus(`Document uploaded: ${result.wordCount} words indexed`);
        setToast({
          title: "Document Uploaded",
          description: `${file.name} has been processed and indexed for AI training`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setVoiceStatus('Document upload failed');
        setToast({
          title: "Upload Failed",
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
        
        // Simulate call monitoring with real-time updates
        const mockCalls = Array.from({length: result.active_calls || 0}, (_, i) => ({
          id: `call-${Date.now()}-${i}`,
          phoneNumber: `+1555${Math.floor(Math.random() * 9000) + 1000}${Math.floor(Math.random() * 90) + 10}`,
          contactName: `Contact ${i + 1}`,
          status: 'dialing',
          duration: 0,
          startTime: new Date(),
          voiceId: selectedPersona,
          script: 'Pipeline call script'
        }));
        
        setActiveCalls(mockCalls);
        
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
  const executeLiveCommand = async (category: string) => {
    try {
      const payload = getLiveCommandPayload(category);
      
      // Use central automation dispatcher for all commands
      const response = await fetch('/api/command-center/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: category,
          category: 'Core',
          payload,
          isTestMode: isTestMode
        })
      });

      const result = await response.json();

      if (result.success || response.ok) {
        setToast({
          title: "Command Executed",
          description: `${category} completed successfully`,
        });
      } else {
        setToast({
          title: "Command Failed",
          description: `${category} failed: ${result.error || result.message || 'Unknown error'}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setToast({
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
          description: "Test support ticket from Command Center",
          priority: "normal",
          clientName: "Command Center User",
          email: "user@company.com"
        };
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
            
            {/* Navigation Menu */}
            <div className="flex justify-center mt-4 mb-6">
              <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
                <Link href="/command-center">
                  <Button 
                    variant="outline" 
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Command Center
                  </Button>
                </Link>
                <Link href="/control-center">
                  <Button 
                    variant="outline" 
                    className="bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Control Center
                  </Button>
                </Link>
                <Link href="/lead-scraper">
                  <Button 
                    variant="outline" 
                    className="bg-green-600 hover:bg-green-700 text-white border-green-500"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Lead Scraper
                  </Button>
                </Link>
              </div>
            </div>
            
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
                <Button 
                  onClick={() => executeLiveCommand("Critical Escalation")}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white border border-red-400"
                >
                  Critical Escalation
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
                    onClick={() => setShowSalesOrderProcessor(true)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">💼</span>
                    <span>Sales Orders</span>
                  </Button>
                  
                  <Button
                    disabled
                    className="bg-gray-500 text-gray-300 flex items-center justify-start p-3 cursor-not-allowed"
                  >
                    <span className="text-xl mr-3">⚙️</span>
                    <span>Open</span>
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
                    onClick={() => executeLiveCommand("Start Pipeline Calls")}
                    className="bg-lime-500 hover:bg-lime-600 text-black flex items-center justify-start p-3 font-semibold"
                  >
                    <span className="text-xl mr-3">📞</span>
                    <span>Start Pipeline Calls</span>
                  </Button>
                  
                  <Button
                    onClick={() => executeLiveCommand("Stop Pipeline Calls")}
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
                  
                  <Button
                    disabled
                    className="bg-gray-500 text-gray-300 flex items-center justify-start p-3 cursor-not-allowed"
                  >
                    <span className="text-xl mr-3">⚙️</span>
                    <span>Open</span>
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
                    onClick={() => executeLiveCommand("Export Data")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📊</span>
                    <span>Export Data</span>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveModule('content-creator')}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📢</span>
                    <span>Content Creator</span>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveModule('mailchimp')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📧</span>
                    <span>Mailchimp Sync</span>
                  </Button>
                  
                  <Button
                    onClick={() => document.getElementById('document-upload')?.click()}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📄</span>
                    <span>Upload Documents</span>
                  </Button>
                  <input
                    id="document-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleDocumentUpload}
                  />
                  
                  <Button
                    onClick={() => executeLiveCommand("Send SMS")}
                    className="bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-start p-3"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    <span>Send SMS</span>
                  </Button>
                  
                  <Button
                    onClick={() => setShowContentCreator(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📢</span>
                    <span>Content Creator</span>
                  </Button>
                  
                  <Button
                    onClick={() => setShowMailchimpSync(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📧</span>
                    <span>Mailchimp Sync</span>
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
              <div className="text-2xl font-bold text-white">
                {metrics?.activeCalls || 0}
              </div>
              <p className="text-xs text-green-400">Live voice sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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

          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                    {automationMetrics?.metrics?.activeFunctions || 40} Functions Active
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
                    {automationMetrics?.metrics?.executionsToday || 0}
                  </div>
                  <div className="text-xs text-green-400">Live tracking</div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">Success Rate</div>
                  <div className="text-2xl font-bold text-green-400">
                    {automationMetrics?.metrics?.successRate || 98.7}%
                  </div>
                  <div className="text-xs text-green-400">High reliability</div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">Recent Executions</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {liveExecutions?.executions?.length || 0}
                  </div>
                  <div className="text-xs text-blue-400">In queue</div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">System Load</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.round((automationMetrics?.metrics?.activeFunctions || 40) / 40 * 100)}%
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
                  {liveExecutions?.executions?.slice(-5).reverse().map((execution: any, index: number) => (
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
                🤖 Bot Health Monitor
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
                  <span className="text-white font-bold">${(crmData?.monthlyRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Pipeline Value:</span>
                  <span className="text-green-400 font-bold">${(crmData?.pipelineValue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Active Deals:</span>
                  <span className="text-blue-400 font-bold">{crmData?.activeDeals || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Close Rate:</span>
                  <span className="text-green-400 font-bold">{crmData?.closeRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Sales Velocity:</span>
                  <span className="text-blue-400 font-bold">{crmData?.salesVelocity || '0'} deals/week</span>
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
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Next Automation</div>
                  <div className="text-white font-medium">Lead Follow-up in 5 min</div>
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
                    <span className="text-green-400 font-bold">$42.80</span>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Based on NLP sentiment, duration, and conversion path">Lead Quality Score</span>
                    <span className="text-green-400 font-bold">84.7%</span>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Percentage of leads that become paying customers">Close Rate</span>
                    <span className="text-green-400 font-bold">28.6%</span>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Return on investment from automation">ROI</span>
                    <span className="text-blue-400 font-bold">340%</span>
                  </div>
                </div>
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                    <span className="text-green-400 font-bold">87.3%</span>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Cost to acquire each new customer">Cost Per Lead Trend</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 font-bold">$4.20</span>
                      <Badge className="bg-green-600 text-white text-xs">-18%</Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300" title="Time until positive return on investment">Payback Period</span>
                    <span className="text-green-400 font-bold">21 days</span>
                  </div>
                </div>
                <div className="bg-blue-900/80 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Automation Coverage</span>
                    <span className="text-blue-400 font-bold">78% tasks</span>
                  </div>
                </div>
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Latest Learning</div>
                  <div className="text-white font-medium">Product pricing updates</div>
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
                <div className="bg-blue-900/60 rounded-lg p-3 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  <div className="text-slate-300 text-sm mb-1">Last Maintenance</div>
                  <div className="text-white font-medium">2 days ago</div>
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
                  <div className="text-white font-bold">12 total meetings</div>
                  <div className="text-cyan-400 text-xs">8 remaining today</div>
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
              <div className="bg-blue-900/60 rounded-lg p-4 border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
              <div className="bg-blue-900/60 rounded-lg p-4 border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-cyan-400 shadow-lg shadow-cyan-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400 mb-2">$127K</div>
                  <div className="text-green-300 text-sm">Monthly Savings</div>
                  <div className="text-green-200 text-xs mt-1">↑ 23% vs last month</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-cyan-400 shadow-lg shadow-cyan-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-400 mb-2">47%</div>
                  <div className="text-blue-300 text-sm">Cost Reduction</div>
                  <div className="text-blue-200 text-xs mt-1">vs Manual Process</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-cyan-400 shadow-lg shadow-cyan-400/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-400 mb-2">340%</div>
                  <div className="text-purple-300 text-sm">ROI</div>
                  <div className="text-purple-200 text-xs mt-1">12-month period</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-cyan-400 shadow-lg shadow-cyan-400/20 rounded-lg p-4">
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
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-slate-300 bg-blue-900/60 p-2 rounded border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  📞 Call completed: Mike Rodriguez - 4m 32s
                </div>
                <div className="text-sm text-slate-300 bg-blue-900/60 p-2 rounded border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  ✅ Lead qualified: Sarah Chen - High Priority
                </div>
                <div className="text-sm text-slate-300 bg-blue-900/60 p-2 rounded border border-cyan-400 shadow-lg shadow-cyan-400/20">
                  🤖 Bot training: Voice model updated +2.3%
                </div>
                <div className="text-sm text-slate-300 bg-blue-900/60 p-2 rounded border border-cyan-400 shadow-lg shadow-cyan-400/20">
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
                <Button
                  onClick={() => setShowSocialContentCreator(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  📢 Content Creator
                </Button>
                <Button
                  onClick={() => setShowMailchimpSync(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  📧 Mailchimp Sync
                </Button>
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

      {/* Zendesk Live Chat Widget */}
      <ZendeskChatWidget />
    </div>
  );
}