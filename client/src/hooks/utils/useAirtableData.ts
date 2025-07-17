import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import type { FeatureKey } from "../../../../shared/types";

// ---------------- Zod runtime validators ----------------
const airtableRecordSchema = z.object({
  id: z.string(),
  fields: z.record(z.any()),
  createdTime: z.string().optional(),
});

const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string(),
});

const paginatedResponseSchema = z.object({
  records: z.array(airtableRecordSchema),
  offset: z.string().optional(),
  hasMore: z.boolean(),
  totalCount: z.number().optional(),
});

// ---------------- Type definitions ----------------
export interface AirtableRecord<T = Record<string, any>> {
  id: string;
  fields: T;
  createdTime?: string;
}

export interface PaginatedResponse<T = AirtableRecord> {
  records: T[];
  offset?: string;
  hasMore: boolean;
  totalCount?: number;
}

export interface UseAirtableOptions {
  feature: FeatureKey;
  view?: string;
  formula?: string;
  maxRecords?: number;
  sort?: Array<{ field: string; direction: "asc" | "desc" }>;
  fields?: string[];
  enabled?: boolean;
}

// ---------------- Main hook ----------------
export function useAirtableData<T = Record<string, any>>(
  options: UseAirtableOptions
) {
  const {
    feature,
    view,
    formula,
    maxRecords,
    sort,
    fields,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ['airtable', feature, view, formula, maxRecords, sort, fields],
    queryFn: async ({ signal }) => {
      try {
        const params = new URLSearchParams();
        
        if (view) params.append("view", view);
        if (formula) params.append("formula", formula);
        if (maxRecords) params.append("maxRecords", maxRecords.toString());
        if (sort) params.append("sort", JSON.stringify(sort));
        if (fields) params.append("fields", JSON.stringify(fields));

        const response = await axios.get(`/api/airtable/${feature}?${params.toString()}`, {
          signal,
        });

        const validatedResponse = apiResponseSchema.parse(response.data);
        
        if (!validatedResponse.success) {
          throw new Error(validatedResponse.error || "API request failed");
        }

        const validatedData = paginatedResponseSchema.parse(validatedResponse.data);
        
        return {
          ...validatedData,
          records: validatedData.records as AirtableRecord<T>[]
        } as PaginatedResponse<AirtableRecord<T>>;
        
      } catch (error) {
        console.error(`[useAirtableData] Error fetching ${feature}:`, error);
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (axios.isAxiosError(error) && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ---------------- Utility hooks ----------------
export function useAirtableRecord<T = Record<string, any>>(
  feature: FeatureKey, 
  recordId: string
) {
  return useQuery({
    queryKey: ["airtable", feature, "record", recordId],
    queryFn: async ({ signal }): Promise<AirtableRecord<T>> => {
      const response = await axios.get(`/api/airtable/${feature}/${recordId}`, { 
        signal 
      });
      
      const validatedResponse = apiResponseSchema.parse(response.data);
      
      if (!validatedResponse.success) {
        throw new Error(validatedResponse.error || "Failed to fetch record");
      }
      
      const validatedRecord = airtableRecordSchema.parse(validatedResponse.data);
      
      // Type assertion to match the expected generic type
      return {
        ...validatedRecord,
        fields: validatedRecord.fields as T
      } as AirtableRecord<T>;
    },
    enabled: !!recordId,
    staleTime: 2 * 60 * 1000, // 2 minutes for individual records
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}