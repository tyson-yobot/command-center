import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, Clock, DollarSign } from "lucide-react";
import { Link } from "wouter";
import type { CrmData } from "@shared/schema";

export default function CrmSnapshot() {
  const { data: crmData, isLoading } = useQuery<CrmData>({
    queryKey: ["/api/crm"],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-5 bg-muted rounded w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
              <div className="h-8 w-12 bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!crmData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>CRM Snapshot</span>
            </CardTitle>
            <Link href="/crm">
              <Button variant="ghost" size="sm">
                Open CRM
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No CRM Data</h3>
          <p className="text-sm text-muted-foreground">
            CRM information will appear here once your bot starts managing client data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const crmMetrics = [
    {
      title: "Hot Leads",
      value: crmData.hotLeads || 0,
      description: "Requiring immediate attention",
      icon: AlertCircle,
      color: "text-red-600",
    },
    {
      title: "Follow-ups Due",
      value: crmData.followUpsDue || 0,
      description: "Scheduled for today",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Pipeline Value",
      value: crmData.pipelineValue || "$0",
      description: "Total potential revenue",
      icon: DollarSign,
      color: "text-green-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>CRM Snapshot</span>
          </CardTitle>
          <Link href="/crm">
            <Button variant="ghost" size="sm">
              Open CRM
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {crmMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-5 w-5 ${metric.color}`} />
                <div>
                  <div className="font-medium text-foreground">{metric.title}</div>
                  <div className="text-sm text-muted-foreground">{metric.description}</div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
