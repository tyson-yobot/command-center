import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare,
  Shield,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface EscalationAlert {
  id: number;
  type: 'call_escalation' | 'high_value_deal' | 'system_critical';
  title: string;
  description: string;
  priority: 'urgent' | 'critical';
  timestamp: number;
  timeoutSeconds: number;
  fallbackActions: string[];
}

export default function EscalationWatchdog() {
  const [activeEscalations, setActiveEscalations] = useState<EscalationAlert[]>([
    {
      id: 1,
      type: 'call_escalation',
      title: 'Bot Confidence Critical Drop',
      description: 'Call with Mike Rodriguez - bot confidence dropped to 28% during pricing discussion',
      priority: 'critical',
      timestamp: Date.now() - 45000, // 45 seconds ago
      timeoutSeconds: 120,
      fallbackActions: ['SMS Alert', 'Email Backup', 'Auto-Transfer']
    },
    {
      id: 2,
      type: 'high_value_deal',
      title: 'High-Value Lead Stalled',
      description: '$45K enterprise prospect has been on hold for 90+ seconds',
      priority: 'urgent',
      timestamp: Date.now() - 30000, // 30 seconds ago
      timeoutSeconds: 180,
      fallbackActions: ['Manager Alert', 'Priority Queue']
    }
  ]);

  const [escalationCountdowns, setEscalationCountdowns] = useState<{[key: number]: number}>({});

  // Update countdown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: {[key: number]: number} = {};
      
      activeEscalations.forEach(escalation => {
        const elapsed = Math.floor((Date.now() - escalation.timestamp) / 1000);
        const remaining = Math.max(0, escalation.timeoutSeconds - elapsed);
        newCountdowns[escalation.id] = remaining;
        
        // Auto-escalate when timer hits zero
        if (remaining === 0) {
          handleAutoEscalation(escalation);
        }
      });
      
      setEscalationCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEscalations]);

  const handleAutoEscalation = (escalation: EscalationAlert) => {
    console.warn(`🛑 Escalation ID ${escalation.id} was NOT handled in time!`);
    
    // Remove from active escalations and trigger fallback
    setActiveEscalations(prev => prev.filter(e => e.id !== escalation.id));
    
    // Here you would trigger actual fallback actions
    // For demo, we'll just log it
    console.log(`🔥 Auto-escalating ID ${escalation.id} with actions:`, escalation.fallbackActions);
  };

  const handleManualResolve = (escalationId: number) => {
    setActiveEscalations(prev => prev.filter(e => e.id !== escalationId));
  };

  const getProgressPercentage = (escalation: EscalationAlert) => {
    const elapsed = Math.floor((Date.now() - escalation.timestamp) / 1000);
    const progress = (elapsed / escalation.timeoutSeconds) * 100;
    return Math.min(100, progress);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="border-2 border-red-500/30 bg-red-50/10 dark:bg-red-900/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
          Escalation Watchdog
          {activeEscalations.length > 0 && (
            <Badge variant="destructive">
              {activeEscalations.length} Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {activeEscalations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600">All Clear</h3>
            <p className="text-sm text-gray-600">
              No urgent escalations requiring attention
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeEscalations.map((escalation) => {
              const countdown = escalationCountdowns[escalation.id] || escalation.timeoutSeconds;
              const progress = getProgressPercentage(escalation);
              
              return (
                <Alert key={escalation.id} className="border-red-500 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <h4 className="font-semibold text-red-800 dark:text-red-200">
                          {escalation.title}
                        </h4>
                        <Badge 
                          variant={escalation.priority === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {escalation.priority}
                        </Badge>
                      </div>
                      
                      <AlertDescription className="text-red-700 dark:text-red-300 mb-3">
                        {escalation.description}
                      </AlertDescription>
                      
                      {/* Countdown Timer */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-red-700 dark:text-red-300">
                            Auto-escalating in: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                          </span>
                          <span className="text-xs text-red-600">
                            {progress.toFixed(0)}% elapsed
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(progress)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Fallback Actions */}
                      <div className="mb-3">
                        <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                          Fallback actions when timer expires:
                        </p>
                        <div className="flex gap-1">
                          {escalation.fallbackActions.map((action, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleManualResolve(escalation.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Phone className="h-3 w-3 mr-1" />
                        Call Now
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Override
                      </Button>
                    </div>
                  </div>
                </Alert>
              );
            })}
          </div>
        )}
        
        {/* Watchdog Status */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Escalation Watchdog Active</span>
          </div>
          <p className="text-blue-600 dark:text-blue-400 mt-2 text-sm">
            Monitoring {activeEscalations.length} critical alerts • Auto-escalation triggers after timeout • 
            All actions logged and audited for compliance
          </p>
        </div>
      </CardContent>
    </Card>
  );
}