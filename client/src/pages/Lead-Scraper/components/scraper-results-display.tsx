import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Eye, Filter, Search, Users, Building2, Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Lead {
  fullName: string;
  email: string;
  company: string;
  title: string;
  location: string;
  phone: string;
  industry: string;
  sourceTag?: string;
  scrapeSessionId?: string;
  source: string;
}

interface Listing {
  businessName: string;
  address: string;
  phone: string;
  website: string;
  rating: string;
  reviewCount: number;
  category: string;
  hours: string;
  source: string;
}

interface Profile {
  fullName: string;
  headline: string;
  company: string;
  location: string;
  connectionDegree: string;
  profileUrl: string;
  mutualConnections: number;
  platform: string;
  source: string;
}

interface ScraperResultsDisplayProps {
  results: {
    success: boolean;
    leadCount?: number;
    listingCount?: number;
    profileCount?: number;
    leads?: Lead[];
    listings?: Listing[];
    profiles?: Profile[];
    sessionId: string;
    source: string;
    timestamp: string;
  };
  onClose: () => void;
}

export default function ScraperResultsDisplay({ results, onClose }: ScraperResultsDisplayProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'detailed'>('preview');
  const { toast } = useToast();

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      let exportData = [];
      let filename = '';

      if (results.leads && results.leads.length > 0) {
        exportData = results.leads;
        filename = `apollo-leads-${Date.now()}.csv`;
      } else if (results.listings && results.listings.length > 0) {
        exportData = results.listings;
        filename = `apify-listings-${Date.now()}.csv`;
      } else if (results.profiles && results.profiles.length > 0) {
        exportData = results.profiles;
        filename = `phantom-profiles-${Date.now()}.csv`;
      }

      if (exportData.length === 0) {
        toast({
          title: "No Data to Export",
          description: "No results available for CSV export",
          variant: "destructive"
        });
        return;
      }

      // Create CSV content
      const headers = Object.keys(exportData[0]).join(',');
      const csvRows = exportData.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        ).join(',')
      );
      const csvContent = [headers, ...csvRows].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Log export to backend
      await apiRequest('POST', '/api/export-leads-csv', {
        leads: exportData,
        source: results.source,
        sessionId: results.sessionId
      });

      toast({
        title: "Export Successful",
        description: `Downloaded ${exportData.length} records as CSV`,
      });

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getResultSummary = () => {
    if (results.leads) return { count: results.leadCount || results.leads.length, type: 'leads', data: results.leads };
    if (results.listings) return { count: results.listingCount || results.listings.length, type: 'listings', data: results.listings };
    if (results.profiles) return { count: results.profileCount || results.profiles.length, type: 'profiles', data: results.profiles };
    return { count: 0, type: 'results', data: [] };
  };

  const summary = getResultSummary();

  const renderLeadCard = (lead: Lead, index: number) => (
    <Card key={index} className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-white">{lead.fullName}</h4>
            <p className="text-slate-300 text-sm">{lead.title}</p>
          </div>
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {lead.source}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Building2 className="w-4 h-4" />
            <span>{lead.company}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4" />
            <span>{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4" />
              <span>{lead.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4" />
            <span>{lead.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderListingCard = (listing: Listing, index: number) => (
    <Card key={index} className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-white">{listing.businessName}</h4>
            <p className="text-slate-300 text-sm">{listing.category}</p>
          </div>
          <Badge variant="outline" className="text-green-400 border-green-400">
            {listing.source}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4" />
            <span>{listing.address}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-4 h-4" />
            <span>{listing.phone}</span>
          </div>
          {listing.website && (
            <div className="flex items-center gap-2 text-slate-300">
              <span>🌐</span>
              <span>{listing.website}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-300">
            <span>⭐</span>
            <span>{listing.rating} ({listing.reviewCount} reviews)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProfileCard = (profile: Profile, index: number) => (
    <Card key={index} className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-white">{profile.fullName}</h4>
            <p className="text-slate-300 text-sm">{profile.headline}</p>
          </div>
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            {profile.platform}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Building2 className="w-4 h-4" />
            <span>{profile.company}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4" />
            <span>{profile.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4" />
            <span>{profile.connectionDegree} • {profile.mutualConnections} mutual</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] bg-slate-900 border-slate-700 overflow-hidden">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5" />
                Scraping Results
              </CardTitle>
              <CardDescription className="text-slate-400">
                Found {summary.count} {summary.type} from {results.source} scraper
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'preview' ? 'detailed' : 'preview')}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                {viewMode === 'preview' ? 'Detailed View' : 'Preview'}
              </Button>
              <Button
                onClick={handleExportCSV}
                disabled={isExporting || summary.count === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Close
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {summary.count === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">No results found</div>
              <p className="text-slate-500 text-sm">Try adjusting your filters and running the scraper again.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span>Session: {results.sessionId}</span>
                  <span>•</span>
                  <span>Scraped: {new Date(results.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span className="text-green-400">✓ Verified data</span>
                </div>
                <Separator className="bg-slate-700" />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.leads && results.leads.slice(0, viewMode === 'preview' ? 6 : results.leads.length).map(renderLeadCard)}
                {results.listings && results.listings.slice(0, viewMode === 'preview' ? 6 : results.listings.length).map(renderListingCard)}
                {results.profiles && results.profiles.slice(0, viewMode === 'preview' ? 6 : results.profiles.length).map(renderProfileCard)}
              </div>

              {viewMode === 'preview' && summary.count > 6 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setViewMode('detailed')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    View All {summary.count} {summary.type}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}