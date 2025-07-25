// CommandCenter.tsx
// Final Production UI - YoBot® Command Center

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button }            from "@/components/ui/button";

import yobotLogo             from "@/assets/Engage Smarter Logo Transparent.png";

import AIAvatarOverlayCard   from "@/components/cards/AIAvatarOverlayCard";
import SmartCalendarCard     from "@/components/cards/SmartCalendarCard";
import VoiceStudioCard       from "@/components/cards/VoiceStudioCard";
import RAGKnowledgeCard      from "@/components/cards/RAGKnowledgeCard";
import CallsCompletedCard    from "@/components/cards/CallsCompletedCard";
import MissedCallLogCard     from "@/components/cards/MissedCallLogCard";
import CallSentimentLogCard  from "@/components/cards/CallSentimentLogCard";
import VoicePerformanceCard  from "@/components/cards/VoicePerformanceCard";
import MonthlyRevenueCard    from "@/components/cards/MonthlyRevenueCard";
import SmartSpendCard        from "@/components/cards/SmartSpendCard";
import PredictiveAnalyticsCard from "@/components/cards/PredictiveAnalyticsCard";
import CRMHealthCheckCard    from "@/components/cards/CRMHealthCheckCard";
import BotalyticsCard        from "@/components/cards/BotalyticsCard";

import PipelineCallsModal    from "@/components/modals/PipelineCallsModal";
import ManualDialerModal     from "@/components/modals/ManualDialerModal";
import SubmitTicketModal     from "@/components/modals/SubmitTicketModal";
import ContentCreatorModal   from "@/components/modals/ContentCreatorModal";
import SalesOrderModal       from "@/components/modals/SalesOrderModal";
import SmartQuotingModal     from "@/components/modals/SmartQuotingModal";
import SmartSchedulerModal   from "@/components/modals/SmartSchedulerModal";
import SlackMonitorModal     from "@/components/modals/SlackMonitorModal";

import GenerateSocialContent from "@/backend/generate_social_content";

