

// YoBot Command Center 

// =============================================

// ✅ React & State Imports
import React, { useState } from 'react';

// ✅ Modal Imports
import LeadScraperModal from '@/components/modals/LeadScraperModal';
import SubmitTicketModal from '@/components/modals/SubmitTicketModal';
import VoiceStudioModal from '@/components/modals/VoiceStudioModal';
import HubspotModal from '@/components/modals/HubspotModal';
import ContentCreatorModal from '@/components/modals/ContentCreatorModal';
import ExportModal from '@/components/modals/ExportModal';
import SmartQuotingModal from '@/components/modals/SmartQuotingModal';
import PdfUploadModal from '@/components/modals/PdfUploadModal';
import AdminLoginModal from '@/components/modals/AdminLoginModal';
import PersonaTrainerModal from '@/components/modals/PersonaTrainerModal';
import AlertCenterModal from '@/components/modals/AlertCenterModal';
import CRMHealthCheckModal from '@/components/modals/CRMHealthCheckModal';
import BotAuditModal from '@/components/modals/BotAuditModal';
import DealTriggerModal from '@/components/modals/DealTriggerModal';
import SystemDiagnosticsModal from '@/components/modals/SystemDiagnosticsModal';
import SubmitRAGModal from '@/components/modals/SubmitRAGModal';
import SyncRAGModal from '@/components/modals/SyncRAGModal';
import SmartCalendarModal from '@/components/modals/SmartCalendarModal';

// ✅ Feature Panels
import SmartCalendar from '@/components/features/SmartCalendar';
import VoiceStudio from '@/components/features/VoiceStudio';
import AIChatAgentPanel from '@/components/features/AIChatAgentPanel';
import RAGKnowledgePanel from '@/components/features/RAGKnowledgePanel';

// ✅ Components
import QuickActionCard from '@/components/ui/cards/QuickActionCard';
import AdvancedToolsDrawer from '@/components/AdvancedToolsDrawer';
import SmartSpendCard from '@/components/ui/cards/SmartSpendCard';
import BotalyticsCard from '@/components/ui/cards/BotalyticsCard';
import VoicePerformanceCard from '@/components/ui/cards/VoicePerformanceCard';
import SentimentCard from '@/components/ui/cards/SentimentCard';
import RepScorecardCard from '@/components/ui/cards/RepScorecardCard';
import LeadQualifierCard from '@/components/ui/cards/LeadQualifierCard';
import CallsCompletedCard from '@/components/ui/cards/CallsCompletedCard';
import ContactRatioCard from '@/components/ui/cards/ContactRatioCard';
import SmartCalendarCard from '@/components/ui/cards/SmartCalendarCard';
import FollowUpTrackerCard from '@/components/ui/cards/FollowUpTrackerCard';
import DealsClosedCard from '@/components/ui/cards/DealsClosedCard';
import PDFGeneratorCard from '@/components/ui/cards/PDFGeneratorCard';
import MonthlyRevenueCard from '@/components/ui/cards/MonthlyRevenueCard';
import StripeRevenueCard from '@/components/ui/cards/StripeRevenueCard';
import QuickBooksSyncCard from '@/components/ui/cards/QuickBooksSyncCard';
import CRMSyncCard from '@/components/ui/cards/CRMSyncCard';
import ComplianceCheckerCard from '@/components/ui/cards/ComplianceCheckerCard';
import LoggerIntegrityCard from '@/components/ui/cards/LoggerIntegrityCard';
import RAGInsightCard from '@/components/ui/cards/RAGInsightCard';
import SlackAlertsCard from '@/components/ui/cards/SlackAlertsCard';
import TicketReviewCard from '@/components/ui/cards/TicketReviewCard';
import ABTestCard from '@/components/ui/cards/ABTestCard';
import PersonalityPackCard from '@/components/ui/cards/PersonalityPackCard';
import PredictiveAnalyticsCard from '@/components/ui/cards/PredictiveAnalyticsCard';
import LiveTransferModal from '@/components/modals/LiveTransferModal';

