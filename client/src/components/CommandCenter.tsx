// Core Modal Imports
import { CustomerProfileModal } from '@/components/modals/CustomerProfileModal';
import { PipelineStatusModal } from '@/components/modals/PipelineStatusModal';
import { VersionControlModal } from '@/components/modals/VersionControlModal';
import { FormConfiguratorModal } from '@/components/modals/FormConfiguratorModal';
import { MetricsPanelModal } from '@/components/modals/MetricsPanelModal';
import { AuditLogModal } from '@/components/modals/AuditLogModal';

// Additional Modal Imports
import { LeadScraperModal } from '@/components/modals/LeadScraperModal';
import VoiceStudioModal from '@/components/modals/VoiceStudioModal';
import { CalendarModal } from '@/components/modals/CalendarModal';
import { SmartQuotingModal } from '@/components/modals/SmartQuotingModal';
import { ContentCreatorModal } from '@/components/modals/ContentCreatorModal';
import SubmitTicketModal from '@/components/modals/SubmitTicketModal';
import { ExportModal } from '@/components/modals/ExportModal';
import { HubspotModal } from '@/components/modals/HubspotModal';
import { AdminPanelModal } from '@/components/modals/AdminPanelModal';
import AdminLoginModal from '@/components/modals/AdminLoginModal';
import { DiagnosticsModal } from '@/components/modals/DiagnosticsModal';
import { EmergencyModal } from '@/components/modals/EmergencyModal';
import { SalesOrderModal } from '@/components/modals/SalesOrderModal';
import { CopilotModal } from '@/components/modals/CopilotModal';
import { PDFUploadModal } from '@/components/modals/PdfUploadModal';
import { CallQueueModal } from '@/components/modals/CallQueueModal';
import { AirtableSyncModal } from '@/components/modals/AirtableSyncModal';
import { LoggerTrackerModal } from '@/components/modals/LoggerTrackerModal';
import { BehaviorTuningModal } from '@/components/modals/BehaviorTuningModal';
import { RAGModal } from '@/components/modals/RagModal';
import { RAGInsightsModal } from '@/components/modals/RAGInsightsModal';
import { RevenueChartsModal } from '@/components/modals/RevenueChartsModal';
import { SlackMonitorModal } from '@/components/modals/SlackMonitorModal';
import { AdminSettingsModal } from '@/components/modals/AdminSettingsModal';
import { SmartSchedulerModal } from '@/components/modals/SmartSchedulerModal';

// UI Components
import QuickActionCard from '@/components/ui/cards/QuickActionCard';
import KPIAnalyticsCard from '@/components/ui/cards/KPIAnalyticsCard';
import SmartSpendCard from '@/components/ui/cards/SmartSpendCard';
import BotalyticsCard from '@/components/ui/cards/BotalyticsCard';
import AIAvatarOverlay from '@/components/ui/cards/AIAvatarOverlayCard';
import SupportChatWidget from '@/components/widgets/SupportChatWidget';
import TopNavBar from '@/components/nav/TopNavBar';

import { useEffect, useState } from 'react';
import '@/styles/CommandCenter.css';
import '@/styles/NeonTheme.css';
import '@/styles/StyledComponents.css';

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
  fetchCustomerProfiles,
  fetchPipelineStatus,
  fetchVersionData,
  fetchMetrics,
  fetchAuditLogs
} from '@/utils/function_library';

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
  }
];

