import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, Users, Building, MapPin, Loader2, 
  CheckCircle, AlertCircle, ArrowLeft, Download,
  Linkedin, Globe, Database, RefreshCw, Rocket,
  Star, Target, BarChart3
} from 'lucide-react';
import { Link } from 'wouter';
import ApifyScraperPanel from './components/apify-scraper-panel';
import ApolloScraperPanel from './components/apollo-scraper-panel';
import PhantomBusterScraperPanel from './components/phantombuster-scraper-panel';
import ScraperResultsDisplay from './components/scraper-results-display';
import IntelligenceResults from './components/intelligence-results';
import EnterpriseLeadPlatform from './components/enterprise-lead-platform';

interface ScrapedLead {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  location: string;
  source: string;
}

interface ScrapeResult {
  success: boolean;
  leadCount?: number;
  listingCount?: number;
  profileCount?: number;
  leads?: any[];
  listings?: any[];
  profiles?: any[];
  sessionId: string;
  source: string;
  timestamp: string;
  message?: string;
  error?: string;
}

const LeadScraper: React.FC = () => {
  const { toast } = useToast();
  
  // State management
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'scraper', or 'results'
  const [activeTab, setActiveTab] = useState('apollo');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapeResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [totalLeadsFound, setTotalLeadsFound] = useState(0);
  const [lastScrapeTime, setLastScrapeTime] = useState<string>('');
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [leadsStats, setLeadsStats] = useState<any>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastScrapedCount, setLastScrapedCount] = useState(0);
  const [lastScrapedSource, setLastScrapedSource] = useState('');

  // Load real leads data from Airtable
  const loadLeadsData = async () => {
    try {
      const [leadsResponse, statsResponse] = await Promise.all([
        fetch('/api/leads/universal'),
        fetch('/api/leads/stats')
      ]);

      if (leadsResponse.ok) {
        const leadsResult = await leadsResponse.json();
        setLeadsData(leadsResult.data || []);
        setTotalLeadsFound(leadsResult.data?.length || 0);
      }

      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        setLeadsStats(statsResult.data || null);
      }
    } catch (error) {
      console.error('Failed to load leads data:', error);
    }
  };

  // Sync leads from Airtable
  const syncFromAirtable = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch('/api/leads/sync-airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (result.success) {
        await loadLeadsData();
        toast({
          title: "Airtable Sync Complete",
          description: `Synced ${result.count} leads from your Airtable`
        });
      } else {
        toast({
          title: "Sync Failed",
          description: result.message || "Airtable API key required",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: "Failed to connect to Airtable",
        variant: "destructive"
      });
    } finally {
      setSyncLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadLeadsData();
  }, []);

  // Scraper launch handlers with real API calls
  const handleApolloLaunch = async (filters: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scraper/apollo/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filters,
          timestamp: new Date().toISOString(),
          mode: process.env.NODE_ENV || 'development'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Only proceed if we have real data or confirmed backend process
        if (process.env.NODE_ENV === 'production' && (!result.leads || result.leads.length === 0)) {
          toast({
            title: "No Leads Found",
            description: "Scraper may have failed or no matching leads found",
            variant: "destructive"
          });
          return;
        }
        
        setResults(result);
        setTotalLeadsFound(prev => prev + (result.leadCount || 0));
        setLastScrapeTime(new Date().toLocaleString());
        setLastScrapedCount(result.leadCount || 0);
        setLastScrapedSource('APOLLO');
        setCurrentView('results');
        
        // Load fresh data after scraping
        await loadLeadsData();
        
        toast({
          title: "Apollo Scrape Complete",
          description: `Found ${result.leadCount || 0} professional leads`
        });
      }
    } catch (error: any) {
      toast({
        title: "Apollo Scrape Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApifyLaunch = async (filters: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scraper/apify/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filters,
          timestamp: new Date().toISOString(),
          mode: process.env.NODE_ENV || 'development'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Only proceed if we have real data or confirmed backend process
        if (process.env.NODE_ENV === 'production' && (!result.leads || result.leads.length === 0)) {
          toast({
            title: "No Leads Found",
            description: "Scraper may have failed or no matching leads found",
            variant: "destructive"
          });
          return;
        }
        
        setResults(result);
        setTotalLeadsFound(prev => prev + (result.listingCount || 0));
        setLastScrapeTime(new Date().toLocaleString());
        setLastScrapedCount(result.listingCount || 0);
        setLastScrapedSource('APIFY');
        setCurrentView('results');
        
        // Load fresh data after scraping
        await loadLeadsData();
        
        toast({
          title: "Apify Scrape Complete",
          description: `Found ${result.listingCount || 0} business listings`
        });
      }
    } catch (error: any) {
      toast({
        title: "Apify Scrape Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhantomBusterLaunch = async (filters: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scraper/phantombuster/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filters,
          timestamp: new Date().toISOString(),
          mode: process.env.NODE_ENV || 'development'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Only proceed if we have real data or confirmed backend process
        if (process.env.NODE_ENV === 'production' && (!result.leads || result.leads.length === 0)) {
          toast({
            title: "No Leads Found",
            description: "Scraper may have failed or no matching leads found",
            variant: "destructive"
          });
          return;
        }
        
        setResults(result);
        setTotalLeadsFound(prev => prev + (result.profileCount || 0));
        setLastScrapeTime(new Date().toLocaleString());
        setLastScrapedCount(result.profileCount || 0);
        setLastScrapedSource('PHANTOMBUSTER');
        setCurrentView('results');
        
        // Load fresh data after scraping
        await loadLeadsData();
        
        toast({
          title: "PhantomBuster Scrape Complete",
          description: `Found ${result.profileCount || 0} LinkedIn profiles`
        });
      }
    } catch (error: any) {
      toast({
        title: "PhantomBuster Scrape Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Platform Overview Interface
  const renderOverview = () => (
    <EnterpriseLeadPlatform onNavigateToScraper={() => setCurrentView('scraper')} />
  );

  // Scraper Interface
  const renderScraper = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('overview')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Platform Overview
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Search className="w-8 h-8 mr-3 text-green-400" />
                Advanced Lead Scraper
              </h1>
              <p className="text-white/60 mt-1">
                Professional lead generation with Apollo, Apify, and PhantomBuster integration
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-semibold">{totalLeadsFound} Total Leads Found</div>
            {lastScrapeTime && (
              <div className="text-white/60 text-sm">Last scrape: {lastScrapeTime}</div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-600/20 backdrop-blur-sm border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-300 text-sm font-medium">Active Leads</div>
                  <div className="text-white text-2xl font-bold">{totalLeadsFound}</div>
                </div>
                <Database className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-600/20 backdrop-blur-sm border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-300 text-sm font-medium">Last Scraped</div>
                  <div className="text-white text-2xl font-bold">{lastScrapedCount}</div>
                  <div className="text-green-200 text-xs">{lastScrapedSource}</div>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-600/20 backdrop-blur-sm border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-purple-300 text-sm font-medium">Sources</div>
                  <div className="text-white text-2xl font-bold">3</div>
                  <div className="text-purple-200 text-xs">Apollo, Apify, PB</div>
                </div>
                <Globe className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-600/20 backdrop-blur-sm border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Button
                    onClick={syncFromAirtable}
                    disabled={syncLoading}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                    {syncLoading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-1" />
                    )}
                    Sync Airtable
                  </Button>
                </div>
                <Database className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scraper Tabs */}
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Rocket className="w-6 h-6 mr-2 text-blue-400" />
              Lead Generation Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                <TabsTrigger value="apollo" className="text-white data-[state=active]:bg-blue-600">
                  <Target className="w-4 h-4 mr-2" />
                  Apollo.io
                </TabsTrigger>
                <TabsTrigger value="apify" className="text-white data-[state=active]:bg-green-600">
                  <Globe className="w-4 h-4 mr-2" />
                  Apify
                </TabsTrigger>
                <TabsTrigger value="phantombuster" className="text-white data-[state=active]:bg-purple-600">
                  <Linkedin className="w-4 h-4 mr-2" />
                  PhantomBuster
                </TabsTrigger>
              </TabsList>

              <TabsContent value="apollo" className="mt-6">
                <ApolloScraperPanel
                  onLaunch={handleApolloLaunch}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="apify" className="mt-6">
                <ApifyScraperPanel
                  onLaunch={handleApifyLaunch}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="phantombuster" className="mt-6">
                <PhantomBusterScraperPanel
                  onLaunch={handlePhantomBusterLaunch}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Results Interface - Only show real data
  const renderResults = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const hasRealData = leadsData && leadsData.length > 0;
    const hasRecentResults = results && results.leads && results.leads.length > 0;

    // In production, only show data if we have real leads
    if (isProduction && !hasRealData && !hasRecentResults) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
          <div className="max-w-4xl mx-auto pt-20">
            <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-center p-12">
              <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No Leads Available</h2>
              <p className="text-white/60 mb-6">
                Scraper may have failed or no matching leads found. Try running a scraper or sync from Airtable.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setCurrentView('scraper')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Run Scraper
                </Button>
                <Button
                  onClick={syncFromAirtable}
                  disabled={syncLoading}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {syncLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync Airtable
                </Button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <IntelligenceResults
        results={results}
        leadsData={leadsData}
        onBack={() => setCurrentView('scraper')}
        onBackToOverview={() => setCurrentView('overview')}
      />
    );
  };

  // Main render logic
  switch (currentView) {
    case 'scraper':
      return renderScraper();
    case 'results':
      return renderResults();
    default:
      return renderOverview();
  }
};

export default LeadScraper;