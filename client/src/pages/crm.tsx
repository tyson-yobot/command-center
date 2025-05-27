import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Calendar, DollarSign, AlertCircle, Clock } from "lucide-react";
import type { CrmData } from "@shared/schema";

export default function CRM() {
  const { data: crmData, isLoading } = useQuery<CrmData>({
    queryKey: ["/api/crm"],
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
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!crmData) {
    return (
      <div className="px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No CRM Data Available</h3>
            <p className="text-sm text-muted-foreground">
              CRM information will appear here once your bot starts capturing leads and managing client data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = [
    {
      title: "Hot Leads",
      value: crmData.hotLeads,
      description: "Requiring immediate attention",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      change: "+3 from yesterday",
      changeType: "increase" as const,
    },
    {
      title: "Follow-ups Due",
      value: crmData.followUpsDue,
      description: "Scheduled for today",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      change: "2 overdue",
      changeType: "neutral" as const,
    },
    {
      title: "Pipeline Value",
      value: crmData.pipelineValue,
      description: "Total potential revenue",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      change: "+$125K this month",
      changeType: "increase" as const,
    },
  ];

  return (
    <div className="px-4 space-y-6">
      {/* CRM Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>CRM Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.title} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{metric.title}</h3>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <Badge 
                    variant={metric.changeType === "increase" ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {metric.changeType === "increase" ? "↗" : "→"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="default">
            <Users className="h-4 w-4 mr-2" />
            View All Hot Leads
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Follow-ups
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Pipeline Report
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent CRM Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Recent Activity</h3>
            <p className="text-sm text-muted-foreground">
              CRM activity will be displayed here once your bot starts managing client interactions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>This Month's Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">89%</div>
              <div className="text-sm text-muted-foreground">Lead Response Rate</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">67%</div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">4.2</div>
              <div className="text-sm text-muted-foreground">Avg. Response Time (min)</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">156</div>
              <div className="text-sm text-muted-foreground">Total Contacts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