export default function CommandCenter() {
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  
  const userEmail = liveMode ? 'tyson@yobot.bot' : 'daniel@yobot.bot';
  const leadId = liveMode ? 'recD9aF6vqpUOCnA4' : 'recDbWmthkHtNZkld';
  const mode = liveMode ? 'LIVE' : 'TEST';

  const openModal = async (modalName: string, label: string) => {
    setSelectedModal(modalName);
    await logEvent({ module: label, trigger: 'Command Center', mode });

    switch (modalName) {
      // Core modules
      case 'customerProfile':
        await fetchCustomerProfiles();
        break;
      case 'pipelineStatus':
        await fetchPipelineStatus();
        break;
      case 'versionControl':
        await fetchVersionData();
        break;
      case 'formConfigurator':
        break;
      case 'metricsPanel':
        await fetchMetrics();
        break;
      case 'auditLog':
        await fetchAuditLogs();
        break;
      
      // Additional modules
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
        break;
      case 'airtableSync':
        break;
      case 'behaviorTuning':
        break;
      case 'callQueue':
        break;
      case 'copilot':
        break;
      case 'loggerTracker':
        break;
      case 'ragInsights':
        break;
      case 'revenueCharts':
        break;
      case 'slackMonitor':
        break;
      case 'smartScheduler':
        break;
    }
  }

  const closeModal = () => setSelectedModal(null);

  useEffect(() => {
    document.title = 'YoBot® Command Center';
    setSelectedModal(null);
  }, []);

  return (
    <div className="command-center-container">
      <div className="fixed top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-sm border-b border-[#0d82da]/30">
        <TopNavBar />
      </div>
      
      <div className="fixed top-20 right-4 z-20 floating-avatar">
        <AIAvatarOverlay />
      </div>
      
      <div className="fixed bottom-4 right-4 z-30 floating-chat">
        <SupportChatWidget />
      </div>

      <div className="pt-16">
        <h1 className="dashboard-title neon-text">🤖 YoBot® Command Center</h1>

        <div className="mode-toggle">
          <label>
            <input type="checkbox" checked={liveMode} onChange={() => setLiveMode(!liveMode)} />
            {liveMode ? 'LIVE MODE' : 'TEST MODE'}
          </label>
        </div>

        {/* Core Modules Section */}
        <div className="section-header">
          <h2 className="section-title">🔧 Core Modules</h2>
        </div>
        <div className="quick-action-grid">
          <QuickActionCard label="👤 Customer Profiles" onClick={() => openModal('customerProfile', '👤 Customer Profiles')} />
          <QuickActionCard label="📊 Pipeline Status" onClick={() => openModal('pipelineStatus', '📊 Pipeline Status')} />
          <QuickActionCard label="🔄 Version Control" onClick={() => openModal('versionControl', '🔄 Version Control')} />
          <QuickActionCard label="📝 Form Configurator" onClick={() => openModal('formConfigurator', '📝 Form Configurator')} />
          <QuickActionCard label="📈 Metrics Panel" onClick={() => openModal('metricsPanel', '📈 Metrics Panel')} />
          <QuickActionCard label="🔍 Audit Logs" onClick={() => openModal('auditLog', '🔍 Audit Logs')} />
        </div>

        {/* Operations Tools Section */}
        <div className="section-header">
          <h2 className="section-title">🛠️ Operations Tools</h2>
        </div>
        <div className="quick-action-grid">
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
          </div>
        )}

        {/* Real-Time Metrics Dashboard */}
        <div className="section-header">
          <h2 className="section-title">📊 Real-Time Metrics</h2>
        </div>
        <div className="analytics-dashboard-wrapper">
          <div className="analytics-dashboard">
            <div className="analytics-row">
              <SmartSpendCard />
              <BotalyticsCard />
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

        {/* Core Module Modals */}
        {selectedModal === 'customerProfile' && <CustomerProfileModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'pipelineStatus' && <PipelineStatusModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'versionControl' && <VersionControlModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'formConfigurator' && <FormConfiguratorModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'metricsPanel' && <MetricsPanelModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'auditLog' && <AuditLogModal isOpen={true} onClose={closeModal} />}
        
        {/* Additional Modals */}
        {selectedModal === 'leadScraper' && <LeadScraperModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'voiceStudio' && <VoiceStudioModal onClose={closeModal} />}
        {selectedModal === 'calendar' && <CalendarModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'quoting' && <SmartQuotingModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'contentCreator' && <ContentCreatorModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'ticket' && <SubmitTicketModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'hubspot' && <HubspotModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'export' && <ExportModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'admin' && <AdminPanelModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'pdf' && <PDFUploadModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'rag' && <RAGModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'diagnostics' && <DiagnosticsModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'emergency' && <EmergencyModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'salesOrder' && <SalesOrderModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'scheduler' && <SmartSchedulerModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'copilot' && <CopilotModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'callQueue' && <CallQueueModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'airtableSync' && <AirtableSyncModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'loggerTracker' && <LoggerTrackerModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'behaviorTuning' && <BehaviorTuningModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'ragInsights' && <RAGInsightsModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'revenueCharts' && <RevenueChartsModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'slackMonitor' && <SlackMonitorModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'adminSettings' && <AdminSettingsModal isOpen={true} onClose={closeModal} />}
        {selectedModal === 'adminLogin' && <AdminLoginModal isOpen={true} onClose={closeModal} />}
      </div>
    </div>
  );
}