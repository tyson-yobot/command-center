import SearchBar from "@/components/search/search-bar";
import ConversationSearch from "@/components/search/conversation-search";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import BotControls from "@/components/dashboard/bot-controls";
import LiveNotifications from "@/components/dashboard/live-notifications";
import ConversationLog from "@/components/dashboard/conversation-log";
import CrmSnapshot from "@/components/dashboard/crm-snapshot";
import { ChevronDown, AlertTriangle, Activity, TrendingUp, Users, Gauge, Calendar, Phone, MessageSquare, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import React from 'react';

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
      <ConversationSearch />
      
      {/* Daily Totals Summary Banner - Desktop Styled */}
      <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                Today's Performance
              </h3>
              <div className="flex items-center space-x-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                  AI Tasks: 58
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  Conversations: 47
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-1"></div>
                  Automations: 182
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                93%
              </div>
              <span className="text-xs text-green-300 mt-1 font-medium">Health</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* System Alerts - Desktop Styled */}
      <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg border border-red-400/30 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">System Alerts</h3>
                <p className="text-red-200 text-xs">2 automation failures, 1 missed follow-up</p>
              </div>
            </div>
            <Badge className="bg-red-600/80 text-white text-xs border-red-400/50">
              High Priority
            </Badge>
          </div>
        </CardContent>
      </Card>

      <MetricsGrid />
      
      {/* Essential Business Modules - Desktop Styled */}
      <div className="grid grid-cols-1 gap-4">
        {/* Bot Health Monitor */}
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center text-sm">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              Bot Health Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Bots:</span>
                <span className="text-white font-bold bg-white/10 px-2 py-1 rounded">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Response Time:</span>
                <span className="text-green-400 font-bold bg-green-500/20 px-2 py-1 rounded">1.2s</span>
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

      {/* Escalation Alerts (Condensed) */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
            Priority Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-red-900/40 rounded p-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-100 text-xs">🔥 Hot Lead - Acme Corp</span>
              </div>
              <span className="text-red-300 text-xs">2m ago</span>
            </div>
            <div className="flex items-center justify-between bg-yellow-900/40 rounded p-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-100 text-xs">🟡 Follow-up Due - TechStart</span>
              </div>
              <span className="text-yellow-300 text-xs">15m ago</span>
            </div>
            <div className="flex items-center justify-between bg-red-900/60 rounded p-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-red-100 text-xs">🔴 Critical Failure - Email Bot</span>
              </div>
              <span className="text-red-300 text-xs">⏱️ 2m overdue</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Analytics (Mini Version) */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-green-400 font-bold text-sm">87% 😊</div>
              <div className="text-slate-300 text-xs">Sentiment</div>
            </div>
            <div>
              <div className="text-blue-400 font-bold text-sm">4m 32s</div>
              <div className="text-slate-300 text-xs">Avg Call</div>
            </div>
            <div>
              <div className="text-green-400 font-bold text-sm">91.5% ✅</div>
              <div className="text-slate-300 text-xs">Resolution</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Calendar (Compact) */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-purple-400" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            <div className="flex-shrink-0 bg-blue-900/40 rounded p-2 min-w-[140px]">
              <div className="text-blue-300 text-xs font-medium">📞 2:00 PM</div>
              <div className="text-white text-xs">Demo - Acme</div>
              <Badge className="bg-blue-600 text-white text-xs mt-1">Join</Badge>
            </div>
            <div className="flex-shrink-0 bg-green-900/40 rounded p-2 min-w-[140px]">
              <div className="text-green-300 text-xs font-medium">🗓️ 3:30 PM</div>
              <div className="text-white text-xs">Follow-up - TechStart</div>
              <Badge className="bg-green-600 text-white text-xs mt-1">Prepare</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <Activity className="w-4 h-4 mr-2 text-green-400" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-green-300 text-xs">🟢 New lead – Acme Corp</span>
              <span className="text-slate-400 text-xs">now</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-xs">📅 Meeting booked – TechStart</span>
              <span className="text-slate-400 text-xs">5m ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-300 text-xs">🧾 Quote sent – Innovate LLC</span>
              <span className="text-slate-400 text-xs">12m ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
      
      {/* Quote Snapshot (Stats Only) */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <FileText className="w-4 h-4 mr-2 text-green-400" />
            Quote Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-white font-bold text-sm">4</div>
              <div className="text-slate-300 text-xs">📄 Today</div>
            </div>
            <div>
              <div className="text-green-400 font-bold text-sm">$8.5K</div>
              <div className="text-slate-300 text-xs">💰 Avg</div>
            </div>
            <div>
              <div className="text-green-400 font-bold text-sm">52%</div>
              <div className="text-slate-300 text-xs">🟩 Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConversationLog />
      <CrmSnapshot />
      
      {/* System Status Footer */}
      <div className="flex justify-center py-4">
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">🟢 Online</span>
          </div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="flex flex-col items-center space-y-1 text-slate-400">
            <ChevronDown className="h-3 w-3 animate-bounce" />
            <span className="text-xs">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
