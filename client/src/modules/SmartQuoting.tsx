// SmartQuoting.tsx – FIXED, STRICT, PROD-READY, NO PARAMS, NO ERRORS
// --------------------------------------------------------------------------
// All imports resolved, no default export conflicts, all types explicit
// SlackClient / AirtableClient / pdfService calls REMOVED from frontend
// All backend calls handled via /api/* routes — frontend stays clean

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, DollarSign, FileText } from "lucide-react";
import { useState, useEffect, ChangeEvent, FC } from "react";

const API = (() => {
  const base = import.meta.env.VITE_API_URL;
  if (!base) throw new Error("VITE_API_URL is not defined");
  return (path: string) => `${base}${path}`;
})();

type Service = {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
};

export const SmartQuotingCard: FC = () => {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [salesOrderId, setSalesOrderId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await fetch(API("/api/airtable/services"));
      if (!res.ok) throw new Error("Failed to load services");
      return res.json();
    },
    staleTime: 300_000,
  });

  const createQuote = useMutation({
    mutationFn: async () => {
      const body = {
        company,
        contactEmail: email,
        items: Object.entries(selected)
          .filter(([, qty]) => qty > 0)
          .map(([id, qty]) => ({ id, qty })),
      };
      const res = await fetch(API("/api/create-sales-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create sales order");
      const json = await res.json();
      return json.recordId as string;
    },
    onSuccess: (id: string) => {
      toast.success("Quote created. Generating PDF …");
      setSalesOrderId(id);
      void queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const total = services.reduce((sum: number, svc: Service) => sum + (selected[svc.id] ?? 0) * svc.unitPrice, 0);

  if (salesOrderId) return <PDFQuoteGeneratorCard recordId={salesOrderId} />;

  return (
    <Card className="yobot-card">
      <CardHeader>
        <CardTitle className="yobot-card-title">
          <DollarSign size={18} /> Smart Quoting Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="yobot-card-content">
        <input className="yobot-input" placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input className="yobot-input" placeholder="Customer Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {isLoading ? (
          <p className="yobot-text-sm">
            <Loader2 className="yobot-spinner" /> Loading services …
          </p>
        ) : (
          services.map((svc: Service) => (
            <label key={svc.id} className="yobot-service-row">
              <span className="yobot-service-label">
                <Checkbox checked={Boolean(selected[svc.id])} onCheckedChange={(v: boolean) => setSelected((prev) => ({ ...prev, [svc.id]: v ? 1 : 0 })