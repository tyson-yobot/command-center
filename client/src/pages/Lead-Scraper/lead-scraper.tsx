import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, Users, Building, MapPin, Loader2, 
  CheckCircle, AlertCircle, ArrowLeft, Download,
  Linkedin, Globe, Database, RefreshCw
} from 'lucide-react';
import { Link } from 'wouter';

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
  data?: {
    leads: ScrapedLead[];
    total: number;
    query: string;
    source: string;
  };
  message?: string;
  error?: string;
}

const LeadScraper: React.FC = () => {
  const { toast } = useToast();
  
  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [selectedPlatform, setSelectedPlatform] = useState<'linkedin' | 'google'>('linkedin');
  
  // Scraping state
  const [isScrapingLinkedIn, setIsScrapingLinkedIn] = useState(false);
  const [isScrapingGoogle, setIsScrapingGoogle] = useState(false);
  const [scrapedLeads, setScrapedLeads] = useState<ScrapedLead[]>([]);
  const [isSavingToAirtable, setIsSavingToAirtable] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Results state
  const [linkedInResults, setLinkedInResults] = useState<ScrapedLead[]>([]);
  const [googleResults, setGoogleResults] = useState<ScrapedLead[]>([]);
  const [totalLeadsFound, setTotalLeadsFound] = useState(0);
  const [lastScrapeTime, setLastScrapeTime] = useState<string>('');

  const handleLinkedInScrape = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search query to scrape LinkedIn leads",
        variant: "destructive"
      });
      return;
    }

    setIsScrapingLinkedIn(true);
    setScrapeProgress(0);
    setStatusMessage('Initializing LinkedIn scraper...');

    try {
      const response = await fetch('/api/scraper/linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          industry,
          location,
          companySize,
          maxResults
        }),
      });

      if (response.ok) {
        const result: ScrapeResult = await response.json();
        
        if (result.success && result.data) {
          setLinkedInResults(result.data.leads);
          setScrapedLeads(prev => [...prev, ...result.data.leads]);
          setTotalLeadsFound(prev => prev + result.data.total);
          setLastScrapeTime(new Date().toLocaleString());
          setScrapeProgress(100);
          setStatusMessage(`Successfully scraped ${result.data.total} leads from LinkedIn`);
          
          toast({
            title: "LinkedIn Scrape Complete",
            description: `Found ${result.data.total} new leads`,
          });
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error: any) {
      setStatusMessage(`LinkedIn scrape failed: ${error.message}`);
      toast({
        title: "LinkedIn Scrape Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsScrapingLinkedIn(false);
    }
  };

  const handleGoogleScrape = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search query to scrape Google leads",
        variant: "destructive"
      });
      return;
    }

    setIsScrapingGoogle(true);
    setScrapeProgress(0);
    setStatusMessage('Initializing Google scraper...');

    try {
      const response = await fetch('/api/scraper/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          industry,
          maxResults: Math.min(maxResults, 30) // Google has lower limits
        }),
      });

      if (response.ok) {
        const result: ScrapeResult = await response.json();
        
        if (result.success && result.data) {
          setGoogleResults(result.data.leads);
          setScrapedLeads(prev => [...prev, ...result.data.leads]);
          setTotalLeadsFound(prev => prev + result.data.total);
          setLastScrapeTime(new Date().toLocaleString());
          setScrapeProgress(100);
          setStatusMessage(`Successfully scraped ${result.data.total} leads from Google`);
          
          toast({
            title: "Google Scrape Complete",
            description: `Found ${result.data.total} new leads`,
          });
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error: any) {
      setStatusMessage(`Google scrape failed: ${error.message}`);
      toast({
        title: "Google Scrape Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsScrapingGoogle(false);
    }
  };

  const handleSaveToAirtable = async () => {
    if (scrapedLeads.length === 0) {
      toast({
        title: "No Leads to Save",
        description: "Please scrape some leads first",
        variant: "destructive"
      });
      return;
    }

    setIsSavingToAirtable(true);
    setStatusMessage('Saving leads to Airtable...');

    try {
      // Transform leads to match Airtable schema
      const airtableLeads = scrapedLeads.map(lead => ({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: 'New',
        source: lead.source,
        notes: `Title: ${lead.title}, Location: ${lead.location}`
      }));

      const response = await fetch('/api/airtable/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leads: airtableLeads }),
      });

      if (response.ok) {
        const result = await response.json();
        setStatusMessage(`Successfully saved ${scrapedLeads.length} leads to Scraped Leads (Universal)`);
        
        toast({
          title: "Leads Saved to Airtable",
          description: `${scrapedLeads.length} leads saved to Scraped Leads (Universal) table`,
        });

        // Clear scraped leads after successful save
        setScrapedLeads([]);
        setLinkedInResults([]);
        setGoogleResults([]);
      } else {
        throw new Error(`Failed to save to Airtable: ${response.status}`);
      }
    } catch (error: any) {
      setStatusMessage(`Failed to save to Airtable: ${error.message}`);
      toast({
        title: "Save Failed",
        description: "Unable to save leads to Airtable",
        variant: "destructive"
      });
    } finally {
      setIsSavingToAirtable(false);
    }
  };

  const handleExportCSV = () => {
    if (scrapedLeads.length === 0) {
      toast({
        title: "No Leads to Export",
        description: "Please scrape some leads first",
        variant: "destructive"
      });
      return;
    }

    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Title', 'Location', 'Source'];
    const csvContent = [
      headers.join(','),
      ...scrapedLeads.map(lead => [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phone,
        lead.company,
        lead.title,
        lead.location,
        lead.source
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `scraped_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Leads exported to CSV file",
    });
  };

  // Simulate progress for better UX
  useEffect(() => {
    if (isScrapingLinkedIn || isScrapingGoogle) {
      const interval = setInterval(() => {
        setScrapeProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isScrapingLinkedIn, isScrapingGoogle]);

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
                Lead Scraper
              </h1>
              <p className="text-white/60 mt-1">
                Scrape leads from LinkedIn and Google, then save to Scraped Leads (Universal)
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

        {/* Search Configuration */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Search Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Search Query *</Label>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Marketing Manager, Software Engineer"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., New York, San Francisco"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Max Results</Label>
                <Select value={maxResults.toString()} onValueChange={(value) => setMaxResults(parseInt(value))}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 leads</SelectItem>
                    <SelectItem value="50">50 leads</SelectItem>
                    <SelectItem value="100">100 leads</SelectItem>
                    <SelectItem value="200">200 leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scraping Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LinkedIn Scraper */}
          <Card className="bg-blue-900/40 backdrop-blur-sm border border-blue-400/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Linkedin className="w-5 h-5 mr-2 text-blue-400" />
                LinkedIn Scraper
                <Badge className="ml-2 bg-blue-500 text-white">Professional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-white/80 text-sm">
                Scrape professional profiles and contact information from LinkedIn based on job titles, industries, and locations.
              </div>
              
              {isScrapingLinkedIn && (
                <div className="space-y-2">
                  <Progress value={scrapeProgress} className="w-full" />
                  <div className="text-white/60 text-sm flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scraping LinkedIn profiles...
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleLinkedInScrape}
                disabled={isScrapingLinkedIn || !searchQuery.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isScrapingLinkedIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scraping LinkedIn...
                  </>
                ) : (
                  <>
                    <Linkedin className="w-4 h-4 mr-2" />
                    Start LinkedIn Scrape
                  </>
                )}
              </Button>
              
              {linkedInResults.length > 0 && (
                <div className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {linkedInResults.length} leads found from LinkedIn
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Scraper */}
          <Card className="bg-orange-900/40 backdrop-blur-sm border border-orange-400/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="w-5 h-5 mr-2 text-orange-400" />
                Google Scraper
                <Badge className="ml-2 bg-orange-500 text-white">Business</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-white/80 text-sm">
                Scrape business listings and contact information from Google search results and business directories.
              </div>
              
              {isScrapingGoogle && (
                <div className="space-y-2">
                  <Progress value={scrapeProgress} className="w-full" />
                  <div className="text-white/60 text-sm flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scraping Google results...
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleGoogleScrape}
                disabled={isScrapingGoogle || !searchQuery.trim()}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isScrapingGoogle ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scraping Google...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Start Google Scrape
                  </>
                )}
              </Button>
              
              {googleResults.length > 0 && (
                <div className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {googleResults.length} leads found from Google
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status and Actions */}
        {(scrapedLeads.length > 0 || statusMessage) && (
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Results & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusMessage && (
                <div className="text-white/80 text-sm p-3 bg-white/10 rounded-lg">
                  {statusMessage}
                </div>
              )}
              
              {scrapedLeads.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <span className="font-semibold">{scrapedLeads.length}</span> leads ready to save
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button
                        onClick={handleSaveToAirtable}
                        disabled={isSavingToAirtable}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSavingToAirtable ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Database className="w-4 h-4 mr-2" />
                            Save to Airtable
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/20" />
                  
                  {/* Quick preview of leads */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <div className="text-white/60 text-sm font-medium">Preview:</div>
                    {scrapedLeads.slice(0, 5).map((lead, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-white/80 p-2 bg-white/5 rounded">
                        <div>
                          <span className="font-medium">{lead.firstName} {lead.lastName}</span>
                          <span className="text-white/60 ml-2">• {lead.company}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {lead.source}
                        </Badge>
                      </div>
                    ))}
                    {scrapedLeads.length > 5 && (
                      <div className="text-white/60 text-xs text-center">
                        +{scrapedLeads.length - 5} more leads...
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeadScraper;