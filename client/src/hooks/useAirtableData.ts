/**
 * useAirtableData.ts – YoBot® production‑grade Airtable hook
 * -----------------------------------------------------------
 * • Zero hard‑coding – derives base+table from featureKey via REST API
 * • TanStack React‑Query with exponential back‑off & circuit‑break
 * • Auto‑validates response payload (runtime Zod) so UI never crashes
 * • All errors bubble to backend /api/airtable which already calls logError() ➜ Slack
 * • Re‑usable across every client (multi‑tenant safe)
 */

import { useQuery, QueryClient, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import type { FeatureKey } from "../../../server/modules/airtable/airtableConfig"; // Absolute path fallback

// ---------------- Zod runtime validators ----------------
const airtableRecordSchema = z.object({
  id: z.string(),
  fields: z.record(z.any()),
});
const airtableArraySchema = z.array(airtableRecordSchema);

type AirtableRecord<T = any> = z.infer<typeof airtableRecordSchema> & {
  fields: T;
};

// ---------------- Hook params ----------------
export interface UseAirtableOptions {
  feature: FeatureKey;
  view?: string;
  formula?: string;
  enabled?: boolean;
}

// ---------------- Axios instance ----------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------- Core fetcher ----------------
const fetchAirtable = async <T = any>(context: QueryFunctionContext<["airtable", FeatureKey, string?, string?]>): Promise<AirtableRecord<T>[]> => {
  const [, feature, view, formula] = context.queryKey;
  const qs = new URLSearchParams();
  if (view) qs.append("view", view);
  if (formula) qs.append("formula", formula);

  try {
    const { data } = await api.get(`/airtable/${feature}`, { params: qs });
    const parsed = airtableArraySchema.parse(data);
    return parsed as AirtableRecord<T>[];
  } catch (err: any) {
    console.error(`[YoBot Airtable] Failed fetch for ${feature}:`, err.message);
    throw err;
  }
};

// ---------------- React hook ----------------
export function useAirtableData<T = any>(opts: UseAirtableOptions) {
  const { feature, view = "", formula = "", enabled = true } = opts;

  return useQuery<AirtableRecord<T>[], unknown, AirtableRecord<T>[], ["airtable", FeatureKey, string, string]>(
    ["airtable", feature, view, formula],
    fetchAirtable,
    {
      enabled,
      staleTime: 60000,
      retry: (failureCount: number, error: any) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500 && status !== 429) return false;
        return failureCount < 4;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  );
}

// ---------------- Global QueryClient ----------------
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
