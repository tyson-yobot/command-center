import React, { useEffect, useState } from "react";
import { featureRegistry } from "@/server/feature-registry";
import Image from "next/image";
import YoBotLogo from "@/assets/Engage Smarter Logo Transparent.png";
import SubmitTicketForm from "@/components/SubmitTicketForm";
import * as Cards from "@/components/ui/cards";

/* ──────────── UI ATOMS ──────────── */
const CardGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
    {children}
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-lg font-semibold text-white tracking-wide border-b border-[#0d82da] pb-1 mb-3">
    {title}
  </h2>
);

const QuickNav: React.FC = () => (
  <nav className="flex flex-wrap gap-2 text-sm text-white mb-4">
    {["Analytics", "Tools", "Voice Engine", "Voice Studio", "Knowledge Base", "Exports & Logs"].map((item) => (
      <span
        key={item}
        className="px-2 py-0.5 bg-[#0d82da]/20 rounded border border-[#0d82da] hover:bg-[#0d82da]/40 cursor-pointer"
      >
        {item}
      </span>
    ))}
  </nav>
);

const CommandCenter: React.FC = () => {
  const [showTicketForm, setShowTicketForm] = useState(false);

  useEffect(() => {
    const openForm = () => setShowTicketForm(true);
    document.addEventListener("open-ticket-form", openForm);
    return () => document.removeEventListener("open-ticket-form", openForm);
  }, []);

  return (
    <div className="p-6 bg-black min-h-screen space-y-8 font-inter">
      <div className="bg-gradient-to-r from-[#c3c3c3] to-[#ffffff] rounded-2xl p-4 text-center">
        <Image src={YoBotLogo} alt="YoBot Logo" width={240} height={80} className="mx-auto" />
        <p className="text-[#0d82da] text-xl font-medium">Engage Smarter, Not Harder</p>
      </div>

      <QuickNav />

      <SectionHeader title="🚀 Quick Action Launchpad" />
      <CardGrid>
        {featureRegistry["lead-qualifier"] && <Cards.LeadQualifierCard />}
        {featureRegistry["pdf-quote-generator"] && <Cards.PDFGeneratorCard />}
        {featureRegistry["rag-insight-center"] && <Cards.RAGInsightCard />}
        {featureRegistry["bot-personality-pack"] && <Cards.PersonalityPackCard />}
        {featureRegistry["script-tester"] && <Cards.ScriptTestCard />}
        {featureRegistry["quickbooks-sync-panel"] && <Cards.QuickBooksSyncCard />}
        {featureRegistry["stripe-billing-log"] && <Cards.StripeBillingCard />}
        {featureRegistry["calendar-sync-view"] && <Cards.CalendarSyncCard />}
        {featureRegistry["slack-alerts-log"] && <Cards.SlackAlertsCard />}

        <button
          type="button"
          onClick={() => setShowTicketForm(true)}
          className="rounded-2xl h-20 font-semibold text-white bg-gradient-to-br from-purple-600 to-purple-400 hover:shadow-[0_0_12px_#ab47bc]"
        >
          🛠️ Submit Support Ticket
        </button>

        <button
          type="button"
          onClick={() => window.location.assign("/admin-control")}
          className="rounded-2xl h-20 font-semibold text-white bg-gradient-to-br from-[#e53935] to-[#b71c1c] hover:shadow-[0_0_12px_#ff4d4d]"
        >
          🔐 Admin Control Center
        </button>
      </CardGrid>

      <SectionHeader title="📊 Analytics Dashboard" />
      <CardGrid>
        {featureRegistry["smartspend-dashboard"] && <Cards.SmartSpendCard />}
        {featureRegistry["botalytics-dashboard"] && <Cards.BotalyticsCard />}
        {featureRegistry["missed-call-log"] && <Cards.MissedCallLogCard />}
        {featureRegistry["voicebot-performance"] && <Cards.VoicePerformanceCard />}
        {featureRegistry["crm-sync-dashboard"] && <Cards.CRMSyncCard />}
        {featureRegistry["follow-up-tracker"] && <Cards.FollowUpTrackerCard />}
        {featureRegistry["sentiment-analytics"] && <Cards.SentimentCard />}
        {featureRegistry["logger-integrity-tracker"] && <Cards.LoggerIntegrityCard />}
        {featureRegistry["ab-test-results"] && <Cards.ABTestCard />}
        {featureRegistry["compliance-checker"] && <Cards.ComplianceCheckerCard />}
        {featureRegistry["rep-scorecard"] && <Cards.RepScorecardCard />}
        {featureRegistry["support-ticket-review"] && <Cards.TicketReviewCard />}
      </CardGrid>

      {showTicketForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center">
          <div className="relative w-full max-w-lg">
            <button
              className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-8 h-8 hover:bg-red-700"
              onClick={() => setShowTicketForm(false)}
            >
              ✕
            </button>
            <SubmitTicketForm onSuccess={() => setShowTicketForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandCenter;
