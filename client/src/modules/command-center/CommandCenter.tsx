import React, { useEffect, useState } from 'react';
import QuickActionCard from '@/components/ui/cards/QuickActionCard';
import SmartSpendCard from '@/components/ui/cards/SmartSpendCard';
import BotalyticsCard from '@/components/ui/cards/BotalyticsCard';
import KPIAnalyticsCard from '@/components/ui/cards/KPIAnalyticsCard';
import TopNavBar from '@/components/nav/TopNavBar';
import AIAgentOverlay from '@/components/ui/cards/AIAvatarOverlayCard';
import SupportChatWidget from '@/components/ui/cards/SupportChatWidget';

// Modal imports
import LeadScraperModal from '@/components/modals/LeadScraperModal';
import VoiceStudioModal from '@/components/modals/VoiceStudioModal';
import { CalendarModal } from '@/components/modals/CalendarModal';
import { SmartQuotingModal } from '@/components/modals/SmartQuotingModal';
import { ContentCreatorModal } from '@/components/modals/ContentCreatorModal';
import { SubmitTicketModal } from '@/components/modals/SubmitTicketModal';
import { ExportModal } from '@/components/modals/ExportModal';
import { HubspotModal } from '@/components/modals/HubspotModal';
import { AdminPanelModal } from '@/components/modals/AdminPanelModal';
import AdminLoginModal from '@/components/modals/AdminLoginModal';
import { DiagnosticsModal } from '@/components/modals/DiagnosticsModal';
import { EmergencyModal } from '@/components/modals/EmergencyModal';
import { SalesOrderModal } from '@/components/modals/SalesOrderModal';
import { CopilotModal } from '@/components/modals/CopilotModal';
import PdfUploadModal from '@/components/modals/PdfUploadModal';
import { CallQueueModal } from '@/components/modals/CallQueueModal';
import { AirtableSyncModal } from '@/components/modals/AirtableSyncModal';
import { LoggerTrackerModal } from '@/components/modals/LoggerTrackerModal';
import { MetricsPanelModal } from '@/components/modals/MetricsPanelModal';
import { BehaviorTuningModal } from '@/components/modals/BehaviorTuningModal';
import RAGModal from '@/components/modals/RAGModal';
import { RevenueChartsModal } from '@/components/modals/RevenueChartsModal';
import { SlackMonitorModal } from '@/components/modals/SlackMonitorModal';
import { AdminSettingsModal } from '@/components/modals/AdminSettingsModal';
import { SmartSchedulerModal } from '@/components/modals/SmartSchedulerModal';

// Styles
import '@/styles/CommandCenter.css';
import '@/styles/NeonTheme.css';
import '@/styles/StyledComponents.css';

// Function library
import {
  fetchLeadsFromApollo,
  openVoiceStudio,
  getUpcomingCalendarEvents,
  generateQuotePDF,
  runContentCreation,
  submitSupportTicket,
  syncHubSpotContacts,
  exportAllData,
  syncCalendarToAirtable,
  createVoiceStudioRecord,
  submitQuoteToAirtable,
  submitContentPost,
  submitTicketToAirtable,
  syncContactsToCRM,
  pushExportToDrive,
  logEvent,
  toggleFeature,
  submitPdfUploadToAirtable,
  submitRagQueryToAirtable,
  syncRagArticles,
  runSystemDiagnostics,
  triggerEmergencyProtocol,
  submitSalesOrderToQBO,
  syncQuickBooksInvoices,
  postToMailchimp,
  openMailchimpPage,
  openHubSpotPage,
  triggerSocialPoster,
  fetchSmartSpendStats,
  fetchBotalyticsStats
} from '@/server/function_library';

const neonColors = ['#FFFF33', '#39FF14', '#FF6EC7', '#DA70D6', '#FFA500'];

