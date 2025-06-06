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
import { Checkbox } from '@/components/ui/checkbox';
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
      industries: [] as string[],
      company_sizes: [] as string[],
      job_titles: [] as string[],
      max_results: 100,
      phantom_id: '',
      session_cookie: ''
    },
    // Apify config
    apify: {
      search_terms: '',
      locations: [] as string[],
      industries: [] as string[],
      company_filters: [] as string[],
      job_levels: [] as string[],
      max_profiles: 50,
      actor_id: 'apify/linkedin-company-scraper'
    },
    // Apollo config
    apollo: {
      company_name: '',
      domain: '',
      industries: [] as string[],
      locations: [] as string[],
      employee_ranges: [] as string[],
      job_titles: [] as string[],
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

  const updateConfig = (tool: string, field: string, value: string | string[]) => {
    setScrapingConfig(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const toggleArrayValue = (tool: string, field: string, value: string) => {
    setScrapingConfig(prev => {
      const currentArray = prev[tool as keyof typeof prev][field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [tool]: {
          ...prev[tool as keyof typeof prev],
          [field]: newArray
        }
      };
    });
  };

  // Filter options for each platform
  const filterOptions = {
    industries: [
      'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
      'Retail', 'Real Estate', 'Construction', 'Legal', 'Marketing',
      'Consulting', 'Non-profit', 'Government', 'Transportation', 'Energy'
    ],
    companySizes: [
      '1-10 employees', '11-50 employees', '51-200 employees', 
      '201-500 employees', '501-1000 employees', '1000+ employees'
    ],
    jobTitles: [
      'CEO', 'CTO', 'CFO', 'COO', 'VP', 'Director', 'Manager', 
      'Senior', 'Lead', 'Principal', 'Founder', 'Owner'
    ],
    locations: [
      'United States', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL',
      'San Francisco, CA', 'Austin, TX', 'Seattle, WA', 'Boston, MA',
      'Canada', 'United Kingdom', 'Germany', 'France', 'Australia'
    ],
    employeeRanges: [
      '1-10', '11-50', '51-200', '201-500', '501-1000', 
      '1001-5000', '5001-10000', '10000+'
    ],
    jobLevels: [
      'Entry Level', 'Mid Level', 'Senior Level', 'Director', 
      'VP Level', 'C-Level', 'Owner/Founder'
    ]
  };

  const renderPhantomBusterConfig = () => (
    <div className="space-y-6">
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
          <Label htmlFor="pb-location">Primary Location</Label>
          <Input
            id="pb-location"
            value={scrapingConfig.phantombuster.location}
            onChange={(e) => updateConfig('phantombuster', 'location', e.target.value)}
            placeholder="e.g., New York, NY"
          />
        </div>
      </div>

      {/* Industries Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Industries ({scrapingConfig.phantombuster.industries.length} selected)</Label>
        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
          {filterOptions.industries.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`pb-industry-${industry}`}
                checked={scrapingConfig.phantombuster.industries.includes(industry)}
                onCheckedChange={() => toggleArrayValue('phantombuster', 'industries', industry)}
              />
              <Label htmlFor={`pb-industry-${industry}`} className="text-sm">{industry}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Company Sizes Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Company Sizes ({scrapingConfig.phantombuster.company_sizes.length} selected)</Label>
        <div className="grid grid-cols-2 gap-2">
          {filterOptions.companySizes.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`pb-size-${size}`}
                checked={scrapingConfig.phantombuster.company_sizes.includes(size)}
                onCheckedChange={() => toggleArrayValue('phantombuster', 'company_sizes', size)}
              />
              <Label htmlFor={`pb-size-${size}`} className="text-sm">{size}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Job Titles Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Job Titles ({scrapingConfig.phantombuster.job_titles.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2">
          {filterOptions.jobTitles.map((title) => (
            <div key={title} className="flex items-center space-x-2">
              <Checkbox
                id={`pb-title-${title}`}
                checked={scrapingConfig.phantombuster.job_titles.includes(title)}
                onCheckedChange={() => toggleArrayValue('phantombuster', 'job_titles', title)}
              />
              <Label htmlFor={`pb-title-${title}`} className="text-sm">{title}</Label>
            </div>
          ))}
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
    <div className="space-y-6">
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

      {/* Locations Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Locations ({scrapingConfig.apify.locations.length} selected)</Label>
        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
          {filterOptions.locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={`apify-location-${location}`}
                checked={scrapingConfig.apify.locations.includes(location)}
                onCheckedChange={() => toggleArrayValue('apify', 'locations', location)}
              />
              <Label htmlFor={`apify-location-${location}`} className="text-sm">{location}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Industries Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Industries ({scrapingConfig.apify.industries.length} selected)</Label>
        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
          {filterOptions.industries.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`apify-industry-${industry}`}
                checked={scrapingConfig.apify.industries.includes(industry)}
                onCheckedChange={() => toggleArrayValue('apify', 'industries', industry)}
              />
              <Label htmlFor={`apify-industry-${industry}`} className="text-sm">{industry}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Job Levels Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Job Levels ({scrapingConfig.apify.job_levels.length} selected)</Label>
        <div className="grid grid-cols-3 gap-2">
          {filterOptions.jobLevels.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`apify-level-${level}`}
                checked={scrapingConfig.apify.job_levels.includes(level)}
                onCheckedChange={() => toggleArrayValue('apify', 'job_levels', level)}
              />
              <Label htmlFor={`apify-level-${level}`} className="text-sm">{level}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Company Filters */}
      <div>
        <Label htmlFor="apify-company">Company Keywords (comma-separated)</Label>
        <Input
          id="apify-company"
          value={scrapingConfig.apify.company_filters.join(', ')}
          onChange={(e) => updateConfig('apify', 'company_filters', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="e.g., Google, Microsoft, Amazon, Apple"
        />
      </div>
    </div>
  );

  const renderApolloConfig = () => (
    <div className="space-y-6">
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

      {/* Industries Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Industries ({scrapingConfig.apollo.industries.length} selected)</Label>
        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
          {filterOptions.industries.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`apollo-industry-${industry}`}
                checked={scrapingConfig.apollo.industries.includes(industry)}
                onCheckedChange={() => toggleArrayValue('apollo', 'industries', industry)}
              />
              <Label htmlFor={`apollo-industry-${industry}`} className="text-sm">{industry}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Locations Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Locations ({scrapingConfig.apollo.locations.length} selected)</Label>
        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
          {filterOptions.locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={`apollo-location-${location}`}
                checked={scrapingConfig.apollo.locations.includes(location)}
                onCheckedChange={() => toggleArrayValue('apollo', 'locations', location)}
              />
              <Label htmlFor={`apollo-location-${location}`} className="text-sm">{location}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Ranges Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Employee Ranges ({scrapingConfig.apollo.employee_ranges.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2">
          {filterOptions.employeeRanges.map((range) => (
            <div key={range} className="flex items-center space-x-2">
              <Checkbox
                id={`apollo-range-${range}`}
                checked={scrapingConfig.apollo.employee_ranges.includes(range)}
                onCheckedChange={() => toggleArrayValue('apollo', 'employee_ranges', range)}
              />
              <Label htmlFor={`apollo-range-${range}`} className="text-sm">{range}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Job Titles Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Job Titles ({scrapingConfig.apollo.job_titles.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2">
          {filterOptions.jobTitles.map((title) => (
            <div key={title} className="flex items-center space-x-2">
              <Checkbox
                id={`apollo-title-${title}`}
                checked={scrapingConfig.apollo.job_titles.includes(title)}
                onCheckedChange={() => toggleArrayValue('apollo', 'job_titles', title)}
              />
              <Label htmlFor={`apollo-title-${title}`} className="text-sm">{title}</Label>
            </div>
          ))}
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