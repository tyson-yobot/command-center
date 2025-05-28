import SearchBar from "@/components/search/search-bar";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import BotControls from "@/components/dashboard/bot-controls";
import LiveNotifications from "@/components/dashboard/live-notifications";
import ConversationLog from "@/components/dashboard/conversation-log";
import CrmSnapshot from "@/components/dashboard/crm-snapshot";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <MetricsGrid />
      <BotControls />
      <LiveNotifications />
      
      {/* Test Alert Button */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-400 font-bold text-sm">Critical Alert System</h3>
            <p className="text-slate-300 text-xs">Test your emergency notifications</p>
          </div>
          <Button 
            onClick={testAlert}
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Test Alert
          </Button>
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
