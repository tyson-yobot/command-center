// app/dashboard/CommandCenter.tsx
import React, { useState } from "react";
import { YoBotCard } from "@/components/ui/YoBotCard";
import { YoBotButton } from "@/components/ui/YoBotButton";
import { PhoneCall, Mic, Upload, AlertTriangle, Search } from "lucide-react";
import LeadScraperModal from "@/components/modals/LeadScraperModal";
import AnalyticsModal from "@/components/modals/AnalyticsModal";
import SmartSpendChart from "@/components/analytics/SmartSpendChart";
import VoiceStatusCard from "@/components/Voice/VoiceStatusCard";
import SystemHealthCard from "@/components/analytics/SystemHealthCard";
import useAirtableSync from "@/lib/hooks/useAirtableSync";

export default function CommandCenter() {
  const [showLeadScraper, setShowLeadScraper] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useAirtableSync(); // full metrics sync

  return (
    <div className="flex flex-col gap-6 px-6 py-6 bg-black min-h-screen">

      {/* 1. HEADER */}
      <div className="w-full text-center text-3xl font-bold bg-gradient-to-r from-silver via-white to-silver text-black py-4 rounded-2xl shadow-md">
        🤖 YoBot® Command Center
      </div>

      {/* 2. QUICK ACTION BUTTONS */}
      <YoBotCard>
        <div className="flex flex-wrap gap-4 justify-start">
          <YoBotButton variant="blue" icon={PhoneCall}>Start Pipeline</YoBotButton>
          <YoBotButton variant="red" icon={AlertTriangle}>End Pipeline</YoBotButton>
          <YoBotButton variant="purple" icon={Mic}>Test Voice</YoBotButton>
          <YoBotButton variant="green" icon={Upload}>Upload Docs</YoBotButton>
          <YoBotButton variant="blue" icon={Search} onClick={() => setShowLeadScraper(true)}>Lead Scraper</YoBotButton>
          <YoBotButton variant="green" onClick={() => setShowAnalytics(true)}>Analytics Report</YoBotButton>
        </div>
      </YoBotCard>

      {/* 3. VOICE ENGINE STATUS */}
      <YoBotCard>
        <VoiceStatusCard />
      </YoBotCard>

      {/* 4. SMARTSPEND CHART */}
      <YoBotCard>
        <SmartSpendChart />
      </YoBotCard>

      {/* 5. SYSTEM HEALTH */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <YoBotCard>
          <SystemHealthCard type="cpu" />
        </YoBotCard>
        <YoBotCard>
          <SystemHealthCard type="ram" />
        </YoBotCard>
        <YoBotCard>
          <SystemHealthCard type="disk" />
        </YoBotCard>
      </div>

      {/* MODALS */}
      {showLeadScraper && (
        <LeadScraperModal onClose={() => setShowLeadScraper(false)} />
      )}
      {showAnalytics && (
        <AnalyticsModal onClose={() => setShowAnalytics(false)} />
      )}

    </div>
  );
}
