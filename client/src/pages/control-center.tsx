import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Settings, Shield, Database, Activity, Phone, Mail, MessageSquare, Search, Bot, Calendar, DollarSign, BarChart, Users, Zap } from "lucide-react";

interface ClientToggleConfig {
  client_id: string;
  toggles: {
    voicebot_enabled: boolean;
    call_engine_enabled: boolean;
    sms_engine_enabled: boolean;
    email_engine_enabled: boolean;
    scraping_apollo_enabled: boolean;
    scraping_phantombuster_enabled: boolean;
    ai_followup_enabled: boolean;
    slack_alerts_enabled: boolean;
    webhook_receivers_active: boolean;
    quickbooks_sync_enabled: boolean;
    calendar_sync_enabled: boolean;
    show_scrape_button: boolean;
    show_call_panel: boolean;
    show_revenue_forecast: boolean;
    show_debug_logs: boolean;
  };
  metrics: {
    last_call: string;
    last_sms: string;
    last_webhook: string;
    error_count_24h: number;
    api_usage_pct: number;
    uptime_pct: number;
  };
}

export default function ControlCenter() {
  const [selectedClient, setSelectedClient] = useState("client_001");
  const [config, setConfig] = useState<ClientToggleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load client configuration
  useEffect(() => {
    loadClientConfig();
  }, [selectedClient]);

  const loadClientConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/control-center/config/${selectedClient}`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateToggle = async (toggleName: string, value: boolean) => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/control-center/config/${selectedClient}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggle_name: toggleName, enabled: value })
      });

      if (response.ok) {
        setConfig(prev => prev ? {
          ...prev,
          toggles: { ...prev.toggles, [toggleName]: value }
        } : null);
        setLastSaved(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Failed to update toggle:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (enabled: boolean) => enabled ? "bg-green-500" : "bg-gray-400";
  const getStatusText = (enabled: boolean) => enabled ? "ACTIVE" : "DISABLED";

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8" />
              YoBot® Control Center
            </h1>
            <p className="text-blue-200 mt-2">System Configuration & Feature Management</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">Client ID: {selectedClient}</div>
            {lastSaved && (
              <div className="text-xs text-green-300">Last saved: {lastSaved}</div>
            )}
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">System Uptime</p>
                  <p className="text-2xl font-bold text-white">{config.metrics.uptime_pct}%</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">API Usage</p>
                  <p className="text-2xl font-bold text-white">{config.metrics.api_usage_pct}%</p>
                </div>
                <Database className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">24h Errors</p>
                  <p className="text-2xl font-bold text-white">{config.metrics.error_count_24h}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Active Services</p>
                  <p className="text-2xl font-bold text-white">
                    {Object.values(config.toggles).filter(Boolean).length}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="engines" className="space-y-6">
          <TabsList className="bg-black/20 border-blue-500/30">
            <TabsTrigger value="engines" className="data-[state=active]:bg-blue-600">Core Engines</TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-blue-600">Integrations</TabsTrigger>
            <TabsTrigger value="interface" className="data-[state=active]:bg-blue-600">Interface</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">Security</TabsTrigger>
          </TabsList>

          {/* Core Engines Tab */}
          <TabsContent value="engines" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voice & Communication */}
              <Card className="bg-black/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Voice & Communication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-blue-400" />
                      <div>
                        <Label className="text-white">VoiceBot Engine</Label>
                        <p className="text-sm text-blue-200">AI-powered voice interactions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(config.toggles.voicebot_enabled)}>
                        {getStatusText(config.toggles.voicebot_enabled)}
                      </Badge>
                      <Switch
                        checked={config.toggles.voicebot_enabled}
                        onCheckedChange={(checked) => updateToggle('voicebot_enabled', checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-400" />
                      <div>
                        <Label className="text-white">Call Engine</Label>
                        <p className="text-sm text-blue-200">Outbound calling system</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(config.toggles.call_engine_enabled)}>
                        {getStatusText(config.toggles.call_engine_enabled)}
                      </Badge>
                      <Switch
                        checked={config.toggles.call_engine_enabled}
                        onCheckedChange={(checked) => updateToggle('call_engine_enabled', checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      <div>
                        <Label className="text-white">SMS Engine</Label>
                        <p className="text-sm text-blue-200">Text messaging automation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(config.toggles.sms_engine_enabled)}>
                        {getStatusText(config.toggles.sms_engine_enabled)}
                      </Badge>
                      <Switch
                        checked={config.toggles.sms_engine_enabled}
                        onCheckedChange={(checked) => updateToggle('sms_engine_enabled', checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-orange-400" />
                      <div>
                        <Label className="text-white">Email Engine</Label>
                        <p className="text-sm text-blue-200">Email automation & follow-ups</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(config.toggles.email_engine_enabled)}>
                        {getStatusText(config.toggles.email_engine_enabled)}
                      </Badge>
                      <Switch
                        checked={config.toggles.email_engine_enabled}
                        onCheckedChange={(checked) => updateToggle('email_engine_enabled', checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data & Scraping */}
              <Card className="bg-black/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Data & Scraping
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div>
                        <Label className="text-white">Apollo Scraping</Label>
                        <p className="text-sm text-blue-200">Contact data extraction</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(config.toggles.scraping_apollo_enabled)}>
                        {getStatusText(config.toggles.scraping_apollo_enabled)}
                      </Badge>
                      <Switch
                        checked={config.toggles.scraping_apollo_enabled}
                        onCheckedChange={(checked) => updateToggle('scraping_apollo_enabled', checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-purple-400" />
                      <div>
                        <Label className="text-white">PhantomBuster</Label>
                        <p className="text-sm text-blue-200">Advanced web scraping</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(config.toggles.scraping_phantombuster_enabled)}>
                        {getStatusText(config.toggles.scraping_phantombuster_enabled)}
                      </Badge>
                      <Switch
                        checked={config.toggles.scraping_phantombuster_enabled}
                        onCheckedChange={(checked) => updateToggle('scraping_phantombuster_enabled', checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-green-400" />
                      <div>
                        <Label className="text-white">AI Follow-up</Label>
                        <p className="text-sm text-blue-200">Automated responses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(config.toggles.ai_followup_enabled)}>
                        {getStatusText(config.toggles.ai_followup_enabled)}
                      </Badge>
                      <Switch
                        checked={config.toggles.ai_followup_enabled}
                        onCheckedChange={(checked) => updateToggle('ai_followup_enabled', checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Business Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      <div>
                        <Label className="text-white">Slack Alerts</Label>
                        <p className="text-sm text-blue-200">Team notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.toggles.slack_alerts_enabled}
                      onCheckedChange={(checked) => updateToggle('slack_alerts_enabled', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <div>
                        <Label className="text-white">QuickBooks Sync</Label>
                        <p className="text-sm text-blue-200">Financial data sync</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.toggles.quickbooks_sync_enabled}
                      onCheckedChange={(checked) => updateToggle('quickbooks_sync_enabled', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <div>
                        <Label className="text-white">Calendar Sync</Label>
                        <p className="text-sm text-blue-200">Schedule integration</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.toggles.calendar_sync_enabled}
                      onCheckedChange={(checked) => updateToggle('calendar_sync_enabled', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-orange-400" />
                      <div>
                        <Label className="text-white">Webhook Receivers</Label>
                        <p className="text-sm text-blue-200">External data ingestion</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.toggles.webhook_receivers_active}
                      onCheckedChange={(checked) => updateToggle('webhook_receivers_active', checked)}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="text-blue-200">Last Call:</div>
                    <div className="text-white">{new Date(config.metrics.last_call).toLocaleString()}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-blue-200">Last SMS:</div>
                    <div className="text-white">{new Date(config.metrics.last_sms).toLocaleString()}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-blue-200">Last Webhook:</div>
                    <div className="text-white">{new Date(config.metrics.last_webhook).toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Interface Tab */}
          <TabsContent value="interface" className="space-y-4">
            <Card className="bg-black/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white">Dashboard Interface Controls</CardTitle>
                <CardDescription className="text-blue-200">
                  Configure what elements are visible in the Command Center
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Show Scrape Button</Label>
                      <Switch
                        checked={config.toggles.show_scrape_button}
                        onCheckedChange={(checked) => updateToggle('show_scrape_button', checked)}
                        disabled={saving}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-white">Show Call Panel</Label>
                      <Switch
                        checked={config.toggles.show_call_panel}
                        onCheckedChange={(checked) => updateToggle('show_call_panel', checked)}
                        disabled={saving}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-white">Show Revenue Forecast</Label>
                      <Switch
                        checked={config.toggles.show_revenue_forecast}
                        onCheckedChange={(checked) => updateToggle('show_revenue_forecast', checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Show Debug Logs</Label>
                      <Switch
                        checked={config.toggles.show_debug_logs}
                        onCheckedChange={(checked) => updateToggle('show_debug_logs', checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-black/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Client ID Management</Label>
                      <Input
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="mt-2 bg-black/30 border-blue-500/30 text-white"
                        placeholder="Enter client ID"
                      />
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-400 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Security Notice</span>
                      </div>
                      <p className="text-sm text-yellow-200">
                        Changes to security settings require administrator approval and may take up to 24 hours to take effect.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Active Sessions</h4>
                      <div className="text-sm text-blue-200">
                        <div>Current Client: {selectedClient}</div>
                        <div>Session Started: {new Date().toLocaleString()}</div>
                        <div>Access Level: Administrator</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <Button 
            onClick={loadClientConfig}
            disabled={loading}
            variant="outline"
            className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
          >
            {loading ? "Refreshing..." : "Refresh Config"}
          </Button>

          <div className="text-sm text-blue-200">
            {saving && "Saving changes..."}
          </div>
        </div>
      </div>
    </div>
  );
}