import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
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
      value: metrics.callsToday || 0,
      label: "Calls Today",
      change: metrics.callsChange || 0,
      color: "#0D82DA", // YoBot Blue
    },
    {
      value: metrics.conversions || 0,
      label: "Conversions",
      change: metrics.conversionsChange || 0,
      color: "#28A745", // Success Green
    },
    {
      value: metrics.newLeads || 0,
      label: "New Leads",
      change: metrics.leadsChange || 0,
      color: "#6F42C1", // Purple
    },
    {
      value: metrics.failedCalls || 0,
      label: "Failed Calls",
      change: metrics.failedCallsChange || 0,
      color: "#DC3545", // Danger Red
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metricCards.map((card, index) => {
        const isPositiveChange = card.change >= 0;
        const isFailedCalls = index === 3;
        const changeColor = isFailedCalls 
          ? (isPositiveChange ? 'text-red-600' : 'text-green-600') // Failed calls: positive is bad
          : (isPositiveChange ? 'text-green-600' : 'text-red-600');

        return (
          <Card key={card.label} className="metric-card touch-feedback bg-gray-200 border-2 border-gray-300 shadow-lg">
            <CardContent className="p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-4 h-12 rounded-md"
                  style={{ backgroundColor: card.color }}
                ></div>
                <div className="flex items-center space-x-2">
                  {isPositiveChange ? (
                    <ArrowUpIcon className={`h-5 w-5 ${changeColor}`} />
                  ) : (
                    <ArrowDownIcon className={`h-5 w-5 ${changeColor}`} />
                  )}
                  <span className={`text-sm font-bold ${changeColor}`}>
                    {Math.abs(card.change)}%
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-black mb-2">
                {card.value.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-black uppercase tracking-wide">
                {card.label}
              </div>
              {/* Background bar graph effect */}
              <div 
                className="absolute bottom-0 left-0 h-2 rounded-b-md opacity-30"
                style={{ 
                  backgroundColor: card.color,
                  width: `${Math.min(100, (card.value / 300) * 100)}%`
                }}
              ></div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
