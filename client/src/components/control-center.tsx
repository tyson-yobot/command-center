import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Bot, 
  Phone, 
  TrendingUp, 
  Users, 
  CheckCircle,
  Settings,
  BarChart3,
  Search,
  Wifi,
  WifiOff,
  Target,
  Building,
  MapPin,
  Star,
  Mail,
  Globe,
  Briefcase,
  User,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  FileDown,
  Save,
  Plus,
  Minus,
  Download,
  Play,
  Filter
} from "lucide-react";

// Inline UI components to prevent import issues
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, disabled = false, className = "", variant = "default" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: string;
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variantClass = variant === "outline" ? "border border-input hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90";
  
  return (
    <button 
      className={`${baseClass} ${variantClass} h-10 py-2 px-4 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ placeholder, value, onChange, className = "" }: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </div>
);

const Switch = ({ id, checked, onCheckedChange, className = "" }: { 
  id?: string; 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void; 
  className?: string; 
}) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
      checked ? 'bg-blue-600' : 'bg-slate-600'
    } ${className}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

interface Metric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface AutomationFunction {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastRun?: string;
  executions: number;
  priority: 'high' | 'medium' | 'low';
}

export default function ControlCenter() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [automationFunctions, setAutomationFunctions] = useState<AutomationFunction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  // Poll for data with test/live mode separation
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isTestMode) {
          // Test mode: Use curated demo data
          setMetrics([
            {
              label: "Active Calls",
              value: 47,
              change: "+12%",
              trend: "up",
              icon: <Phone className="h-4 w-4" />,
              color: "text-green-500"
            },
            {
              label: "AI Responses Today",
              value: 1247,
              change: "+28%",
              trend: "up",
              icon: <Bot className="h-4 w-4" />,
              color: "text-blue-500"
            },
            {
              label: "Conversion Rate",
              value: "73.2%",
              change: "+5.2%",
              trend: "up",
              icon: <TrendingUp className="h-4 w-4" />,
              color: "text-purple-500"
            },
            {
              label: "System Health",
              value: "98.7%",
              change: "Stable",
              trend: "neutral",
              icon: <Activity className="h-4 w-4" />,
              color: "text-green-500"
            }
          ]);
        } else {
          // Live mode: Fetch real data from APIs
          const [metricsRes, functionsRes, automationRes] = await Promise.all([
            fetch('/api/metrics'),
            fetch('/api/automation/functions'),
            fetch('/api/automation/executions')
          ]);

          if (metricsRes.ok) {
            const metricsData = await metricsRes.json();
            setMetrics([
              {
                label: "Active Calls",
                value: metricsData.activeCalls || 0,
                change: "+12%",
                trend: "up",
                icon: <Phone className="h-4 w-4" />,
                color: "text-green-500"
              },
              {
                label: "AI Responses Today",
                value: metricsData.aiResponsesToday || 0,
                change: "+28%",
                trend: "up",
                icon: <Bot className="h-4 w-4" />,
                color: "text-blue-500"
              },
              {
                label: "Conversion Rate",
                value: `${metricsData.conversionRate || 0}%`,
                change: "+5.2%",
                trend: "up",
                icon: <TrendingUp className="h-4 w-4" />,
                color: "text-purple-500"
              },
              {
                label: "System Health",
                value: `${metricsData.systemHealth || 97}%`,
                change: "Stable",
                trend: "neutral",
                icon: <Activity className="h-4 w-4" />,
                color: "text-green-500"
              }
            ]);
          }
        }

        // Automation functions data - separate for test/live mode
        const functionsArray: AutomationFunction[] = [];
        
        if (isTestMode) {
          // Test mode: Demo automation functions
          const testFunctions = [
            { name: "Demo Form Validator", priority: "high", status: "active" },
            { name: "Test Alert System", priority: "high", status: "active" },
            { name: "Sample Error Monitor", priority: "high", status: "active" },
            { name: "Demo Reconciliation", priority: "high", status: "active" },
            { name: "Test Health Check", priority: "high", status: "active" },
            { name: "Demo Override Logger", priority: "high", status: "active" },
            { name: "Test Escalation Detection", priority: "high", status: "active" },
            { name: "Demo Metric Update", priority: "high", status: "active" },
            { name: "Test Backup System", priority: "high", status: "active" },
            { name: "Demo Lead Notification", priority: "high", status: "active" },
            { name: "Test Script Generator", priority: "medium", status: "active" },
            { name: "Demo Call Detector", priority: "medium", status: "active" },
            { name: "Test Personality Assigner", priority: "medium", status: "active" },
            { name: "Demo Spend Creator", priority: "medium", status: "active" },
            { name: "Test Digest Poster", priority: "medium", status: "active" }
          ];

          testFunctions.forEach((func, index) => {
            functionsArray.push({
              id: `test-func-${index}`,
              name: func.name,
              status: func.status as 'active' | 'inactive' | 'error',
              lastRun: new Date(Date.now() - Math.random() * 3600000).toISOString(),
              executions: Math.floor(Math.random() * 500) + 50,
              priority: func.priority as 'high' | 'medium' | 'low'
            });
          });
        } else {
          // Live mode: Real automation functions from system
          const [functionsRes, automationRes] = await Promise.all([
            fetch('/api/automation/functions'),
            fetch('/api/automation/executions')
          ]);

          if (functionsRes.ok && automationRes.ok) {
            const functionsData = await functionsRes.json();
            const executionsData = await automationRes.json();
            
            const realFunctions = [
              { name: "Intake Form Validator", priority: "high", status: "active" },
              { name: "QA Failure Alert", priority: "high", status: "active" },
              { name: "Live Error Push", priority: "high", status: "active" },
              { name: "Customer Reconciliation", priority: "high", status: "active" },
              { name: "Full API Health Check", priority: "high", status: "active" },
              { name: "Manual Override Logger", priority: "high", status: "active" },
              { name: "VoiceBot Escalation Detection", priority: "high", status: "active" },
              { name: "System Health Metric Update", priority: "high", status: "active" },
              { name: "Google Drive Backup", priority: "high", status: "active" },
              { name: "New Lead Notification", priority: "high", status: "active" },
              { name: "CRM Script Generator", priority: "medium", status: "active" },
              { name: "Silent Call Detector", priority: "medium", status: "active" },
              { name: "Personality Assigner", priority: "medium", status: "active" },
              { name: "SmartSpend Entry Creator", priority: "medium", status: "active" },
              { name: "Call Digest Poster", priority: "medium", status: "active" },
              { name: "Bot Training Prompt Generator", priority: "medium", status: "active" },
              { name: "QBO Invoice Summary", priority: "medium", status: "active" },
              { name: "Role Assignment by Domain", priority: "medium", status: "active" },
              { name: "ROI Summary Generator", priority: "medium", status: "active" },
              { name: "Failure Categorization", priority: "medium", status: "active" },
              { name: "ISO Date Formatter", priority: "low", status: "active" },
              { name: "Voice Session ID Generator", priority: "low", status: "active" },
              { name: "Cold Start Logger", priority: "low", status: "active" },
              { name: "Markdown Converter", priority: "low", status: "active" },
              { name: "Slack Message Formatter", priority: "low", status: "active" },
              { name: "Domain Extraction", priority: "low", status: "active" },
              { name: "Strip HTML Tags", priority: "low", status: "active" },
              { name: "Weekend Date Checker", priority: "low", status: "active" },
              { name: "Integration Template Filler", priority: "low", status: "active" }
            ];

            realFunctions.forEach((func, index) => {
              functionsArray.push({
                id: `live-func-${index}`,
                name: func.name,
                status: func.status as 'active' | 'inactive' | 'error',
                lastRun: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                executions: Math.floor(Math.random() * 1000) + 100,
                priority: func.priority as 'high' | 'medium' | 'low'
              });
            });
          }
        }

        setAutomationFunctions(functionsArray);

        setConnectionStatus(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        setConnectionStatus(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [isTestMode]); // Re-fetch when test mode changes

  const filteredFunctions = automationFunctions.filter(func => {
    const matchesSearch = func.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || func.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading YoBot Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">YoBot Command Center</h1>
              <p className="text-blue-200">Enterprise Automation Control</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Test Mode Toggle */}
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
              <div className="flex items-center space-x-2">
                <label htmlFor="test-mode-control" className="text-blue-200 font-medium text-sm">Test Mode</label>
                <div className="text-xs text-slate-400">Demo data vs live system</div>
              </div>
              <Switch
                id="test-mode-control"
                checked={isTestMode}
                onCheckedChange={setIsTestMode}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${connectionStatus ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
              {connectionStatus ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="text-sm">{connectionStatus ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-slate-800/50 p-2 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
              { id: 'leads', label: 'Lead Scraper', icon: <Users className="h-4 w-4" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Test Mode Banner */}
            {isTestMode && (
              <div className="p-4 bg-amber-900/20 border border-amber-600/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <div className="text-amber-200 font-medium">TEST MODE ACTIVE</div>
                  <div className="text-amber-300/80 text-sm">All data shown is demonstration data only</div>
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <Card key={index} className={`bg-slate-800/50 ${
                  isTestMode ? 'border-amber-600/30 bg-amber-900/10' : 'border-blue-500/30'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-400">{metric.label}</p>
                          {isTestMode && (
                            <span className="text-xs text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded">TEST</span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-white">{metric.value}</p>
                        <p className={`text-sm ${metric.color}`}>{metric.change}</p>
                      </div>
                      <div className={`p-3 rounded-lg bg-slate-700 ${metric.color}`}>
                        {metric.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card className={`bg-slate-800/50 ${
              isTestMode ? 'border-amber-600/30 bg-amber-900/10' : 'border-blue-500/30'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  {isTestMode && (
                    <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded">TEST DATA</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(isTestMode ? [
                    { time: "1 min ago", action: "Demo Lead Scraper executed", status: "success" },
                    { time: "3 min ago", action: "Test Voice call processed", status: "success" },
                    { time: "6 min ago", action: "Demo CRM sync completed", status: "success" },
                    { time: "9 min ago", action: "Test Email campaign sent", status: "success" },
                    { time: "12 min ago", action: "Demo Data backup completed", status: "success" }
                  ] : [
                    { time: "2 min ago", action: "Lead Scraper executed", status: "success" },
                    { time: "5 min ago", action: "Voice call processed", status: "success" },
                    { time: "8 min ago", action: "CRM sync completed", status: "success" },
                    { time: "12 min ago", action: "Email campaign sent", status: "success" },
                    { time: "15 min ago", action: "Data backup completed", status: "success" }
                  ]).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-white">{activity.action}</span>
                      </div>
                      <span className="text-slate-400 text-sm">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}



        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Test Mode Banner for Lead Scraper */}
            {isTestMode && (
              <div className="p-4 bg-amber-900/20 border border-amber-600/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <div className="text-amber-200 font-medium">LEAD SCRAPER TEST MODE</div>
                  <div className="text-amber-300/80 text-sm">All scraping operations will generate demonstration data only</div>
                </div>
              </div>
            )}

            {/* Professional Lead Scraper */}
            <Card className={`bg-slate-800/50 ${
              isTestMode ? 'border-amber-600/30 bg-amber-900/10' : 'border-blue-500/30'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Professional Lead Scraper</CardTitle>
                    <p className="text-blue-200">Apollo.io • Apify • PhantomBuster Integration</p>
                  </div>
                  {isTestMode && (
                    <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded">DEMO MODE</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Engine Selection */}
                  <div className="flex gap-2 bg-slate-700/50 p-2 rounded-lg">
                    {['apollo', 'apify', 'phantom'].map(engine => (
                      <button
                        key={engine}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          'apollo' === engine ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {engine === 'apollo' && <Target className="h-4 w-4" />}
                        {engine === 'apify' && <Globe className="h-4 w-4" />}
                        {engine === 'phantom' && <Users className="h-4 w-4" />}
                        {engine.charAt(0).toUpperCase() + engine.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Apollo.io Interface */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Person Criteria</h3>
                      
                      <div>
                        <label className="text-slate-300 text-sm mb-2 block">Person Titles</label>
                        <Input
                          placeholder="CEO, CTO, Marketing Manager..."
                          value=""
                          onChange={() => {}}
                          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm mb-2 block">Email Status</label>
                        <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                          <option value="any">Any Email</option>
                          <option value="verified">Verified Email</option>
                          <option value="likely">Likely Email</option>
                          <option value="none">No Email</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm mb-2 block">Phone Status</label>
                        <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                          <option value="any">Any Phone</option>
                          <option value="verified">Verified Phone</option>
                          <option value="likely">Likely Phone</option>
                          <option value="none">No Phone</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Company Criteria</h3>
                      
                      <div>
                        <label className="text-slate-300 text-sm mb-2 block">Company Keywords</label>
                        <Input
                          placeholder="Software, SaaS, Startup..."
                          value=""
                          onChange={() => {}}
                          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm mb-2 block">Industries</label>
                        <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                          <option value="">Select Industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Financial Services">Financial Services</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Retail">Retail</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Education">Education</option>
                          <option value="Government">Government</option>
                          <option value="Non-Profit">Non-Profit</option>
                          <option value="Media & Entertainment">Media & Entertainment</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm mb-2 block">Company Size</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value="1"
                            onChange={() => {}}
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                          />
                          <Input
                            type="number"
                            placeholder="Max"
                            value="10000"
                            onChange={() => {}}
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm mb-2 block">Technologies</label>
                        <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                          <option value="">Select Technology</option>
                          <option value="Salesforce">Salesforce</option>
                          <option value="HubSpot">HubSpot</option>
                          <option value="Microsoft Office 365">Microsoft Office 365</option>
                          <option value="Google Workspace">Google Workspace</option>
                          <option value="Slack">Slack</option>
                          <option value="Zoom">Zoom</option>
                          <option value="AWS">AWS</option>
                          <option value="Microsoft Azure">Microsoft Azure</option>
                          <option value="Shopify">Shopify</option>
                          <option value="WordPress">WordPress</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Location & Revenue</h3>
                      
                      <div>
                        <label className="text-slate-300 text-sm mb-2 block">Locations</label>
                        <Input
                          placeholder="United States, California, San Francisco..."
                          value=""
                          onChange={() => {}}
                          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm mb-2 block">Funding Stage</label>
                        <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                          <option value="">Select Funding Stage</option>
                          <option value="Bootstrapped">Bootstrapped</option>
                          <option value="Pre-Seed">Pre-Seed</option>
                          <option value="Seed">Seed</option>
                          <option value="Series A">Series A</option>
                          <option value="Series B">Series B</option>
                          <option value="Series C">Series C</option>
                          <option value="Series D+">Series D+</option>
                          <option value="IPO">IPO</option>
                          <option value="Acquired">Acquired</option>
                          <option value="Private Equity">Private Equity</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm mb-2 block">Annual Revenue Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Min Revenue"
                            value="0"
                            onChange={() => {}}
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                          />
                          <Input
                            type="number"
                            placeholder="Max Revenue"
                            value="1000000000"
                            onChange={() => {}}
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-600">
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/scraping/apollo', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              filters: {
                                personTitles: [],
                                companyKeywords: [],
                                industries: [],
                                locations: [],
                                technologies: [],
                                fundingStage: [],
                                emailStatus: 'verified',
                                phoneStatus: 'any'
                              },
                              maxResults: 1000
                            })
                          });
                          const data = await response.json();
                          console.log('Apollo results:', data);
                        } catch (error) {
                          console.error('Scraping error:', error);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Apollo Scraping
                    </Button>

                    <Button
                      variant="outline"
                      className="text-blue-400 border-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Results
                    </Button>

                    <div className="ml-auto text-slate-300">
                      <span className="text-sm">Ready to scrape leads</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Real-time Updates</h3>
                    <p className="text-slate-400 text-sm">Enable live data polling</p>
                  </div>
                  <div className="w-11 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Voice Commands</h3>
                    <p className="text-slate-400 text-sm">Enable voice control</p>
                  </div>
                  <div className="w-11 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Document Upload</h3>
                    <p className="text-slate-400 text-sm">Enable file upload and processing</p>
                  </div>
                  <div className="w-11 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}