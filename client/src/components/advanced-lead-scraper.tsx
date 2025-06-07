import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, Download, Filter, Users, Building2, MapPin, Zap, Globe, Target, X } from 'lucide-react';
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
  revenue?: string;
  source: string;
}

interface AdvancedLeadScraperProps {
  onScrapingStart?: () => void;
  onScrapingComplete?: (results: any) => void;
}

export function AdvancedLeadScraper({ onScrapingStart, onScrapingComplete }: AdvancedLeadScraperProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [scrapingTool, setScrapingTool] = useState<'apollo' | 'phantombuster' | 'apify'>('apollo');
  const [selectedTools, setSelectedTools] = useState<{apollo: boolean, phantombuster: boolean, apify: boolean}>({
    apollo: true,
    phantombuster: true,
    apify: true
  });
  const [selectedFilters, setSelectedFilters] = useState({
    locations: [] as string[],
    industries: [] as string[],
    titles: [] as string[],
    companySize: '',
    technologies: [] as string[]
  });
  const { toast } = useToast();

  const USStates = [
    'California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia',
    'North Carolina', 'Michigan', 'New Jersey', 'Virginia', 'Washington', 'Arizona', 'Massachusetts',
    'Tennessee', 'Indiana', 'Missouri', 'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina',
    'Alabama', 'Louisiana', 'Kentucky', 'Oregon', 'Oklahoma', 'Connecticut', 'Utah', 'Iowa', 'Nevada',
    'Arkansas', 'Mississippi', 'Kansas', 'New Mexico', 'Nebraska', 'West Virginia', 'Idaho', 'Hawaii',
    'New Hampshire', 'Maine', 'Montana', 'Rhode Island', 'Delaware', 'South Dakota', 'North Dakota',
    'Alaska', 'Vermont', 'Wyoming'
  ];

  const Industries = [
    'Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail', 'Real Estate',
    'Construction', 'Professional Services', 'Education', 'Government', 'Energy', 'Transportation',
    'Media & Entertainment', 'Food & Beverage', 'Hospitality', 'Agriculture', 'Automotive',
    'Aerospace', 'Telecommunications', 'Insurance', 'Legal', 'Consulting', 'Non-profit'
  ];

  const JobTitles = [
    'CEO', 'President', 'Owner', 'Founder', 'CTO', 'CFO', 'COO', 'Vice President', 'Director',
    'Manager', 'Head of Sales', 'Sales Manager', 'Marketing Director', 'Operations Manager',
    'Business Development Manager', 'Account Executive', 'Project Manager', 'Partner'
  ];

  const Technologies = [
    'Salesforce', 'HubSpot', 'Microsoft Office', 'Google Workspace', 'Slack', 'Zoom',
    'Adobe Creative Suite', 'AutoCAD', 'QuickBooks', 'SAP', 'Oracle', 'AWS', 'Azure',
    'Shopify', 'WordPress', 'Mailchimp', 'DocuSign', 'Zendesk', 'Tableau', 'Power BI'
  ];

  const CompanySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1001+', label: '1000+ employees' }
  ];

  const addFilter = (type: keyof typeof selectedFilters, value: string) => {
    if (type === 'companySize') {
      setSelectedFilters(prev => ({ ...prev, [type]: value }));
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        [type]: [...(prev[type] as string[]), value]
      }));
    }
  };

  const removeFilter = (type: keyof typeof selectedFilters, value: string) => {
    if (type === 'companySize') {
      setSelectedFilters(prev => ({ ...prev, [type]: '' }));
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        [type]: (prev[type] as string[]).filter(item => item !== value)
      }));
    }
  };

  const handleScrape = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a search query to begin scraping",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    onScrapingStart?.();

    try {
      const endpoint = scrapingTool === 'apollo' ? '/api/leads/scrape' : 
                     scrapingTool === 'phantombuster' ? '/api/leads/phantombuster' : 
                     '/api/leads/apify';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          limit: 100,
          filters: {
            locations: selectedFilters.locations,
            industries: selectedFilters.industries,
            titles: selectedFilters.titles,
            company_size: selectedFilters.companySize,
            technologies: selectedFilters.technologies
          },
          tool: scrapingTool
        })
      });

      const data = await response.json();

      if (data.success && data.leads) {
        const formattedLeads: Lead[] = data.leads.map((lead: any, index: number) => ({
          id: lead.id || `lead-${index}`,
          name: lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown',
          title: lead.title || lead.job_title || 'Unknown Title',
          company: lead.organization?.name || lead.company || 'Unknown Company',
          email: lead.email || lead.email_address,
          phone: lead.phone_numbers?.[0]?.raw_number || lead.phone,
          location: lead.location || `${lead.city || ''}, ${lead.state || ''}`.trim() || 'Unknown',
          industry: lead.organization?.industry || lead.industry || 'Unknown',
          employees: lead.organization?.estimated_num_employees?.toString() || 'Unknown',
          revenue: lead.organization?.estimated_annual_revenue || '',
          source: scrapingTool.charAt(0).toUpperCase() + scrapingTool.slice(1)
        }));

        setLeads(formattedLeads);
        onScrapingComplete?.(formattedLeads);

        toast({
          title: "Scraping Complete",
          description: `Successfully found ${formattedLeads.length} leads using ${scrapingTool}`
        });
      } else {
        toast({
          title: "Scraping Failed",
          description: data.error || "Unable to retrieve leads",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to lead scraping service",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportLeads = () => {
    if (leads.length === 0) {
      toast({
        title: "No Data",
        description: "No leads to export",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['Name', 'Title', 'Company', 'Email', 'Phone', 'Location', 'Industry', 'Employees', 'Source'],
      ...leads.map(lead => [
        lead.name, lead.title, lead.company, lead.email || '', 
        lead.phone || '', lead.location, lead.industry, lead.employees, lead.source
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${scrapingTool}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${leads.length} leads to CSV`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Advanced Lead Scraper
          </CardTitle>
          <CardDescription>
            Scrape qualified leads using Apollo, PhantomBuster, or Apify with advanced filtering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tool Selection */}
          <div className="space-y-2">
            <Label>Scraping Tool</Label>
            <Tabs value={scrapingTool} onValueChange={(value) => setScrapingTool(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="apollo" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Apollo
                </TabsTrigger>
                <TabsTrigger value="phantombuster" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  PhantomBuster
                </TabsTrigger>
                <TabsTrigger value="apify" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Apify
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="query">Search Keywords</Label>
            <Input
              id="query"
              placeholder="e.g., roofing contractor, dental practice, law firm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Location Filter */}
            <div className="space-y-2">
              <Label>Location (US States)</Label>
              <Select onValueChange={(value) => addFilter('locations', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add location" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {USStates.filter(state => !selectedFilters.locations.includes(state)).map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Industry Filter */}
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select onValueChange={(value) => addFilter('industries', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add industry" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {Industries.filter(industry => !selectedFilters.industries.includes(industry)).map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Title Filter */}
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Select onValueChange={(value) => addFilter('titles', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add job title" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {JobTitles.filter(title => !selectedFilters.titles.includes(title)).map(title => (
                    <SelectItem key={title} value={title}>{title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Size Filter */}
            <div className="space-y-2">
              <Label>Company Size</Label>
              <Select value={selectedFilters.companySize} onValueChange={(value) => addFilter('companySize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {CompanySizes.map(size => (
                    <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Technology Filter */}
            <div className="space-y-2">
              <Label>Technologies Used</Label>
              <Select onValueChange={(value) => addFilter('technologies', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add technology" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {Technologies.filter(tech => !selectedFilters.technologies.includes(tech)).map(tech => (
                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="space-y-3">
            {(selectedFilters.locations.length > 0 || selectedFilters.industries.length > 0 || 
              selectedFilters.titles.length > 0 || selectedFilters.companySize || 
              selectedFilters.technologies.length > 0) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Active Filters:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedFilters.locations.map(location => (
                    <Badge key={location} variant="secondary" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {location}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('locations', location)} />
                    </Badge>
                  ))}
                  {selectedFilters.industries.map(industry => (
                    <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {industry}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('industries', industry)} />
                    </Badge>
                  ))}
                  {selectedFilters.titles.map(title => (
                    <Badge key={title} variant="secondary" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {title}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('titles', title)} />
                    </Badge>
                  ))}
                  {selectedFilters.companySize && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {CompanySizes.find(s => s.value === selectedFilters.companySize)?.label}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('companySize', selectedFilters.companySize)} />
                    </Badge>
                  )}
                  {selectedFilters.technologies.map(tech => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {tech}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('technologies', tech)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleScrape} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Start Scraping
                </>
              )}
            </Button>
            {leads.length > 0 && (
              <Button variant="outline" onClick={exportLeads}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {leads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Found Leads ({leads.length})
              </span>
              <Badge variant="outline">{scrapingTool}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {leads.map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{lead.name}</h4>
                      <p className="text-sm text-muted-foreground">{lead.title} at {lead.company}</p>
                    </div>
                    <Badge variant="secondary">{lead.source}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {lead.email && <div><span className="font-medium">Email:</span> {lead.email}</div>}
                    {lead.phone && <div><span className="font-medium">Phone:</span> {lead.phone}</div>}
                    <div><span className="font-medium">Location:</span> {lead.location}</div>
                    <div><span className="font-medium">Industry:</span> {lead.industry}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}