import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Download, Calendar, Users, Phone, Target, Activity, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MetricData {
  period: string;
  leads: number;
  calls: number;
  conversions: number;
  revenue: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export function AnalyticsReportModal({ isOpen, onClose }: AnalyticsReportModalProps) {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<MetricData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadAnalyticsData();
    }
  }, [isOpen, reportType, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics/report?type=${reportType}&range=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data.metrics || []);
        setPerformanceMetrics(result.data.performance || []);
      }
    } catch (error) {
      console.error('Analytics load error:', error);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/analytics/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          range: timeRange,
          includeCharts: true,
          format: 'pdf'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${reportType}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Report Generated",
          description: "Analytics report has been downloaded successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate analytics report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const chartData = analyticsData.map(item => ({
    name: item.period,
    leads: item.leads,
    calls: item.calls,
    conversions: item.conversions,
    revenue: item.revenue / 1000 // Convert to thousands for better display
  }));

  const pieData = [
    { name: 'Apollo', value: 35, color: '#3b82f6' },
    { name: 'Apify', value: 45, color: '#10b981' },
    { name: 'PhantomBuster', value: 20, color: '#f59e0b' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-blue-400">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <BarChart className="w-5 h-5 mr-2 text-blue-400" />
            Analytics Dashboard Report
          </DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-slate-300 text-sm">Report Type:</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-slate-300 text-sm">Time Range:</label>
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateReport}
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-slate-800/50 border border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {metric.name === 'Total Leads' && <Users className="w-4 h-4 text-blue-400" />}
                      {metric.name === 'Total Calls' && <Phone className="w-4 h-4 text-green-400" />}
                      {metric.name === 'Conversions' && <Target className="w-4 h-4 text-purple-400" />}
                      {metric.name === 'Revenue' && <DollarSign className="w-4 h-4 text-yellow-400" />}
                      <span className="text-slate-300 text-sm">{metric.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">
                        {metric.name === 'Revenue' ? `$${metric.value.toLocaleString()}` : metric.value.toLocaleString()}
                      </div>
                      <div className={`flex items-center space-x-1 text-xs ${
                        metric.trend === 'up' ? 'text-green-400' : 
                        metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {getTrendIcon(metric.trend)}
                        <span>{formatChange(metric.change)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Lead Sources */}
            <Card className="bg-slate-800/50 border border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Lead Sources Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-300 text-sm">{item.name}</span>
                      </div>
                      <span className="text-white text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Trend */}
            <Card className="bg-slate-800/50 border border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '6px'
                      }}
                    />
                    <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="calls" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="conversions" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Analysis */}
            <Card className="bg-slate-800/50 border border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Revenue Analysis (in thousands)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="revenue" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary Statistics */}
        <Card className="bg-slate-800/50 border border-slate-600 mt-6">
          <CardHeader>
            <CardTitle className="text-white text-sm">Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {analyticsData.reduce((sum, item) => sum + item.leads, 0).toLocaleString()}
                </div>
                <div className="text-slate-400 text-sm">Total Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {analyticsData.reduce((sum, item) => sum + item.calls, 0).toLocaleString()}
                </div>
                <div className="text-slate-400 text-sm">Total Calls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {analyticsData.reduce((sum, item) => sum + item.conversions, 0).toLocaleString()}
                </div>
                <div className="text-slate-400 text-sm">Conversions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  ${(analyticsData.reduce((sum, item) => sum + item.revenue, 0) / 1000).toFixed(1)}K
                </div>
                <div className="text-slate-400 text-sm">Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-slate-600">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Close
          </Button>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Print Report
            </Button>
            
            <Button
              onClick={generateReport}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}