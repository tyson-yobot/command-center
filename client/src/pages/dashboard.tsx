import SearchBar from "@/components/search/search-bar";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import BotControls from "@/components/dashboard/bot-controls";
import LiveNotifications from "@/components/dashboard/live-notifications";
import ConversationLog from "@/components/dashboard/conversation-log";
import CrmSnapshot from "@/components/dashboard/crm-snapshot";

export default function Dashboard() {
  return (
    <div className="px-4 space-y-6">
      <SearchBar />
      <MetricsGrid />
      <BotControls />
      <LiveNotifications />
      <ConversationLog />
      <CrmSnapshot />
    </div>
  );
}
