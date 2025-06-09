import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Phone,
  Users,
  DollarSign,
  Filter,
  LineChart,
  Copy,
  Share2,
  ChevronDown
} from "lucide-react";
import type { Metrics } from "@shared/schema";

export default function Reports() {
  const [selectedFilter, setSelectedFilter] = React.useState('All');
  const [chartView, setChartView] = React.useState<'bar' | 'line'>('bar');
  const [expandedCard, setExpandedCard] = React.useState<string | null>(null);
  
  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000,
  });

  const copyToClipboard = (value: string, title: string) => {
    navigator.clipboard.writeText(`${title}: ${value}`);
  };

  if (isLoading) {
    return (
      <div className="px-4 space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Reports Available</h3>
            <p className="text-sm text-muted-foreground">
              Performance reports will be generated once your bot accumulates sufficient data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reportCards = [
    {
      title: "Calls Today",
      value: metrics.callsToday,
      change: metrics.callsChange,
      icon: Phone,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      trend: "up",
      type: "metric-success"
    },
    {
      title: "Conversions",
      value: metrics.conversions,
      change: metrics.conversionsChange,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      trend: "up",
      type: "metric-success"
    },
    {
      title: "New Leads",
      value: metrics.newLeads,
      change: metrics.leadsChange,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      trend: "up",
      type: "metric-success"
    },
    {
      title: "Failed Calls",
      value: metrics.failedCalls,
      change: metrics.failedCallsChange,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      trend: "down",
      type: "metric-warning"
    },
  ];

  return (
    <div className="px-4 space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Performance Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-3">
            <Select defaultValue="today">
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {reportCards.map((card) => {
          const Icon = card.icon;
          const isPositiveChange = card.change >= 0;
          return (
            <Card key={card.title} className={`metric-card ${card.type} card`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    {card.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-green-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-amber-400" />
                    )}
                    <span className={`text-xs font-medium ${card.trend === "up" ? 'text-green-400' : 'text-amber-400'}`}>
                      {(card.change || 0) >= 0 ? '+' : ''}{card.change || 0}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {card.value}
                </div>
                <div className="text-sm text-slate-300">
                  {card.title}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 7-Day Trend Summary */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
            7-Day Trend Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-3 text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-slate-800/50">
              <span className="text-slate-300">Average Daily Calls</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold">189</span>
                <span className="text-green-400 font-medium trend-positive">↗ +17%</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-800/50">
              <span className="text-slate-300">Conversion Rate</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold">36%</span>
                <span className="text-green-400 font-medium trend-positive">↗ +12%</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-800/50">
              <span className="text-slate-300">Response Time</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold">1.2s</span>
                <span className="text-amber-400 font-medium">↘ -5%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Performance Insights */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Activity className="h-5 w-5" />
            <span>Performance Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Critical Alert */}
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg insight-card">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-200 text-base mb-2">
                  ⚠️ Failed Calls Alert
                </h4>
                <p className="text-sm text-red-300 leading-relaxed">
                  12 failed calls detected (-3% trend). Most failures during 3-4 PM. Consider bot capacity scaling.
                </p>
              </div>
            </div>
          </div>

          {/* Success Insight */}
          <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg insight-card">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-4 w-4 text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-200 text-base mb-2">
                  📈 Revenue Impact
                </h4>
                <p className="text-sm text-green-300 leading-relaxed">
                  Your optimizations generated an estimated $12,400 additional revenue this week.
                </p>
              </div>
            </div>
          </div>

          {/* Optimization Opportunity */}
          <div className="p-4 bg-amber-900/20 border border-amber-800 rounded-lg insight-card">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-200 text-base mb-2">
                  Optimization Opportunity
                </h4>
                <p className="text-sm text-amber-300 leading-relaxed">
                  Consider adjusting response templates during low-conversion hours for better results.
                </p>
              </div>
            </div>
          </div>

          {/* Trend Alert */}
          <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg insight-card">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-200 text-base mb-2">
                  Trend Alert
                </h4>
                <p className="text-sm text-blue-300 leading-relaxed">
                  New leads up 15% this week. Current bot capacity can handle 23% more volume.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Download Daily Summary (PDF)
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Analytics Data (CSV)
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <DollarSign className="h-4 w-4 mr-2" />
            ROI Performance Report (Excel)
          </Button>
        </CardContent>
      </Card>

      {/* Historical Trends */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Trend Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Average Daily Calls</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">189</span>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +7%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Conversion Rate</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">36%</span>
                <Badge variant="default" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Response Time</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">1.2s</span>
                <Badge variant="secondary" className="text-xs">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
