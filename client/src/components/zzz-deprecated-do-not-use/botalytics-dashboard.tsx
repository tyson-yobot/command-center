import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Percent, 
  Target,
  ArrowUp,
  ArrowDown,
  Activity,
  Clock,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  revenueGenerated: number;
  revenueIncrease: number;
  costPerLead: number;
  roi: number;
  avgResponseTime: number;
  botEfficiency: number;
  leadVolumeGrowth: number;
  salesVelocity: number;
  customerLifetimeValue: number;
}

interface PerformanceMetric {
  period: string;
  leads: number;
  revenue: number;
  conversions: number;
  efficiency: number;
}

export default function BotalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    revenueGenerated: 0,
    revenueIncrease: 0,
    costPerLead: 0,
    roi: 0,
    avgResponseTime: 0,
    botEfficiency: 0,
    leadVolumeGrowth: 0,
    salesVelocity: 0,
    customerLifetimeValue: 0
  });

  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [timeframe, setTimeframe] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/botalytics/analytics?timeframe=${timeframe}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.analytics);
        setPerformanceData(data.performanceChart || []);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast({
        title: "Data Load Failed",
        description: "Could not retrieve analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'leads': return <Users className="h-4 w-4 text-blue-600" />;
      case 'conversion': return <Target className="h-4 w-4 text-purple-600" />;
      case 'efficiency': return <Zap className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeIndicator = (value: number) => {
    if (value > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="h-3 w-3 mr-1" />
          <span className="text-xs">+{formatPercentage(value)}</span>
        </div>
      );
    } else if (value < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="h-3 w-3 mr-1" />
          <span className="text-xs">{formatPercentage(value)}</span>
        </div>
      );
    }
    return <span className="text-xs text-gray-500">No change</span>;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="w-8 h-8" />
            Botalytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Performance, ROI, lead volume, conversion rates and revenue analysis</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Core Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ROI</CardTitle>
            {getMetricIcon('revenue')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPercentage(analyticsData.roi)}</div>
            {getChangeIndicator(15.2)}
            <p className="text-xs text-muted-foreground mt-1">Return on Investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Volume</CardTitle>
            {getMetricIcon('leads')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalLeads.toLocaleString()}</div>
            {getChangeIndicator(analyticsData.leadVolumeGrowth)}
            <p className="text-xs text-muted-foreground mt-1">{analyticsData.qualifiedLeads} qualified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            {getMetricIcon('conversion')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analyticsData.conversionRate)}</div>
            {getChangeIndicator(3.7)}
            <p className="text-xs text-muted-foreground mt-1">Lead to customer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            {getMetricIcon('revenue')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenueGenerated)}</div>
            {getChangeIndicator(analyticsData.revenueIncrease)}
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Lead</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.costPerLead)}</div>
            <Badge variant="outline" className="mt-2">
              {analyticsData.costPerLead < 25 ? 'Excellent' : analyticsData.costPerLead < 50 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Efficiency</CardTitle>
            {getMetricIcon('efficiency')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analyticsData.botEfficiency)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Clock className="h-3 w-3 mr-1" />
              {analyticsData.avgResponseTime}s avg response
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.customerLifetimeValue)}</div>
            <p className="text-xs text-muted-foreground mt-2">Average lifetime value</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Generation Trend</CardTitle>
            <CardDescription>Lead volume and quality over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Area type="monotone" dataKey="conversions" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Performance</CardTitle>
            <CardDescription>Revenue generation and growth metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Efficiency Analysis</CardTitle>
          <CardDescription>Performance metrics and optimization opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="efficiency" fill="#8884d8" name="Efficiency %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <div className="font-semibold text-green-800 dark:text-green-300">ROI Improvement</div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  +{formatPercentage(15.2)} increase this month
                </div>
              </div>
              <Badge variant="default" className="bg-green-600">Excellent</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-300">Lead Quality</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {formatPercentage((analyticsData.qualifiedLeads / analyticsData.totalLeads) * 100)} qualification rate
                </div>
              </div>
              <Badge variant="outline">Strong</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <div className="font-semibold text-purple-800 dark:text-purple-300">Sales Velocity</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  {analyticsData.salesVelocity} days avg sales cycle
                </div>
              </div>
              <Badge variant="secondary">Improving</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-yellow-500 pl-4">
              <div className="font-semibold">Response Time</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Reduce average response time by 0.5s to improve user experience
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <div className="font-semibold">Lead Scoring</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Implement advanced scoring to increase qualification rate to 75%
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <div className="font-semibold">Follow-up Automation</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Add automated follow-up sequences to boost conversion by 12%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}