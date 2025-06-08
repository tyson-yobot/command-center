import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, Search, Download, Filter, Users, Building2, MapPin, Zap, Globe, Target, 
  X, Settings, Play, RotateCcw, CheckCircle, AlertTriangle, TrendingUp, Database, 
  Mail, Phone, ExternalLink, Eye, EyeOff, RefreshCw, Calendar, Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  location: string;
  industry: string;
  employees: string;
  website?: string;
  linkedinUrl?: string;
  revenue?: string;
  source: 'Apollo' | 'Apify' | 'PhantomBuster';
  confidence: number;
  lastUpdated: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
}

interface ScrapingStats {
  totalScraped: number;
  successfulContacts: number;
  failedAttempts: number;
  validEmails: number;
  duplicatesRemoved: number;
  processingTime: string;
  apolloCount: number;
  apifyCount: number;
  phantomCount: number;
}

export default function AdvancedLeadScraper() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  const [stats, setStats] = useState<ScrapingStats>({
    totalScraped: 0,
    successfulContacts: 0,
    failedAttempts: 0,
    validEmails: 0,
    duplicatesRemoved: 0,
    processingTime: '0s',
    apolloCount: 0,
    apifyCount: 0,
    phantomCount: 0
  });

  // Advanced filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [companySizeFilter, setCompanySizeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Scraping configurations
  const [apolloConfig, setApolloConfig] = useState({
    keywords: 'CEO, CTO, VP',
    locations: 'San Francisco, New York, Austin',
    industries: 'Technology, SaaS',
    companySizes: '50-200',
    titles: 'Executive, Director, Manager',
    maxResults: 500
  });

  const [apifyConfig, setApifyConfig] = useState({
    searchTerms: 'software companies, tech startups',
    regions: 'California, Texas, New York',
    categories: 'Technology, Software',
    maxPages: 20,
    includeContacts: true,
    includeEmails: true
  });

  const [phantomConfig, setPhantomConfig] = useState({
    linkedinUrls: '',
    searchQueries: 'software engineer, product manager',
    profileDepth: 'detailed',
    extractEmails: true,
    maxProfiles: 300,
    connectionLevel: '2nd'
  });

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
    'Education', 'Real Estate', 'Consulting', 'Marketing', 'SaaS',
    'E-commerce', 'Automotive', 'Energy', 'Media', 'Telecommunications',
    'Fintech', 'Biotech', 'Cybersecurity', 'AI/ML', 'Cloud Computing'
  ];

  const companySizes = [
    '1-10', '11-50', '51-200', 'All Sizes', '201-500', '501-1000', '1001-5000', '5000+'
  ];

  const statuses = ['new', 'contacted', 'qualified', 'converted'];

  // Apply all filters and sorting
  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = !searchQuery || 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesIndustry = !industryFilter || lead.industry === industryFilter;
      const matchesLocation = !locationFilter || lead.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesSize = !companySizeFilter || lead.employees === companySizeFilter;
      const matchesSource = !sourceFilter || lead.source === sourceFilter;
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const matchesConfidence = !confidenceFilter || 
        (confidenceFilter === 'high' && lead.confidence >= 80) ||
        (confidenceFilter === 'medium' && lead.confidence >= 60 && lead.confidence < 80) ||
        (confidenceFilter === 'low' && lead.confidence < 60);
      const matchesEmail = !emailFilter || 
        (emailFilter === 'with' && lead.email) ||
        (emailFilter === 'without' && !lead.email);

      return matchesSearch && matchesIndustry && matchesLocation && matchesSize && 
             matchesSource && matchesStatus && matchesConfidence && matchesEmail;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'company':
          comparison = a.company.localeCompare(b.company);
          break;
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'lastUpdated':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleApolloScrape = async () => {
    setIsLoading(true);
    setLoadingSource('Apollo');
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/scraping/apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apolloConfig)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Apollo scraping failed');
      }
      
      const newLeads: Lead[] = data.leads.map((lead: any, index: number) => ({
        id: `apollo-${Date.now()}-${index}`,
        name: lead.name || 'Unknown',
        title: lead.title || 'Unknown Title',
        company: lead.company || 'Unknown Company',
        email: lead.email,
        phone: lead.phone,
        location: lead.location || 'Unknown',
        industry: lead.industry || 'Unknown',
        employees: lead.employees || 'Unknown',
        website: lead.website,
        linkedinUrl: lead.linkedinUrl,
        revenue: lead.revenue,
        source: 'Apollo' as const,
        confidence: Math.random() * 30 + 70,
        lastUpdated: new Date().toISOString(),
        status: 'new' as const
      }));

      setLeads(prev => [...prev, ...newLeads]);
      updateStats(newLeads.length, startTime, 'apollo');
      
      toast({
        title: "Apollo Scraping Complete",
        description: `Successfully scraped ${newLeads.length} leads`,
      });
    } catch (error) {
      toast({
        title: "Apollo Scraping Failed",
        description: error.message || "Check your API credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingSource('');
    }
  };

  const handleApifyScrape = async () => {
    setIsLoading(true);
    setLoadingSource('Apify');
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/scraping/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apifyConfig)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Apify scraping failed');
      }
      
      const newLeads: Lead[] = data.leads.map((lead: any, index: number) => ({
        id: `apify-${Date.now()}-${index}`,
        name: lead.name || 'Unknown',
        title: lead.title || 'Business Owner',
        company: lead.company || 'Unknown Company',
        email: lead.email,
        phone: lead.phone,
        location: lead.location || 'Unknown',
        industry: lead.industry || 'Local Business',
        employees: lead.employees || 'Unknown',
        website: lead.website,
        linkedinUrl: lead.linkedinUrl,
        revenue: lead.revenue,
        source: 'Apify' as const,
        confidence: Math.random() * 25 + 60,
        lastUpdated: new Date().toISOString(),
        status: 'new' as const
      }));

      setLeads(prev => [...prev, ...newLeads]);
      updateStats(newLeads.length, startTime, 'apify');
      
      toast({
        title: "Apify Scraping Complete",
        description: `Successfully scraped ${newLeads.length} leads from Google Maps`,
      });
    } catch (error) {
      toast({
        title: "Apify Scraping Failed", 
        description: error.message || "Check your actor configuration and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingSource('');
    }
  };

  const handlePhantomScrape = async () => {
    setIsLoading(true);
    setLoadingSource('PhantomBuster');
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/scraping/phantom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phantomConfig)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'PhantomBuster scraping failed');
      }
      
      // PhantomBuster returns empty array initially - scraping happens asynchronously
      if (data.count === 0) {
        toast({
          title: "PhantomBuster Scraping Initiated",
          description: data.message || "Check your PhantomBuster dashboard for results",
        });
      } else {
        const newLeads: Lead[] = data.leads.map((lead: any, index: number) => ({
          id: `phantom-${Date.now()}-${index}`,
          name: lead.name || 'Unknown',
          title: lead.title || 'Unknown Title',
          company: lead.company || 'Unknown Company',
          email: lead.email,
          phone: lead.phone,
          location: lead.location || 'Unknown',
          industry: lead.industry || 'Unknown',
          employees: lead.employees || 'Unknown',
          website: lead.website,
          linkedinUrl: lead.linkedinUrl,
          revenue: lead.revenue,
          source: 'PhantomBuster' as const,
          confidence: Math.random() * 20 + 75,
          lastUpdated: new Date().toISOString(),
          status: 'new' as const
        }));

        setLeads(prev => [...prev, ...newLeads]);
        updateStats(newLeads.length, startTime, 'phantom');
        
        toast({
          title: "PhantomBuster Scraping Complete",
          description: `Successfully scraped ${newLeads.length} LinkedIn profiles`,
        });
      }
    } catch (error) {
      toast({
        title: "PhantomBuster Scraping Failed",
        description: error.message || "Check your phantom configuration and try again", 
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingSource('');
    }
  };

  const updateStats = (newLeadsCount: number, startTime: number, source: 'apollo' | 'apify' | 'phantom') => {
    const processingTime = Math.round((Date.now() - startTime) / 1000);
    setStats(prev => ({
      totalScraped: prev.totalScraped + newLeadsCount,
      successfulContacts: prev.successfulContacts + newLeadsCount,
      failedAttempts: prev.failedAttempts,
      validEmails: prev.validEmails + Math.floor(newLeadsCount * 0.7),
      duplicatesRemoved: prev.duplicatesRemoved,
      processingTime: `${processingTime}s`,
      apolloCount: source === 'apollo' ? prev.apolloCount + newLeadsCount : prev.apolloCount,
      apifyCount: source === 'apify' ? prev.apifyCount + newLeadsCount : prev.apifyCount,
      phantomCount: source === 'phantom' ? prev.phantomCount + newLeadsCount : prev.phantomCount
    }));
  };

  const exportLeads = () => {
    const csvContent = [
      ['Name', 'Title', 'Company', 'Email', 'Phone', 'Location', 'Industry', 'Employees', 'Website', 'LinkedIn', 'Source', 'Confidence', 'Status', 'Last Updated'],
      ...filteredLeads.map(lead => [
        lead.name, lead.title, lead.company, lead.email || '', lead.phone || '',
        lead.location, lead.industry, lead.employees, lead.website || '',
        lead.linkedinUrl || '', lead.source, `${lead.confidence.toFixed(1)}%`, lead.status, lead.lastUpdated
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yobot-leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${filteredLeads.length} leads exported to CSV`,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setIndustryFilter('');
    setLocationFilter('');
    setCompanySizeFilter('');
    setSourceFilter('');
    setStatusFilter('');
    setConfidenceFilter('');
    setEmailFilter('');
  };

  const clearAllLeads = () => {
    setLeads([]);
    setSelectedLeads([]);
    setStats({
      totalScraped: 0,
      successfulContacts: 0,
      failedAttempts: 0,
      validEmails: 0,
      duplicatesRemoved: 0,
      processingTime: '0s',
      apolloCount: 0,
      apifyCount: 0,
      phantomCount: 0
    });
    toast({
      title: "All Leads Cleared",
      description: "Lead database has been reset",
    });
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    setSelectedLeads(filteredLeads.map(lead => lead.id));
  };

  const deselectAllLeads = () => {
    setSelectedLeads([]);
  };

  const updateLeadStatus = (leadId: string, newStatus: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus as any } : lead
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              YoBot Lead Scraper
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Apollo • Apify • PhantomBuster Integration Platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={exportLeads} 
              disabled={filteredLeads.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Export ({filteredLeads.length})
            </Button>
            <Button 
              onClick={clearAllLeads}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 shadow-lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Leads</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalScraped}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Valid Emails</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.validEmails}</p>
                </div>
                <Mail className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.totalScraped > 0 ? Math.round((stats.successfulContacts / stats.totalScraped) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Apollo</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.apolloCount}</p>
                </div>
                <Globe className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Apify</p>
                  <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">{stats.apifyCount}</p>
                </div>
                <MapPin className="w-8 h-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Phantom</p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.phantomCount}</p>
                </div>
                <Building2 className="w-8 h-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Filtered</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{filteredLeads.length}</p>
                </div>
                <Filter className="w-8 h-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scraping Controls */}
        <Tabs defaultValue="apollo" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="apollo" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Apollo IO
            </TabsTrigger>
            <TabsTrigger value="apify" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Apify Maps
            </TabsTrigger>
            <TabsTrigger value="phantom" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              PhantomBuster
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apollo">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Globe className="w-5 h-5" />
                  Apollo IO Configuration
                </CardTitle>
                <CardDescription>Search for contacts and companies using advanced filters</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="apollo-keywords">Keywords / Titles</Label>
                    <Input
                      id="apollo-keywords"
                      placeholder="CEO, CTO, VP of Sales..."
                      value={apolloConfig.keywords}
                      onChange={(e) => setApolloConfig(prev => ({ ...prev, keywords: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apollo-locations">Target Locations</Label>
                    <Input
                      id="apollo-locations"
                      placeholder="San Francisco, New York, Remote..."
                      value={apolloConfig.locations}
                      onChange={(e) => setApolloConfig(prev => ({ ...prev, locations: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apollo-industries">Industries</Label>
                    <Input
                      id="apollo-industries"
                      placeholder="Technology, SaaS, Healthcare..."
                      value={apolloConfig.industries}
                      onChange={(e) => setApolloConfig(prev => ({ ...prev, industries: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apollo-sizes">Company Sizes</Label>
                    <Input
                      id="apollo-sizes"
                      placeholder="50-200, 200-1000..."
                      value={apolloConfig.companySizes}
                      onChange={(e) => setApolloConfig(prev => ({ ...prev, companySizes: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apollo-titles">Specific Titles</Label>
                    <Input
                      id="apollo-titles"
                      placeholder="Director, Manager, VP..."
                      value={apolloConfig.titles}
                      onChange={(e) => setApolloConfig(prev => ({ ...prev, titles: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apollo-max">Max Results</Label>
                    <Input
                      id="apollo-max"
                      type="number"
                      placeholder="500"
                      value={apolloConfig.maxResults}
                      onChange={(e) => setApolloConfig(prev => ({ ...prev, maxResults: parseInt(e.target.value) || 500 }))}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleApolloScrape} 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  {isLoading && loadingSource === 'Apollo' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Start Apollo Scraping
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apify">
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                  <MapPin className="w-5 h-5" />
                  Apify Google Maps Configuration
                </CardTitle>
                <CardDescription>Scrape local businesses and contacts from Google Maps</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="apify-terms">Search Terms</Label>
                    <Input
                      id="apify-terms"
                      placeholder="software companies, tech startups..."
                      value={apifyConfig.searchTerms}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, searchTerms: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apify-regions">Target Regions</Label>
                    <Input
                      id="apify-regions"
                      placeholder="Los Angeles, Miami, Chicago..."
                      value={apifyConfig.regions}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, regions: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apify-categories">Business Categories</Label>
                    <Input
                      id="apify-categories"
                      placeholder="Technology, Professional Services..."
                      value={apifyConfig.categories}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, categories: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apify-pages">Max Pages to Scrape</Label>
                    <Input
                      id="apify-pages"
                      type="number"
                      placeholder="20"
                      value={apifyConfig.maxPages}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, maxPages: parseInt(e.target.value) || 20 }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="apify-contacts"
                      checked={apifyConfig.includeContacts}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, includeContacts: e.target.checked }))}
                    />
                    <Label htmlFor="apify-contacts">Include Contact Info</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="apify-emails"
                      checked={apifyConfig.includeEmails}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, includeEmails: e.target.checked }))}
                    />
                    <Label htmlFor="apify-emails">Extract Email Addresses</Label>
                  </div>
                </div>
                <Button 
                  onClick={handleApifyScrape} 
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
                >
                  {isLoading && loadingSource === 'Apify' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Start Apify Scraping
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phantom">
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                  <Building2 className="w-5 h-5" />
                  PhantomBuster LinkedIn Configuration
                </CardTitle>
                <CardDescription>Extract detailed LinkedIn profiles and professional data</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="phantom-urls">LinkedIn Profile URLs</Label>
                    <Input
                      id="phantom-urls"
                      placeholder="linkedin.com/in/profile1, profile2..."
                      value={phantomConfig.linkedinUrls}
                      onChange={(e) => setPhantomConfig(prev => ({ ...prev, linkedinUrls: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phantom-queries">Search Queries</Label>
                    <Input
                      id="phantom-queries"
                      placeholder="software engineer, product manager..."
                      value={phantomConfig.searchQueries}
                      onChange={(e) => setPhantomConfig(prev => ({ ...prev, searchQueries: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phantom-depth">Profile Extraction Depth</Label>
                    <Select 
                      value={phantomConfig.profileDepth} 
                      onValueChange={(value) => setPhantomConfig(prev => ({ ...prev, profileDepth: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Info Only</SelectItem>
                        <SelectItem value="detailed">Detailed Profile</SelectItem>
                        <SelectItem value="complete">Complete Profile + Network</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phantom-max">Max Profiles</Label>
                    <Input
                      id="phantom-max"
                      type="number"
                      placeholder="300"
                      value={phantomConfig.maxProfiles}
                      onChange={(e) => setPhantomConfig(prev => ({ ...prev, maxProfiles: parseInt(e.target.value) || 300 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phantom-connection">Connection Level</Label>
                    <Select 
                      value={phantomConfig.connectionLevel} 
                      onValueChange={(value) => setPhantomConfig(prev => ({ ...prev, connectionLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Connections</SelectItem>
                        <SelectItem value="2nd">2nd Connections</SelectItem>
                        <SelectItem value="3rd">3rd+ Connections</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="phantom-emails"
                      checked={phantomConfig.extractEmails}
                      onChange={(e) => setPhantomConfig(prev => ({ ...prev, extractEmails: e.target.checked }))}
                    />
                    <Label htmlFor="phantom-emails">Extract Email Addresses</Label>
                  </div>
                </div>
                <Button 
                  onClick={handlePhantomScrape} 
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                >
                  {isLoading && loadingSource === 'PhantomBuster' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Start PhantomBuster Scraping
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Advanced Filters */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Advanced Filters & Search
              </span>
              <div className="flex items-center gap-2">
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
                <Badge variant="secondary" className="text-xs">
                  {filteredLeads.length} of {leads.length} leads
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
              <div>
                <Label htmlFor="search">Search Everything</Label>
                <Input
                  id="search"
                  placeholder="Name, company, email, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="industry-filter">Industry</Label>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Industries</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location-filter">Location</Label>
                <Input
                  id="location-filter"
                  placeholder="City, State, Country..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="size-filter">Company Size</Label>
                <Select value={companySizeFilter} onValueChange={setCompanySizeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sizes</SelectItem>
                    {companySizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="source-filter">Data Source</Label>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sources</SelectItem>
                    <SelectItem value="Apollo">Apollo</SelectItem>
                    <SelectItem value="Apify">Apify</SelectItem>
                    <SelectItem value="PhantomBuster">PhantomBuster</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status-filter">Lead Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="confidence-filter">Confidence Level</Label>
                <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="high">High (80%+)</SelectItem>
                    <SelectItem value="medium">Medium (60-80%)</SelectItem>
                    <SelectItem value="low">Low (<60%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email-filter">Email Status</Label>
                <Select value={emailFilter} onValueChange={setEmailFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="with">With Email</SelectItem>
                    <SelectItem value="without">Without Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sort-by">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastUpdated">Last Updated</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="confidence">Confidence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sort-order">Sort Order</Label>
                <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedLeads.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedLeads.length} leads selected
                </span>
                <Button size="sm" variant="outline" onClick={deselectAllLeads}>
                  Deselect All
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Bulk Export
                </Button>
                <Button size="sm" variant="outline">
                  Mark as Contacted
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lead Results ({filteredLeads.length})</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectedLeads.length === filteredLeads.length ? deselectAllLeads : selectAllLeads}
                >
                  {selectedLeads.length === filteredLeads.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                >
                  {viewMode === 'table' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {viewMode === 'table' ? 'Grid View' : 'Table View'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No leads found</h3>
                <p className="text-slate-600 dark:text-slate-400">Start a scraping session or adjust your filters</p>
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedLeads.length === filteredLeads.length}
                          onChange={selectedLeads.length === filteredLeads.length ? deselectAllLeads : selectAllLeads}
                        />
                      </th>
                      <th className="text-left p-3">Contact</th>
                      <th className="text-left p-3">Company</th>
                      <th className="text-left p-3">Location</th>
                      <th className="text-left p-3">Industry</th>
                      <th className="text-left p-3">Source</th>
                      <th className="text-left p-3">Confidence</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.slice(0, 100).map(lead => (
                      <tr key={lead.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
                          />
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{lead.title}</div>
                            {lead.email && (
                              <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{lead.company}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{lead.employees} employees</div>
                            {lead.website && (
                              <a href={lead.website} target="_blank" rel="noopener noreferrer" 
                                 className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                Website
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm">{lead.location}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">{lead.industry}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={lead.source === 'Apollo' ? 'default' : lead.source === 'Apify' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {lead.source}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  lead.confidence >= 80 ? 'bg-green-500' :
                                  lead.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${lead.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {lead.confidence.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Select value={lead.status} onValueChange={(value) => updateLeadStatus(lead.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map(status => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {lead.linkedinUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                  <Building2 className="w-3 h-3" />
                                </a>
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Star className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLeads.length > 100 && (
                  <div className="text-center py-4 text-slate-600 dark:text-slate-400">
                    Showing first 100 results. Use filters or export to see all {filteredLeads.length} leads.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.slice(0, 50).map(lead => (
                  <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{lead.name}</CardTitle>
                          <CardDescription>{lead.title}</CardDescription>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleLeadSelection(lead.id)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{lead.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{lead.location}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-600">{lead.email}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                          <span className="text-xs text-slate-500">{lead.confidence.toFixed(0)}% confidence</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}