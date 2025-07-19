import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Play, Pause, RefreshCw, AlertTriangle, Bot, FileText, Upload, Trash2, Mic,
  Settings, CircleDot, Clock, Users, Server, BrainCircuit
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";// Type Definitions
type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'DEGRADED';
type ServiceName = 'monitoring' | 'recording' | 'analytics';
interface ServiceState {
  status: ServiceStatus;  lastPing: string;
}
interface RecentActivity {
  id: number;
  message: string;  type: 'system' | 'user' | 'error';
  timestamp: string;
}
interface Call {
  id: string;
  customerName: string;
  status: 'Ringing' | 'In Progress' | 'Completed' | 'Failed';
  duration: number;
}
interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const CommandCenter: React.FC = () => {
  const [mode, setMode] = useState<'live' | 'test'>('test');
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeCalls, setActiveCalls] = useState<Call[]>([]);
  const [voiceStatus, setVoiceStatus] = useState('System ready');
  const [voiceGenerationText, setVoiceGenerationText] = useState('Hello, this is a test of the YoBot voice generation system.');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [serviceStates] = useState<Record<ServiceName, ServiceState>>({
    monitoring: { status: 'INACTIVE', lastPing: 'N/A' },
    recording: { status: 'INACTIVE', lastPing: 'N/A' },
    analytics: { status: 'INACTIVE', lastPing: 'N/A' },  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);


  const addRecentActivity = useCallback((message: string, type: RecentActivity['type']) => {
    const newActivity: RecentActivity = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  }, []);

  const { data: knowledgeData, refetch: refetchKnowledge } = useQuery({
    queryKey: ['/api/knowledge/stats'],
    queryFn: () => fetch('/api/knowledge/stats').then(res => res.json()),
  });

  const loadDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      const response = await fetch('/api/knowledge/documents');
      if (response.ok) {
        const data = await response.json();
        setUploadedDocuments(data.documents || []);
      } else {
        toast.error("Load Failed", { description: "Unable to load documents from knowledge base" });
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error("Load Error", { description: "Network error while loading documents" });
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);


  const handleModeToggle = (newMode: 'live' | 'test') => {
    if (pipelineRunning) {
      toast.warning("Mode Change Blocked", { description: "Cannot change mode while pipeline is running." });
      return;
    }
    setMode(newMode);
    addRecentActivity(`Switched to ${newMode.toUpperCase()} mode`, 'user');
    toast.info("Mode Toggle", { description: `Switched to ${newMode} mode` });
  };

  const startPipeline = async () => {
    setPipelineRunning(true);
    setVoiceStatus('Starting pipeline...');
    addRecentActivity('Pipeline start initiated', 'user');    try {
      const response = await fetch('/api/pipeline/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setTotalRecords(result.total_records || 0);
        setActiveCalls(result.activeCalls || []);
        toast.success("Pipeline Started", { description: `Started ${result.active_calls} calls from your Airtable` });
        addRecentActivity(`Pipeline started with ${result.active_calls} calls`, 'system');
      } else {
        setPipelineRunning(false);
        toast.error("Pipeline Failed", { description: result.error || result.message || 'Failed to start pipeline' });
        addRecentActivity('Pipeline start failed', 'error');
      }
    } catch (error: any) {
      setPipelineRunning(false);
      setVoiceStatus('Pipeline error');
      toast.error("Connection Error", { description: `Failed to connect to pipeline: ${error.message}` });
      addRecentActivity(`Pipeline connection error: ${error.message}`, 'error');
    }
  };

  const stopPipeline = async () => {
    setVoiceStatus('Stopping pipeline...');
    addRecentActivity('Pipeline stop initiated', 'user');
    try {
      const response = await fetch('/api/pipeline/stop', { method: 'POST' });
      await response.json();
      setPipelineRunning(false);
      setActiveCalls([]);
      toast.info("Pipeline Stopped", { description: "All pipeline calls have been terminated" });
      addRecentActivity('Pipeline stopped successfully', 'system');
    } catch (error: any) {
      toast.error("Stop Failed", { description: `Failed to stop pipeline: ${error.message}` });
      addRecentActivity(`Pipeline stop error: ${error.message}`, 'error');    }
  };

  const handleServiceAction = async (service: ServiceName, action: 'start' | 'stop' | 'restart' | 'ping') => {
    setVoiceStatus(`Performing ${action} on ${service}...`);
    addRecentActivity(`${action.charAt(0).toUpperCase() + action.slice(1)} action on ${service} service`, 'user');
    toast.info("Service Action", { description: `Requesting ${action} for ${service} service.` });
  };

  const testVoicePersona = async () => {
    try {
      setVoiceStatus('Testing voice connection...');
      const response = await fetch('/api/voice/test', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setVoiceStatus('Voice connection test successful');          toast.success('Voice Test Success', { description: result.message || 'ElevenLabs API connection is working' });
        } else {
          setVoiceStatus(`Voice test failed: ${result.message || 'Unknown error'}`);
          toast.error('Voice Test Failed', { description: result.message || 'Unable to connect to voice service' });
        }
      } else {
        setVoiceStatus(`Voice test failed: ${response.status}`);
        toast.error('Connection Error', { description: 'Unable to test voice connection' });
      }
    } catch (error: any) {
      setVoiceStatus(`Voice test error: ${error.message}`);
      toast.error('Test Error', { description: 'Network error during voice test' });
    }
  };

  const generateVoice = async () => {
    if (!voiceGenerationText.trim()) {
      toast.warning("Text Required", { description: "Please enter text to generate voice" });
      return;
    }
    setVoiceStatus('Generating voice...');
    try {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: voiceGenerationText }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setVoiceStatus('Voice generated successfully.');
        toast.success("Voice Generated", { description: "Audio is ready for playback." });
      } else {
        setVoiceStatus('Voice generation failed.');
        toast.error("Generation Failed", { description: "Could not generate audio from text." });
      }
    } catch (error) {
      setVoiceStatus('Voice generation error.');
      toast.error("Network Error", { description: "Could not connect to voice generation service." });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    setVoiceStatus('Uploading documents...');
    toast.info("Upload in Progress", { description: "Uploading selected documents to knowledge base." });

    try {
      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setVoiceStatus(`${result.count} documents uploaded successfully.`);
        toast.success("Upload Complete", { description: `${result.count} documents added.` });
        refetchKnowledge();
        loadDocuments();
      } else {
        const error = await response.json();
        setVoiceStatus('Document upload failed.');
        toast.error("Upload Failed", { description: error.error || 'Server error during upload.' });
      }
    } catch (error) {
      setVoiceStatus('Upload network error.');
      toast.error("Network Error", { description: "Could not connect to the server." });    }
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };
  
  const deleteSelectedDocuments = async () => {
    if (selectedDocuments.length === 0) {
      toast.warning("No Selection", { description: "Please select documents to delete." });
      return;
    }
    try {
      const response = await fetch('/api/knowledge/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: selectedDocuments }),
      });

      if (response.ok) {
        toast.success("Documents Deleted", { description: `${selectedDocuments.length} documents removed.` });
        setSelectedDocuments([]);
        refetchKnowledge();
        loadDocuments();
      } else {
        toast.error("Delete Failed", { description: "Unable to delete selected documents." });
      }
    } catch (error) {
      toast.error("Delete Error", { description: "Network error during deletion." });
    }
  };

  const confirmClearKnowledge = async () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      try {
        setVoiceStatus('Clearing knowledge base...');
        const response = await fetch('/api/knowledge/clear', { method: 'POST' });

        if (response.ok) {
          setVoiceStatus('Knowledge base cleared successfully.');
          toast.success("Knowledge Cleared", { description: "All documents and memories removed." });
          refetchKnowledge();
          loadDocuments();
          setSelectedDocuments([]);
        } else {
          setVoiceStatus('Failed to clear knowledge base.');
          toast.error("Clear Failed", { description: "Unable to clear knowledge base." });
        }
      } catch (error) {
        setVoiceStatus('Error clearing knowledge base.');
        toast.error("Error", { description: "Network error while clearing knowledge base." });
      }
      setShowClearConfirm(false);
      setDeleteConfirmText('');
    } else {
      toast.warning("Confirmation Incorrect", { description: "Please type 'delete' to confirm." });
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Bot size={32} className="text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold">YoBot Command Center</h1>
              <p className="text-sm text-gray-400">{voiceStatus}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Label htmlFor="mode-switch" className="text-sm">Mode:</Label>
            <div className="flex items-center space-x-2 rounded-lg bg-gray-800 p-1">
              <Button onClick={() => handleModeToggle('test')} variant={mode === 'test' ? 'secondary' : 'ghost'} size="sm" className="px-3">Test</Button>
              <Button onClick={() => handleModeToggle('live')} variant={mode === 'live' ? 'secondary' : 'ghost'} size="sm" className="px-3">Live</Button>
            </div>
            <Button variant="outline" size="icon"><Settings size={18} /></Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Call Pipeline Control</span>
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${mode === 'live' ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
                  {mode} Mode
                </span>
              </CardTitle>
              <CardDescription>Start or stop the outbound calling pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-around">
              <div>
                <p className="text-4xl font-bold">{activeCalls.length}</p>
                <p className="text-sm text-gray-400">Active Calls</p>
              </div>              <div>
                <p className="text-4xl font-bold">{totalRecords}</p>
                <p className="text-sm text-gray-400">Leads in Airtable</p>
              </div>              <div className="flex space-x-4">
                <Button size="lg" onClick={startPipeline} disabled={pipelineRunning} className="bg-blue-600 hover:bg-blue-700">
                  <Play className="mr-2 h-5 w-5" /> Start Pipeline
                </Button>
                <Button size="lg" onClick={stopPipeline} disabled={!pipelineRunning} variant="destructive">
                  <Pause className="mr-2 h-5 w-5" /> Stop Pipeline
                </Button>
              </div>            </CardContent>
            <CardFooter>
              <Progress value={pipelineRunning && totalRecords > 0 ? (activeCalls.length / totalRecords) * 100 : 0} className="w-full" />
            </CardFooter>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>System Services</CardTitle>
              <CardDescription>Manage core autonomous services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(serviceStates).map(([name, state]) => (
                <div key={name} className="flex items-center justify-between">                  <div className="flex items-center">
                    <Server size={18} className="mr-3" />
                    <span className="capitalize font-medium">{name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${state.status === 'ACTIVE' ? 'bg-green-500 text-black' : 'bg-gray-600 text-white'}`}>{state.status}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleServiceAction(name as ServiceName, 'restart')}><RefreshCw size={14} /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="knowledge"><BrainCircuit className="mr-2 h-4 w-4"/>Knowledge Base</TabsTrigger>
            <TabsTrigger value="voice"><Mic className="mr-2 h-4 w-4"/>Voice Persona</TabsTrigger>
            <TabsTrigger value="activity"><Clock className="mr-2 h-4 w-4"/>Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge">
            <Card className="bg-gray-800 border-gray-700 mt-2">
              <CardHeader>
                <CardTitle>Knowledge Base Management</CardTitle>
                <CardDescription>Upload, manage, and query documents for the RAG pipeline.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div><p className="text-2xl font-bold">{knowledgeData?.documents || 0}</p><p className="text-xs text-gray-400">Documents</p></div>
                    <div><p className="text-2xl font-bold">{knowledgeData?.vectors || 0}</p><p className="text-xs text-gray-400">Vectors</p></div>
                    <div><p className="text-2xl font-bold">{knowledgeData?.memoryEntries || 0}</p><p className="text-xs text-gray-400">Memory Entries</p></div>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4"/>Upload Files</Button>
                    <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
                    <Button onClick={deleteSelectedDocuments} variant="destructive" disabled={selectedDocuments.length === 0}><Trash2 className="mr-2 h-4 w-4"/>Delete Selected</Button>
                    <Button onClick={() => setShowClearConfirm(true)} variant="destructive" className="ml-auto"><AlertTriangle className="mr-2 h-4 w-4"/>Clear All</Button>
                </div>
                <div className="border border-gray-700 rounded-lg p-2 h-48 overflow-y-auto">
                    {documentsLoading ? <p>Loading...</p> : uploadedDocuments.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={() => toggleDocumentSelection(doc.id)}>
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" id={`doc-${doc.id}`} checked={selectedDocuments.includes(doc.id)} readOnly className="accent-blue-500" />
                                <FileText size={16}/>
                                <Label htmlFor={`doc-${doc.id}`}>{doc.name}</Label>
                            </div>
                            <span className="text-xs text-gray-400">{(doc.size / 1024).toFixed(2)} KB</span>
                        </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice">
            <Card className="bg-gray-800 border-gray-700 mt-2">
              <CardHeader>
                <CardTitle>Voice Persona</CardTitle>
                <CardDescription>Configure and test the ElevenLabs voice persona.</CardDescription>              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full gap-2">
                  <Textarea placeholder="Type text here to generate voice..." value={voiceGenerationText} onChange={(e) => setVoiceGenerationText(e.target.value)} rows={4}/>
                  <div className="flex space-x-2">
                    <Button onClick={generateVoice}><Play className="mr-2 h-4 w-4"/>Generate Voice</Button>
                    <Button onClick={testVoicePersona} variant="outline"><CircleDot className="mr-2 h-4 w-4"/>Test API</Button>
                  </div>
                </div>
                {audioUrl && <audio ref={audioRef} src={audioUrl} controls className="w-full"></audio>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
             <Card className="bg-gray-800 border-gray-700 mt-2">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Live log of system and user actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 h-64 overflow-y-auto">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3 text-sm">
                                {activity.type === 'system' && <Server size={14} className="mt-1 text-blue-400"/>}
                                {activity.type === 'user' && <Users size={14} className="mt-1 text-green-400"/>}
                                {activity.type === 'error' && <AlertTriangle size={14} className="mt-1 text-red-400"/>}
                                <p><span className="font-mono text-gray-500 mr-2">{activity.timestamp}</span>{activity.message}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="bg-gray-800 text-white border-red-500">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center"><AlertTriangle className="mr-2"/>Confirm Knowledge Base Deletion</DialogTitle>
            <DialogDescription>
              This is an irreversible action. You will delete all uploaded documents and learned memories. Please type 'delete' below to confirm.
            </DialogDescription>
          </DialogHeader>
          <input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="delete"
            className="bg-gray-900 border-gray-600 px-3 py-2 rounded w-full"
            type="text"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmClearKnowledge}>Delete Everything</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>  );
};

export default CommandCenter;
