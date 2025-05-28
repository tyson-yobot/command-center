import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Phone, Target, Users, AlertTriangle } from "lucide-react";
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
      label: "📞 TOTAL CALLS TODAY",
      subtitle: "Bot Performance Summary",
      change: metrics.callsChange || 0,
      color: "#0D82DA", // YoBot Blue
      gradient: "from-blue-600 to-blue-800",
    },
    {
      icon: Target,
      value: metrics.conversions || 0,
      label: "💰 DEALS CLOSED",
      subtitle: "Closed Deals",
      change: metrics.conversionsChange || 0,
      color: "#28A745", // Success Green
      gradient: "from-green-600 to-green-800",
    },
    {
      icon: Users,
      value: metrics.newLeads || 0,
      label: "🧲 NEW LEADS",
      subtitle: "New Prospects",
      change: metrics.leadsChange || 0,
      color: "#6F42C1", // Purple
      gradient: "from-purple-600 to-purple-800",
    },
    {
      icon: AlertTriangle,
      value: metrics.failedCalls || 0,
      label: "⚠️ MISSED OPPORTUNITIES",
      subtitle: "Unanswered Calls",
      change: metrics.failedCallsChange || 0,
      color: "#DC3545", // Danger Red
      gradient: "from-red-600 to-red-800",
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

        const Icon = card.icon;
        
        return (
          <Card key={card.label} className="metric-card touch-feedback bg-gradient-to-br from-white via-gray-50 to-gray-100 border-2 border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer relative overflow-hidden">
            <CardContent className="p-5 relative overflow-hidden">
              {/* Icon and Change Indicator */}
              <div className="flex items-center justify-between mb-4">
                <div 
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg flex items-center justify-center`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 shadow-md">
                  {isPositiveChange ? (
                    <TrendingUp className={`h-4 w-4 ${changeColor}`} />
                  ) : (
                    <TrendingDown className={`h-4 w-4 ${changeColor}`} />
                  )}
                  <span className={`text-xs font-bold ${changeColor}`}>
                    {Math.abs(card.change)}%
                  </span>
                </div>
              </div>
              
              {/* Main Value */}
              <div className="text-4xl font-black text-black mb-2 tracking-tight">
                {card.value.toLocaleString()}
              </div>
              
              {/* Labels */}
              <div className="text-xs font-bold text-black uppercase tracking-widest mb-1">
                {card.label}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                {card.subtitle}
              </div>
              
              {/* Premium bar graph effect */}
              <div 
                className="absolute bottom-0 left-0 h-2 rounded-b-md shadow-inner"
                style={{ 
                  background: `linear-gradient(90deg, ${card.color} 0%, ${card.color}cc 50%, ${card.color}88 100%)`,
                  width: `${Math.min(100, (card.value / 300) * 100)}%`
                }}
              ></div>
              
              {/* Animated accent line */}
              <div 
                className="absolute top-0 left-0 h-1 rounded-t-md animate-pulse"
                style={{ 
                  background: `linear-gradient(90deg, ${card.color}88 0%, ${card.color} 50%, ${card.color}88 100%)`,
                  width: '100%'
                }}
              ></div>
              
              {/* Subtle glow effect */}
              <div 
                className="absolute inset-0 rounded-lg opacity-20 pointer-events-none"
                style={{ 
                  background: `radial-gradient(circle at top right, ${card.color}22 0%, transparent 70%)`
                }}
              ></div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
