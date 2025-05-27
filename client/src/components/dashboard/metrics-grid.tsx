import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, TrendingUp, Users, AlertTriangle } from "lucide-react";
import type { Metrics } from "@shared/schema";

export default function MetricsGrid() {
  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ["/api/metrics"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-muted rounded-lg" />
                  <div className="w-12 h-4 bg-muted rounded" />
                </div>
                <div className="w-16 h-8 bg-muted rounded" />
                <div className="w-20 h-4 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-muted-foreground">No metrics available</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metricCards = [
    {
      icon: Phone,
      value: metrics.callsToday || 0,
      label: "Calls Today",
      change: metrics.callsChange || 0,
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600",
    },
    {
      icon: TrendingUp,
      value: metrics.conversions || 0,
      label: "Conversions",
      change: metrics.conversionsChange || 0,
      bgColor: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600",
    },
    {
      icon: Users,
      value: metrics.newLeads || 0,
      label: "New Leads",
      change: metrics.leadsChange || 0,
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600",
    },
    {
      icon: AlertTriangle,
      value: metrics.failedCalls || 0,
      label: "Failed Calls",
      change: metrics.failedCallsChange || 0,
      bgColor: "bg-red-100 dark:bg-red-900/20",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        const isPositiveChange = card.change >= 0;
        const changeColor = index === 3 
          ? (isPositiveChange ? 'text-red-600' : 'text-green-600') // Failed calls: positive is bad
          : (isPositiveChange ? 'text-green-600' : 'text-red-600');

        return (
          <Card key={card.label} className="metric-card touch-feedback">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`h-3 w-3 ${changeColor}`} />
                  <span className={`text-xs font-medium ${changeColor}`}>
                    {isPositiveChange ? '+' : ''}{card.change}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {card.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {card.label}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
