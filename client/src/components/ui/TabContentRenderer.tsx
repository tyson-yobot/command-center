// ========================================================================
// TabContentRenderer.tsx – PRODUCTION VERSION
// Full Automation · Airtable/Slack-Ready · Built to Scale · No Hardcoding
// ========================================================================

import React, { lazy, Suspense, useEffect, useState } from "react";
import { featureTabs } from "@/feature-registry";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import { sendSlackNotification } from "@/utils/slackLogger";
import { trackModuleLoad } from "@/utils/metrics";

// Lazy imports – ensure dynamic loading
const SmartSpendDashboard = lazy(() => import("@/modules/SmartSpendDashboard"));
const BotalyticsDashboard = lazy(() => import("@/modules/BotalyticsDashboard"));
const LoggerIntegrityTracker = lazy(() => import("@/modules/LoggerIntegrityTracker"));
const SmartQuoting = lazy(() => import("@/modules/SmartQuoting"));
const QuickBooksSyncPanel = lazy(() => import("@/modules/QuickBooksSyncPanel"));
const StripeBillingLog = lazy(() => import("@/modules/StripeBillingLog"));
const VoiceBotPerformance = lazy(() => import("@/modules/VoiceBotPerformance"));
const MissedCallLog = lazy(() => import("@/modules/MissedCallLog"));
const RAGInsightCenter = lazy(() => import("@/modules/RAGInsightCenter"));
const SentimentAnalytics = lazy(() => import("@/modules/SentimentAnalytics"));
const RepScorecard = lazy(() => import("@/modules/RepScorecard"));
const ComplianceChecker = lazy(() => import("@/modules/ComplianceChecker"));
const SupportTicketReview = lazy(() => import("@/modules/SupportTicketReview"));

interface TabContentRendererProps {
  tabKey: string;
  recordId?: string;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({ tabKey, recordId }) => {
  const [record, setRecord] = useState<any>(null);

  useEffect(() => {
    const fetchRecordIfNeeded = async () => {
      if (recordId && ["smart-quoting", "quickbooks-sync"].includes(tabKey)) {
        try {
          const response = await axios.get(`/api/airtable/record/${recordId}`);
          setRecord(response.data);
          await sendSlackNotification(`✅ Loaded Airtable record for ${tabKey}: ${recordId}`);
        } catch (error) {
          toast.error("❌ Failed to load record data.");
          await sendSlackNotification(`❌ Error loading Airtable record for ${tabKey}: ${recordId}`);
        }
      }
    };
    fetchRecordIfNeeded();
  }, [tabKey, recordId]);

  useEffect(() => {
    trackModuleLoad(tabKey);
  }, [tabKey]);

  const renderTabComponent = () => {
    switch (tabKey) {
      case "smart-spend":
        return <SmartSpendDashboard />;
      case "botalytics":
        return <BotalyticsDashboard />;
      case "logger-integrity":
        return <LoggerIntegrityTracker />;
      case "smart-quoting":
        return <SmartQuoting record={record} />;
      case "quickbooks-sync":
        return <QuickBooksSyncPanel record={record} />;
      case "stripe-billing":
        return <StripeBillingLog />;
      case "voice-performance":
        return <VoiceBotPerformance />;
      case "missed-calls":
        return <MissedCallLog />;
      case "rag-insights":
        return <RAGInsightCenter />;
      case "sentiment-analytics":
        return <SentimentAnalytics />;
      case "rep-scorecard":
        return <RepScorecard />;
      case "compliance-checker":
        return <ComplianceChecker />;
      case "ticket-review":
        return <SupportTicketReview />;
      default:
        return <div className="text-white p-4">🚫 Feature not found</div>;
    }
  };

  return (
    <Card className="yobot-card">
      <CardContent className="p-4">
        <Suspense fallback={<div className="text-gray-400">Loading module…</div>}>
          {renderTabComponent()}
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default TabContentRenderer;
