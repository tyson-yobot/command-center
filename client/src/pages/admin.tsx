import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import robotHeadPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";
import { 
  Shield, 
  Settings, 
  Users, 
  Database, 
  Brain, 
  Upload, 
  Webhook,
  AlertCircle,
  FileText,
  DollarSign,
  Mic,
  Eye,
  Download,
  TestTube,
  Zap,
  Bot as BotIcon,
  Headphones,
  Power,
  Lock,
  Wifi,
  RotateCcw,
  Send,
  Search,
  Plus,
  Trash2
} from "lucide-react";

export default function AdminConsole() {
  const [userRole, setUserRole] = useState<string>("admin");
  const [systemHealth, setSystemHealth] = useState(98.7);
  
  // System Control States
  const [botSystemEnabled, setBotSystemEnabled] = useState(true);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [voiceProcessing, setVoiceProcessing] = useState(true);
  const [automationMode, setAutomationMode] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showConfirmShutdown, setShowConfirmShutdown] = useState(false);
  
  // RAG States
  const [ragQuery, setRagQuery] = useState("");
  const [ragResponse, setRagResponse] = useState("");
  const [newKnowledge, setNewKnowledge] = useState("");
  const [newKnowledgeTitle, setNewKnowledgeTitle] = useState("");

  // Redirect non-admin users
  useEffect(() => {
    if (userRole !== "admin") {
      window.location.href = "/dashboard";
    }
  }, [userRole]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-1 flex items-center">
              <img 
                src={robotHeadPath} 
                alt="YoBot" 
                className="w-12 h-12 mr-2 inline-block"
                style={{ marginTop: '-4px' }}
              />
              YoBot Control Center
            </h1>
            <p className="text-blue-300 text-lg">System Administration & RAG Knowledge</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-green-500/20 border-green-500/30 rounded-full px-4 py-2 border">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-medium">OPERATIONAL</span>
            </div>
            <Badge className="bg-purple-600 text-white px-4 py-2">
              <Lock className="w-4 h-4 mr-2" />
              Admin Access
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="system-controls" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-600/30">
            <TabsTrigger value="system-controls">⚡ System Controls</TabsTrigger>
            <TabsTrigger value="knowledge-rag">🧠 Knowledge RAG</TabsTrigger>
            <TabsTrigger value="voice-config">🎤 VoiceBot Config</TabsTrigger>
            <TabsTrigger value="bot-personality">🤖 Bot Personality</TabsTrigger>
            <TabsTrigger value="system-monitor">📊 System Monitor</TabsTrigger>
            <TabsTrigger value="user-roles">👥 User Roles</TabsTrigger>
          </TabsList>

          {/* System Controls */}
          <TabsContent value="system-controls">
            {/* Emergency Alert */}
            {emergencyMode && (
              <Card className="bg-red-600/90 backdrop-blur-sm border border-red-400/30 mb-8">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-6 h-6 text-white" />
                      <div>
                        <h3 className="text-white font-bold">🚨 EMERGENCY MODE ACTIVE</h3>
                        <p className="text-red-100 text-sm">All systems have been shut down for safety</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setBotSystemEnabled(true);
                        setRagEnabled(true);
                        setVoiceProcessing(true);
                        setAutomationMode(true);
                        setEmergencyMode(false);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restart Systems
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main System Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Bot System Control */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BotIcon className="w-5 h-5 text-blue-400" />
                    <span>Bot System</span>
                    <Badge className={`${botSystemEnabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {botSystemEnabled ? 'ACTIVE' : 'OFFLINE'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Master Power</span>
                      <Switch 
                        checked={botSystemEnabled && !emergencyMode} 
                        onCheckedChange={setBotSystemEnabled}
                        disabled={emergencyMode}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      {botSystemEnabled ? 'All bot instances are operational' : 'All bots are shutdown'}
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-sm text-white mb-2">Active Instances: {botSystemEnabled ? '12' : '0'}</div>
                      <div className="text-xs text-slate-400">Last restart: 2 hours ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* RAG Knowledge System */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span>Knowledge RAG</span>
                    <Badge className={`${ragEnabled ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-300'}`}>
                      {ragEnabled ? 'ENABLED' : 'DISABLED'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">RAG Processing</span>
                      <Switch 
                        checked={ragEnabled && !emergencyMode} 
                        onCheckedChange={setRagEnabled}
                        disabled={emergencyMode}
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      {ragEnabled ? 'AI knowledge retrieval active' : 'Knowledge system offline'}
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-sm text-white mb-2">Vector Store: {ragEnabled ? 'Connected' : 'Offline'}</div>
                      <div className="text-xs text-slate-400">Documents indexed: 2,847</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Voice Processing Engine */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Headphones className="w-5 h-5 text-green-400" />
                    <span>Voice Engine</span>
                    <Badge className={`${voiceProcessing ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                      {voiceProcessing ? 'PROCESSING' : 'PAUSED'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Voice Calls</span>
                      <Switch 
                        checked={voiceProcessing && !emergencyMode} 
                        onCheckedChange={setVoiceProcessing}
                        disabled={emergencyMode}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      {voiceProcessing ? 'Processing incoming calls' : 'Voice calls disabled'}
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-sm text-white mb-2">Queue: {voiceProcessing ? '3 pending' : 'Empty'}</div>
                      <div className="text-xs text-slate-400">Response time: 1.2s avg</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Automation Controls */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Automation</span>
                    <Badge className={`${automationMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
                      {automationMode ? 'AUTO' : 'MANUAL'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Auto Mode</span>
                      <Switch 
                        checked={automationMode && !emergencyMode} 
                        onCheckedChange={setAutomationMode}
                        disabled={emergencyMode}
                        className="data-[state=checked]:bg-yellow-500"
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      {automationMode ? 'Workflows run automatically' : 'Manual approval required'}
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-sm text-white mb-2">Active Workflows: {automationMode ? '8' : '0'}</div>
                      <div className="text-xs text-slate-400">Success rate: 94.2%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Database Control */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    <span>Database</span>
                    <Badge className="bg-green-500/20 text-green-300">
                      CONNECTED
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Read/Write</span>
                      <Switch 
                        checked={true} 
                        disabled={true}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      Database operations are active
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-sm text-white mb-2">Connections: 4/10</div>
                      <div className="text-xs text-slate-400">Latency: 12ms</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security & Monitoring */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span>Security</span>
                    <Badge className="bg-green-500/20 text-green-300">
                      SECURE
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Auth Required</span>
                      <Switch 
                        checked={true} 
                        disabled={true}
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      All endpoints protected
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-sm text-white mb-2">Failed attempts: 0</div>
                      <div className="text-xs text-slate-400">Last audit: 1 day ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Controls */}
            <Card className="bg-red-900/20 backdrop-blur-sm border border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span>Emergency Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold mb-1">System Emergency Shutdown</h3>
                    <p className="text-red-200 text-sm">Immediately stops all bot operations, voice processing, and automation</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {showConfirmShutdown ? (
                      <div className="flex items-center space-x-2">
                        <Button 
                          onClick={() => {
                            setBotSystemEnabled(false);
                            setRagEnabled(false);
                            setVoiceProcessing(false);
                            setAutomationMode(false);
                            setEmergencyMode(true);
                            setShowConfirmShutdown(false);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          CONFIRM SHUTDOWN
                        </Button>
                        <Button 
                          onClick={() => setShowConfirmShutdown(false)}
                          variant="outline"
                          className="text-slate-400 border-slate-600"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => {
                          setShowConfirmShutdown(true);
                          setTimeout(() => setShowConfirmShutdown(false), 5000);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Emergency Shutdown
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge RAG */}
          <TabsContent value="knowledge-rag">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* RAG Query Interface */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Search className="w-5 h-5 text-blue-400" />
                    <span>Knowledge Query</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Ask the knowledge base anything..."
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    rows={4}
                  />
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={async () => {
                      if (!ragQuery.trim()) return;
                      try {
                        const response = await apiRequest(`/api/rag/query`, {
                          method: 'POST',
                          body: JSON.stringify({ query: ragQuery })
                        });
                        setRagResponse(response.answer || "No response received");
                      } catch (error) {
                        setRagResponse("Error querying knowledge base");
                      }
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Query Knowledge Base
                  </Button>
                  {ragResponse && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="text-blue-300 font-medium mb-2">Response:</h4>
                      <p className="text-white text-sm">{ragResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add New Knowledge */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-green-400" />
                    <span>Add Knowledge</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Knowledge title..."
                    value={newKnowledgeTitle}
                    onChange={(e) => setNewKnowledgeTitle(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                  <Textarea
                    placeholder="Enter new knowledge content..."
                    value={newKnowledge}
                    onChange={(e) => setNewKnowledge(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    rows={6}
                  />
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      if (!newKnowledge.trim() || !newKnowledgeTitle.trim()) return;
                      try {
                        await apiRequest(`/api/rag/knowledge`, {
                          method: 'POST',
                          body: JSON.stringify({ 
                            title: newKnowledgeTitle,
                            content: newKnowledge 
                          })
                        });
                        setNewKnowledge("");
                        setNewKnowledgeTitle("");
                        // Show success message
                      } catch (error) {
                        console.error('Error adding knowledge:', error);
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Knowledge Base
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Knowledge Base Stats */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  <span>Knowledge Base Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-black text-purple-400 mb-2">2,847</div>
                    <div className="text-purple-300 text-sm">Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-400 mb-2">12,493</div>
                    <div className="text-blue-300 text-sm">Vector Chunks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-400 mb-2">94.7%</div>
                    <div className="text-green-300 text-sm">Avg Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-yellow-400 mb-2">1,247</div>
                    <div className="text-yellow-300 text-sm">Queries Today</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VoiceBot Configuration */}
          <TabsContent value="voice-config">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Mic className="w-5 h-5 text-cyan-400" />
                    <span>Voice ID Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Primary Voice ID</span>
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                        Upload New
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Fallback Voice</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                      <div className="text-cyan-300 text-xs font-medium mb-1">Active Voice</div>
                      <div className="text-white text-sm">Professional_Male_v2.wav</div>
                      <div className="text-cyan-200 text-xs">Last updated: 2 hours ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <span>Tone Response Router</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { tone: 'Empathetic', trigger: 'frustrated, upset, confused', active: true },
                    { tone: 'Assertive', trigger: 'pricing, objection, competitor', active: true },
                    { tone: 'Friendly', trigger: 'greeting, casual, introduction', active: false }
                  ].map((config) => (
                    <div key={config.tone} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div>
                        <div className="text-white text-sm font-medium">{config.tone}</div>
                        <div className="text-slate-400 text-xs">{config.trigger}</div>
                      </div>
                      <Switch defaultChecked={config.active} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bot Personality Pack */}
          <TabsContent value="bot-personality">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span>Tone Variants</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['Professional', 'Casual', 'Empathetic', 'Assertive'].map((tone) => (
                    <div key={tone} className="flex items-center justify-between p-2 bg-purple-500/10 rounded">
                      <span className="text-white text-sm">{tone}</span>
                      <Button size="sm" variant="outline" className="text-purple-400 border-purple-500/30">
                        Edit
                      </Button>
                    </div>
                  ))}
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    + Add New Tone
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-green-400" />
                    <span>Voice Upload</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border-2 border-dashed border-green-500/30 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-white text-sm">Drag & drop voice files</div>
                    <div className="text-green-400 text-xs">WAV, MP3 supported</div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Browse Files
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TestTube className="w-5 h-5 text-yellow-400" />
                    <span>Testing Suite</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    Test Voice Response
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Simulate Call Flow
                  </Button>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Test Fallback Route
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RAG Manager */}
          <TabsContent value="rag-manager">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    <span>Knowledge Base Upload</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Documents Indexed</span>
                      <span className="text-blue-400">47,892</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Vector Chunks</span>
                      <span className="text-green-400">127,486</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Stale Content</span>
                      <span className="text-red-400">847 flagged</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Upload Client KB
                  </Button>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Clear Stale Content
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-cyan-400" />
                    <span>Vector Match Testing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                    placeholder="Test query..."
                  />
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Run Vector Match
                  </Button>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                    <div className="text-cyan-300 text-xs font-medium mb-1">Last Test Result</div>
                    <div className="text-white text-sm">Query: "pricing for enterprise"</div>
                    <div className="text-cyan-200 text-xs">Match: 94.7% confidence</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Monitor */}
          <TabsContent value="system-monitor">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Webhook className="w-5 h-5 text-orange-400" />
                    <span>Make Scenario Health</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Voice-to-CRM Pipeline', status: 'green', last: '2m ago' },
                    { name: 'Airtable Sync', status: 'yellow', last: '12m ago' },
                    { name: 'Stripe Webhook', status: 'red', last: '47m ago' }
                  ].map((scenario) => (
                    <div key={scenario.name} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                      <div>
                        <div className="text-white text-sm">{scenario.name}</div>
                        <div className="text-slate-400 text-xs">Last: {scenario.last}</div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        scenario.status === 'green' ? 'bg-green-400' :
                        scenario.status === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-purple-400" />
                    <span>Admin Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Restart All Workflows
                  </Button>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Inject Test Lead
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Export System Logs
                  </Button>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Emergency Stop
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span>Live System Audit</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {[
                      { time: '6:41 PM', action: 'Admin logged in', user: 'Tyson' },
                      { time: '6:39 PM', action: 'Voice config updated', user: 'Daniel' },
                      { time: '6:37 PM', action: 'RAG query executed', user: 'System' },
                      { time: '6:35 PM', action: 'Client dashboard accessed', user: 'AMT66' }
                    ].map((log, index) => (
                      <div key={index} className="p-2 bg-slate-800/20 rounded text-xs">
                        <div className="text-white">[{log.time}] {log.action}</div>
                        <div className="text-slate-400">User: {log.user}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Roles */}
          <TabsContent value="user-roles">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span>User Role Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Tyson Lerfald', role: 'Super Admin', access: 'Full Control', status: 'Active' },
                    { name: 'Daniel Chen', role: 'Admin', access: 'Development', status: 'Active' },
                    { name: 'AMT66 Team', role: 'Client', access: 'Dashboard Only', status: 'Active' },
                    { name: 'Demo User', role: 'Demo', access: 'Read Only', status: 'Inactive' }
                  ].map((user) => (
                    <div key={user.name} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-slate-400 text-sm">{user.access}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${
                          user.role === 'Super Admin' ? 'bg-red-500/20 text-red-300' :
                          user.role === 'Admin' ? 'bg-orange-500/20 text-orange-300' :
                          user.role === 'Client' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {user.role}
                        </Badge>
                        <Button size="sm" variant="outline" className="text-green-400 border-green-500/30">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Config */}
          <TabsContent value="billing-config">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span>Stripe Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Live Mode</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Auto-billing</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="text-green-300 text-xs font-medium mb-1">Monthly Revenue</div>
                      <div className="text-white text-lg font-bold">$24,780</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span>Client File Manager</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {['AMT66_Contract.pdf', 'Bot_Script_v3.docx', 'Voice_Samples.zip'].map((file) => (
                      <div key={file} className="flex items-center justify-between p-2 bg-blue-500/10 rounded">
                        <span className="text-white text-sm">{file}</span>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Upload New File
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}