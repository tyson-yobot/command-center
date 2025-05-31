import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Power, Route, MessageSquare, Settings, Activity, Bell } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NotificationSettings from "@/components/notification-settings";
import type { Bot } from "@shared/schema";

export default function Controls() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: bot, isLoading } = useQuery<Bot>({
    queryKey: ["/api/bot"],
    refetchInterval: 5000,
  });

  const updateBotMutation = useMutation({
    mutationFn: async (updates: Partial<Bot>) => {
      return apiRequest("PATCH", "/api/bot", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot"] });
      toast({
        title: "Settings Updated",
        description: "Bot settings have been successfully updated.",
      });
      setIsUpdating(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update bot settings.",
      });
      setIsUpdating(false);
    },
  });

  const handleStatusToggle = async (checked: boolean) => {
    setIsUpdating(true);
    updateBotMutation.mutate({
      status: checked ? "active" : "paused",
    });
  };

  const handleToneChange = async (tone: string) => {
    setIsUpdating(true);
    updateBotMutation.mutate({ tone });
  };

  const handleRoutingChange = async (routingMode: string) => {
    setIsUpdating(true);
    updateBotMutation.mutate({ routingMode });
  };

  if (isLoading) {
    return (
      <div className="px-4 space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Bot Configuration Found</h3>
            <p className="text-sm text-muted-foreground">
              Bot settings will appear here once your bot is properly configured.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "paused":
        return "text-yellow-600";
      case "offline":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active & Ready";
      case "paused":
        return "Paused";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="px-4 space-y-6">
      {/* Bot Status */}
      <Card className="bg-white border-2 border-white shadow-2xl">
        <CardHeader className="pb-3 bg-black">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#0d82da] rounded-lg flex items-center justify-center">
                <Power className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">SYSTEM STATUS</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                bot.status === "active" ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-red-400 shadow-lg shadow-red-400/50"
              }`} />
              <span className="text-xs font-mono text-white">LIVE</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white">
          <div className="flex items-center justify-between p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden ${
                bot.status === "active" 
                  ? "bg-green-500 shadow-lg shadow-green-500/30" 
                  : "bg-red-500 shadow-lg shadow-red-500/30"
              }`}>
                <Activity className={`h-7 w-7 text-white ${
                  bot.status === "active" ? "animate-pulse" : "animate-ping"
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-black text-lg">YoBot Assistant</h3>
                <p className={`text-sm font-bold ${
                  bot.status === "active" ? "text-green-600" : "text-red-600"
                } tracking-wide`}>
                  {getStatusLabel(bot.status)}
                </p>
                <p className="text-xs text-black font-mono mt-1">ID: {bot.id} | PID: 2847</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Switch
                checked={bot.status === "active"}
                onCheckedChange={handleStatusToggle}
                disabled={isUpdating}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
              <span className="text-xs text-black font-mono">[TOGGLE]</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Routing */}
      <Card className="bg-white border-2 border-white shadow-xl">
        <CardHeader className="pb-3 bg-black">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#0d82da] rounded-lg flex items-center justify-center">
                <Route className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">LEAD ROUTING</span>
            </div>
            <div className="text-xs font-mono bg-[#0d82da] px-2 py-1 rounded text-white">RT-SYS</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#0d82da] rounded-xl flex items-center justify-center shadow-lg">
                  <Route className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black text-lg">Routing Algorithm</h3>
                  <p className="text-sm font-semibold text-black tracking-wide">
                    {bot.routingMode.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>
              <Badge className="bg-[#0d82da] text-white font-bold px-3 py-1 text-sm">
                {bot.routingMode.toUpperCase()}
              </Badge>
            </div>
            <Select
              value={bot.routingMode}
              onValueChange={handleRoutingChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="bg-white border-2 border-black font-semibold text-lg h-12 text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto-assign">Auto Assign</SelectItem>
                <SelectItem value="round-robin">Round Robin</SelectItem>
                <SelectItem value="manual">Manual Assignment</SelectItem>
                <SelectItem value="priority-based">Priority Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Tone */}
      <Card className="bg-white border-2 border-white shadow-xl">
        <CardHeader className="pb-3 bg-black">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#0d82da] rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">CONVERSATION TONE</span>
            </div>
            <div className="text-xs font-mono bg-[#0d82da] px-2 py-1 rounded text-white">AI-TONE</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#0d82da] rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black text-lg">Bot Personality</h3>
                  <p className="text-sm font-semibold text-black tracking-wide">
                    {bot.tone.charAt(0).toUpperCase() + bot.tone.slice(1)} Communication
                  </p>
                </div>
              </div>
              <Badge className="bg-[#0d82da] text-white font-bold px-3 py-1 text-sm">
                {bot.tone.toUpperCase()}
              </Badge>
            </div>
            <Select
              value={bot.tone}
              onValueChange={handleToneChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="bg-white border-2 border-black font-semibold text-lg h-12 text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Automation Controls */}
      <Card className="bg-white border-2 border-white shadow-xl">
        <CardHeader className="pb-3 bg-black">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#0d82da] rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">AUTOMATION CONTROLS</span>
            </div>
            <div className="text-xs font-mono bg-[#0d82da] px-2 py-1 rounded text-white">AUTO-SYS</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OCR Processing */}
            <div className="p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">OCR</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-black">Business Card OCR</h4>
                    <p className="text-xs text-gray-600">Extract contact data</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            {/* CRM Integration */}
            <div className="p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CRM</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-black">HubSpot Sync</h4>
                    <p className="text-xs text-gray-600">Auto-create contacts</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            {/* QuickBooks Integration */}
            <div className="p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">QB</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-black">QuickBooks Sync</h4>
                    <p className="text-xs text-gray-600">Customer creation</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            {/* Slack Notifications */}
            <div className="p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black">Slack Alerts</h4>
                    <p className="text-xs text-gray-600">Team notifications</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            {/* Lead Scoring */}
            <div className="p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-black">Lead Scoring</h4>
                    <p className="text-xs text-gray-600">Hot/Warm/Cold tags</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            {/* PDF Generation */}
            <div className="p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">PDF</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-black">Quote Generator</h4>
                    <p className="text-xs text-gray-600">Auto-generate quotes</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            {/* Calendar Tasks */}
            <div className="p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📅</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-black">Follow-Up Tasks</h4>
                    <p className="text-xs text-gray-600">Schedule reminders</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            {/* Voice Analytics */}
            <div className="p-4 bg-[#c3c3c3] rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🎤</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-black">Voice Analytics</h4>
                    <p className="text-xs text-gray-600">ElevenLabs integration</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Permissions */}
      <Card className="bg-white border-2 border-white shadow-xl">
        <CardHeader className="pb-3 bg-black">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#0d82da] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">👤</span>
              </div>
              <span className="text-xl font-bold">PACKAGE PERMISSIONS</span>
            </div>
            <div className="text-xs font-mono bg-[#0d82da] px-2 py-1 rounded text-white">PKG-MGR</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <div className="space-y-4">
            {/* Basic Package */}
            <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-black text-lg">Basic Package</h4>
                  <p className="text-sm text-gray-600">$99/month - Core features</p>
                </div>
                <Badge className="bg-gray-500 text-white">BASIC</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Business Card OCR</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Basic CRM Sync</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Lead Scoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Voice Analytics</span>
                </div>
              </div>
            </div>

            {/* Pro Package */}
            <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-black text-lg">Pro Package</h4>
                  <p className="text-sm text-gray-600">$299/month - Advanced automation</p>
                </div>
                <Badge className="bg-blue-500 text-white">PRO</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>All Basic Features</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Lead Scoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>PDF Generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Calendar Integration</span>
                </div>
              </div>
            </div>

            {/* Enterprise Package */}
            <div className="p-4 bg-yellow-100 rounded-lg border-2 border-yellow-300">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-black text-lg">Enterprise Package</h4>
                  <p className="text-sm text-gray-600">$699/month - Full automation suite</p>
                </div>
                <Badge className="bg-yellow-500 text-white">ENTERPRISE</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>All Pro Features</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Voice Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>QuickBooks Integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Custom Integrations</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-20 justify-start bg-white text-black border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 font-semibold px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1 right-1 text-xs text-gray-400 font-mono">PWR</div>
            <span className="relative z-10 flex flex-col items-start space-y-1">
              <div className="flex items-center space-x-2">
                <Power className="h-5 w-5" />
                <span className="text-sm font-bold">Restart Bot</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">[F5]</span>
            </span>
          </Button>
          <Button variant="outline" className="h-20 justify-start bg-white text-black border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 font-semibold px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1 right-1 text-xs text-gray-400 font-mono">CFG</div>
            <span className="relative z-10 flex flex-col items-start space-y-1">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span className="text-sm font-bold">Reset Settings</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">[F6]</span>
            </span>
          </Button>
          <Button variant="outline" className="h-20 justify-start bg-white text-black border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 font-semibold px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1 right-1 text-xs text-gray-400 font-mono">SYS</div>
            <span className="relative z-10 flex flex-col items-start space-y-1">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span className="text-sm font-bold">Diagnostics</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">[F7]</span>
            </span>
          </Button>
          <Button variant="outline" className="h-20 justify-start bg-white text-black border-2 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 font-semibold px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1 right-1 text-xs text-gray-400 font-mono">RPT</div>
            <span className="relative z-10 flex flex-col items-start space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <span className="text-sm font-bold">Daily Report</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">[F8]</span>
            </span>
          </Button>
          <Button variant="outline" className="h-20 justify-start bg-white text-black border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 font-semibold px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1 right-1 text-xs text-gray-400 font-mono">EXP</div>
            <span className="relative z-10 flex flex-col items-start space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📈</span>
                <span className="text-sm font-bold">Export Data</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">[F9]</span>
            </span>
          </Button>
          <Button variant="outline" className="h-20 justify-start bg-white text-black border-2 border-gray-300 hover:border-pink-400 hover:bg-pink-50 font-semibold px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1 right-1 text-xs text-gray-400 font-mono">ALT</div>
            <span className="relative z-10 flex flex-col items-start space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🚨</span>
                <span className="text-sm font-bold">Alerts Setup</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">[F10]</span>
            </span>
          </Button>
        </CardContent>
      </Card>

      {/* Push Notification Settings */}
      <NotificationSettings />
    </div>
  );
}
