import SearchBar from "@/components/search/search-bar";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import BotControls from "@/components/dashboard/bot-controls";
import LiveNotifications from "@/components/dashboard/live-notifications";
import ConversationLog from "@/components/dashboard/conversation-log";
import CrmSnapshot from "@/components/dashboard/crm-snapshot";
import { ChevronDown, AlertTriangle, Activity, TrendingUp, Users, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const testAlert = async () => {
    // Trigger critical alert overlay directly
    const alertEvent = new CustomEvent('message', {
      detail: {
        data: {
          type: 'CRITICAL_NOTIFICATION',
          notification: {
            title: '🚨 URGENT CALL ESCALATION',
            body: 'High-value client Mike Rodriguez needs immediate assistance - $125,000 deal at risk',
            type: 'call_escalation',
            timestamp: Date.now(),
            requiresAttention: true
          }
        }
      }
    });
    window.dispatchEvent(alertEvent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white px-4 space-y-6">
      <SearchBar />
      
      {/* Daily Totals Summary Banner */}
      <Card className="bg-blue-600/90 backdrop-blur-sm border border-blue-400/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">📅 Today's Totals</h3>
              <div className="flex items-center space-x-4 text-xs text-blue-100 mt-1">
                <span>🧠 AI Tasks: 58</span>
                <span>💬 Conversations: 47</span>
                <span>✅ Automations: 182</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                93%
              </div>
              <span className="text-xs text-blue-100 mt-1">Health</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* System Alerts for Mobile */}
      <Card className="bg-red-600/90 backdrop-blur-sm border border-red-400/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-white" />
              <div>
                <h3 className="text-white font-semibold text-sm">🚨 System Alerts</h3>
                <p className="text-red-100 text-xs">2 automation failures, 1 missed follow-up</p>
              </div>
            </div>
            <Badge variant="destructive" className="bg-red-800 text-white text-xs">
              High Priority
            </Badge>
          </div>
        </CardContent>
      </Card>

      <MetricsGrid />
      
      {/* Essential Business Modules for Mobile */}
      <div className="grid grid-cols-1 gap-4">
        {/* Bot Health Monitor */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center text-sm">
              <Activity className="w-4 h-4 mr-2 text-green-400" />
              🤖 Bot Health Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Total Bots:</span>
                <span className="text-white font-bold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Response Time:</span>
                <span className="text-green-400 font-bold">1.2s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Errors:</span>
                <span className="text-orange-400 font-bold">2 impacted</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Uptime:</span>
                <span className="text-green-400 font-bold">✅ 98.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Forecast */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center text-sm">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
              📈 Revenue Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">MRR:</span>
                <span className="text-white font-bold">$24,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">30d Proj:</span>
                <span className="text-green-400 font-bold">$31,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Pipeline:</span>
                <span className="text-blue-400 font-bold">14 deals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Confidence:</span>
                <span className="text-green-400 font-bold">87%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Pulse & Ops Metrics Combined for Mobile */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-xs">
                <Users className="w-3 h-3 mr-1 text-purple-400" />
                🧭 Client Pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">Active:</span>
                  <span className="text-white font-bold">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">NPS:</span>
                  <span className="text-green-400 font-bold">72/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Risk:</span>
                  <span className="text-orange-400 font-bold">3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-xs">
                <Gauge className="w-3 h-3 mr-1 text-yellow-400" />
                📊 Ops Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">Success:</span>
                  <span className="text-green-400 font-bold">97.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Errors:</span>
                  <span className="text-red-400 font-bold">12 ↗︎</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">API:</span>
                  <span className="text-blue-400 font-bold">68%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BotControls />
      <LiveNotifications />
      
      {/* Quick Actions Panel for Mobile */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-sm">Quick Actions</h3>
            <p className="text-slate-300 text-xs">Get help or request training</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3"
            >
              Request Training
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs px-3"
            >
              Submit Ticket
            </Button>
          </div>
        </div>
      </div>
      
      <ConversationLog />
      <CrmSnapshot />
      
      {/* Subtle scroll indicator */}
      <div className="flex justify-center py-4 opacity-50">
        <div className="flex flex-col items-center space-y-1 text-slate-400">
          <ChevronDown className="h-4 w-4 animate-bounce" />
          <span className="text-xs">Scroll for more</span>
        </div>
      </div>
    </div>
  );
}
