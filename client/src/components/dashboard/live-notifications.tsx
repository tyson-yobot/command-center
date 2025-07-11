import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, UserPlus, AlertTriangle, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@shared/schema";

export default function LiveNotifications() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "escalations" | "quotes" | "meetings">("all");

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 3000,
  });

  const dismissNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest("PATCH", `/api/notifications/${notificationId}`, { isRead: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to dismiss notification.",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "lead_captured":
        return UserPlus;
      case "call_escalation":
        return AlertTriangle;
      case "meeting_booked":
        return Calendar;
      default:
        return Bell;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "lead_captured":
        return {
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-l-blue-500",
          iconBg: "bg-blue-100 dark:bg-blue-900/40",
          iconColor: "text-blue-600",
        };
      case "call_escalation":
        return {
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-l-red-500",
          iconBg: "bg-red-100 dark:bg-red-900/40",
          iconColor: "text-red-600",
        };
      case "meeting_booked":
        return {
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-l-green-500",
          iconBg: "bg-green-100 dark:bg-green-900/40",
          iconColor: "text-green-600",
        };
      default:
        return {
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-l-gray-500",
          iconBg: "bg-gray-100 dark:bg-gray-900/40",
          iconColor: "text-gray-600",
        };
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  
  const filteredNotifications = unreadNotifications.filter(notification => {
    switch (filter) {
      case "escalations":
        return notification.type === "call_escalation";
      case "quotes":
        return notification.type === "quote_sent" || notification.type === "quote_approved";
      case "meetings":
        return notification.type === "meeting_booked";
      default:
        return true;
    }
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
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Bell className="h-5 w-5" />
            <span>📣 Live Notifications</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full notification-dot" />
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">
              {filteredNotifications.length} new
            </Badge>
          </div>
        </div>
        
        {/* Quick Filter Buttons */}
        <div className="flex space-x-1 mt-4">
          <Button
            size="sm"
            variant={filter === "escalations" ? "default" : "outline"}
            onClick={() => setFilter("escalations")}
            className={`text-xs px-3 py-1 ${filter === "escalations" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"}`}
          >
            🔴 Escalations
          </Button>
          <Button
            size="sm"
            variant={filter === "quotes" ? "default" : "outline"}
            onClick={() => setFilter("quotes")}
            className={`text-xs px-3 py-1 ${filter === "quotes" ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"}`}
          >
            🟩 Quotes
          </Button>
          <Button
            size="sm"
            variant={filter === "meetings" ? "default" : "outline"}
            onClick={() => setFilter("meetings")}
            className={`text-xs px-3 py-1 ${filter === "meetings" ? "bg-yellow-600 text-white" : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"}`}
          >
            🟨 Meetings
          </Button>
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1 ${filter === "all" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"}`}
          >
            All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {unreadNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">All Caught Up!</h3>
            <p className="text-sm text-muted-foreground">
              No new notifications. Your bot is running smoothly.
            </p>
          </div>
        ) : (
          filteredNotifications.slice(0, 5).map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const style = getNotificationStyle(notification.type);
            
            return (
              <div
                key={notification.id}
                className={`bg-slate-700 rounded-lg border-l-4 ${style.borderColor} cursor-pointer hover:shadow-md transition-all duration-200 active:scale-98 ${
                  notification.type === "call_escalation" ? "animate-pulse hover:bg-slate-600" : "hover:bg-slate-600"
                }`}
              >
                {/* Header with icon and title */}
                <div className="flex items-center justify-between p-4 pb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${style.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${style.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white leading-tight">
                        {notification.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {(() => {
                          const now = new Date();
                          const notificationTime = new Date(notification.createdAt!);
                          const diffMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
                          
                          if (diffMinutes < 1) return "Just now";
                          if (diffMinutes < 60) return `${diffMinutes} min ago`;
                          if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
                          return notificationTime.toLocaleDateString();
                        })()}
                        {notification.type === "call_escalation" && (
                          <span className="ml-2 text-red-400 font-bold animate-pulse">🚨 URGENT</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissNotificationMutation.mutate(notification.id)}
                    disabled={dismissNotificationMutation.isPending}
                    className="text-slate-400 hover:text-white h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Message content */}
                <div className="px-4 pb-3">
                  <div className="text-sm text-slate-200 leading-relaxed">
                    {notification.message}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="px-4 pb-4">
                  {notification.type === "call_escalation" && (
                    <div className="flex space-x-2">
                      <Button size="sm" className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 h-9 flex-1">
                        📞 Take Call
                      </Button>
                      <Button size="sm" variant="outline" className="text-sm bg-slate-600 border-slate-500 text-slate-200 hover:bg-slate-500 px-4 py-2 h-9">
                        👁️ View
                      </Button>
                    </div>
                  )}
                  {notification.type === "meeting_booked" && (
                    <Button size="sm" className="text-sm bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 h-9 w-full">
                      📅 View Meeting
                    </Button>
                  )}
                  {notification.type === "lead_captured" && (
                    <div className="flex space-x-2">
                      <Button size="sm" className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 h-9 flex-1">
                        💰 View Quote
                      </Button>
                      <Button size="sm" variant="outline" className="text-sm bg-slate-600 border-slate-500 text-slate-200 hover:bg-slate-500 px-4 py-2 h-9">
                        📋 Details
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
