import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  Phone, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Calendar,
  Target,
  Clock,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';

interface KPIData {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  avgDealSize: number;
  callsToday: number;
  messagesProcessed: number;
  activeConversations: number;
  responseTime: number;
  botUptime: number;
}

interface ChartData {
  name: string;
  value: number;
  leads?: number;
  revenue?: number;
  calls?: number;
}

export default function CommandCenterDashboard() {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    totalRevenue: 0,
    avgDealSize: 0,
    callsToday: 0,
    messagesProcessed: 0,
    activeConversations: 0,
    responseTime: 0,
    botUptime: 0
  });
  
  const [salesData, setSalesData] = useState<ChartData[]>([]);
  const [leadSourceData, setLeadSourceData] = useState<ChartData[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/command-center/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setKpiData(data.kpis);
        setSalesData(data.salesChart || []);
        setLeadSourceData(data.leadSources || []);
        setPerformanceData(data.performance || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadDashboardData();
    setIsLoading(false);
    toast({
      title: "Dashboard Refreshed",
      description: "All data has been updated with latest information",
    });
  };

  const exportReport = async () => {
    try {
      const response = await fetch('/api/command-center/export-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dateRange: 'current_month',
          includeCharts: true 
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yobot-dashboard-report-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Report Exported",
          description: "Dashboard report downloaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export dashboard report",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">YoBot Command Center</h1>
          <p className="text-gray-600 dark:text-gray-400">KPI dashboard with sales, leads, usage, and reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalLeads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {kpiData.qualifiedLeads} qualified ({((kpiData.qualifiedLeads / kpiData.totalLeads) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpiData.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(kpiData.avgDealSize)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
            <Phone className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.callsToday}</div>
            <p className="text-xs text-muted-foreground">
              {kpiData.activeConversations} active chats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Performance</CardTitle>
            <Activity className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{kpiData.botUptime.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {kpiData.responseTime}s avg response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Revenue and lead generation over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : value,
                  name === 'revenue' ? 'Revenue' : 'Leads'
                ]} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="leads" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Distribution of leads by source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Performance Analytics</CardTitle>
          <CardDescription>Daily message volume and response metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" fill="#8884d8" name="Calls" />
              <Bar dataKey="value" fill="#82ca9d" name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpiData.messagesProcessed.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Badge variant="outline">+12% vs yesterday</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpiData.responseTime}s</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Badge variant={kpiData.responseTime < 5 ? "default" : "secondary"}>
                {kpiData.responseTime < 5 ? "Excellent" : "Good"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+18.2%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Badge variant="default">Month over Month</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}