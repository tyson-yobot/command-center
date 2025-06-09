import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useModeContext } from '../App';
import { 
  Settings, 
  Zap, 
  Shield, 
  Globe, 
  Database,
  Bell,
  Monitor,
  Users,
  Lock,
  Eye,
  Activity,
  BarChart3,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Calendar,
  Target,
  Cpu,
  Wifi,
  Server
} from 'lucide-react';

export default function ControlCenterPage() {
  const { isTestMode, setTestMode } = useModeContext();
  const [features, setFeatures] = React.useState({
    // Core Features
    voiceBot: true,
    leadScraping: true,
    salesOrders: true,
    supportChat: true,
    
    // Integrations
    hubspot: true,
    slack: true,
    quickbooks: true,
    stripe: true,
    twilio: true,
    
    // Advanced Features
    aiAssistant: false,
    ragSystem: true,
    automation: true,
    analytics: true,
    
    // Security & Monitoring
    monitoring: true,
    alerts: true,
    logging: true,
    backup: true
  });

  const toggleFeature = (feature: string) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature as keyof typeof prev]
    }));
  };

  const featureGroups = [
    {
      title: "🚀 Core Features",
      icon: <Zap className="w-5 h-5" />,
      features: [
        { key: 'voiceBot', label: 'VoiceBot System', icon: <Phone className="w-4 h-4" />, description: 'AI-powered voice interactions' },
        { key: 'leadScraping', label: 'Lead Scraping', icon: <Users className="w-4 h-4" />, description: 'Apollo, Apify, PhantomBuster integration' },
        { key: 'salesOrders', label: 'Sales Orders', icon: <FileText className="w-4 h-4" />, description: 'Automated order processing' },
        { key: 'supportChat', label: 'Support Chat', icon: <MessageSquare className="w-4 h-4" />, description: 'Customer support system' }
      ]
    },
    {
      title: "🔗 Integrations",
      icon: <Globe className="w-5 h-5" />,
      features: [
        { key: 'hubspot', label: 'HubSpot CRM', icon: <Database className="w-4 h-4" />, description: 'Customer relationship management' },
        { key: 'slack', label: 'Slack Notifications', icon: <Bell className="w-4 h-4" />, description: 'Team communication alerts' },
        { key: 'quickbooks', label: 'QuickBooks', icon: <BarChart3 className="w-4 h-4" />, description: 'Financial data integration' },
        { key: 'stripe', label: 'Stripe Payments', icon: <Shield className="w-4 h-4" />, description: 'Payment processing' },
        { key: 'twilio', label: 'Twilio SMS', icon: <Mail className="w-4 h-4" />, description: 'SMS communication' }
      ]
    },
    {
      title: "🧠 AI & Automation",
      icon: <Cpu className="w-5 h-5" />,
      features: [
        { key: 'aiAssistant', label: 'AI Assistant', icon: <Activity className="w-4 h-4" />, description: 'Advanced AI capabilities' },
        { key: 'ragSystem', label: 'RAG Knowledge Base', icon: <FileText className="w-4 h-4" />, description: 'Document-based AI responses' },
        { key: 'automation', label: 'Workflow Automation', icon: <Target className="w-4 h-4" />, description: '1040+ automation functions' },
        { key: 'analytics', label: 'Advanced Analytics', icon: <BarChart3 className="w-4 h-4" />, description: 'Real-time business insights' }
      ]
    },
    {
      title: "🛡️ Security & Monitoring",
      icon: <Shield className="w-5 h-5" />,
      features: [
        { key: 'monitoring', label: 'System Monitoring', icon: <Monitor className="w-4 h-4" />, description: 'Real-time system health' },
        { key: 'alerts', label: 'Alert System', icon: <Bell className="w-4 h-4" />, description: 'Proactive notifications' },
        { key: 'logging', label: 'Audit Logging', icon: <Eye className="w-4 h-4" />, description: 'Complete activity tracking' },
        { key: 'backup', label: 'Data Backup', icon: <Server className="w-4 h-4" />, description: 'Automated data protection' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Control Center</h1>
              <p className="text-blue-200">Feature Toggles & System Configuration</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isTestMode ? "secondary" : "default"} className="px-4 py-2">
              {isTestMode ? "🧪 Test Mode" : "🚀 Live Mode"}
            </Badge>
          </div>
        </div>

        {/* Global Test/Live Mode Toggle */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-yellow-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-yellow-400" />
              <span>Global Mode Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">System Mode</h3>
                <p className="text-gray-300">
                  {isTestMode 
                    ? "Test mode uses simulated data and safe operations" 
                    : "Live mode processes real data and executes actual operations"
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Label htmlFor="globalMode" className="text-white font-medium">
                  {isTestMode ? "Test Mode" : "Live Mode"}
                </Label>
                <Switch
                  id="globalMode"
                  checked={!isTestMode}
                  onCheckedChange={(checked) => setTestMode(!checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featureGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  {group.icon}
                  <span>{group.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.features.map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{feature.label}</h4>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={features[feature.key as keyof typeof features]}
                      onCheckedChange={() => toggleFeature(feature.key)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Status */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-green-500/20 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <p className="text-green-300 font-medium">Active Features</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(features).filter(Boolean).length}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <p className="text-blue-300 font-medium">Automations</p>
                <p className="text-2xl font-bold text-white">1040+</p>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <p className="text-purple-300 font-medium">Integrations</p>
                <p className="text-2xl font-bold text-white">15+</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <p className="text-yellow-300 font-medium">Uptime</p>
                <p className="text-2xl font-bold text-white">99.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-500/20">
            <Lock className="w-4 h-4 mr-2" />
            Export Configuration
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
            <Settings className="w-4 h-4 mr-2" />
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
}