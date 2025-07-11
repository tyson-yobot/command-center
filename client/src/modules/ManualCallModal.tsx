import React, { useEffect, useState } from 'react';
import '@/styles/CommandCenter.css';
import LeadScraperModal from '@/components/modals/LeadScraperModal';
import VoiceStudioModal from '@/components/modals/VoiceStudioModal';
import CalendarModal from '@/components/modals/CalendarModal';
import SmartQuotingModal from '@/components/modals/SmartQuotingModal';
import ContentCreatorModal from '@/components/modals/ContentCreatorModal';
import SubmitTicketModal from '@/components/modals/SubmitTicketModal';
import HubspotModal from '@/components/modals/HubspotModal';
import ExportModal from '@/components/modals/ExportModal';
import AdminPanelModal from '@/components/modals/AdminPanelModal';
import RagModal from '@/components/modals/RagModal';
import DiagnosticsModal from '@/components/modals/DiagnosticsModal';
import EmergencyModal from '@/components/modals/EmergencyModal';
import PdfUploadModal from '@/components/modals/PdfUploadModal';
import QuickActionCard from '@/components/cards/QuickActionCard';
import KPIAnalyticsCard from '@/components/cards/KPIAnalyticsCard';
import SmartSpendCard from '@/components/cards/SmartSpendCard';
import BotalyticsCard from '@/components/cards/BotalyticsCard';
import axios from 'axios';
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
  sendSlackAlert,
  toggleFeature
} from '@/utils/function_library';

const neonColors = ['#FFFF33', '#39FF14', '#FF6EC7', '#DA70D6', '#FFA500'];

