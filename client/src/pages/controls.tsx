import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Power, Route, MessageSquare, Settings, Activity } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Bot } from "@shared/schema";

export default function Controls() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: bot, isLoading } = useQuery<Bot>({
    queryKey: ["/api/bot"],
    refetchInterval: 5000,
  });

  const updateBotMutation = useMutation({
    mutationFn: async (updates: Partial<Bot>) => {
      return apiRequest("PATCH", "/api/bot", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot"] });
      toast({
        title: "Settings Updated",
        description: "Bot settings have been successfully updated.",
      });
      setIsUpdating(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update bot settings.",
      });
      setIsUpdating(false);
    },
  });

  const handleStatusToggle = async (checked: boolean) => {
    setIsUpdating(true);
    updateBotMutation.mutate({
      status: checked ? "active" : "paused",
    });
  };

  const handleToneChange = async (tone: string) => {
    setIsUpdating(true);
    updateBotMutation.mutate({ tone });
  };

  const handleRoutingChange = async (routingMode: string) => {
    setIsUpdating(true);
    updateBotMutation.mutate({ routingMode });
  };

  if (isLoading) {
    return (
      <div className="px-4 space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Bot Configuration Found</h3>
            <p className="text-sm text-muted-foreground">
              Bot settings will appear here once your bot is properly configured.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "paused":
        return "text-yellow-600";
      case "offline":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active & Ready";
      case "paused":
        return "Paused";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="px-4 space-y-6">
      {/* Bot Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Power className="h-5 w-5" />
            <span>Bot Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Activity className={`h-6 w-6 ${getStatusColor(bot.status)}`} />
              </div>
              <div>
                <h3 className="font-medium">Bot Status</h3>
                <p className={`text-sm ${getStatusColor(bot.status)}`}>
                  {getStatusLabel(bot.status)}
                </p>
              </div>
            </div>
            <Switch
              checked={bot.status === "active"}
              onCheckedChange={handleStatusToggle}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lead Routing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Lead Routing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Routing Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Current: {bot.routingMode.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
              <Badge variant="outline">{bot.routingMode}</Badge>
            </div>
            <Select
              value={bot.routingMode}
              onValueChange={handleRoutingChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select routing mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto-assign">Auto Assign</SelectItem>
                <SelectItem value="round-robin">Round Robin</SelectItem>
                <SelectItem value="manual">Manual Assignment</SelectItem>
                <SelectItem value="priority-based">Priority Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Tone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Conversation Tone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Current Tone</h3>
                <p className="text-sm text-muted-foreground">
                  {bot.tone.charAt(0).toUpperCase() + bot.tone.slice(1)}
                </p>
              </div>
              <Badge variant="secondary">{bot.tone}</Badge>
            </div>
            <Select
              value={bot.tone}
              onValueChange={handleToneChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select conversation tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Power className="h-4 w-4 mr-2" />
            Restart Bot Service
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Reset to Default Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Activity className="h-4 w-4 mr-2" />
            Run System Diagnostics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
