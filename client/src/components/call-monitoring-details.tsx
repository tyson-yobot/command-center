import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, User, Star } from 'lucide-react';

interface CallMonitoringDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  currentSystemMode: string;
}

export function CallMonitoringDetails({ isOpen, onClose, currentSystemMode }: CallMonitoringDetailsProps) {
  const testCalls = currentSystemMode === 'test' ? [
    {
      id: 1,
      caller: "Sarah Johnson",
      phone: "(555) 123-4567",
      duration: "08:42",
      status: "Active",
      timestamp: "2:15 PM",
      purpose: "Product inquiry",
      score: 8.5,
      sentiment: "Positive"
    },
    {
      id: 2,
      caller: "Mike Chen",
      phone: "(555) 987-6543", 
      duration: "12:18",
      status: "On Hold",
      timestamp: "1:48 PM",
      purpose: "Support request",
      score: 7.2,
      sentiment: "Neutral"
    },
    {
      id: 3,
      caller: "Emily Davis",
      phone: "(555) 456-7890",
      duration: "05:33",
      status: "Active",
      timestamp: "2:22 PM",
      purpose: "Pricing discussion", 
      score: 9.1,
      sentiment: "Very Positive"
    }
  ] : [];

  const testCallHistory = currentSystemMode === 'test' ? [
    {
      id: 4,
      caller: "John Smith",
      phone: "(555) 111-2222",
      duration: "15:47",
      status: "Completed",
      timestamp: "11:30 AM",
      purpose: "Demo scheduled",
      score: 9.8,
      outcome: "Sale - $12,500",
      sentiment: "Excellent"
    },
    {
      id: 5,
      caller: "Lisa Wong", 
      phone: "(555) 333-4444",
      duration: "09:12",
      status: "Completed",
      timestamp: "10:45 AM",
      purpose: "Follow-up call",
      score: 7.9,
      outcome: "Quote sent",
      sentiment: "Positive"
    },
    {
      id: 6,
      caller: "Robert Kim",
      phone: "(555) 777-8888",
      duration: "06:33",
      status: "Completed", 
      timestamp: "9:15 AM",
      purpose: "Technical support",
      score: 8.4,
      outcome: "Issue resolved",
      sentiment: "Satisfied"
    }
  ] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-blue-400">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Phone className="w-5 h-5 mr-2 text-blue-400" />
            Call Monitoring Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Call Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-900/60 rounded-lg p-4 border border-blue-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{currentSystemMode === 'test' ? '3' : '0'}</div>
                <div className="text-slate-300 text-sm">Active Calls</div>
              </div>
            </div>
            <div className="bg-green-900/60 rounded-lg p-4 border border-green-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{currentSystemMode === 'test' ? '47' : '0'}</div>
                <div className="text-slate-300 text-sm">Completed Today</div>
              </div>
            </div>
            <div className="bg-purple-900/60 rounded-lg p-4 border border-purple-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{currentSystemMode === 'test' ? '1,847' : '0'}</div>
                <div className="text-slate-300 text-sm">Total Records</div>
              </div>
            </div>
            <div className="bg-cyan-900/60 rounded-lg p-4 border border-cyan-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{currentSystemMode === 'test' ? '8.7' : ''}</div>
                <div className="text-slate-300 text-sm">Avg Score</div>
              </div>
            </div>
          </div>

          {/* Live Call Activity */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Live Call Activity</h3>
            {currentSystemMode === 'test' ? (
              <div className="space-y-3">
                {testCalls.map((call) => (
                  <div key={call.id} className="bg-slate-800/60 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <div>
                          <div className="text-white font-medium flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {call.caller}
                          </div>
                          <div className="text-slate-400 text-sm">{call.phone} • {call.purpose}</div>
                          <div className="text-blue-400 text-xs">Sentiment: {call.sentiment}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-cyan-400 font-bold flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {call.duration}
                          </div>
                          <div className="text-yellow-400 text-sm flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Score: {call.score}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {call.status}
                        </Badge>
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400">
                          Listen In
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                No active calls at this time
              </div>
            )}
          </div>

          {/* Recent Call History */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Recent Call History</h3>
            {currentSystemMode === 'test' ? (
              <div className="space-y-3">
                {testCallHistory.map((call) => (
                  <div key={call.id} className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <div>
                          <div className="text-white font-medium flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {call.caller}
                          </div>
                          <div className="text-slate-400 text-sm">{call.phone} • {call.purpose}</div>
                          <div className="text-blue-400 text-xs">Sentiment: {call.sentiment}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-slate-300 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {call.duration}
                          </div>
                          <div className="text-slate-400 text-sm">{call.timestamp}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {call.score}
                          </div>
                          <div className="text-blue-400 text-sm">{call.outcome}</div>
                        </div>
                        <Badge variant="outline" className="text-gray-400 border-gray-400">
                          {call.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                No call history available
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}