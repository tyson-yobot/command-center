import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Download, Filter, Users, Building2, MapPin, Zap, Globe, Target, X, Settings } from 'lucide-react';
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
    phantombuster: false,
    apify: false
  });
  const [filters, setFilters] = useState({
    locations: [] as string[],
    industries: [] as string[],
    titles: [] as string[],
    companySize: '',
    technologies: [] as string[],
    revenue: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const locations = [
    'California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia',
    'North Carolina', 'Michigan', 'New Jersey', 'Virginia', 'Washington', 'Arizona', 'Massachusetts'
  ];

  const industries = [
    'Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail', 'Real Estate',
    'Construction', 'Professional Services', 'Education', 'Government', 'Energy', 'Transportation'
  ];

  const jobTitles = [
    'CEO', 'President', 'Owner', 'Founder', 'CTO', 'CFO', 'COO', 'Vice President', 'Director',
    'Manager', 'Head of Sales', 'Sales Manager', 'Marketing Director', 'Operations Manager'
  ];

  const technologies = [
    'Salesforce', 'HubSpot', 'Microsoft Office', 'Google Workspace', 'Slack', 'Zoom',
    'Adobe Creative Suite', 'QuickBooks', 'SAP', 'Oracle', 'AWS', 'Azure', 'Shopify'
  ];

  const companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1001+', label: '1000+ employees' }
  ];

  const revenueRanges = [
    { value: '0-1M', label: '$0 - $1M' },
    { value: '1M-10M', label: '$1M - $10M' },
    { value: '10M-50M', label: '$10M - $50M' },
    { value: '50M-100M', label: '$50M - $100M' },
    { value: '100M+', label: '$100M+' }
  ];

  const addFilter = (type: string, value: string) => {
    if (type === 'companySize' || type === 'revenue') {
      setFilters(prev => ({ ...prev, [type]: value }));
    } else {
      setFilters(prev => ({
        ...prev,
        [type]: [...(prev[type as keyof typeof prev] as string[]), value]
      }));
    }
  };

  const removeFilter = (type: string, value: string) => {
    if (type === 'companySize' || type === 'revenue') {
      setFilters(prev => ({ ...prev, [type]: '' }));
    } else {
      setFilters(prev => ({
        ...prev,
        [type]: (prev[type as keyof typeof prev] as string[]).filter(item => item !== value)
      }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
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
          filters
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced Lead Scraper
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find qualified leads using Apollo, PhantomBuster, and Apify with powerful filtering
          </p>
        </div>

        {/* Main Search Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Lead Search Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Search Input */}
            <div className="space-y-3">
              <Label className="text-lg font-medium">Search Query</Label>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter company names, keywords, or specific criteria..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-lg py-6 border-2"
                />
                <Button 
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="px-6 py-6 text-lg"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>
            </div>

            {/* Data Source Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">Data Sources</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Apollo */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    selectedTools.apollo 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTools(prev => ({ ...prev, apollo: !prev.apollo }))}
                >
                  <CardContent className="p-6 text-center">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="text-xl font-semibold mb-2">Apollo</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Professional B2B contacts and company data
                    </p>
                    {selectedTools.apollo && (
                      <Badge className="bg-blue-500 text-white">✓ Active</Badge>
                    )}
                  </CardContent>
                </Card>

                {/* PhantomBuster */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    selectedTools.phantombuster 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTools(prev => ({ ...prev, phantombuster: !prev.phantombuster }))}
                >
                  <CardContent className="p-6 text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                    <h3 className="text-xl font-semibold mb-2">PhantomBuster</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Social media and LinkedIn lead extraction
                    </p>
                    {selectedTools.phantombuster && (
                      <Badge className="bg-purple-500 text-white">✓ Active</Badge>
                    )}
                  </CardContent>
                </Card>

                {/* Apify */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    selectedTools.apify 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950 shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTools(prev => ({ ...prev, apify: !prev.apify }))}
                >
                  <CardContent className="p-6 text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-xl font-semibold mb-2">Apify</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Web scraping and directory extraction
                    </p>
                    {selectedTools.apify && (
                      <Badge className="bg-green-500 text-white">✓ Active</Badge>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Advanced Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Location Filter */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 font-medium">
                        <MapPin className="w-4 h-4" />
                        Locations
                      </Label>
                      <Select onValueChange={(value) => addFilter('locations', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select locations..." />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2">
                        {filters.locations.map(location => (
                          <Badge key={location} variant="secondary" className="flex items-center gap-1">
                            {location}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('locations', location)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Industry Filter */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 font-medium">
                        <Building2 className="w-4 h-4" />
                        Industries
                      </Label>
                      <Select onValueChange={(value) => addFilter('industries', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industries..." />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map(industry => (
                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2">
                        {filters.industries.map(industry => (
                          <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                            {industry}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('industries', industry)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Job Title Filter */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 font-medium">
                        <Users className="w-4 h-4" />
                        Job Titles
                      </Label>
                      <Select onValueChange={(value) => addFilter('titles', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job titles..." />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTitles.map(title => (
                            <SelectItem key={title} value={title}>{title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2">
                        {filters.titles.map(title => (
                          <Badge key={title} variant="secondary" className="flex items-center gap-1">
                            {title}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('titles', title)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Company Size Filter */}
                    <div className="space-y-3">
                      <Label className="font-medium">Company Size</Label>
                      <Select onValueChange={(value) => addFilter('companySize', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size..." />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map(size => (
                            <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filters.companySize && (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          {companySizes.find(s => s.value === filters.companySize)?.label}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('companySize', filters.companySize)} />
                        </Badge>
                      )}
                    </div>

                    {/* Revenue Filter */}
                    <div className="space-y-3">
                      <Label className="font-medium">Annual Revenue</Label>
                      <Select onValueChange={(value) => addFilter('revenue', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select revenue range..." />
                        </SelectTrigger>
                        <SelectContent>
                          {revenueRanges.map(range => (
                            <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filters.revenue && (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          {revenueRanges.find(r => r.value === filters.revenue)?.label}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('revenue', filters.revenue)} />
                        </Badge>
                      )}
                    </div>

                    {/* Technologies Filter */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 font-medium">
                        <Zap className="w-4 h-4" />
                        Technologies
                      </Label>
                      <Select onValueChange={(value) => addFilter('technologies', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select technologies..." />
                        </SelectTrigger>
                        <SelectContent>
                          {technologies.map(tech => (
                            <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2">
                        {filters.technologies.map(tech => (
                          <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                            {tech}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('technologies', tech)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Filter Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button variant="outline" onClick={clearAllFilters} className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Clear All Filters
                    </Button>
                    <div className="text-sm text-gray-500">
                      {Object.values(filters).flat().filter(Boolean).length} filters active
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleSearch} 
                disabled={isLoading || !query.trim() || Object.values(selectedTools).every(v => !v)}
                className="flex-1 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Scraping Leads...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Start Lead Scraping
                  </>
                )}
              </Button>
              
              {leads.length > 0 && (
                <Button 
                  onClick={exportLeads}
                  variant="outline"
                  className="py-6 px-8 text-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export ({leads.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {leads.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="w-6 h-6" />
                Lead Results ({leads.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {leads.map((lead) => (
                  <Card key={lead.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{lead.name}</h3>
                          <Badge variant="outline" className="text-sm">{lead.source}</Badge>
                        </div>
                        <p className="text-lg text-gray-600">{lead.title} at {lead.company}</p>
                        <div className="flex gap-6 text-gray-500">
                          {lead.email && <span className="flex items-center gap-1">📧 {lead.email}</span>}
                          {lead.phone && <span className="flex items-center gap-1">📞 {lead.phone}</span>}
                          <span className="flex items-center gap-1">📍 {lead.location}</span>
                        </div>
                        <div className="flex gap-3">
                          <Badge variant="secondary" className="text-sm">{lead.industry}</Badge>
                          <Badge variant="secondary" className="text-sm">{lead.employees} employees</Badge>
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
    </div>
  );
}