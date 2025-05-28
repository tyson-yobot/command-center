import { useState, useEffect } from "react";
import { AlertTriangle, Phone, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CriticalAlert {
  id: string;
  title: string;
  message: string;
  type: 'call_escalation' | 'system_critical' | 'high_value_deal';
  timestamp: number;
  requiresAction: boolean;
}

export default function CriticalAlertOverlay() {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    // Play alert sound for critical notifications
    const playAlertSound = () => {
      if (!audioEnabled) return;
      
      // Create audio context for alert sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create urgent beep pattern
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };

    // Listen for WebSocket messages about critical alerts
    const handleWebSocketMessage = (event: any) => {
      if (event.data?.type === 'CRITICAL_NOTIFICATION') {
        const newAlert: CriticalAlert = {
          id: `${Date.now()}-${Math.random()}`,
          title: event.data.notification.title,
          message: event.data.notification.body,
          type: event.data.notification.type,
          timestamp: event.data.notification.timestamp,
          requiresAction: event.data.notification.requiresAttention
        };
        
        setAlerts(prev => [newAlert, ...prev].slice(0, 3)); // Keep only 3 most recent
        playAlertSound();
        
        // Vibrate if supported
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
      }
    };

    // Connect to existing WebSocket or simulate for demo
    window.addEventListener('message', handleWebSocketMessage);
    
    // Auto-dismiss non-critical alerts after 10 seconds
    const timer = setInterval(() => {
      setAlerts(prev => prev.filter(alert => 
        alert.requiresAction || (Date.now() - alert.timestamp < 10000)
      ));
    }, 1000);

    return () => {
      window.removeEventListener('message', handleWebSocketMessage);
      clearInterval(timer);
    };
  }, [audioEnabled]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleTakeCall = () => {
    // Trigger call taking action
    window.location.href = '/mobile?action=take_call';
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="p-4 space-y-3 pointer-events-auto">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className={`
              ${alert.type === 'call_escalation' ? 'bg-red-900/95 border-red-500' : 'bg-orange-900/95 border-orange-500'}
              backdrop-blur-lg shadow-2xl animate-in slide-in-from-top-2 duration-300
            `}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`
                    p-2 rounded-full 
                    ${alert.type === 'call_escalation' ? 'bg-red-500/20' : 'bg-orange-500/20'}
                  `}>
                    {alert.type === 'call_escalation' ? (
                      <Phone className="h-5 w-5 text-red-400 animate-pulse" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-400 animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-bold text-sm">
                        {alert.title}
                      </h3>
                      {alert.requiresAction && (
                        <Badge className="bg-red-600 text-white text-xs animate-pulse">
                          ACTION REQUIRED
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-slate-200 text-sm leading-tight">
                      {alert.message}
                    </p>
                    
                    <div className="text-xs text-slate-400 mt-2">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="text-slate-400 hover:text-white h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {alert.type === 'call_escalation' && (
                <div className="flex space-x-2 mt-3">
                  <Button
                    onClick={handleTakeCall}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2 h-8"
                  >
                    📞 Take Call Now
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-500 text-slate-200 hover:bg-slate-700 text-sm px-3 py-2 h-8"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    Later
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {/* Sound toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="text-slate-400 hover:text-white h-8 w-8 p-0"
        >
          <Bell className={`h-4 w-4 ${audioEnabled ? 'text-blue-400' : 'text-slate-600'}`} />
        </Button>
      </div>
    </div>
  );
}