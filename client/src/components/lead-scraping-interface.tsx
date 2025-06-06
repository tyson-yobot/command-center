import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Download, 
  Settings, 
  Filter, 
  MapPin, 
  Building, 
  Users, 
  Mail, 
  Phone,
  Globe,
  Target,
  Clock,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface LeadScrapingProps {
  onScrapingStart?: () => void;
  onScrapingComplete?: (results: any) => void;
}

export function LeadScrapingInterface({ onScrapingStart, onScrapingComplete }: LeadScrapingProps) {
  const [selectedTool, setSelectedTool] = useState<'phantombuster' | 'apify' | 'apollo'>('phantombuster');
  const [scrapingConfig, setScrapingConfig] = useState({
    // PhantomBuster config
    phantombuster: {
      search_query: '',
      location: '',
      industry: '',
      company_size: '',
      job_title: '',
      max_results: 100,
      phantom_id: '',
      session_cookie: ''
    },
    // Apify config
    apify: {
      search_terms: '',
      location_filter: '',
      industry_filter: '',
      company_filter: '',
      job_level: '',
      max_profiles: 50,
      actor_id: 'apify/linkedin-company-scraper'
    },
    // Apollo config
    apollo: {
      company_name: '',
      domain: '',
      industry: '',
      location: '',
      employee_range: '',
      job_titles: '',
      max_contacts: 25
    }
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const { toast } = useToast();

  // PhantomBuster scraping mutation
  const phantombusterMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await apiRequest('POST', '/api/phantombuster/scrape', config);
      return response.json();
    },
    onSuccess: (data) => {
      handleScrapingComplete(data);
    },
    onError: (error) => {
      toast({
        title: "PhantomBuster Error",
        description: "Failed to start PhantomBuster scraping. Please check your API credentials.",
        variant: "destructive"
      });
      setIsRunning(false);
    }
  });

  // Apify scraping mutation
  const apifyMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await apiRequest('POST', '/api/apify/scrape', config);
      return response.json();
    },
    onSuccess: (data) => {
      handleScrapingComplete(data);
    },
    onError: (error) => {
      toast({
        title: "Apify Error", 
        description: "Failed to start Apify scraping. Please check your API credentials.",
        variant: "destructive"
      });
      setIsRunning(false);
    }
  });

  // Apollo scraping mutation
  const apolloMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await apiRequest('POST', '/api/apollo/scrape', config);
      return response.json();
    },
    onSuccess: (data) => {
      handleScrapingComplete(data);
    },
    onError: (error) => {
      toast({
        title: "Apollo Error",
        description: "Failed to start Apollo scraping. Please check your API credentials.", 
        variant: "destructive"
      });
      setIsRunning(false);
    }
  });

  const handleScrapingComplete = (data: any) => {
    setResults(data.results || []);
    setProgress(100);
    setCurrentStatus('Complete');
    setIsRunning(false);
    
    toast({
      title: "Scraping Complete",
      description: `Found ${data.results?.length || 0} leads`
    });
    
    if (onScrapingComplete) {
      onScrapingComplete(data);
    }
  };

  const startScraping = () => {
    const config = scrapingConfig[selectedTool];
    
    setIsRunning(true);
    setProgress(0);
    setCurrentStatus('Starting...');
    setResults([]);
    
    if (onScrapingStart) {
      onScrapingStart();
    }

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 1000);

    // Start the appropriate scraping tool
    switch (selectedTool) {
      case 'phantombuster':
        setCurrentStatus('Running PhantomBuster...');
        phantombusterMutation.mutate(config);
        break;
      case 'apify':
        setCurrentStatus('Running Apify actor...');
        apifyMutation.mutate(config);
        break;
      case 'apollo':
        setCurrentStatus('Searching Apollo.io...');
        apolloMutation.mutate(config);
        break;
    }
  };

  const updateConfig = (tool: string, field: string, value: string) => {
    setScrapingConfig(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const renderPhantomBusterConfig = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pb-search">Search Query</Label>
          <Input
            id="pb-search"
            value={scrapingConfig.phantombuster.search_query}
            onChange={(e) => updateConfig('phantombuster', 'search_query', e.target.value)}
            placeholder="e.g., CEO OR Founder"
          />
        </div>
        <div>
          <Label htmlFor="pb-location">Location</Label>
          <Input
            id="pb-location"
            value={scrapingConfig.phantombuster.location}
            onChange={(e) => updateConfig('phantombuster', 'location', e.target.value)}
            placeholder="e.g., New York, NY"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pb-industry">Industry</Label>
          <Select onValueChange={(value) => updateConfig('phantombuster', 'industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="pb-company-size">Company Size</Label>
          <Select onValueChange={(value) => updateConfig('phantombuster', 'company_size', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pb-max-results">Max Results</Label>
          <Input
            id="pb-max-results"
            type="number"
            value={scrapingConfig.phantombuster.max_results}
            onChange={(e) => updateConfig('phantombuster', 'max_results', e.target.value)}
            min="1"
            max="1000"
          />
        </div>
        <div>
          <Label htmlFor="pb-phantom-id">Phantom ID</Label>
          <Input
            id="pb-phantom-id"
            value={scrapingConfig.phantombuster.phantom_id}
            onChange={(e) => updateConfig('phantombuster', 'phantom_id', e.target.value)}
            placeholder="Your PhantomBuster Phantom ID"
          />
        </div>
      </div>
    </div>
  );

  const renderApifyConfig = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="apify-search">Search Terms</Label>
          <Input
            id="apify-search"
            value={scrapingConfig.apify.search_terms}
            onChange={(e) => updateConfig('apify', 'search_terms', e.target.value)}
            placeholder="e.g., software engineer, data scientist"
          />
        </div>
        <div>
          <Label htmlFor="apify-location">Location Filter</Label>
          <Input
            id="apify-location"
            value={scrapingConfig.apify.location_filter}
            onChange={(e) => updateConfig('apify', 'location_filter', e.target.value)}
            placeholder="e.g., San Francisco Bay Area"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="apify-industry">Industry Filter</Label>
          <Input
            id="apify-industry"
            value={scrapingConfig.apify.industry_filter}
            onChange={(e) => updateConfig('apify', 'industry_filter', e.target.value)}
            placeholder="e.g., Computer Software"
          />
        </div>
        <div>
          <Label htmlFor="apify-company">Company Filter</Label>
          <Input
            id="apify-company"
            value={scrapingConfig.apify.company_filter}
            onChange={(e) => updateConfig('apify', 'company_filter', e.target.value)}
            placeholder="e.g., Google, Microsoft"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="apify-job-level">Job Level</Label>
          <Input
            id="apify-job-level"
            value={scrapingConfig.apify.job_level}
            onChange={(e) => updateConfig('apify', 'job_level', e.target.value)}
            placeholder="e.g., Senior, Director, Executive"
          />
        </div>
        <div>
          <Label htmlFor="apify-max-profiles">Max Profiles</Label>
          <Input
            id="apify-max-profiles"
            type="number"
            value={scrapingConfig.apify.max_profiles}
            onChange={(e) => updateConfig('apify', 'max_profiles', e.target.value)}
            min="1"
            max="500"
          />
        </div>
      </div>
    </div>
  );

  const renderApolloConfig = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="apollo-company">Company Name</Label>
          <Input
            id="apollo-company"
            value={scrapingConfig.apollo.company_name}
            onChange={(e) => updateConfig('apollo', 'company_name', e.target.value)}
            placeholder="e.g., Salesforce"
          />
        </div>
        <div>
          <Label htmlFor="apollo-domain">Domain</Label>
          <Input
            id="apollo-domain"
            value={scrapingConfig.apollo.domain}
            onChange={(e) => updateConfig('apollo', 'domain', e.target.value)}
            placeholder="e.g., salesforce.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="apollo-industry">Industry</Label>
          <Input
            id="apollo-industry"
            value={scrapingConfig.apollo.industry}
            onChange={(e) => updateConfig('apollo', 'industry', e.target.value)}
            placeholder="e.g., Software Development"
          />
        </div>
        <div>
          <Label htmlFor="apollo-location">Location</Label>
          <Input
            id="apollo-location"
            value={scrapingConfig.apollo.location}
            onChange={(e) => updateConfig('apollo', 'location', e.target.value)}
            placeholder="e.g., San Francisco, CA"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="apollo-employee-range">Employee Range</Label>
          <Input
            id="apollo-employee-range"
            value={scrapingConfig.apollo.employee_range}
            onChange={(e) => updateConfig('apollo', 'employee_range', e.target.value)}
            placeholder="e.g., 1-10, 51-200, 1000+"
          />
        </div>
        <div>
          <Label htmlFor="apollo-job-titles">Job Titles</Label>
          <Input
            id="apollo-job-titles"
            value={scrapingConfig.apollo.job_titles}
            onChange={(e) => updateConfig('apollo', 'job_titles', e.target.value)}
            placeholder="e.g., CEO, CTO, VP Engineering"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="apollo-max-contacts">Max Contacts</Label>
        <Input
          id="apollo-max-contacts"
          type="number"
          value={scrapingConfig.apollo.max_contacts}
          onChange={(e) => updateConfig('apollo', 'max_contacts', e.target.value)}
          min="1"
          max="100"
        />
      </div>
    </div>
  );

  const renderResults = () => (
    <ScrollArea className="h-96">
      <div className="space-y-2">
        {results.map((lead, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{lead.name || 'N/A'}</span>
                  <Badge variant="outline">{lead.title || 'Unknown Title'}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {lead.company && (
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {lead.company}
                    </div>
                  )}
                  {lead.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {lead.location}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {lead.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lead.email}
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </div>
                  )}
                </div>
              </div>
              <Badge variant={lead.verified ? "default" : "secondary"}>
                {lead.verified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Lead Scraping Interface
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tool Selection */}
        <div>
          <Label>Scraping Tool</Label>
          <Tabs value={selectedTool} onValueChange={(value) => setSelectedTool(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="phantombuster">PhantomBuster</TabsTrigger>
              <TabsTrigger value="apify">Apify</TabsTrigger>
              <TabsTrigger value="apollo">Apollo.io</TabsTrigger>
            </TabsList>
            
            <TabsContent value="phantombuster" className="mt-4">
              {renderPhantomBusterConfig()}
            </TabsContent>
            
            <TabsContent value="apify" className="mt-4">
              {renderApifyConfig()}
            </TabsContent>
            
            <TabsContent value="apollo" className="mt-4">
              {renderApolloConfig()}
            </TabsContent>
          </Tabs>
        </div>

        {/* Progress and Status */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{currentStatus}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={startScraping}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Lead Scrape
              </>
            )}
          </Button>
          
          {results.length > 0 && (
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export ({results.length})
            </Button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <Label>Results ({results.length} leads found)</Label>
            {renderResults()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}