// ✅ Footer Component
const Footer = () => (
  <footer className="mt-20 text-center text-sm text-gray-400 border-t border-gray-600 pt-6">
    © {new Date().getFullYear()} YoBot® Command Center – Advanced AI Business Automation
  </footer>
);

// ✅ Functions
import {
  runLeadScraper,
  runVoiceStudio,
  runHubspotSync,
  runContentStudio,
  runTicketSubmit,
  runExportJob,
  runQuoteGenerator,
  runPdfUploader,
  runSmartCalendar,
} from '@/utils/function_library';

const QuickActionLaunchpad = () => {
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [modals, setModals] = useState({
    persona: false,
    alert: false,
    crm: false,
    audit: false,
    deal: false,
    diagnostics: false,
    ragSubmit: false,
    ragSync: false,
  });

  const openModal = (key) => setModals({ ...modals, [key]: true });
  const closeModal = (key) => setModals({ ...modals, [key]: false });

  return (
    <div className="launchpad-wrapper bg-black min-h-screen p-8 text-white">
      <div className="w-full flex justify-between items-center py-4 px-6 bg-[#1a1a1a] border-b-4 border-blue-500 rounded-t-3xl mb-6">
        <img src="/assets/Main YoBot Logo.png" alt="YoBot Logo" className="h-12" />
        <h1 className="text-3xl font-bold text-white">🤖 YoBot® Command Center</h1>
        <div className="text-sm text-gray-400">Total AI Control at Your Fingertips</div>
      </div>

      <div className="launchpad-container bg-gradient-to-br from-[#c3c3c3] to-[#ffffff] border-[6px] border-blue-500 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-black mb-4">🚀 Quick Action Launchpad</h3>
        <div className="launchpad-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard title="📞 Start Pipeline Calls" onClick={() => runSmartCalendar('pipeline')} />
          <QuickActionCard title="📲 Manual Call" onClick={() => runSmartCalendar('manual')} />
          <QuickActionCard title="🔍 Lead Scraper" onClick={runLeadScraper} />
          <QuickActionCard title="📝 Content Creator" onClick={runContentStudio} />
          <QuickActionCard title="📊 KPI Reports" onClick={runExportJob} />
          <QuickActionCard title="📤 PDF Upload" onClick={runPdfUploader} />
          <QuickActionCard title="🎫 Submit Ticket" onClick={runTicketSubmit} />
          <QuickActionCard title="📧 Mailchimp" onClick={() => window.open('https://mailchimp.com', '_blank')} />
          <QuickActionCard title="🔗 HubSpot CRM" onClick={() => window.open('https://app.hubspot.com', '_blank')} />
          <QuickActionCard title="🔐 Admin" onClick={() => setAdminModalOpen(true)} />
          <QuickActionCard title="🧪 Diagnostics" onClick={() => openModal('diagnostics')} />
          <QuickActionCard title="⚙️ Settings" onClick={() => openModal('audit')} />
        </div>
      </div>

      <div className="text-center my-8">
        <button onClick={() => setShowAdvancedTools(!showAdvancedTools)} className="text-lg font-bold py-2 px-4 rounded-xl bg-gradient-to-r from-gray-500 to-gray-300 text-black shadow-md border-[3px] border-blue-500">
          {showAdvancedTools ? '🧰 Hide Advanced Tools' : '🧰 Show Advanced Tools'}
        </button>
      </div>

      {showAdvancedTools && <AdvancedToolsDrawer modals={modals} openModal={openModal} closeModal={closeModal} />}

      <div className="feature-panels space-y-12 mt-12">
        <SmartCalendar />
        <VoiceStudio />
        <RAGKnowledgePanel />

        <div className="bg-[#1a1a1a] border-[6px] border-blue-500 rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">📊 Analytics Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-3xl p-4 bg-gradient-to-tr from-[#878787] to-[#d1d1d1] border-[4px] border-blue-500 shadow-xl">
              <SmartSpendCard />
            </div>
            <div className="rounded-3xl p-4 bg-gradient-to-tr from-[#0d82da] to-[#053d74] border-[4px] border-blue-500 shadow-xl">
              <BotalyticsCard />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <VoicePerformanceCard />
            <SentimentCard />
            <RepScorecardCard />
            <LeadQualifierCard />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <CallsCompletedCard />
            <ContactRatioCard />
            <DealsClosedCard />
            <FollowUpTrackerCard />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SmartCalendarCard />
            <PDFGeneratorCard />
            <MonthlyRevenueCard />
            <StripeRevenueCard />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <QuickBooksSyncCard />
            <CRMSyncCard />
            <ComplianceCheckerCard />
            <LoggerIntegrityCard />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <RAGInsightCard />
            <SlackAlertsCard />
            <TicketReviewCard />
            <ABTestCard />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <PersonalityPackCard />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <PredictiveAnalyticsCard />
      </div>

      <SuggestionsPushCard
        onPush={() => {
          fetch('/api/suggestions-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trigger: 'manual' }),
          })
            .then(res => {
              if (!res.ok) throw new Error('Failed to push suggestions');
              console.log('✅ Suggestions pushed to Slack');
            })
            .catch(err => {
              console.error('❌ Slack push failed:', err);
              fetch('https://hooks.slack.com/services/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', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: `🚨 Suggestions Push failed in Command Center: ${err.message}`,
                }),
              });
            });
        }}
  />


      <SecurityGuardCard
        onToggle={(enabled: boolean) => {
          fetch('/api/security-guard-toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled }),
          })
            .then(res => {
              if (!res.ok) throw new Error('Failed to toggle Security Guard Mode');
            console.log(`🛡 Security Guard toggled ${enabled ? 'ON' : 'OFF'}`);
          })
            .catch(err => {
            console.error('❌ Security toggle failed:', err);
            fetch('https://hooks.slack.com/services/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', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: `🚨 Security Guard toggle failed: ${err.message}`,
              }),
            });
          });
      }}
    />

      
      <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setAdminModalOpen(false)} />
      <SmartCalendarModal isOpen={isCalendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
      <PersonaTrainerModal isOpen={modals.persona} onClose={() => closeModal('persona')} />
      <AlertCenterModal isOpen={modals.alert} onClose={() => closeModal('alert')} />
      <CRMHealthCheckModal isOpen={modals.crm} onClose={() => closeModal('crm')} />
      <BotAuditModal isOpen={modals.audit} onClose={() => closeModal('audit')} />
      <DealTriggerModal isOpen={modals.deal} onClose={() => closeModal('deal')} />
      <SystemDiagnosticsModal isOpen={modals.diagnostics} onClose={() => closeModal('diagnostics')} />
      <SubmitRAGModal isOpen={modals.ragSubmit} onClose={() => closeModal('ragSubmit')} />
      <SyncRAGModal isOpen={modals.ragSync} onClose={() => closeModal('ragSync')} />

      <Footer />
    </div>
  );
};

