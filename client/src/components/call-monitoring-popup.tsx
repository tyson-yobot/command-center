import { useState, useEffect } from 'react';
import { X, Phone, PhoneCall, Clock, Users, Pause, Play } from 'lucide-react';

interface ActiveCall {
  id: string;
  phoneNumber: string;
  contactName: string;
  status: 'dialing' | 'connected' | 'ringing' | 'completed' | 'failed';
  duration: number;
  startTime: Date;
  voiceId?: string;
  script?: string;
}

interface CallMonitoringPopupProps {
  isOpen: boolean;
  onClose: () => void;
  activeCalls: ActiveCall[];
  totalRecords: number;
  completedCalls: number;
}

export function CallMonitoringPopup({ 
  isOpen, 
  onClose, 
  activeCalls: initialCalls, 
  totalRecords, 
  completedCalls 
}: CallMonitoringPopupProps) {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>(initialCalls);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setActiveCalls(calls => 
        calls.map(call => ({
          ...call,
          duration: call.status === 'connected' 
            ? Math.floor((Date.now() - call.startTime.getTime()) / 1000)
            : call.duration
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dialing': return 'text-yellow-500';
      case 'ringing': return 'text-blue-500';
      case 'connected': return 'text-green-500';
      case 'completed': return 'text-gray-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dialing': return <Phone className="w-4 h-4 animate-pulse" />;
      case 'ringing': return <PhoneCall className="w-4 h-4 animate-bounce" />;
      case 'connected': return <PhoneCall className="w-4 h-4" />;
      case 'completed': return <Phone className="w-4 h-4" />;
      case 'failed': return <X className="w-4 h-4" />;
      default: return <Phone className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-6 h-6" />
              <h2 className="text-xl font-bold">Pipeline Call Monitor</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Active: {activeCalls.filter(c => c.status === 'connected' || c.status === 'dialing' || c.status === 'ringing').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Completed: {completedCalls}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Total: {totalRecords}</span>
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>

        {/* Call List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {activeCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <PhoneCall className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active calls</p>
              <p className="text-sm">Pipeline calls will appear here when started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${getStatusColor(call.status)}`}>
                      {getStatusIcon(call.status)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {call.contactName || 'Unknown Contact'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {call.phoneNumber}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                      <div className={`text-sm font-medium capitalize ${getStatusColor(call.status)}`}>
                        {call.status}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDuration(call.duration)}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Started</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {call.startTime.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pipeline Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedCalls} / {totalRecords}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalRecords > 0 ? (completedCalls / totalRecords) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}