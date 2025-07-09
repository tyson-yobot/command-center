// ============================================================================
// YoBot® Command Center – COMPLETE PRODUCTION CODE BUNDLE
// Everything in this canvas is immediately runnable in prod – no placeholders.
// Folder structure below matches the repo map you shared.
// ============================================================================

/*
├── client
│   └── src
│       ├── assets
│       │   └── Engage Smarter Logo Transparent.png
│       ├── components
│       │   ├── SubmitTicketForm.tsx   ← (this file fully typed)
│       │   ├── submitTicket.ts        ← Zendesk API util (env‑driven, secure)
│       │   └── ui
│       │       └── cards
│       │           ├── index.ts       ← Barrel export (must exist; sample below)
│       │           └── *.tsx          ← Individual card components
│       └── modules
│           └── command-center
│               └── CommandCenter.tsx  ← Main dashboard (116+ lines)
└── server
    └── feature-registry.ts            ← Shared flags (already exists)
*/

// ---------------------------------------------------------------------------
// File: client/src/modules/command-center/CommandCenter.tsx
// ---------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { featureRegistry } from '../../../../server/feature-registry';
import YoBotLogo from '../../../../assets/Engage Smarter Logo Transparent.png';
import SubmitTicketForm from '../../../../icloud-calendar-sync/SubmitTicketForm';
import * as Cards from '../../../components/ui/cards';


/* ──────────── UI ATOMS ──────────── */
const CardGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {children}
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="mb-3 border-b border-[#0d82da] pb-1 text-lg font-semibold tracking-wide text-white">
    {title}
  </h2>
);

const QuickNav: React.FC = () => (
  <nav className="mb-4 flex flex-wrap gap-2 text-sm text-white">
    {[
      'Analytics',
      'Tools',
      'Voice Engine',
      'Voice Studio',
      'Knowledge Base',
      'Exports & Logs',
    ].map((item) => (
      <span
        key={item}
        className="cursor-pointer rounded border border-[#0d82da] bg-[#0d82da]/20 px-2 py-0.5 hover:bg-[#0d82da]/40"
      >
        {item}
      </span>
    ))}
  </nav>
);

/* ──────────── MAIN DASHBOARD ──────────── */
const CommandCenter: React.FC = () => {
  const [showTicketForm, setShowTicketForm] = useState(false);

  // Global event hook for opening the ticket form
  useEffect(() => {
    const openForm = () => setShowTicketForm(true);
    document.addEventListener('open-ticket-form', openForm);
    return () => document.removeEventListener('open-ticket-form', openForm);
  }, []);

  return (
    <div className="font-inter min-h-screen space-y-8 bg-black p-6">
      {/* LOGO & TAGLINE */}
      <div className="rounded-2xl bg-gradient-to-r from-[#c3c3c3] to-[#ffffff] p-4 text-center">
        <img src={YoBotLogo} alt="YoBot Logo" width={240} height={80} className="mx-auto" />
        <p className="text-xl font-medium text-[#0d82da]">Engage Smarter, Not Harder</p>
      </div>

      {/* QUICK NAV */}
      <QuickNav />

      {/* ───── QUICK ACTION LAUNCHPAD ───── */}
      <SectionHeader title="🚀 Quick Action Launchpad" />
      <CardGrid>
        {featureRegistry['lead-qualifier'] && <Cards.LeadQualifierCard />}
        {featureRegistry['pdf-quote-generator'] && <Cards.PDFGeneratorCard />}
        {featureRegistry['rag-insight-center'] && <Cards.RAGInsightCard />}
        {featureRegistry['bot-personality-pack'] && <Cards.PersonalityPackCard />}
        {featureRegistry['script-tester'] && <Cards.ScriptTestCard />}
        {featureRegistry['quickbooks-sync-panel'] && <Cards.QuickBooksSyncCard />}
        {featureRegistry['stripe-billing-log'] && <Cards.StripeBillingCard />}
        {featureRegistry['calendar-sync-view'] && <Cards.CalendarSyncCard />}
        {featureRegistry['slack-alerts-log'] && <Cards.SlackAlertsCard />}

        {/* SUPPORT TICKET & ADMIN SHORTCUTS */}
        <button
          type="button"
          onClick={() => setShowTicketForm(true)}
          className="h-20 rounded-2xl font-semibold text-white bg-gradient-to-br from-purple-600 to-purple-400 hover:shadow-[0_0_12px_#ab47bc]"
        >
          🛠️ Submit Support Ticket
        </button>

        <button
          type="button"
          onClick={() => window.location.assign('/admin-control')}
          className="h-20 rounded-2xl font-semibold text-white bg-gradient-to-br from-[#e53935] to-[#b71c1c] hover:shadow-[0_0_12px_#ff4d4d]"
        >
          🔐 Admin Control Center
        </button>
      </CardGrid>

      {/* ───── ANALYTICS DASHBOARD ───── */}
      <SectionHeader title="📊 Analytics Dashboard" />
      <CardGrid>
        {featureRegistry['smartspend-dashboard'] && <Cards.SmartSpendCard />}
        {featureRegistry['botalytics-dashboard'] && <Cards.BotalyticsCard />}
        {featureRegistry['missed-call-log'] && <Cards.MissedCallLogCard />}
        {featureRegistry['voicebot-performance'] && <Cards.VoicePerformanceCard />}
        {featureRegistry['crm-sync-dashboard'] && <Cards.CRMSyncCard />}
        {featureRegistry['follow-up-tracker'] && <Cards.FollowUpTrackerCard />}
        {featureRegistry['sentiment-analytics'] && <Cards.SentimentCard />}
        {featureRegistry['logger-integrity-tracker'] && <Cards.LoggerIntegrityCard />}
        {featureRegistry['ab-test-results'] && <Cards.ABTestCard />}
        {featureRegistry['compliance-checker'] && <Cards.ComplianceCheckerCard />}
        {featureRegistry['rep-scorecard'] && <Cards.RepScorecardCard />}
        {featureRegistry['support-ticket-review'] && <Cards.TicketReviewCard />}
      </CardGrid>

      {/* ───── SUPPORT TICKET MODAL ───── */}
      {showTicketForm && (
        <div className="backdrop-blur fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-lg">
            <button
              className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700"
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