export default function CommandCenter() {
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [liveMode, setLiveMode] = useState(true);

  const userEmail = liveMode ? 'yobot@yobot.bot' : 'test@yobot.bot';
  const leadId = liveMode ? 'live-lead-id' : 'test-lead-id';
  const mode = liveMode ? 'LIVE' : 'TEST';

  const openModal = async (modalName: string, label: string) => {
    setSelectedModal(modalName);
    await sendSlackAlert(`${label} launched from Command Center [${mode}]`);
    await logEvent({ module: label, trigger: 'Command Center', mode });

    switch (modalName) {
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
        break;
      case 'export':
        await exportAllData();
        await pushExportToDrive(mode);
        break;
      case 'admin':
        await toggleFeature('maintenance_mode', true);
        break;
    }
  };

  const closeModal = () => setSelectedModal(null);

  useEffect(() => {
    document.title = 'YoBot® Command Center';
  }, []);

  const kpiGroups = [
    {
      title: '📈 Revenue + Financials',
      kpis: ['Monthly Revenue', 'MRR (Recurring)', 'One-Time Payments', 'Open Invoices', 'Refunds Issued']
    },
    {
      title: '🧲 Lead Generation',
      kpis: ['Leads Captured (7 days)', 'Web Scraper Leads', 'VoiceBot Leads', 'Verified Leads %', 'New Sources Added']
    },
    {
      title: '🔄 Conversion Performance',
      kpis: ['Conversion Rate %', 'Leads → Deals Closed', 'Abandoned Leads', 'Average Time to Close', 'New Deals This Week']
    },
    {
      title: '📞 Call Performance',
      kpis: ['Calls Made', 'Manual vs Bot Ratio', 'Avg Call Duration', 'Calls per Rep', 'Dropped Calls %']
    },
    {
      title: '🎯 Bot Effectiveness',
      kpis: ['Bot Engagements', '% Tasks Auto-Handled', 'VoiceBot Uptime %', 'Avg Bot Response Time', 'Escalations Prevented']
    },
    {
      title: '✅ Task + Project Tracking',
      kpis: ['Tasks Completed', 'Tasks Overdue', 'Active Projects', '% On-Time Delivery', 'Total Assigned Tasks']
    },
    {
      title: '🤝 Client Management',
      kpis: ['Active Clients', 'Renewals Sent', 'Upsells Closed', 'Client Satisfaction %', 'CRM Sync Errors']
    },
    {
      title: '📝 Quote Engine Stats',
      kpis: ['Quotes Sent', 'Avg Quote Value', 'Quotes Accepted', 'Quote-to-Close Rate', 'Smart Quote Time Saved']
    },
    {
      title: '📤 PDF + Upload Insights',
      kpis: ['PDFs Sent', 'File Uploads Logged', 'Avg PDF Size', 'Failed Uploads', 'Upload Time Trend']
    },
    {
      title: '🎫 Support + Tickets',
      kpis: ['Tickets Open', 'Avg Response Time', 'Ticket Resolved %', 'Bot-Auto Resolved', 'Escalations This Week']
    },
    {
      title: '😠 Sentiment + Escalations',
      kpis: ['Positive Sentiment %', 'Negative Calls', 'Alerts Triggered', 'Red Flags Count', 'Escalation Resolution Time']
    },
    {
      title: '🧠 AI Training + Usage',
      kpis: ['RAG Queries Run', 'RAG Accuracy %', 'Suggested Actions Used', 'Knowledge Articles Added', 'Smart Calendar Usage %']
    }
  ];

  return (
    <div className="command-center-wrapper">
      <h1 className="dashboard-title">🤖 YoBot® Command Center</h1>

      <div className="mode-toggle">
        <label>
          <input type="checkbox" checked={liveMode} onChange={() => setLiveMode(!liveMode)} />
          {liveMode ? 'LIVE MODE' : 'TEST MODE'}
        </label>
      </div>

      <div className="quick-action-launchpad">
        <QuickActionCard label="🔍 Lead Scraper" onClick={() => openModal('leadScraper', '🔍 Lead Scraper')} />
        <QuickActionCard label="🎙 Voice Studio" onClick={() => openModal('voiceStudio', '🎙 Voice Studio')} />
        <QuickActionCard label="🗓 Smart Calendar" onClick={() => openModal('calendar', '🗓 Smart Calendar')} />
        <QuickActionCard label="🧾 Smart Quoting" onClick={() => openModal('quoting', '🧾 Smart Quoting')} />
        <QuickActionCard label="🪄 Content Creator" onClick={() => openModal('contentCreator', '🪄 Content Creator')} />
        <QuickActionCard label="🎟 Submit Ticket" onClick={() => openModal('ticket', '🎟 Submit Ticket')} />
        <QuickActionCard label="📥 HubSpot Sync" onClick={() => openModal('hubspot', '📥 HubSpot Sync')} />
        <QuickActionCard label="📤 Export Data" onClick={() => openModal('export', '📤 Export Data')} />
        <QuickActionCard label="🛡 Admin Controls" onClick={() => openModal('admin', '🛡 Admin Controls')} />
        <QuickActionCard label={showAdvancedTools ? '🧰 Hide Tools' : '🧰 Advanced Tools'} onClick={() => setShowAdvancedTools(!showAdvancedTools)} />
      </div>

      {showAdvancedTools && (
        <div className="advanced-tools-drawer">
          <QuickActionCard label="📎 PDF Upload" onClick={() => setSelectedModal('pdf')} />
          <QuickActionCard label="📘 Knowledge Base" onClick={() => setSelectedModal('rag')} />
          <QuickActionCard label="❤️‍🔥 Diagnostics" onClick={() => setSelectedModal('diagnostics')} />
          <QuickActionCard label="🚨 Emergency" onClick={() => setSelectedModal('emergency')} />
        </div>
      )}

      <div className="analytics-dashboard">
        <SmartSpendCard />
        <BotalyticsCard />

        {kpiGroups.map((group, idx) => (
          <div key={idx} className="kpi-group">
            <h3>{group.title}</h3>
            <div className="kpi-row">
              {group.kpis.map((label, i) => (
                <KPIAnalyticsCard
                  key={i}
                  label={label}
                  airtableField={label}
                  color={neonColors[(i + idx) % neonColors.length]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedModal === 'leadScraper' && <LeadScraperModal onClose={closeModal} />}
      {selectedModal === 'voiceStudio' && <VoiceStudioModal onClose={closeModal} />}
      {selectedModal === 'calendar' && <CalendarModal onClose={closeModal} />}
      {selectedModal === 'quoting' && <SmartQuotingModal onClose={closeModal} />}
      {selectedModal === 'contentCreator' && <ContentCreatorModal onClose={closeModal} />}
      {selectedModal === 'ticket' && <SubmitTicketModal onClose={closeModal} />}
      {selectedModal === 'hubspot' && <HubspotModal onClose={closeModal} />}
      {selectedModal === 'export' && <ExportModal onClose={closeModal} />}
      {selectedModal === 'admin' && <AdminPanelModal onClose={closeModal} />}
      {selectedModal === 'pdf' && <PdfUploadModal onClose={closeModal} />}
      {selectedModal === 'rag' && <RagModal onClose={closeModal} />}
      {selectedModal === 'diagnostics' && <DiagnosticsModal onClose={closeModal} />}
      {selectedModal === 'emergency' && <EmergencyModal onClose={closeModal} />}
    </div>
  );
}
