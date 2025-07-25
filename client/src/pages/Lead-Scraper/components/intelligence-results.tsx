import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, ExternalLink, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LEAD_ENGINE_BASE_ID } from '@shared/airtableConfig';

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  location: string;
  source: string;
  createdAt: string;
}

interface IntelligenceResultsProps {
  onBack: () => void;
  onBackToOverview: () => void;
  results?: any;
  leadsData?: any[];
  source?: string;
  totalScraped?: number;
}

export default function IntelligenceResults({ 
  onBack, 
  onBackToOverview, 
  results, 
  leadsData = [],
  source = "APOLLO", 
  totalScraped 
}: IntelligenceResultsProps) {
  const [exportLoading, setExportLoading] = useState(false);

  // Use real leads data - either from recent results or from Airtable
  const leads = results?.leads || leadsData || [];
  const actualTotal = totalScraped || results?.leadCount || results?.count || leads.length;
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, don't show anything if no real data
  if (isProduction && leads.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-white">No Leads Available</h1>
            <p className="text-slate-300">
              Scraper may have failed or no matching leads found. Try running a scraper again.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 text-white">
                Run New Scraper
              </Button>
              <Button onClick={onBackToOverview} variant="outline" className="border-white/20 text-white">
                Back to Overview
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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