<<<<<<< HEAD
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
=======
/*  SmartQuoting.tsx  –  YoBot® production‑grade quote workflow UI
    --------------------------------------------------------------------
    • 1 card, 2 views:
      ── “SmartQuotingCard”  → lets user select services & generate a new
         Sales‑Order record in Airtable (+ POST /api/generate‑quote).
      ── “PDFQuoteGeneratorCard”  → appears after backend returns recordId
         and lets the user re‑trigger PDF generation at any time.
    • Live Airtable fetch for Services (table “🛠️ Service Catalog”)
    • React‑Query everywhere; no hard‑coding; toast alerts.
    • Slack / Airtable / DocuSign handled server‑side via /api endpoints.
------------------------------------------------------------------------ */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, FileText } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';

const API = (path: string) =>
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}${path}`
    : path;

type Service = {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
};

async function fetchServices(): Promise<Service[]> {
  const res = await fetch(API('/api/airtable/services'), {
    method: 'GET',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

interface CreateSOBody {
  company: string;
  contactEmail: string;
  items: { id: string; qty: number }[];
}

async function createSalesOrder(body: CreateSOBody): Promise<{
  recordId: string;
}> {
  const res = await fetch(API('/api/create-sales-order'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const SmartQuotingCard: React.FC = () => {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [salesOrderId, setSalesOrderId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
    data: services = [],
    isLoading,
  } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000,
  });

  const createSO = useMutation<
    { recordId: string },
    Error,
    CreateSOBody
  >({
    mutationFn: createSalesOrder,
    onSuccess: ({ recordId }) => {
      toast.success('Sales Order created, generating PDF…');
      setSalesOrderId(recordId);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCreateQuote = () => {
    const items = Object.entries(selected)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ id, qty }));
    if (!company || !email || items.length === 0) {
      toast.error('Company, email, and at least 1 service required.');
      return;
    }
    createSO.mutate({ company, contactEmail: email, items });
  };

  const total = services
    ?.filter((s) => selected[s.id])
    .reduce((sum: number, s) => sum + s.unitPrice * selected[s.id], 0);

  if (salesOrderId) {
    return <PDFQuoteGeneratorCard recordId={salesOrderId} />;
  }

  return (
    <Card className="yobot-card">
      <CardHeader className="flex items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5" /> Smart Quoting Tool
        </CardTitle>
      </CardHeader>

      <CardContent className="text-white space-y-3">
        <input
          className="w-full p-2 rounded bg-[#ffffff0d] text-white text-sm"
          placeholder="Company Name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          className="w-full p-2 rounded bg-[#ffffff0d] text-white text-sm"
          placeholder="Customer Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {isLoading ? (
          <p className="text-sm flex items-center gap-1">
            <Loader2 className="animate-spin h-4 w-4" /> Loading services…
          </p>
        ) : (
          services.map((svc) => (
            <label
              key={svc.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <Checkbox
                  checked={!!selected[svc.id]}
                  onCheckedChange={(v: boolean) =>
                    setSelected((prev) => ({
                      ...prev,
                      [svc.id]: v ? 1 : 0,
                    }))
                  }
                />
                {svc.name} (${svc.unitPrice.toFixed(2)})
              </span>
              {selected[svc.id] ? (
                <input
                  type="number"
                  min={1}
                  value={selected[svc.id]}
                  className="w-12 bg-[#ffffff0d] rounded text-center"
                  onChange={(e) =>
                    setSelected((prev) => ({
                      ...prev,
                      [svc.id]: Number(e.target.value),
                    }))
                  }
                />
              ) : null}
            </label>
          ))
        )}
        <p className="text-right font-bold text-white pt-2">
          Total: ${total?.toFixed(2) || '0.00'}
        </p>
      </CardContent>

      <CardFooter>
        <Button
          size="sm"
          disabled={createSO.status === 'pending'}
          onClick={handleCreateQuote}
          className="btn-blue w-full"
        >
          {createSO.status === 'pending' ? (
            <>
              <Loader2 className="animate-spin mr-1" size={16} /> Creating…
            </>
          ) : (
            'Create Quote'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

interface PDFProps {
  recordId: string;
}

const PDFQuoteGeneratorCard: React.FC<PDFProps> = ({ recordId }) => {
  const gen = useMutation<unknown, Error>({
    mutationFn: async () => {
      const res = await fetch(API('/api/generate-quote'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => toast.success('Quote PDF generated!'),
    onError: (err: Error) => toast.error(err.message),
  });

  const pollStatus = useMutation<unknown, Error, void, unknown>({
    mutationFn: async () => {
      const res = await fetch(API(`/api/quote-status/${recordId}`));
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.status === 'completed') {
        toast.success('Quote signed via DocuSign.');
      } else if (data.status === 'failed') {
        toast.error('DocuSign failed.');
      }
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      pollStatus.mutate();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="yobot-card">
      <CardHeader className="flex items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="h-5 w-5" /> Quote PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white space-y-3">
        <p className="text-sm">
          Your quote is being processed. Click the button below to regenerate the PDF or wait for DocuSign status.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          size="sm"
          onClick={() => gen.mutate()}
          className="btn-blue w-full"
        >
          {gen.status === 'pending' ? (
            <>
              <Loader2 className="animate-spin mr-1" size={16} /> Generating…
            </>
          ) : (
            'Regenerate PDF'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export { SmartQuotingCard, PDFQuoteGeneratorCard };


>>>>>>> 692751fa02aec1a95d0ca2c3113091d5e0732d44
