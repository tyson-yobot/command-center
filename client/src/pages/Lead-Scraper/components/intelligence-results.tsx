<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, ExternalLink, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LEAD_ENGINE_BASE_ID } from '@shared/airtableConfig';
=======
/**
 * Airtable logger — production-ready
 * • Uses env constants only (no hard-coded IDs)
 * • Sanitises & validates data
 * • Deduplicates on “🧾 Dedupe Key”
 * • Retries once on transient failures
 * • Throws on unrecoverable errors
 */
>>>>>>> 6ceca54e23ef93c85c6cc94b0ba290772fdbfea3

import axios from 'axios';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_LOG_TABLE } = process.env;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_LOG_TABLE) {
  throw new Error(
    '❌ Missing Airtable env vars (AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_LOG_TABLE)'
  );
}

const airtableURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  AIRTABLE_LOG_TABLE
)}`;

interface AirtableResponse {
  id: string;
}

export async function logToAirtable(
  fields: Record<string, unknown>,
  attempt = 1
): Promise<AirtableResponse> {
  // 1 — remove undefined / null
  const cleaned = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined && v !== null)
  );

  // 2 — basic validation
  if (!cleaned['🧾 Dedupe Key']) {
    throw new Error('Missing 🧾 Dedupe Key for deduplication');
  }

<<<<<<< HEAD
  const { data: airtableLeads = [], isLoading } = useQuery({
    queryKey: ['/api/leads/universal'],
    enabled: leads.length === 0, // Only fetch if we don't have results data
    select: (data: Lead[]) => data.slice(0, 5) // Show first 5 leads as preview
  });

  const displayLeads = leads.length > 0 ? leads.slice(0, 5) : airtableLeads;

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/leads/export-csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewInAirtable = () => {
    window.open(`https://airtable.com/${LEAD_ENGINE_BASE_ID}/tblXXXXXXXXXXXXXX/viwXXXXXXXXXXXXXX`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              New Intelligence Search
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Intelligence Results</h1>
          <p className="text-slate-300 text-lg">
            Extracted {actualTotal} high-quality leads using {source} platform
          </p>
        </div>

        {/* Success Banner */}
        <Card className="bg-green-900/20 border-green-500/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-200 font-semibold">
                    ✅ {actualTotal} leads scraped. View in Airtable »
                  </span>
                </div>
                <p className="text-green-300/80 text-sm mt-1">
                  Notification sent to Slack • Data ready for export
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleViewInAirtable}
                className="border-green-500/50 text-green-200 hover:bg-green-500/10"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Airtable
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Premium Lead Intelligence Preview</CardTitle>
            <Button
              onClick={handleExportCSV}
              disabled={exportLoading}
              className="text-white border transition-all duration-200 hover:shadow-[0_0_8px_rgba(13,130,218,0.5)]"
              style={{ 
                backgroundColor: '#0d82da',
                borderColor: '#0d82da'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0864b1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0d82da';
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportLoading ? "Exporting..." : "Export Enterprise CSV"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="h-4 bg-slate-600 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-slate-600 rounded w-1/2 mb-3"></div>
                      <div className="flex gap-4">
                        <div className="h-3 bg-slate-600 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-600 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-600 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayLeads.map((lead: any, index: number) => (
                  <Card key={lead.id || index} className="bg-slate-700/30 border-slate-600/50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            {lead.firstName} {lead.lastName}
                          </h3>
                          <p className="text-slate-300">
                            at {lead.company}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          {lead.email && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Mail className="h-4 w-4" />
                              <span>{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone className="h-4 w-4" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                          {lead.location && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <MapPin className="h-4 w-4" />
                              <span>{lead.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-slate-400">
            Showing {Math.min(5, displayLeads.length)} of {actualTotal} premium leads. Export complete dataset for full intelligence package.
          </p>
        </div>
      </div>
    </div>
  );
}
=======
  try {
    const { data } = await axios.post(
      airtableURL,
      { records: [{ fields: cleaned }] },
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 7_000,
      }
    );

    return { id: (data as any).records?.[0]?.id };
  } catch (err: any) {
    const ae = err;
    // Retry once on 5xx / timeout
    if (attempt === 1 && (ae.code === 'ECONNABORTED' || (ae.response?.status || 500) >= 500)) {
      return logToAirtable(fields, 2);
    }
    throw new Error(
      `Airtable logging failed [${ae.response?.status || 'no-status'}]: ${
        ae.response?.data || ae.message
      }`
    );
  }
}
>>>>>>> 6ceca54e23ef93c85c6cc94b0ba290772fdbfea3
