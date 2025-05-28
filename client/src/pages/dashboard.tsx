import SearchBar from "@/components/search/search-bar";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import BotControls from "@/components/dashboard/bot-controls";
import LiveNotifications from "@/components/dashboard/live-notifications";
import ConversationLog from "@/components/dashboard/conversation-log";
import CrmSnapshot from "@/components/dashboard/crm-snapshot";
import { ChevronDown } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white px-4 space-y-6">
      <SearchBar />
      <MetricsGrid />
      <BotControls />
      <LiveNotifications />
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
