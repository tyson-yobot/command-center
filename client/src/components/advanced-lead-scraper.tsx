import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  const [selectedTools, setSelectedTools] = useState({
    apollo: true,
    phantombuster: true,
    apify: true
  });
  const [selectedFilters, setSelectedFilters] = useState({
    locations: [] as string[],
    industries: [] as string[],
    titles: [] as string[],
    companySize: '',
    technologies: [] as string[],
    revenue: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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

  const RevenueRanges = [
    { value: '0-1M', label: '$0 - $1M' },
    { value: '1M-10M', label: '$1M - $10M' },
    { value: '10M-50M', label: '$10M - $50M' },
    { value: '50M-100M', label: '$50M - $100M' },
    { value: '100M+', label: '$100M+' }
  ];

  const addFilter = (type: keyof typeof selectedFilters, value: string) => {
    if (type === 'companySize' || type === 'revenue') {
      setSelectedFilters(prev => ({ ...prev, [type]: value }));
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        [type]: [...(prev[type] as string[]), value]
      }));
    }
  };

  const removeFilter = (type: keyof typeof selectedFilters, value: string) => {
    if (type === 'companySize' || type === 'revenue') {
      setSelectedFilters(prev => ({ ...prev, [type]: '' }));
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        [type]: (prev[type] as string[]).filter(item => item !== value)
      }));
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      locations: [],
      industries: [],
      titles: [],
      companySize: '',
      technologies: [],
      revenue: ''
    });
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter search keywords",
        variant: "destructive"
      });
      return;
    }

    const activeTools = Object.entries(selectedTools).filter(([_, active]) => active).map(([tool]) => tool);
    if (activeTools.length === 0) {
      toast({
        title: "Select Data Source",
        description: "Please select at least one data source",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    onScrapingStart?.();

    try {
      const response = await fetch('/api/scrape/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          tools: activeTools,
          filters: selectedFilters
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
          source: activeTools.join(', ')
        }));

        setLeads(formattedLeads);
        onScrapingComplete?.(formattedLeads);

        toast({
          title: "Scraping Complete",
          description: `Successfully found ${formattedLeads.length} leads`
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
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
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
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <div className="flex gap-2">
              <Input
                id="search-query"
                placeholder="Enter company names, keywords, or specific criteria..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showAdvancedFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {/* Tool Selection */}
          <div className="space-y-3">
            <Label>Data Sources</Label>
            <div className="grid grid-cols-3 gap-3">
              <Card 
                className={`border-2 cursor-pointer transition-all ${
                  selectedTools.apollo 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTools(prev => ({ ...prev, apollo: !prev.apollo }))}
              >
                <CardContent className="p-4 text-center">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Apollo</div>
                  <div className="text-xs text-gray-500">Professional contacts</div>
                  {selectedTools.apollo && <div className="text-xs text-blue-600 mt-1">✓ Active</div>}
                </CardContent>
              </Card>
              
              <Card 
                className={`border-2 cursor-pointer transition-all ${
                  selectedTools.phantombuster 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTools(prev => ({ ...prev, phantombuster: !prev.phantombuster }))}
              >
                <CardContent className="p-4 text-center">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <div className="font-medium">PhantomBuster</div>
                  <div className="text-xs text-gray-500">Social networks</div>
                  {selectedTools.phantombuster && <div className="text-xs text-purple-600 mt-1">✓ Active</div>}
                </CardContent>
              </Card>
              
              <Card 
                className={`border-2 cursor-pointer transition-all ${
                  selectedTools.apify 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTools(prev => ({ ...prev, apify: !prev.apify }))}
              >
                <CardContent className="p-4 text-center">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">Apify</div>
                  <div className="text-xs text-gray-500">Web scraping</div>
                  {selectedTools.apify && <div className="text-xs text-green-600 mt-1">✓ Active</div>}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="w-5 h-5" />
                  Advanced Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Location Filter */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Locations
                    </Label>
                    <Select onValueChange={(value) => addFilter('locations', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select locations..." />
                      </SelectTrigger>
                      <SelectContent>
                        {USStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1">
                      {selectedFilters.locations.map(location => (
                        <Badge key={location} variant="secondary" className="flex items-center gap-1">
                          {location}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('locations', location)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Industry Filter */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Industries
                    </Label>
                    <Select onValueChange={(value) => addFilter('industries', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industries..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Industries.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1">
                      {selectedFilters.industries.map(industry => (
                        <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                          {industry}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('industries', industry)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Job Title Filter */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Job Titles
                    </Label>
                    <Select onValueChange={(value) => addFilter('titles', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job titles..." />
                      </SelectTrigger>
                      <SelectContent>
                        {JobTitles.map(title => (
                          <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1">
                      {selectedFilters.titles.map(title => (
                        <Badge key={title} variant="secondary" className="flex items-center gap-1">
                          {title}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('titles', title)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Company Size Filter */}
                  <div className="space-y-3">
                    <Label>Company Size</Label>
                    <Select onValueChange={(value) => addFilter('companySize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CompanySizes.map(size => (
                          <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedFilters.companySize && (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        {CompanySizes.find(s => s.value === selectedFilters.companySize)?.label}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('companySize', selectedFilters.companySize)} />
                      </Badge>
                    )}
                  </div>

                  {/* Revenue Filter */}
                  <div className="space-y-3">
                    <Label>Annual Revenue</Label>
                    <Select onValueChange={(value) => addFilter('revenue', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select revenue range..." />
                      </SelectTrigger>
                      <SelectContent>
                        {RevenueRanges.map(range => (
                          <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedFilters.revenue && (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        {RevenueRanges.find(r => r.value === selectedFilters.revenue)?.label}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('revenue', selectedFilters.revenue)} />
                      </Badge>
                    )}
                  </div>

                  {/* Technologies Filter */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Technologies
                    </Label>
                    <Select onValueChange={(value) => addFilter('technologies', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technologies..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Technologies.map(tech => (
                          <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1">
                      {selectedFilters.technologies.map(tech => (
                        <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                          {tech}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('technologies', tech)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Clear All Filters */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </Button>
                  <div className="text-sm text-gray-500">
                    {Object.values(selectedFilters).flat().filter(Boolean).length} filters active
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !query.trim() || Object.values(selectedTools).every(v => !v)}
              className="flex items-center gap-2 flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scraping Leads...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Start Lead Scraping
                </>
              )}
            </Button>
            
            {leads.length > 0 && (
              <Button 
                onClick={exportLeads}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export ({leads.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {leads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lead Results ({leads.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{lead.name}</h3>
                        <Badge variant="outline">{lead.source}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{lead.title} at {lead.company}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        {lead.email && <span>📧 {lead.email}</span>}
                        {lead.phone && <span>📞 {lead.phone}</span>}
                        <span>📍 {lead.location}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{lead.industry}</Badge>
                        <Badge variant="secondary">{lead.employees} employees</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}