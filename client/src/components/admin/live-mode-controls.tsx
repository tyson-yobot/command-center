import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Database, Trash2, Settings, RefreshCw, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface SystemMode {
  systemMode: string;
  timestamp: string;
}

interface PurgeResult {
  success: boolean;
  itemsPurged: number;
  areas: string[];
  timestamp: string;
  message: string;
}

export default function LiveModeControls() {
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current system mode
  const { data: systemMode, isLoading: modeLoading } = useQuery<SystemMode>({
    queryKey: ["/api/system-mode"],
    refetchInterval: 5000,
  });

  // Execute live data purge
  const purgeDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/live-data-purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (data: PurgeResult) => {
      if (data.success) {
        toast({
          title: "Live Data Purged",
          description: `Successfully removed ${data.itemsPurged} hardcoded items from ${data.areas.length} areas`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard-metrics"] });
        queryClient.invalidateQueries({ queryKey: ["/api/call-monitoring/details"] });
        queryClient.invalidateQueries({ queryKey: ["/api/automation-performance"] });
      } else {
        toast({
          title: "Purge Failed",
          description: data.message,
          variant: "destructive",
        });
      }
      setIsExecuting(false);
    },
    onError: () => {
      toast({
        title: "Purge Error",
        description: "Failed to execute live data purge",
        variant: "destructive",
      });
      setIsExecuting(false);
    }
  });

  // Switch system mode
  const switchModeMutation = useMutation({
    mutationFn: async (mode: string) => {
      const response = await fetch('/api/system-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-mode"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/call-monitoring/details"] });
      queryClient.invalidateQueries({ queryKey: ["/api/automation-performance"] });
      toast({
        title: "Mode Switched",
        description: "System mode updated successfully",
      });
    }
  });

  const handlePurgeExecution = () => {
    if (systemMode?.systemMode !== 'live') {
      toast({
        title: "Mode Restriction",
        description: "Data purge only available in LIVE mode",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    purgeDataMutation.mutate();
  };

  const isLiveMode = systemMode?.systemMode === 'live';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Live Mode Data Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current System Mode */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Mode:</span>
          <Badge variant={isLiveMode ? "default" : "secondary"}>
            {modeLoading ? "..." : systemMode?.systemMode?.toUpperCase() || "UNKNOWN"}
          </Badge>
        </div>

        <Separator />

        {/* Mode Switch Controls */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Environment Control</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isLiveMode ? "default" : "outline"}
              onClick={() => switchModeMutation.mutate('live')}
              disabled={switchModeMutation.isPending || isLiveMode}
            >
              <Database className="w-4 h-4 mr-2" />
              LIVE Mode
            </Button>
            <Button
              size="sm"
              variant={!isLiveMode ? "default" : "outline"}
              onClick={() => switchModeMutation.mutate('test')}
              disabled={switchModeMutation.isPending || !isLiveMode}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              TEST Mode
            </Button>
          </div>
        </div>

        <Separator />

        {/* Live Data Purge Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Data Management</h4>
          
          {isLiveMode && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                LIVE mode active - Only authentic data from real integrations will be displayed.
                All hardcoded content has been removed.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handlePurgeExecution}
            disabled={!isLiveMode || isExecuting || purgeDataMutation.isPending}
            variant={isLiveMode ? "destructive" : "outline"}
            size="sm"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isExecuting ? "Purging..." : "Clear LIVE Data"}
          </Button>

          {!isLiveMode && (
            <p className="text-xs text-muted-foreground">
              Switch to LIVE mode to access data purge controls
            </p>
          )}
        </div>

        <Separator />

        {/* Status Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Environment Status</h4>
          <div className="text-xs space-y-1">
            {isLiveMode ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-3 h-3" />
                Production environment - authentic data only
              </div>
            ) : (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="w-3 h-3" />
                Test environment - sample data enabled
              </div>
            )}
            <div className="text-muted-foreground">
              Last updated: {systemMode?.timestamp ? new Date(systemMode.timestamp).toLocaleTimeString() : "Unknown"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}