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
  const [activeTab, setActiveTab] = useState('apollo');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapeResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [totalLeadsFound, setTotalLeadsFound] = useState(0);
  const [lastScrapeTime, setLastScrapeTime] = useState<string>('');

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
        setShowResults(true);
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
        setShowResults(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/command-center">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Command Center
              </Button>
            </Link>
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
};

export default LeadScraper;