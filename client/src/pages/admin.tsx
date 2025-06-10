import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Zap
} from "lucide-react";

export default function AdminConsole() {
  const [userRole, setUserRole] = useState<string>("admin");
  const [systemHealth, setSystemHealth] = useState(98.7);

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
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">YoBot® Admin Console</h1>
              <p className="text-red-300 text-sm">⚠️ FULL CONTROL PANEL - Admin Access Only</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">
              ADMIN MODE
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
              System: {systemHealth}%
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="voice-config" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-600/30">
            <TabsTrigger value="voice-config">🎤 VoiceBot Config</TabsTrigger>
            <TabsTrigger value="bot-personality">🧠 Bot Personality</TabsTrigger>
            <TabsTrigger value="rag-manager">📤 RAG Manager</TabsTrigger>
            <TabsTrigger value="system-monitor">🧩 System Monitor</TabsTrigger>
            <TabsTrigger value="user-roles">👥 User Roles</TabsTrigger>
            <TabsTrigger value="billing-config">💰 Billing Config</TabsTrigger>
          </TabsList>

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