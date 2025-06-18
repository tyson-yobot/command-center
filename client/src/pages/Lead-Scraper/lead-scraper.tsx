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

  // Scraper launch handlers
  const handleApolloLaunch = async (filters: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scraper/apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      
      const result = await response.json();
      if (result.success) {
        setResults(result);
        setTotalLeadsFound(prev => prev + (result.leadCount || 0));
        setLastScrapeTime(new Date().toLocaleString());
        setLastScrapedCount(result.leadCount || 0);
        setLastScrapedSource('APOLLO');
        setCurrentView('results');
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
      const response = await fetch('/api/scraper/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      
      const result = await response.json();
      if (result.success) {
        setResults(result);
        setTotalLeadsFound(prev => prev + (result.listingCount || 0));
        setLastScrapeTime(new Date().toLocaleString());
        setLastScrapedCount(result.listingCount || 0);
        setLastScrapedSource('APIFY');
        setCurrentView('results');
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
      const response = await fetch('/api/scraper/phantombuster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      
      const result = await response.json();
      if (result.success) {
        setResults(result);
        setTotalLeadsFound(prev => prev + (result.profileCount || 0));
        setLastScrapeTime(new Date().toLocaleString());
        setShowResults(true);
        toast({
          title: "PhantomBuster Scrape Complete",
          description: `Found ${result.profileCount || 0} social profiles`
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

  // Enterprise Lead Intelligence Platform Overview
  const renderOverview = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Enterprise Lead Intelligence Platform
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence
          </p>
        </div>

        {/* Real-time Data Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{totalLeadsFound}</div>
              <div className="text-sm text-blue-200">Total Leads</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {leadsStats?.callableLeads || 0}
              </div>
              <div className="text-sm text-blue-200">Callable</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {leadsStats?.sources?.length || 0}
              </div>
              <div className="text-sm text-blue-200">Sources</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <Button 
                onClick={syncFromAirtable}
                disabled={syncLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {syncLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Airtable
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Apollo.io */}
          <Card 
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-sm border border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer group"
            onClick={() => {
              setActiveTab('apollo');
              setCurrentView('scraper');
            }}
          >
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Apollo.io</h3>
              <p className="text-blue-200 mb-6">
                Professional B2B intelligence with 250M+ verified contacts and advanced enterprise filtering
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-200 text-sm">Verified Emails</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-200 text-sm">Executive Targeting</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-blue-300 text-sm">
                <Star className="w-4 h-4" />
                <span>Enterprise-grade accuracy</span>
              </div>
            </CardContent>
          </Card>

          {/* Apify */}
          <Card 
            className="bg-gradient-to-br from-green-900/50 to-green-800/30 backdrop-blur-sm border border-green-500/30 hover:border-green-400/50 transition-all cursor-pointer group"
            onClick={() => {
              setActiveTab('apify');
              setCurrentView('scraper');
            }}
          >
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Apify</h3>
              <p className="text-green-200 mb-6">
                Advanced web intelligence platform for LinkedIn profiles and comprehensive business listings
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-200 text-sm">Web Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-200 text-sm">Business Listings</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-green-300 text-sm">
                <Database className="w-4 h-4" />
                <span>Custom data extraction</span>
              </div>
            </CardContent>
          </Card>

          {/* PhantomBuster */}
          <Card 
            className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer group"
            onClick={() => {
              setActiveTab('phantombuster');
              setCurrentView('scraper');
            }}
          >
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">PhantomBuster</h3>
              <p className="text-purple-200 mb-6">
                Premium social media automation for LinkedIn, Twitter with intelligent connection management
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-200 text-sm">Social Automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-200 text-sm">Safe Outreach</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-purple-300 text-sm">
                <Rocket className="w-4 h-4" />
                <span>Multi-platform reach</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Real-time Processing */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Processing</h3>
              <p className="text-gray-300">
                Instant lead extraction with live notifications
              </p>
            </CardContent>
          </Card>

          {/* Enterprise Security */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
              <p className="text-gray-300">
                Bank-grade encryption and compliance
              </p>
            </CardContent>
          </Card>

          {/* Advanced Analytics */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Advanced Analytics</h3>
              <p className="text-gray-300">
                Comprehensive reporting and insights
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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

        {/* Main Scraper Interface */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="p-6 pb-0">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                  <TabsTrigger 
                    value="apollo" 
                    className="flex items-center gap-2 data-[state=active]:bg-blue-600"
                  >
                    <Users className="w-4 h-4" />
                    Apollo
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 text-xs">
                      Professional
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="apify" 
                    className="flex items-center gap-2 data-[state=active]:bg-green-600"
                  >
                    <Building className="w-4 h-4" />
                    Apify
                    <Badge variant="secondary" className="bg-green-500/20 text-green-200 text-xs">
                      Business
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="phantombuster" 
                    className="flex items-center gap-2 data-[state=active]:bg-purple-600"
                  >
                    <Target className="w-4 h-4" />
                    PhantomBuster
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 text-xs">
                      Social
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="apollo" className="mt-0">
                <ApolloScraperPanel onLaunch={handleApolloLaunch} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="apify" className="mt-0">
                <ApifyScraperPanel onLaunch={handleApifyLaunch} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="phantombuster" className="mt-0">
                <PhantomBusterScraperPanel onLaunch={handlePhantomBusterLaunch} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results Display */}
        {showResults && results && (
          <ScraperResultsDisplay 
            results={results} 
            onClose={() => setShowResults(false)} 
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-4">
                <Loader2 className="w-8 h-8 animate-spin text-green-400" />
                <div>
                  <div className="text-white font-medium">Scraping in progress...</div>
                  <div className="text-white/60 text-sm">This may take a few minutes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return currentView === 'overview' ? renderOverview() : renderScraper();
};

export default LeadScraper;