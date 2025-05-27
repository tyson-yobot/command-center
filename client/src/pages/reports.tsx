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
  DollarSign
} from "lucide-react";
import type { Metrics } from "@shared/schema";

export default function Reports() {
  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000,
  });

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
    },
    {
      title: "Conversions",
      value: metrics.conversions,
      change: metrics.conversionsChange,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "New Leads",
      value: metrics.newLeads,
      change: metrics.leadsChange,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Failed Calls",
      value: metrics.failedCalls,
      change: metrics.failedCallsChange,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
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
            <Card key={card.title} className="metric-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    {isPositiveChange ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositiveChange ? '+' : ''}{card.change}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {card.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {card.title}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Performance Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Strong Performance Today
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your bot's conversion rate is 15% higher than average. Great work on the recent optimizations!
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Peak Hours Identified
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Most leads are captured between 10 AM - 2 PM. Consider optimizing bot responses during these hours.
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