export default function CommandCenter() {
  const [openModal, setOpenModal] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const buttonClass = "bg-white/20 text-white hover:bg-white/40 backdrop-blur border border-white/30 rounded-xl shadow-lg px-4 py-2";

<<<<<<< HEAD
  const launchButtons = [
    <Button key="pipeline" onClick={() => setOpenModal("pipeline")} className={buttonClass}>📡 Pipeline Calls</Button>,
    <Button key="mailchimp" onClick={() => window.open("https://mailchimp.com", "_blank")} className={buttonClass}>📬 Mailchimp</Button>,
    <Button key="hubspot" onClick={() => window.open("https://hubspot.com", "_blank")} className={buttonClass}>🧩 HubSpot</Button>,
    <Button key="aiAgent" onClick={() => setOpenModal("aiAgent")} className={buttonClass}>🤖 AI Support Agent</Button>,
    <Button key="manualCall" onClick={() => setOpenModal("manualCall")} className={buttonClass}>📞 Manual Call</Button>,
    <Button key="reportGen" onClick={() => setOpenModal("reportGen")} className={buttonClass}>📄 Generate Report</Button>,
    <Button key="salesOrder" onClick={() => setOpenModal("salesOrder")} className={buttonClass}>💼 Sales Order</Button>,
    <Button key="contentCreator" onClick={() => setOpenModal("contentCreator")} className={buttonClass}>📈 Content Creator</Button>,
    <Button key="submitTicket" onClick={() => setOpenModal("submitTicket")} className={buttonClass}>🎟 Submit Ticket</Button>,
    <Button key="leads" onClick={() => setOpenModal("leads")} className={buttonClass}>🌟 Lead Scraper</Button>,
    <Button key="queue" onClick={() => setOpenModal("queue")} className={buttonClass}>📞 Live Call Queue</Button>,
    <Button key="liveTransfer" onClick={() => setOpenModal("liveTransfer")} className={buttonClass}>📲 Live Transfer</Button>
  ];
=======
  const openModal = async (modalName: string, label: string) => {
    setSelectedModal(modalName);
    await logEvent({ module: label, trigger: 'Command Center' });
>>>>>>> 6ceca54e23ef93c85c6cc94b0ba290772fdbfea3

  const advancedButtons = [
    <Button key="calendar" onClick={() => setOpenModal("calendar")} className={buttonClass}>📅 Calendar Booking</Button>,
    <Button key="quoting" onClick={() => setOpenModal("quoting")} className={buttonClass}>📄 Quote Generator</Button>,
    <Button key="abTest" onClick={() => setOpenModal("abTest")} className={buttonClass}>🧪 A/B Testing Engine</Button>,
    <Button key="slackAlerts" onClick={() => setOpenModal("slackAlerts")} className={buttonClass}>💬 Slack Alerts</Button>,
    <Button key="persona" onClick={() => setOpenModal("persona")} className={buttonClass}>🎭 Persona Designer</Button>,
    <Button key="generator" onClick={() => setOpenModal("generator")} className={buttonClass}>🧬 Content Generator</Button>,
    <Button key="analyzer" onClick={() => setOpenModal("analyzer")} className={buttonClass}>🧠 Conversation Analyzer</Button>,
    <Button key="admin" onClick={() => setOpenModal("admin")} className={buttonClass}>🔒 Admin Control</Button>,
    <Button key="radar" onClick={() => setOpenModal("radar")} className={buttonClass}>📡 Competitor Tracker</Button>,
    <Button key="integration" onClick={() => setOpenModal("integration")} className={buttonClass}>🔌 Data Integrations</Button>,
    <Button key="journey" onClick={() => setOpenModal("journey")} className={buttonClass}>🧭 Journey Automation</Button>,
    <Button key="whiteLabel" onClick={() => setOpenModal("whiteLabel")} className={buttonClass}>🏷️ White Label Manager</Button>,
    <Button key="sync" onClick={() => setOpenModal("sync")} className={buttonClass}>📶 Airtable Sync</Button>,
    <Button key="booster" onClick={() => setOpenModal("booster")} className={buttonClass}>🤖 ChatGPT Booster</Button>,
    <Button key="smartspend" onClick={() => setOpenModal("smartspend")} className={buttonClass}>💰 SmartSpend™</Button>,
    <Button key="botalytics" onClick={() => setOpenModal("botalytics")} className={buttonClass}>📊 Botalytics™</Button>,
    <Button key="quickbooks" onClick={() => setOpenModal("quickbooks")} className={buttonClass}>🧾 QuickBooks Sync</Button>,
    <Button key="sentiment" onClick={() => setOpenModal("sentiment")} className={buttonClass}>🎤 Sentiment Logger</Button>
  ];

  const modalComponents: Record<string, JSX.Element> = {
    pipeline: <PipelineCallsModal isOpen={openModal === "pipeline"} onClose={() => setOpenModal("")} tableId="tblYcNm6ywiAP1RzW" baseId="appRt8V3tH4g5Z5if" />,
    contentCreator: <ContentCreatorModal isOpen={openModal === "contentCreator"} onClose={() => setOpenModal("")} />,
    submitTicket: <SubmitTicketModal isOpen={openModal === "submitTicket"} onClose={() => setOpenModal("")} />,
    manualCall: <ManualDialerModal isOpen={openModal === "manualCall"} onClose={() => setOpenModal("")} />,
    quoting: <SmartQuotingModal isOpen={openModal === "quoting"} onClose={() => setOpenModal("")} />,
    smartScheduler: <SmartSchedulerModal isOpen={openModal === "smartScheduler"} onClose={() => setOpenModal("")} />,
    slackAlerts: <SlackMonitorModal isOpen={openModal === "slackAlerts"} onClose={() => setOpenModal("")} />,
    salesOrder: <SalesOrderModal isOpen={openModal === "salesOrder"} onClose={() => setOpenModal("")} />
  };

  return (
    <div className="bg-black text-white min-h-screen p-4">
      <div className="flex items-center justify-between bg-gradient-to-r from-white to-gray-300 rounded-xl p-3 mb-6">
        <div className="flex items-center gap-4">
          <img src={yobotLogo} alt="YoBot Logo" className="h-12" />
          <div className="text-black text-xl font-bold">YoBot® Command Center</div>
        </div>
        <div className="text-black text-sm italic">Engage Smarter, Not Harder</div>
      </div>

      <Card className="bg-gradient-to-br from-gray-200 to-gray-400 border-4 border-blue-500 rounded-2xl shadow-xl mb-4">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-center text-black mb-2 border-b-4 border-blue-500 pb-1">
            🚀 YoBot® Quick Action Launchpad
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {launchButtons}
          </div>

          <div className="text-center mt-4">
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-white border border-white/40 bg-black/20 hover:bg-black/40 rounded-full px-6 py-2"
            >
              {showAdvanced ? "🔽 Hide Advanced Tools" : "🔼 Show Advanced Tools"}
            </Button>
          </div>

          {showAdvanced && (
            <div className="mt-6 grid grid-cols-4 gap-3 border-t border-white/20 pt-4">
              {advancedButtons}
            </div>
          )}
        </CardContent>
      </Card>

      {openModal && modalComponents[openModal]}

      <div id="smart-calendar" className="mb-6">
        <SmartCalendarCard />
      </div>

      <div id="voice-studio" className="mb-6">
        <VoiceStudioCard />
      </div>

      <div id="rag-knowledge" className="mb-6">
        <RAGKnowledgeCard />
      </div>

      <h2 className="text-center text-xl font-bold text-white mt-10 mb-4 border-b-2 border-blue-600 pb-1">
        📊 Analytics Dashboard
      </h2>

      <div className="grid grid-cols-4 gap-4 mb-20">
        <CallsCompletedCard />
        <MissedCallLogCard />
        <CallSentimentLogCard />
        <VoicePerformanceCard />
        <MonthlyRevenueCard />
        <SmartSpendCard />
        <PredictiveAnalyticsCard />
        <CRMHealthCheckCard />
        <BotalyticsCard />
      </div>

      <div id="ai-support-agent" className="fixed bottom-6 right-6 z-50">
        <AIAvatarOverlayCard />
      </div>
    </div>
  );
}
