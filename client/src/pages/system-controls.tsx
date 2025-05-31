import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Database, 
  Brain, 
  FileText, 
  BarChart3, 
  Network, 
  Mic, 
  Calendar, 
  Target, 
  Eye, 
  Shield,
  Power,
  Bell,
  MessageSquare,
  Activity,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock
} from "lucide-react";

export default function SystemControls() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [adminPassword, setAdminPassword] = useState("YoBot2025!"); // Default password
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [moduleStates, setModuleStates] = useState({
    // Voice & Communication
    voiceBotCore: true,
    callRouting: true,
    emergencyEscalation: true,
    slackNotifications: true,
    
    // CRM & Data
    hubspotSync: true,
    airtableLogging: true,
    leadScoring: true,
    contactEnrichment: false,
    
    // Automation & AI
    smartWorkflows: true,
    emailAutomation: true,
    followupTasks: true,
    pdfGeneration: false,
    
    // Business Tools
    quoteGenerator: true,
    calendarBooking: false,
    ndaGenerator: false,
    businessCardOcr: true,
    
    // Analytics & Monitoring
    realtimeMetrics: true,
    performanceTracking: true,
    usageAnalytics: false,
    errorMonitoring: true,
    
    // Integrations
    googleCalendar: false,
    stripePayments: false,
    quickbooks: false,
    twilioSms: true
  });

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setAuthError("");
      setPassword("");
    } else {
      setAuthError("Invalid password. Access denied.");
      setPassword("");
    }
  };

  const handlePasswordUpdate = () => {
    if (newPassword.length >= 8) {
      setAdminPassword(newPassword);
      setNewPassword("");
      setShowPasswordSetup(false);
      // Store in localStorage for persistence
      localStorage.setItem("yobot_admin_password", newPassword);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setAuthError("");
  };

  const toggleModule = (module: string) => {
    setModuleStates(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-400" : "bg-gray-400";
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-gray-500" />;
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-black text-white">RESTRICTED ACCESS</CardTitle>
            <p className="text-red-300 text-sm font-medium">System Control Panel</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-semibold">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                placeholder="Enter admin password"
              />
            </div>
            
            {authError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm font-medium">{authError}</p>
              </div>
            )}
            
            <Button 
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Authenticate
            </Button>
            
            <div className="pt-4 border-t border-white/20">
              <Button 
                variant="outline"
                onClick={() => setShowPasswordSetup(!showPasswordSetup)}
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              
              {showPasswordSetup && (
                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white font-semibold">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <Button 
                    onClick={handlePasswordUpdate}
                    disabled={newPassword.length < 8}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update Password
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-center pt-4">
              <p className="text-white/60 text-xs">Default: YoBot2025!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">System Control Panel</h1>
            <p className="text-blue-300">Manage automation modules and integrations</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            24 Active Modules
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            6 Disabled
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Apply Changes
          </Button>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Voice & Communication */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <Mic className="w-4 h-4 text-blue-400" />
              <span>Voice & Communication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.voiceBotCore)} rounded-full`}></div>
                <span className="text-white text-sm">VoiceBot Core</span>
                {getStatusIcon(moduleStates.voiceBotCore)}
              </div>
              <Switch 
                checked={moduleStates.voiceBotCore} 
                onCheckedChange={() => toggleModule('voiceBotCore')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.callRouting)} rounded-full`}></div>
                <span className="text-white text-sm">Call Routing</span>
                {getStatusIcon(moduleStates.callRouting)}
              </div>
              <Switch 
                checked={moduleStates.callRouting} 
                onCheckedChange={() => toggleModule('callRouting')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.emergencyEscalation)} rounded-full`}></div>
                <span className="text-white text-sm">Emergency Escalation</span>
                {getStatusIcon(moduleStates.emergencyEscalation)}
              </div>
              <Switch 
                checked={moduleStates.emergencyEscalation} 
                onCheckedChange={() => toggleModule('emergencyEscalation')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.slackNotifications)} rounded-full`}></div>
                <span className="text-white text-sm">Slack Notifications</span>
                {getStatusIcon(moduleStates.slackNotifications)}
              </div>
              <Switch 
                checked={moduleStates.slackNotifications} 
                onCheckedChange={() => toggleModule('slackNotifications')}
              />
            </div>
          </CardContent>
        </Card>

        {/* CRM & Data */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <Database className="w-4 h-4 text-green-400" />
              <span>CRM & Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.hubspotSync)} rounded-full`}></div>
                <span className="text-white text-sm">HubSpot Sync</span>
                {getStatusIcon(moduleStates.hubspotSync)}
              </div>
              <Switch 
                checked={moduleStates.hubspotSync} 
                onCheckedChange={() => toggleModule('hubspotSync')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.airtableLogging)} rounded-full`}></div>
                <span className="text-white text-sm">Airtable Logging</span>
                {getStatusIcon(moduleStates.airtableLogging)}
              </div>
              <Switch 
                checked={moduleStates.airtableLogging} 
                onCheckedChange={() => toggleModule('airtableLogging')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.leadScoring)} rounded-full`}></div>
                <span className="text-white text-sm">Lead Scoring</span>
                {getStatusIcon(moduleStates.leadScoring)}
              </div>
              <Switch 
                checked={moduleStates.leadScoring} 
                onCheckedChange={() => toggleModule('leadScoring')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.contactEnrichment)} rounded-full`}></div>
                <span className="text-white text-sm">Contact Enrichment</span>
                {getStatusIcon(moduleStates.contactEnrichment)}
              </div>
              <Switch 
                checked={moduleStates.contactEnrichment} 
                onCheckedChange={() => toggleModule('contactEnrichment')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Automation & AI */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Automation & AI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.smartWorkflows)} rounded-full`}></div>
                <span className="text-white text-sm">Smart Workflows</span>
                {getStatusIcon(moduleStates.smartWorkflows)}
              </div>
              <Switch 
                checked={moduleStates.smartWorkflows} 
                onCheckedChange={() => toggleModule('smartWorkflows')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.emailAutomation)} rounded-full`}></div>
                <span className="text-white text-sm">Email Automation</span>
                {getStatusIcon(moduleStates.emailAutomation)}
              </div>
              <Switch 
                checked={moduleStates.emailAutomation} 
                onCheckedChange={() => toggleModule('emailAutomation')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.followupTasks)} rounded-full`}></div>
                <span className="text-white text-sm">Follow-up Tasks</span>
                {getStatusIcon(moduleStates.followupTasks)}
              </div>
              <Switch 
                checked={moduleStates.followupTasks} 
                onCheckedChange={() => toggleModule('followupTasks')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.pdfGeneration)} rounded-full`}></div>
                <span className="text-white text-sm">PDF Generation</span>
                {getStatusIcon(moduleStates.pdfGeneration)}
              </div>
              <Switch 
                checked={moduleStates.pdfGeneration} 
                onCheckedChange={() => toggleModule('pdfGeneration')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Tools */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <FileText className="w-4 h-4 text-yellow-400" />
              <span>Business Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.quoteGenerator)} rounded-full`}></div>
                <span className="text-white text-sm">Quote Generator</span>
                {getStatusIcon(moduleStates.quoteGenerator)}
              </div>
              <Switch 
                checked={moduleStates.quoteGenerator} 
                onCheckedChange={() => toggleModule('quoteGenerator')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.calendarBooking)} rounded-full`}></div>
                <span className="text-white text-sm">Calendar Booking</span>
                {getStatusIcon(moduleStates.calendarBooking)}
              </div>
              <Switch 
                checked={moduleStates.calendarBooking} 
                onCheckedChange={() => toggleModule('calendarBooking')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.ndaGenerator)} rounded-full`}></div>
                <span className="text-white text-sm">NDA Generator</span>
                {getStatusIcon(moduleStates.ndaGenerator)}
              </div>
              <Switch 
                checked={moduleStates.ndaGenerator} 
                onCheckedChange={() => toggleModule('ndaGenerator')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.businessCardOcr)} rounded-full`}></div>
                <span className="text-white text-sm">Business Card OCR</span>
                {getStatusIcon(moduleStates.businessCardOcr)}
              </div>
              <Switch 
                checked={moduleStates.businessCardOcr} 
                onCheckedChange={() => toggleModule('businessCardOcr')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Monitoring */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Analytics & Monitoring</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.realtimeMetrics)} rounded-full`}></div>
                <span className="text-white text-sm">Real-time Metrics</span>
                {getStatusIcon(moduleStates.realtimeMetrics)}
              </div>
              <Switch 
                checked={moduleStates.realtimeMetrics} 
                onCheckedChange={() => toggleModule('realtimeMetrics')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.performanceTracking)} rounded-full`}></div>
                <span className="text-white text-sm">Performance Tracking</span>
                {getStatusIcon(moduleStates.performanceTracking)}
              </div>
              <Switch 
                checked={moduleStates.performanceTracking} 
                onCheckedChange={() => toggleModule('performanceTracking')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.usageAnalytics)} rounded-full`}></div>
                <span className="text-white text-sm">Usage Analytics</span>
                {getStatusIcon(moduleStates.usageAnalytics)}
              </div>
              <Switch 
                checked={moduleStates.usageAnalytics} 
                onCheckedChange={() => toggleModule('usageAnalytics')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.errorMonitoring)} rounded-full`}></div>
                <span className="text-white text-sm">Error Monitoring</span>
                {getStatusIcon(moduleStates.errorMonitoring)}
              </div>
              <Switch 
                checked={moduleStates.errorMonitoring} 
                onCheckedChange={() => toggleModule('errorMonitoring')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <Network className="w-4 h-4 text-orange-400" />
              <span>Integrations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.googleCalendar)} rounded-full`}></div>
                <span className="text-white text-sm">Google Calendar</span>
                {getStatusIcon(moduleStates.googleCalendar)}
              </div>
              <Switch 
                checked={moduleStates.googleCalendar} 
                onCheckedChange={() => toggleModule('googleCalendar')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.stripePayments)} rounded-full`}></div>
                <span className="text-white text-sm">Stripe Payments</span>
                {getStatusIcon(moduleStates.stripePayments)}
              </div>
              <Switch 
                checked={moduleStates.stripePayments} 
                onCheckedChange={() => toggleModule('stripePayments')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.quickbooks)} rounded-full`}></div>
                <span className="text-white text-sm">QuickBooks</span>
                {getStatusIcon(moduleStates.quickbooks)}
              </div>
              <Switch 
                checked={moduleStates.quickbooks} 
                onCheckedChange={() => toggleModule('quickbooks')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.twilioSms)} rounded-full`}></div>
                <span className="text-white text-sm">Twilio SMS</span>
                {getStatusIcon(moduleStates.twilioSms)}
              </div>
              <Switch 
                checked={moduleStates.twilioSms} 
                onCheckedChange={() => toggleModule('twilioSms')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">System Status: Operational</span>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Reset All
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
          >
            <Lock className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}