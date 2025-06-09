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
  const [botSystemEnabled, setBotSystemEnabled] = useState(true);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [voiceProcessing, setVoiceProcessing] = useState(true);
  const [automationMode, setAutomationMode] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showConfirmShutdown, setShowConfirmShutdown] = useState(false);
  const [ragQuery, setRagQuery] = useState("");
  const [ragResponse, setRagResponse] = useState("");
  const [newKnowledge, setNewKnowledge] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <img 
                src={robotHeadPath} 
                alt="YoBot Robot Head" 
                className="w-12 h-12 mr-3 inline-block"
                style={{ marginTop: '-4px' }}
              />
              YoBot Control Center LITE
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

        <Tabs defaultValue="knowledge-rag" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-600/30">
            <TabsTrigger value="knowledge-rag">🧠 Knowledge RAG</TabsTrigger>
            <TabsTrigger value="voice-config">🎤 VoiceBot Config</TabsTrigger>
            <TabsTrigger value="bot-personality">🤖 Bot Personality</TabsTrigger>
            <TabsTrigger value="system-monitor">📊 System Monitor</TabsTrigger>
            <TabsTrigger value="user-roles">👥 User Roles</TabsTrigger>
          </TabsList>

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
                        const response = await fetch('/api/rag/query', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ query: ragQuery })
                        });
                        const data = await response.json();
                        setRagResponse(data.answer || "No response received");
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
                  <Textarea
                    placeholder="Enter new knowledge or documentation..."
                    value={newKnowledge}
                    onChange={(e) => setNewKnowledge(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    rows={4}
                  />
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      if (!newKnowledge.trim()) return;
                      try {
                        await fetch('/api/rag/add', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ content: newKnowledge })
                        });
                        setNewKnowledge("");
                      } catch (error) {
                        console.error("Error adding knowledge");
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
                    <div className="text-3xl font-black text-orange-400 mb-2">324%</div>
                    <div className="text-orange-300 text-sm">ROI</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Controls Section */}
            <div className="mt-8">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-400" />
                System Controls
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* RAG System Control */}
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-green-400" />
                      <span>RAG System</span>
                      <Badge className={`${ragEnabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {ragEnabled ? 'ACTIVE' : 'OFF'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium transition-colors duration-300 ${
                          ragEnabled ? 'text-white' : 'text-slate-500'
                        }`}>Knowledge Engine</span>
                        <Switch 
                          checked={ragEnabled && !emergencyMode} 
                          onCheckedChange={setRagEnabled}
                          disabled={emergencyMode}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                      <div className={`text-xs transition-colors duration-300 ${
                        ragEnabled ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {ragEnabled ? 'Vector search active' : 'Knowledge retrieval disabled'}
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className={`text-sm mb-2 transition-colors duration-300 ${
                          ragEnabled ? 'text-white' : 'text-slate-500'
                        }`}>Documents: {ragEnabled ? '2,847' : '0'}</div>
                        <div className={`text-xs transition-colors duration-300 ${
                          ragEnabled ? 'text-slate-400' : 'text-slate-600'
                        }`}>Confidence: 94.7%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bot System Control */}
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <BotIcon className="w-5 h-5 text-blue-400" />
                      <span>Bot System</span>
                      <Badge className={`${botSystemEnabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {botSystemEnabled ? 'ONLINE' : 'OFFLINE'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium transition-colors duration-300 ${
                          botSystemEnabled ? 'text-white' : 'text-slate-500'
                        }`}>Main Bot</span>
                        <Switch 
                          checked={botSystemEnabled && !emergencyMode} 
                          onCheckedChange={setBotSystemEnabled}
                          disabled={emergencyMode}
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </div>
                      <div className={`text-xs transition-colors duration-300 ${
                        botSystemEnabled ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {botSystemEnabled ? 'Accepting conversations' : 'Bot is offline'}
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className={`text-sm mb-2 transition-colors duration-300 ${
                          botSystemEnabled ? 'text-white' : 'text-slate-500'
                        }`}>Active chats: {botSystemEnabled ? '12' : '0'}</div>
                        <div className={`text-xs transition-colors duration-300 ${
                          botSystemEnabled ? 'text-slate-400' : 'text-slate-600'
                        }`}>Response time: 1.2s</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Voice Processing Control */}
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Mic className="w-5 h-5 text-cyan-400" />
                      <span>Voice Processing</span>
                      <Badge className={`${voiceProcessing ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {voiceProcessing ? 'ACTIVE' : 'MUTED'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium transition-colors duration-300 ${
                          voiceProcessing ? 'text-white' : 'text-slate-500'
                        }`}>Voice Engine</span>
                        <Switch 
                          checked={voiceProcessing && !emergencyMode} 
                          onCheckedChange={setVoiceProcessing}
                          disabled={emergencyMode}
                          className="data-[state=checked]:bg-cyan-500"
                        />
                      </div>
                      <div className={`text-xs transition-colors duration-300 ${
                        voiceProcessing ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {voiceProcessing ? 'Ready for voice commands' : 'Voice input disabled'}
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className={`text-sm mb-2 transition-colors duration-300 ${
                          voiceProcessing ? 'text-white' : 'text-slate-500'
                        }`}>Queue: {voiceProcessing ? '3' : '0'}</div>
                        <div className={`text-xs transition-colors duration-300 ${
                          voiceProcessing ? 'text-slate-400' : 'text-slate-600'
                        }`}>Avg processing: 2.1s</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Automation Control */}
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <span>Automation</span>
                      <Badge className={`${automationMode ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {automationMode ? 'AUTO' : 'MANUAL'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium transition-colors duration-300 ${
                          automationMode ? 'text-white' : 'text-slate-500'
                        }`}>Auto Mode</span>
                        <Switch 
                          checked={automationMode && !emergencyMode} 
                          onCheckedChange={setAutomationMode}
                          disabled={emergencyMode}
                          className="data-[state=checked]:bg-yellow-500"
                        />
                      </div>
                      <div className={`text-xs transition-colors duration-300 ${
                        automationMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {automationMode ? 'Workflows run automatically' : 'Manual approval required'}
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className={`text-sm mb-2 transition-colors duration-300 ${
                          automationMode ? 'text-white' : 'text-slate-500'
                        }`}>Active Workflows: {automationMode ? '8' : '0'}</div>
                        <div className={`text-xs transition-colors duration-300 ${
                          automationMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>Success rate: 94.2%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Emergency Controls */}
              <Card className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 mt-6">
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
            </div>
          </TabsContent>

          {/* VoiceBot Configuration */}
          <TabsContent value="voice-config">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Voice Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Voice configuration settings would go here.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bot Personality */}
          <TabsContent value="bot-personality">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Bot Personality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Bot personality settings would go here.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Monitor */}
          <TabsContent value="system-monitor">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">System Monitor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">System monitoring data would go here.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Roles */}
          <TabsContent value="user-roles">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">User Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">User role management would go here.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}