const kpiGroups = [
  {
    title: '📟 Bot Operations',
    kpis: ['🎙️ Avg. Call Duration', '🔁 Retry Rate', '❌ Call Failures', '🧠 NLP Accuracy', '🤖 Bot Uptime']
  },
  {
    title: '⚙️ Automation Health',
    kpis: ['⚠️ Error Rate', '🔁 Scenario Repeats', '🔍 Logs Reviewed', '📦 Modules Triggered', '⏱️ Avg. Flow Runtime']
  },
  {
    title: '🧰 Support Performance',
    kpis: ['🕒 Avg. Resolution Time', '🎫 Tickets Received', '✅ Tickets Closed', '💬 Client NPS', '👀 Escalations']
  },
  {
    title: '🔐 Security & Compliance',
    kpis: ['🔐 Data Integrity Score', '🧾 Compliance Tasks Done', '🔍 Logger Tamper Rate', '🚨 Last Breach Flag', '✅ Checklist Pass %']
  },
  {
    title: '📦 Client Lifecycle',
    kpis: ['📥 New Clients This Month', '🧾 Completed Onboardings', '🗓️ Avg. Days to Launch', '🔄 Renewals Closed', '📉 Inactive Accounts']
  },
  {
    title: '📊 Core KPIs',
    kpis: ['💰 Cost Per Lead', '🚀 ROI', '🎯 Close Rate', '📈 Learning Rate']
  },
  {
    title: '📡 Smart Metrics',
    kpis: ['🧠 SmartSpend™', '📊 Botalytics™', '📞 Calls Completed', '😄 Sentiment Score']
  },
  {
    title: '📈 Sales Ops',
    kpis: ['🔁 Trial Conversion Rate', '💬 AI Suggestions Used', '📦 Top Package', '📤 Email CTR']
  },
  {
    title: '🧲 Funnel & Automation',
    kpis: ['🧲 Lead Source ROI', '⏳ First Response Time', '🕹️ Automation Success', '🕵️‍♂️ Flagged Logs']
  },
  {
    title: '📋 Task & Revenue',
    kpis: ['🎯 Tasks Completed', '⏱️ Open Tasks', '🧾 Quotes Generated', '💳 Payments Collected']
  },
  {
    title: '📉 Retention',
    kpis: ['📉 Churn Risk']
  }
];

