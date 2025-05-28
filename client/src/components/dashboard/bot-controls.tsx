import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Power, Route, MessageSquare, Activity } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Bot } from "@shared/schema";

export default function BotControls() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: bot, isLoading } = useQuery<Bot>({
    queryKey: ["/api/bot"],
    refetchInterval: 10000,
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

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
              <div className="w-11 h-6 bg-muted rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!bot) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Power className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Bot Not Available</h3>
          <p className="text-sm text-muted-foreground">
            Bot controls will appear here once your bot is properly configured.
          </p>
        </CardContent>
      </Card>
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
        return "🚀 ACTIVE & DOMINATING";
      case "paused":
        return "⏸️ PAUSED";
      case "offline":
        return "🔴 OFFLINE";
      default:
        return "❓ UNKNOWN STATUS";
    }
  };

  const getStatusIcon = (status: string) => {
    const baseClasses = "h-5 w-5 transition-all duration-300";
    switch (status) {
      case "active":
        return <Activity className={`${baseClasses} ${getStatusColor(status)} animate-pulse`} />;
      case "paused":
        return <Activity className={`${baseClasses} ${getStatusColor(status)} animate-bounce`} />;
      case "offline":
        return <Activity className={`${baseClasses} ${getStatusColor(status)} animate-ping`} />;
      default:
        return <Activity className={`${baseClasses} ${getStatusColor(status)}`} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Power className="h-5 w-5" />
          <span>🧠 Bot Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bot Status Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              {getStatusIcon(bot.status)}
            </div>
            <div>
              <div className="font-medium text-foreground">Bot Status</div>
              <div className={`text-sm ${getStatusColor(bot.status)}`}>
                {getStatusLabel(bot.status)}
              </div>
            </div>
          </div>
          <Switch
            checked={bot.status === "active"}
            onCheckedChange={handleStatusToggle}
            disabled={isUpdating}
          />
        </div>

        {/* Lead Routing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Route className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-foreground">Lead Routing</div>
              <div className="text-sm text-muted-foreground">
                {bot.routingMode.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isUpdating}
            className="bg-white text-black border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1 left-1 text-xs text-gray-400 font-mono">SYS</div>
            <span className="relative z-10 flex items-center space-x-2">
              <span>⚙️</span>
              <span>Configure</span>
              <span className="text-xs text-gray-500 font-mono">[CTRL]</span>
            </span>
          </Button>
        </div>

        {/* Conversation Tone */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-foreground">Conversation Tone</div>
              <div className="text-sm text-muted-foreground">
                {bot.tone.charAt(0).toUpperCase() + bot.tone.slice(1)}
              </div>
            </div>
          </div>
          <Select
            value={bot.tone}
            onValueChange={handleToneChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
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
  );
}
