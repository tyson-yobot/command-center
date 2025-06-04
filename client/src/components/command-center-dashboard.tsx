import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Play, Zap, Phone, Mic, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CommandCenterDashboard() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any[]>([]);

  // Form states for different automation types
  const [apolloParams, setApolloParams] = useState({
    title: "Owner",
    location: "Texas",
    keywords: "roofing contractor"
  });

  const [apifyParams, setApifyParams] = useState({
    actor_id: "",
    search: "roofing contractors",
    location: "Texas"
  });

  const [smsParams, setSmsParams] = useState({
    to: "",
    message: "Follow-up message from YoBot"
  });

  const [transcribeParams, setTranscribeParams] = useState({
    file_path: ""
  });

  const [voiceParams, setVoiceParams] = useState({
    text: "Hello from YoBot",
    voice_id: "21m00Tcm4TlvDq8ikWAM"
  });

  const [callParams, setCallParams] = useState({
    api_url: "https://your-voicebot-endpoint.com/api/call",
    contact_name: "",
    phone_number: "",
    script: "Hello, this is YoBot calling to follow up on your inquiry."
  });

  const automationCategories = [
    { value: "New Booking Sync", label: "📆 New Booking Sync", icon: <Zap className="w-4 h-4" /> },
    { value: "New Support Ticket", label: "🆘 New Support Ticket", icon: <AlertTriangle className="w-4 h-4" /> },
    { value: "Initiate Voice Call", label: "📞 Initiate Voice Call", icon: <Phone className="w-4 h-4" /> },
    { value: "Run Lead Scrape", label: "🧲 Run Lead Scrape", icon: <Play className="w-4 h-4" /> },
    { value: "Manual Follow-up", label: "🚀 Manual Follow-up Now", icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const executeAutomation = async () => {
    if (!selectedCategory) {
      toast({
        title: "Selection Required",
        description: "Please select an automation category",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);

    try {
      let payload = {};

      // Set payload based on selected category
      switch (selectedCategory) {
        case "New Booking Sync":
          payload = { action: "sync_latest_bookings" };
          break;
        case "New Support Ticket":
          payload = { action: "create_support_ticket", priority: "Medium" };
          break;
        case "Initiate Voice Call":
          payload = callParams;
          break;
        case "Run Lead Scrape":
          payload = apolloParams;
          break;
        case "Manual Follow-up":
          payload = { action: "push_to_followup", immediate: true };
          break;
        default:
          payload = {};
      }

      const response = await apiRequest("POST", "/api/command-center/trigger", {
        category: selectedCategory,
        payload
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Automation Executed",
          description: `${selectedCategory} completed successfully`
        });

        setExecutionResults(prev => [{
          category: selectedCategory,
          result: result.result,
          timestamp: new Date().toISOString(),
          success: true
        }, ...prev.slice(0, 4)]);
      } else {
        toast({
          title: "Execution Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });

        setExecutionResults(prev => [{
          category: selectedCategory,
          result: { error: result.error },
          timestamp: new Date().toISOString(),
          success: false
        }, ...prev.slice(0, 4)]);
      }
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to execute automation",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeLiveCommand = async (category: string) => {
    setIsExecuting(true);
    
    try {
      const payload = getLiveCommandPayload(category);
      
      const response = await apiRequest("POST", "/api/command-center/trigger", {
        category,
        payload
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Command Executed",
          description: `${category} completed successfully`
        });

        setExecutionResults(prev => [{
          category,
          result: result.result,
          timestamp: new Date().toISOString(),
          success: true
        }, ...prev.slice(0, 4)]);
      } else {
        toast({
          title: "Command Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });

        setExecutionResults(prev => [{
          category,
          result: { error: result.error },
          timestamp: new Date().toISOString(),
          success: false
        }, ...prev.slice(0, 4)]);
      }
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to execute command",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getLiveCommandPayload = (category: string) => {
    switch (category) {
      case "New Booking Sync":
        return { action: "sync_latest_bookings" };
      case "New Support Ticket":
        return { action: "create_sample_ticket", priority: "high" };
      case "Initiate Voice Call":
        return { action: "test_call", number: "+15551234567" };
      case "Run Lead Scrape":
        return { query: "roofing contractor", limit: 10 };
      case "Manual Follow-up":
        return { lead_id: "manual_trigger", priority: "high" };
      default:
        return {};
    }
  };

  const sendEmergencyAlert = async () => {
    try {
      const message = prompt("Enter emergency alert message:");
      if (!message) return;

      const response = await apiRequest("POST", "/api/command-center/sev1-alert", {
        message
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Emergency Alert Sent",
          description: "SEV-1 alert delivered to Slack"
        });
      } else {
        toast({
          title: "Alert Failed",
          description: result.error || "Failed to send alert",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Alert Error",
        description: error.message || "Failed to send emergency alert",
        variant: "destructive"
      });
    }
  };

  const renderParameterForm = () => {
    switch (selectedCategory) {
      case "Apollo Scrape":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apollo-title">Job Title</Label>
              <Input
                id="apollo-title"
                value={apolloParams.title}
                onChange={(e) => setApolloParams({...apolloParams, title: e.target.value})}
                placeholder="Owner, Manager, etc."
              />
            </div>
            <div>
              <Label htmlFor="apollo-location">Location</Label>
              <Input
                id="apollo-location"
                value={apolloParams.location}
                onChange={(e) => setApolloParams({...apolloParams, location: e.target.value})}
                placeholder="Texas, California, etc."
              />
            </div>
            <div>
              <Label htmlFor="apollo-keywords">Company Keywords</Label>
              <Input
                id="apollo-keywords"
                value={apolloParams.keywords}
                onChange={(e) => setApolloParams({...apolloParams, keywords: e.target.value})}
                placeholder="roofing contractor, HVAC, etc."
              />
            </div>
          </div>
        );

      case "Apify Maps":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apify-actor">Actor ID</Label>
              <Input
                id="apify-actor"
                value={apifyParams.actor_id}
                onChange={(e) => setApifyParams({...apifyParams, actor_id: e.target.value})}
                placeholder="Your Apify actor ID"
              />
            </div>
            <div>
              <Label htmlFor="apify-search">Search Term</Label>
              <Input
                id="apify-search"
                value={apifyParams.search}
                onChange={(e) => setApifyParams({...apifyParams, search: e.target.value})}
                placeholder="roofing contractors"
              />
            </div>
            <div>
              <Label htmlFor="apify-location">Location</Label>
              <Input
                id="apify-location"
                value={apifyParams.location}
                onChange={(e) => setApifyParams({...apifyParams, location: e.target.value})}
                placeholder="Texas"
              />
            </div>
          </div>
        );

      case "Send SMS":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sms-to">Phone Number</Label>
              <Input
                id="sms-to"
                value={smsParams.to}
                onChange={(e) => setSmsParams({...smsParams, to: e.target.value})}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                value={smsParams.message}
                onChange={(e) => setSmsParams({...smsParams, message: e.target.value})}
                placeholder="Your message here"
                rows={3}
              />
            </div>
          </div>
        );

      case "Transcribe":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="transcribe-file">Audio File Path</Label>
              <Input
                id="transcribe-file"
                value={transcribeParams.file_path}
                onChange={(e) => setTranscribeParams({...transcribeParams, file_path: e.target.value})}
                placeholder="/path/to/audio/file.mp3"
              />
            </div>
          </div>
        );

      case "Voice Generate":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="voice-text">Text to Speech</Label>
              <Textarea
                id="voice-text"
                value={voiceParams.text}
                onChange={(e) => setVoiceParams({...voiceParams, text: e.target.value})}
                placeholder="Hello from YoBot"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="voice-id">Voice ID</Label>
              <Input
                id="voice-id"
                value={voiceParams.voice_id}
                onChange={(e) => setVoiceParams({...voiceParams, voice_id: e.target.value})}
                placeholder="21m00Tcm4TlvDq8ikWAM"
              />
            </div>
          </div>
        );

      case "Voice Call":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="call-name">Contact Name</Label>
              <Input
                id="call-name"
                value={callParams.contact_name}
                onChange={(e) => setCallParams({...callParams, contact_name: e.target.value})}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label htmlFor="call-phone">Phone Number</Label>
              <Input
                id="call-phone"
                value={callParams.phone_number}
                onChange={(e) => setCallParams({...callParams, phone_number: e.target.value})}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="call-script">Call Script</Label>
              <Textarea
                id="call-script"
                value={callParams.script}
                onChange={(e) => setCallParams({...callParams, script: e.target.value})}
                placeholder="Hello, this is YoBot calling to follow up..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Command Center</h2>
        <Button
          onClick={sendEmergencyAlert}
          variant="destructive"
          className="bg-red-600 hover:bg-red-700"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          SEV-1 Alert
        </Button>
      </div>

      {/* Live Command Center Buttons */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Live Command Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Button
              onClick={() => executeLiveCommand("New Booking Sync")}
              className="bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center p-4 h-auto"
              disabled={isExecuting}
            >
              <span className="text-2xl mb-2">📆</span>
              <span className="text-sm">New Booking Sync</span>
            </Button>
            
            <Button
              onClick={() => executeLiveCommand("New Support Ticket")}
              className="bg-red-600 hover:bg-red-700 text-white flex flex-col items-center p-4 h-auto"
              disabled={isExecuting}
            >
              <span className="text-2xl mb-2">🆘</span>
              <span className="text-sm">New Support Ticket</span>
            </Button>
            
            <Button
              onClick={() => executeLiveCommand("Initiate Voice Call")}
              className="bg-green-600 hover:bg-green-700 text-white flex flex-col items-center p-4 h-auto"
              disabled={isExecuting}
            >
              <span className="text-2xl mb-2">📞</span>
              <span className="text-sm">Initiate Voice Call</span>
            </Button>
            
            <Button
              onClick={() => executeLiveCommand("Run Lead Scrape")}
              className="bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center p-4 h-auto"
              disabled={isExecuting}
            >
              <span className="text-2xl mb-2">🧲</span>
              <span className="text-sm">Run Lead Scrape</span>
            </Button>
            
            <Button
              onClick={() => executeLiveCommand("Manual Follow-up")}
              className="bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center p-4 h-auto"
              disabled={isExecuting}
            >
              <span className="text-2xl mb-2">🚀</span>
              <span className="text-sm">Manual Follow-up</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Trigger */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Automation Dispatcher</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category-select" className="text-white">Select Automation</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-black/20 border-white/30 text-white">
                  <SelectValue placeholder="Choose automation type" />
                </SelectTrigger>
                <SelectContent>
                  {automationCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div className="space-y-4">
                {renderParameterForm()}
                <Button
                  onClick={executeAutomation}
                  disabled={isExecuting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isExecuting ? "Executing..." : "Execute Automation"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution Results */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {executionResults.length === 0 ? (
                <p className="text-slate-400 text-sm">No executions yet</p>
              ) : (
                executionResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{result.category}</p>
                        <p className="text-slate-300 text-xs">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        result.success
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}>
                        {result.success ? 'Success' : 'Failed'}
                      </div>
                    </div>
                    {result.result.error && (
                      <p className="text-red-300 text-xs mt-2">{result.result.error}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}