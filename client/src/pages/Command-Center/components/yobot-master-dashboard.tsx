import { useState, useEffect } from 'react';
import yobotLogo from '@assets/A_flat_vector_illustration_features_a_robot_face_i_1749714890077.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  DollarSign, 
  BarChart3, 
  Calculator,
  TestTube,
  Brain,
  Search,
  Palette,
  Slack,
  Quote,
  UserCheck,
  Zap,
  TrendingUp,
  Settings,
  Activity,
  BookOpen,
  Target,
  Palette as PaletteIcon
} from 'lucide-react';

// Import dashboard components
import SmartSpendDashboard from './smartspend-dashboard';
import CommandCenterDashboard from './command-center-dashboard';
import BotalyticsDashboard from './botalytics-dashboard';
import ProfessionalLeadScraper from './professional-lead-scraper';
import ContentCreatorModule from './content-creator-module';
import ABTestingModule from './ab-testing-module';
import CallSentimentModule from './call-sentiment-module';

interface AddOnService {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'active' | 'inactive' | 'trial';
  category: 'analytics' | 'automation' | 'optimization' | 'integration';
  component?: any;
}

export default function YoBotMasterDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [services, setServices] = useState<AddOnService[]>([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalAutomations: 0,
    activeServices: 0,
    monthlyROI: 0,
    leadsGenerated: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    initializeServices();
    loadSystemMetrics();
  }, []);

  const initializeServices = () => {
    const addOnServices: AddOnService[] = [
      {
        id: 'smartspend',
        name: 'SmartSpend™ Dashboard',
        description: 'Track expenses, budget, and ROI directly inside your bot system',
        icon: DollarSign,
        status: 'active',
        category: 'analytics',
        component: SmartSpendDashboard
      },
      {
        id: 'command-center',
        name: 'YoBot Command Center Dashboard',
        description: 'KPI dashboard -- sales, leads, usage, reporting',
        icon: BarChart3,
        status: 'active',
        category: 'analytics',
        component: CommandCenterDashboard
      },
      {
        id: 'botalytics',
        name: 'Botalytics',
        description: 'Calculates YoBot\'s performance, ROI, lead volume, conversion rates and revenue increases',
        icon: Calculator,
        status: 'active',
        category: 'analytics',
        component: BotalyticsDashboard
      },
      {
        id: 'ab-testing',
        name: 'A/B Script Testing',
        description: 'Optimize messaging with data-backed split tests',
        icon: TestTube,
        status: 'active',
        category: 'optimization',
        component: ABTestingModule
      },
      {
        id: 'call-sentiment',
        name: 'Call Sentiment Log',
        description: 'Uses AI to detect emotional cues, frustration, or buying signals',
        icon: Brain,
        status: 'active',
        category: 'optimization',
        component: CallSentimentModule
      },
      {
        id: 'lead-scraping',
        name: 'Lead Generation & Scraping Tools',
        description: 'Automated lead collection from websites and directories',
        icon: Search,
        status: 'active',
        category: 'automation',
        component: ProfessionalLeadScraper
      },
      {
        id: 'content-creator',
        name: 'Automated Content Generation Studio',
        description: 'Dynamic content creation for responses and documents',
        icon: Palette,
        status: 'active',
        category: 'automation',
        component: ContentCreatorModule
      },
      {
        id: 'slack-notifications',
        name: 'Slack Notifications',
        description: 'Sends hot-lead alerts to your team instantly',
        icon: Slack,
        status: 'active',
        category: 'integration'
      },
      {
        id: 'smart-quoting',
        name: 'Smart Quoting Engine',
        description: 'Auto-send branded quotes in chat/SMS',
        icon: Quote,
        status: 'active',
        category: 'automation'
      },
      {
        id: 'live-transfer',
        name: 'Live Transfer Routing',
        description: 'Send leads directly to sales reps',
        icon: UserCheck,
        status: 'active',
        category: 'automation'
      },
      {
        id: 'chatgpt-booster',
        name: 'ChatGPT Booster',
        description: 'Adds advanced AI logic (OpenAI API layer)',
        icon: Zap,
        status: 'active',
        category: 'optimization'
      },
      {
        id: 'predictive-analytics',
        name: 'Predictive Analytics Engine',
        description: 'Forecast future sales and unlock insights, automate alerts based on predicted outcomes',
        icon: TrendingUp,
        status: 'active',
        category: 'analytics'
      },
      {
        id: 'conversational-intelligence',
        name: 'Conversational Intelligence Suite',
        description: 'Advanced insights and optimization for conversations',
        icon: Activity,
        status: 'active',
        category: 'optimization'
      },
      {
        id: 'data-integration',
        name: 'Advanced Data Integration Hub',
        description: 'Connect with any external system or database',
        icon: Settings,
        status: 'active',
        category: 'integration'
      },
      {
        id: 'booking-tools',
        name: 'Booking Tool Setup',
        description: 'Calendly, TidyCal, or Google Calendar integrations',
        icon: BookOpen,
        status: 'active',
        category: 'integration'
      },
      {
        id: 'personality-pack',
        name: 'Custom Personality Pack',
        description: 'Define tone (e.g., Chill, Corporate, Wild)',
        icon: PaletteIcon,
        status: 'active',
        category: 'optimization'
      }
    ];
    
    setServices(addOnServices);
  };

  const loadSystemMetrics = async () => {
    try {
      const response = await fetch('/api/system/metrics');
      const data = await response.json();
      
      if (data.success) {
        setSystemMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trial': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      case 'automation': return <Bot className="w-4 h-4" />;
      case 'optimization': return <Target className="w-4 h-4" />;
      case 'integration': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const renderServiceComponent = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service?.component) return null;
    
    const Component = service.component;
    return <Component />;
  };

  const activeServices = services.filter(s => s.status === 'active');
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, AddOnService[]>);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-blue-300">
            <img 
              src={yobotLogo} 
              alt="YoBot Logo" 
              className="w-8 h-8"
            />
            YoBot Master Dashboard
          </h1>
          <p className="text-slate-400">Complete enterprise automation and analytics platform</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-slate-700/50 border-blue-500/50 text-blue-300">
          {activeServices.length} Active Services
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8 bg-slate-800/50 border-slate-600">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Overview</TabsTrigger>
          <TabsTrigger value="smartspend" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">SmartSpend</TabsTrigger>
          <TabsTrigger value="command-center" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Command Center</TabsTrigger>
          <TabsTrigger value="botalytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Botalytics</TabsTrigger>
          <TabsTrigger value="lead-scraping" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Lead Tools</TabsTrigger>
          <TabsTrigger value="content-creator" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Content Studio</TabsTrigger>
          <TabsTrigger value="ab-testing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">A/B Testing</TabsTrigger>
          <TabsTrigger value="call-sentiment" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-300">Total Automations</CardTitle>
                <Bot className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">{systemMetrics.totalAutomations}</div>
                <p className="text-xs text-slate-400">Active functions</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-300">Active Services</CardTitle>
                <Activity className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">{activeServices.length}</div>
                <p className="text-xs text-slate-400">Running modules</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-300">Monthly ROI</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">+247%</div>
                <p className="text-xs text-slate-400">Return on investment</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-300">Leads Generated</CardTitle>
                <Target className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">2,847</div>
                <p className="text-xs text-slate-400">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Service Categories */}
          <div className="space-y-6">
            {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
              <Card key={category} className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize text-blue-300">
                    {getCategoryIcon(category)}
                    {category} Services
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {categoryServices.length} services in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryServices.map((service) => (
                      <Card key={service.id} className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 transition-all cursor-pointer"
                            onClick={() => setActiveTab(service.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <service.icon className="w-5 h-5 text-blue-400" />
                              <Badge className={`${getStatusColor(service.status)} text-white`} variant="outline">
                                {service.status}
                              </Badge>
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm mb-1 text-slate-200">{service.name}</h3>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {service.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-300">Quick Actions</CardTitle>
              <CardDescription className="text-slate-400">Common tasks and system controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" onClick={() => setActiveTab('lead-scraping')}>
                  <Search className="w-4 h-4 mr-2" />
                  Launch Scraper
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('ab-testing')}>
                  <TestTube className="w-4 h-4 mr-2" />
                  Create A/B Test
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('content-creator')}>
                  <Palette className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('botalytics')}>
                  <Calculator className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Service Tabs */}
        <TabsContent value="smartspend">
          {renderServiceComponent('smartspend')}
        </TabsContent>

        <TabsContent value="command-center">
          {renderServiceComponent('command-center')}
        </TabsContent>

        <TabsContent value="botalytics">
          {renderServiceComponent('botalytics')}
        </TabsContent>

        <TabsContent value="lead-scraping">
          {renderServiceComponent('lead-scraping')}
        </TabsContent>

        <TabsContent value="content-creator">
          {renderServiceComponent('content-creator')}
        </TabsContent>

        <TabsContent value="ab-testing">
          {renderServiceComponent('ab-testing')}
        </TabsContent>

        <TabsContent value="call-sentiment">
          {renderServiceComponent('call-sentiment')}
        </TabsContent>
      </Tabs>
    </div>
  );
}