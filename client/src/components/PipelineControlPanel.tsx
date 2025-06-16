import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Square, Phone, Users, Clock, Activity, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuickTooltip } from '@/components/EnhancedTooltip';

interface PipelineStatus {
  pipelineStatus: string;
  callsToday: number;
  inProgress: number;
  conversionRate: string;
  avgDuration: string;
  completed: number;
  failed: number;
}

interface PipelineControlPanelProps {
  onStatusChange?: (status: string) => void;
}

export function PipelineControlPanel({ onStatusChange }: PipelineControlPanelProps) {
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>({
    pipelineStatus: 'Idle',
    callsToday: 0,
    inProgress: 0,
    conversionRate: '0%',
    avgDuration: '0m 0s',
    completed: 0,
    failed: 0
  });
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch pipeline status
  const fetchPipelineStatus = async () => {
    try {
      const response = await fetch('/api/call-status-summary');
      const result = await response.json();
      
      if (result.success) {
        setPipelineStatus(result.data);
        onStatusChange?.(result.data.pipelineStatus);
      }
    } catch (error) {
      console.error('Pipeline status fetch error:', error);
    }
  };

  useEffect(() => {
    fetchPipelineStatus();
    const interval = setInterval(fetchPipelineStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const startPipeline = async () => {
    setIsStarting(true);
    
    try {
      const response = await fetch('/api/start-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchSize: 10,
          targetFilters: {
            minScore: 5,
            excludeFailed: true
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setActivePipelineId(result.data.pipelineId);
        toast({
          title: "Pipeline Started",
          description: `Voice pipeline started with ${result.data.leadsQueued} leads`
        });
        fetchPipelineStatus();
      } else {
        toast({
          title: "Pipeline Start Failed",
          description: result.error || result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Pipeline Error",
        description: "Failed to start voice pipeline",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };

  const stopPipeline = async () => {
    setIsStopping(true);
    
    try {
      const response = await fetch('/api/stop-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipelineId: activePipelineId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setActivePipelineId(null);
        toast({
          title: "Pipeline Stopped",
          description: `Voice pipeline stopped. ${result.data.leadsReturned} leads returned to queue`
        });
        fetchPipelineStatus();
      } else {
        toast({
          title: "Pipeline Stop Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Pipeline Error",
        description: "Failed to stop voice pipeline",
        variant: "destructive"
      });
    } finally {
      setIsStopping(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Idle': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <Activity className="w-4 h-4 text-green-600" />;
      case 'Idle': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <Card className="bg-slate-800/50 border border-slate-600">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center justify-between">
          <span>Voice Pipeline Control</span>
          <Badge className={`${getStatusColor(pipelineStatus.pipelineStatus)} text-xs`}>
            {getStatusIcon(pipelineStatus.pipelineStatus)}
            <span className="ml-1">{pipelineStatus.pipelineStatus}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipeline Controls */}
        <div className="flex space-x-2">
          {pipelineStatus.pipelineStatus === 'Idle' ? (
            <QuickTooltip 
              preset="pipeline"
              customTitle="Start Voice Pipeline"
              customDescription="Begin automated voice calling for qualified leads"
            >
              <Button
                onClick={startPipeline}
                disabled={isStarting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                {isStarting ? 'Starting...' : 'Start Pipeline'}
              </Button>
            </QuickTooltip>
          ) : (
            <QuickTooltip
              preset="pipeline"
              customTitle="Stop Voice Pipeline"
              customDescription="Stop all active voice calls and return leads to queue"
            >
              <Button
                onClick={stopPipeline}
                disabled={isStopping}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                {isStopping ? 'Stopping...' : 'Stop Pipeline'}
              </Button>
            </QuickTooltip>
          )}
        </div>

        {/* Pipeline Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Phone className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300 text-xs">Calls Today</span>
            </div>
            <div className="text-white text-lg font-bold">{pipelineStatus.callsToday}</div>
            <div className="text-slate-400 text-xs">Avg: {pipelineStatus.avgDuration}</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-slate-300 text-xs">Active Now</span>
            </div>
            <div className="text-white text-lg font-bold">{pipelineStatus.inProgress}</div>
            <div className="text-slate-400 text-xs">Conversion: {pipelineStatus.conversionRate}</div>
          </div>
        </div>

        {/* Progress Indicator */}
        {pipelineStatus.pipelineStatus === 'Active' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Pipeline Progress</span>
              <span className="text-white">{pipelineStatus.completed + pipelineStatus.failed + pipelineStatus.inProgress} total</span>
            </div>
            <Progress 
              value={pipelineStatus.completed > 0 ? 
                (pipelineStatus.completed / (pipelineStatus.completed + pipelineStatus.failed + pipelineStatus.inProgress)) * 100 : 
                0
              } 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>✅ {pipelineStatus.completed} completed</span>
              <span>❌ {pipelineStatus.failed} failed</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}