export default function CommandCenter() {
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [smartSpendStats, setSmartSpendStats] = useState(null);
  const [botalyticsStats, setBotalyticsStats] = useState(null);

  const userEmail = liveMode ? 'tyson@yobot.bot' : 'daniel@yobot.bot';
  const leadId = liveMode ? 'recD9aF6vqpUOCnA4' : 'recDbWmthkHtNZkld';
  const mode = liveMode ? 'LIVE' : 'TEST';

  const openModal = async (modalName: string, label: string) => {
    setSelectedModal(modalName);
    await logEvent({ module: label, trigger: 'Command Center', mode });

    switch (modalName) {
      case 'pipeline':
        console.log('Opening Pipeline Calls');
        break;
      case 'manual':
        console.log('Opening Manual Call');
        break;
      case 'leadScraper':
        await fetchLeadsFromApollo(userEmail);
        break;
      case 'voiceStudio':
        await openVoiceStudio();
        await createVoiceStudioRecord(userEmail, mode);
        break;
      case 'calendar':
        await getUpcomingCalendarEvents(userEmail);
        await syncCalendarToAirtable(userEmail, mode);
        break;
      case 'quoting':
        await generateQuotePDF(leadId);
        await submitQuoteToAirtable(leadId, mode);
        break;
      case 'contentCreator':
        await runContentCreation();
        await submitContentPost(userEmail, mode);
        break;
      case 'ticket':
        await submitSupportTicket({ email: userEmail, message: `Submitted from ${mode} Command Center` });
        await submitTicketToAirtable(userEmail, mode);
        break;
      case 'hubspot':
        await syncHubSpotContacts();
        await syncContactsToCRM();
        await openHubSpotPage();
        break;
      case 'mailchimp':
        await postToMailchimp(userEmail);
        await openMailchimpPage();
        break;
      case 'export':
        await exportAllData();
        await pushExportToDrive(mode);
        break;
      case 'admin':
        await toggleFeature('maintenance_mode', true);
        break;
      case 'pdf':
        await submitPdfUploadToAirtable(userEmail, mode);
        break;
      case 'rag':
        await submitRagQueryToAirtable();
        await syncRagArticles();
        break;
      case 'diagnostics':
        await runSystemDiagnostics();
        break;
      case 'emergency':
        await triggerEmergencyProtocol();
        break;
      case 'salesOrder':
        await submitSalesOrderToQBO(userEmail, mode);
        await syncQuickBooksInvoices(userEmail);
        break;
      case 'socialPoster':
        await triggerSocialPoster(userEmail);
        break;
      case 'adminSettings':
        console.log('Opening Admin Settings');
        break;
      case 'airtableSync':
        console.log('Opening Airtable Sync Log');
        break;
      case 'behaviorTuning':
        console.log('Opening Bot Behavior Tuning');
        break;
      case 'callQueue':
        console.log('Opening Live Call Queue');
        break;
      case 'copilot':
        console.log('Opening Copilot Assistant');
        break;
      case 'loggerTracker':
        console.log('Opening Logger Tracker');
        break;
      case 'metricsPanel':
        console.log('Opening Metrics Panel');
        break;
      case 'ragInsights':
        console.log('Opening RAG Article Insights');
        break;
      case 'revenueCharts':
        console.log('Opening Live Revenue Charts');
        break;
      case 'slackMonitor':
        console.log('Opening Slack Monitor');
        break;
      case 'smartScheduler':
        console.log('Opening Smart Scheduler');
        break;
      case 'auditLog':
        console.log('Opening Audit Log');
        break;
      case 'slackTest':
        console.log('Opening Slack Test Ping');
        break;
      case 'adminLogin':
        console.log('Opening Admin Login');
        break;
      default:
        console.log(`Processing modal: ${modalName}`);
        break;
    }
  };

  const closeModal = () => setSelectedModal(null);

  useEffect(() => {
    const loadStats = async () => {
      const smartStats = await fetchSmartSpendStats();
      const botaStats = await fetchBotalyticsStats();
      setSmartSpendStats(smartStats);
      setBotalyticsStats(botaStats);
    };

    loadStats();
  }, []);

  useEffect(() => {
    document.title = 'YoBot® Command Center';
  }, []);

  return (
    <div className="command-center-container">
      <TopNavBar />
      <AIAgentOverlay />
      <SupportChatWidget />

      <h1 className="dashboard-title neon-text">🤖 YoBot® Command Center</h1>

      <div className="mode-toggle">
        <label>
          <input type="checkbox" checked={liveMode} onChange={() => setLiveMode(!liveMode)} />
          {liveMode ? 'LIVE MODE' : 'TEST MODE'}
        </label>
      </div>

      <div className="quick-action-launchpad">
        <QuickActionCard label="📞 Pipeline Calls" onClick={() => openModal('pipeline', '📞 Pipeline Calls')} />
        <QuickActionCard label="☎️ Manual Call" onClick={() => openModal('manual', '☎️ Manual Call')} />
        <QuickActionCard label="🔍 Lead Scraper" onClick={() => openModal('leadScraper', '🔍 Lead Scraper')} />
        <QuickActionCard label="🧾 Sales Order" onClick={() => openModal('salesOrder', '🧾 Sales Order')} />
        <QuickActionCard label="🎨 Content Creator" onClick={() => openModal('contentCreator', '🎨 Content Creator')} />
        <QuickActionCard label="📆 SmartCalendar" onClick={() => openModal('calendar', '📆 SmartCalendar')} />
        <QuickActionCard label="🎫 Submit Ticket" onClick={() => openModal('ticket', '🎫 Submit Ticket')} />
        <QuickActionCard label="🤖 Smart Quoting" onClick={() => openModal('quoting', '🤖 Smart Quoting')} />
        <QuickActionCard label="📊 Generate Report" onClick={() => openModal('export', '📊 Generate Report')} />
        <QuickActionCard label={showAdvancedTools ? '🧰 Hide Tools' : '🧰 Advanced Tools'} onClick={() => setShowAdvancedTools(!showAdvancedTools)} />
      </div>

      {showAdvancedTools && (
        <div className="advanced-tools-drawer">
          <QuickActionCard label="📎 PDF Upload" onClick={() => openModal('pdf', '📎 PDF Upload')} />
          <QuickActionCard label="📚 Knowledge" onClick={() => openModal('rag', '📚 Knowledge')} />
          <QuickActionCard label="❤️‍🔥 Diagnostics" onClick={() => openModal('diagnostics', '❤️‍🔥 Diagnostics')} />
          <QuickActionCard label="🚨 Emergency" onClick={() => openModal('emergency', '🚨 Emergency')} />
          <QuickActionCard label="🎙️ Voice Studio" onClick={() => openModal('voiceStudio', '🎙️ Voice Studio')} />
          <QuickActionCard label="📬 Mailchimp" onClick={() => openModal('mailchimp', '📬 Mailchimp')} />
          <QuickActionCard label="🔗 HubSpot" onClick={() => openModal('hubspot', '🔗 HubSpot')} />
          <QuickActionCard label="📣 Social Poster" onClick={() => openModal('socialPoster', '📣 Social Poster')} />
          <QuickActionCard label="🧠 Copilot Assistant" onClick={() => openModal('copilot', '🧠 Copilot Assistant')} />
          <QuickActionCard label="📞 Live Call Queue" onClick={() => openModal('callQueue', '📞 Live Call Queue')} />
          <QuickActionCard label="📤 Airtable Sync Log" onClick={() => openModal('airtableSync', '📤 Airtable Sync Log')} />
          <QuickActionCard label="🧾 Logger Tracker" onClick={() => openModal('loggerTracker', '🧾 Logger Tracker')} />
          <QuickActionCard label="📍 Metrics Panel" onClick={() => openModal('metricsPanel', '📍 Metrics Panel')} />
          <QuickActionCard label="🎯 Bot Behavior Tuning" onClick={() => openModal('behaviorTuning', '🎯 Bot Behavior Tuning')} />
          <QuickActionCard label="🔎 RAG Article Insights" onClick={() => openModal('ragInsights', '🔎 RAG Article Insights')} />
          <QuickActionCard label="📈 Live Revenue Charts" onClick={() => openModal('revenueCharts', '📈 Live Revenue Charts')} />
          <QuickActionCard label="💬 Slack Monitor" onClick={() => openModal('slackMonitor', '💬 Slack Monitor')} />
          <QuickActionCard label="🔧 Admin Settings" onClick={() => openModal('adminSettings', '🔧 Admin Settings')} />
        </div>
      )}

      <div className="analytics-dashboard-wrapper">
        <h2 className="analytics-heading">Analytics Dashboard</h2>
        <div className="analytics-dashboard">
          <div className="analytics-row">
            <SmartSpendCard stats={smartSpendStats} specialStyle="platinum" />
            <BotalyticsCard stats={botalyticsStats} specialStyle="gold" />
          </div>

          {kpiGroups.map((group, idx) => (
            <div key={idx} className="kpi-group">
              <h3 className="kpi-title neon-text">{group.title}</h3>
              <div className="kpi-row">
                {group.kpis.map((label, i) => (
                  <KPIAnalyticsCard
                    key={i}
                    label={label}
                    airtableField={label}
                    color={neonColors[Math.floor(Math.random() * neonColors.length)]}
                    showMeter={true}
                    meterThresholds={{ green: 75, yellow: 50, red: 25 }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 Predictive Analytics Section */}
      <div className="kpi-group">
        <h3 className="kpi-title neon-text">📈 Predictive Analytics</h3>
        <div className="kpi-row">
          <KPIAnalyticsCard
            label="📅 Revenue Forecast"
            airtableField="📅 Revenue Forecast"
            color="#FF6EC7"
            showMeter={true} 
            meterThresholds={{ green: 75, yellow: 50, red: 25 }}
          />
          <KPIAnalyticsCard
            label="📉 Projected Churn"
            airtableField="📉 Projected Churn"
            color="#DA70D6"
            showMeter={true} 
            meterThresholds={{ green: 75, yellow: 50, red: 25 }}
          />
          <KPIAnalyticsCard
            label="📈 Growth Trajectory"
            airtableField="📈 Growth Trajectory"
            color="#39FF14"
            showMeter={true} 
            meterThresholds={{ green: 75, yellow: 50, red: 25 }}
          />
          <KPIAnalyticsCard
            label="🧠 Behavior Forecast"
            airtableField="🧠 Behavior Forecast"
            color="#FFFF33"
            showMeter={true} 
            meterThresholds={{ green: 75, yellow: 50, red: 25 }}
          />
          <KPIAnalyticsCard
            label="🧲 AI Deal Prediction"
            airtableField="🧲 AI Deal Prediction"
            color="#0d82da"
            showMeter={true} 
            meterThresholds={{ green: 75, yellow: 50, red: 25 }}
          />
        </div>
      </div>

      {/* Modals */}
      {selectedModal === 'leadScraper' && <LeadScraperModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'voiceStudio' && <VoiceStudioModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'calendar' && <CalendarModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'quoting' && <SmartQuotingModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'contentCreator' && <ContentCreatorModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'ticket' && <SubmitTicketModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'hubspot' && <HubspotModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'export' && <ExportModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'admin' && <AdminPanelModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'pdf' && <PdfUploadModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'rag' && <RAGModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'diagnostics' && <DiagnosticsModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'emergency' && <EmergencyModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'salesOrder' && <SalesOrderModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'scheduler' && <SmartSchedulerModal isOpen={true} onClose={closeModal} title="Smart Scheduler" />}
      {selectedModal === 'copilot' && <CopilotModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'callQueue' && <CallQueueModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'airtableSync' && <AirtableSyncModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'loggerTracker' && <LoggerTrackerModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'ragInsights' && <RAGModal isOpen={true} onClose={closeModal} title="RAG Article Insights" />}
      {selectedModal === 'revenueCharts' && <RevenueChartsModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'slackMonitor' && <SlackMonitorModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'adminSettings' && <AdminSettingsModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'metricsPanel' && <MetricsPanelModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'behaviorTuning' && <BehaviorTuningModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'adminLogin' && <AdminLoginModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'auditLog' && <LoggerTrackerModal isOpen={true} onClose={closeModal} title="Audit Log" />}
      {selectedModal === 'slackTest' && <SlackMonitorModal isOpen={true} onClose={closeModal} title="Slack Test Ping" />}
      {selectedModal === 'mailchimp' && <HubspotModal isOpen={true} onClose={closeModal} title="Mailchimp Integration" />}
      {selectedModal === 'socialPoster' && <ContentCreatorModal isOpen={true} onClose={closeModal} title="Social Poster" />}
      {selectedModal === 'pipeline' && <CallQueueModal isOpen={true} onClose={closeModal} title="Pipeline Calls" />}
      {selectedModal === 'manual' && <CallQueueModal isOpen={true} onClose={closeModal} title="Manual Call" />}
    </div>
  );
}tion"
            color="#0d82da"
            showMeter={true} 
            meterThresholds={{ green: 75, yellow: 50, red: 25 }}
          />
        </div>
      </div>

      {/* Modals */}
      {selectedModal === 'leadScraper' && <LeadScraperModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'voiceStudio' && <VoiceStudioModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'calendar' && <CalendarModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'quoting' && <SmartQuotingModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'contentCreator' && <ContentCreatorModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'ticket' && <SubmitTicketModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'hubspot' && <HubspotModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'export' && <ExportModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'admin' && <AdminPanelModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'pdf' && <PdfUploadModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'rag' && <RAGModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'diagnostics' && <DiagnosticsModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'emergency' && <EmergencyModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'salesOrder' && <SalesOrderModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'scheduler' && <SmartSchedulerModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'copilot' && <CopilotModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'callQueue' && <CallQueueModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'airtableSync' && <AirtableSyncModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'loggerTracker' && <LoggerTrackerModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'ragInsights' && <RAGModal isOpen={true} onClose={closeModal} title="RAG Article Insights" />}
      {selectedModal === 'revenueCharts' && <RevenueChartsModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'slackMonitor' && <SlackMonitorModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'adminSettings' && <AdminSettingsModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'metricsPanel' && <MetricsPanelModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'behaviorTuning' && <BehaviorTuningModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'adminLogin' && <AdminLoginModal isOpen={true} onClose={closeModal} />}
      {selectedModal === 'auditLog' && <LoggerTrackerModal isOpen={true} onClose={closeModal} title="Audit Log" />}
      {selectedModal === 'slackTest' && <SlackMonitorModal isOpen={true} onClose={closeModal} title="Slack Test Ping" />}
      {selectedModal === 'mailchimp' && <HubspotModal isOpen={true} onClose={closeModal} title="Mailchimp Integration" />}
      {selectedModal === 'socialPoster' && <ContentCreatorModal isOpen={true} onClose={closeModal} title="Social Poster" />}
      {selectedModal === 'pipeline' && <CallQueueModal isOpen={true} onClose={closeModal} title="Pipeline Calls" />}
      {selectedModal === 'manual' && <CallQueueModal isOpen={true} onClose={closeModal} title="Manual Call" />}
    </div>
  );
}