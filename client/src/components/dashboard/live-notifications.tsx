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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>📣 Live Notifications</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full notification-dot" />
            <Badge variant="secondary" className="text-xs">
              {unreadNotifications.length} new
            </Badge>
          </div>
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
          unreadNotifications.slice(0, 5).map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const style = getNotificationStyle(notification.type);
            
            return (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 ${style.bgColor} rounded-lg border-l-4 ${style.borderColor} ${
                  notification.type === "call_escalation" ? "animate-pulse" : ""
                }`}
              >
                <div className={`w-8 h-8 ${style.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${style.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {notification.title}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt!).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} • {new Date(notification.createdAt!).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-start space-x-1">
                  {notification.type === "call_escalation" && (
                    <Button size="sm" variant="outline" className="text-xs bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 font-bold">
                      🚨 Escalated
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissNotificationMutation.mutate(notification.id)}
                    disabled={dismissNotificationMutation.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