export default QuickActionLaunchpad;


// ... (above imports and components remain unchanged)

import { useEffect } from 'react';

// ... (above imports and components remain unchanged)

import { useEffect } from 'react';

// ✅ Runtime Data Fetch + Slack Sync (Inline)
const fetchCardDataAndSyncToSlack = async (cardId) => {
  try {
    const res = await fetch(`/api/cards/${cardId}`);
    const data = await res.json();

    if (data?.status === 'error') {
      await fetch("https://hooks.slack.com/services/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", {
        method: "POST",
        body: JSON.stringify({
          text: `🔴 ${cardId} sync failed: ${data?.message || 'Unknown error'}`,
        }),
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    await fetch("https://hooks.slack.com/services/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", {
      method: "POST",
      body: JSON.stringify({
        text: `🔴 ${cardId} sync exception: ${err?.message}`,
      }),
      headers: { "Content-Type": "application/json" },
    });
  }
};

// 📊 Analytics Dashboard
const AnalyticsDashboard = () => {
  useEffect(() => {
    const cardIds = [
      'VoicePerformanceCard', 'SentimentCard', 'RepScorecardCard', 'CallsCompletedCard', 'ContactRatioCard', 'LeadQualifierCard',
      'MissedCallLogCard', 'VoiceTrainingCard', 'RAGInsightCard', 'SelfHealingCard', 'CustomerJourneyOrchestrationCard',
      'PersonalityPackCard', 'SlackAlertsCard', 'ABTestCard', 'TicketReviewCard', 'SuggestionsPushCard', 'PredictiveAnalyticsCard',
      'ClientAcquisitionCard', 'DealsClosedCard', 'FollowUpTrackerCard', 'KPIReportingCard', 'ROITrackingCard', 'SmartCalendarCard',
      'ExportHistoryCard', 'FileUploadCard', 'BookingToolCard', 'SmartSpendCard', 'StripeRevenueCard', 'MonthlyRevenueCard',
      'QuickBooksSyncCard', 'PDFGeneratorCard', 'CRMSyncCard', 'ComplianceCheckerCard', 'LoggerIntegrityCard', 'Dynamics365SyncCard',
      'ContentStudioCard', 'PodcastGeneratorCard', 'InternalSecurityCard', 'DiagnosticsCard', 'AdminControlCard', 'ModeToggleCard',
      'SecurityGuardCard', 'ClientSplitterCard', 'AddOnManagerCard', 'KPIExportCard', 'ThemeLoaderCard'
    ];
    cardIds.forEach(id => fetchCardDataAndSyncToSlack(id));
  }, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 px-6">

      {/* 🔊 VoiceBot Performance */}
      <VoicePerformanceCard />
      <SentimentCard />
      <RepScorecardCard />
      <CallsCompletedCard />
      <ContactRatioCard />
      <LeadQualifierCard />
      <MissedCallLogCard />
      <VoiceTrainingCard />

      {/* 🧠 AI Logic + Learning */}
      <RAGInsightCard />
      <SelfHealingCard />
      <CustomerJourneyOrchestrationCard />
      <PersonalityPackCard />
      <SlackAlertsCard />
      <ABTestCard />
      <TicketReviewCard />
      <SuggestionsPushCard />

      {/* 🚀 Lead & Sales Intelligence */}
      <PredictiveAnalyticsCard />
      <ClientAcquisitionCard />
      <DealsClosedCard />
      <FollowUpTrackerCard />
      <KPIReportingCard />
      <ROITrackingCard />

      {/* 📅 Scheduling & Engagement */}
      <SmartCalendarCard />
      <ExportHistoryCard />
      <FileUploadCard />
      <BookingToolCard />

      {/* 💸 Revenue & Accounting */}
      <SmartSpendCard />
      <StripeRevenueCard />
      <MonthlyRevenueCard />
      <QuickBooksSyncCard />
      <PDFGeneratorCard />

      {/* 🧩 Integration & Sync */}
      <CRMSyncCard />
      <ComplianceCheckerCard />
      <LoggerIntegrityCard />
      <Dynamics365SyncCard />

      {/* 🎨 Content & Brand */}
      <ContentStudioCard />
      <PodcastGeneratorCard />

      {/* 🔐 Security & Admin */}
      <InternalSecurityCard />
      <DiagnosticsCard />
      <AdminControlCard />
      <ModeToggleCard />

      {/* ➕ Add-On Modules */}
      <SecurityGuardCard />
      <ClientSplitterCard />
      <AddOnManagerCard />
      <KPIExportCard />
      <ThemeLoaderCard />

    </section>
  );
};

// ✅ Footer Component
const Footer = () => (
  <footer className="mt-20 text-center text-sm text-gray-400 border-t border-gray-600 pt-6">
    © {new Date().getFullYear()} YoBot® Command Center – Advanced AI Business Automation
  </footer>
);

// ✅ Main Component
const CommandCenter = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <QuickActionCard />
      <AdvancedToolsDrawer />
      <AnalyticsDashboard />
      <Footer />
    </div>
  );
};

export default CommandCenter;
