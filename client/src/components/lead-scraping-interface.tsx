import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Download, 
  Play,
  MapPin, 
  Building, 
  Users, 
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useIndustryTemplates } from '@/hooks/useIndustryTemplates';

interface LeadScrapingProps {
  onScrapingStart?: () => void;
  onScrapingComplete?: (results: any) => void;
}

export function LeadScrapingInterface({ onScrapingStart, onScrapingComplete }: LeadScrapingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const { industries, isLoading: industriesLoading } = useIndustryTemplates();
  const [companySize, setCompanySize] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const { toast } = useToast();

  // Apollo scraping mutation
  const scrapingMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await apiRequest('POST', '/api/apollo/search', config);
      return response.json();
    },
    onSuccess: (data) => {
      handleScrapingComplete(data);
    },
    onError: (error) => {
      toast({
        title: "Lead Scraping Error",
        description: "Failed to search for leads. Please check your configuration.",
        variant: "destructive"
      });
      setIsRunning(false);
      setCurrentStatus('Error');
    }
  });

  const handleScrapingComplete = (data: any) => {
    setResults(data.contacts || []);
    setIsRunning(false);
    setProgress(100);
    setCurrentStatus('Complete');
    
    toast({
      title: "Lead Search Complete",
      description: `Found ${data.contacts?.length || 0} potential leads`,
    });

    if (onScrapingComplete) {
      onScrapingComplete(data);
    }
  };

  const startScraping = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter search terms to find leads",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setCurrentStatus('Searching...');
    setResults([]);

    if (onScrapingStart) {
      onScrapingStart();
    }

    const config = {
      query: searchQuery,
      location: location || undefined,
      industry: industry || undefined,
      company_size: companySize || undefined,
      job_title: jobTitle || undefined,
      limit: maxResults
    };

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    scrapingMutation.mutate(config);
  };

  const downloadResults = () => {
    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "No leads to download. Please run a search first.",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['Name', 'Email', 'Company', 'Title', 'Location'].join(','),
      ...results.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.company || '',
        lead.title || '',
        lead.location || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: `Downloaded ${results.length} leads as CSV`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Lead Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simple Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Terms *</Label>
            <Input
              id="search"
              placeholder="e.g., CEO, software engineer, marketing director"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isRunning}
            />
          </div>

          {/* Basic Filters in a Clean Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., New York, California"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry} disabled={isRunning || industriesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={industriesLoading ? "Loading industries..." : "Select industry"} />
                </SelectTrigger>
                <SelectContent>
                  {!industriesLoading && industries.map((ind) => (
                    <SelectItem key={ind.id} value={ind.id}>
                      {ind.name}
                    </SelectItem>
                  ))}
                  {industriesLoading && (
                    <SelectItem value="loading" disabled>Loading industries...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-size">Company Size</Label>
              <Select value={companySize} onValueChange={setCompanySize} disabled={isRunning}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                placeholder="e.g., CEO, Director, Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-results">Max Results</Label>
              <Select value={maxResults.toString()} onValueChange={(value) => setMaxResults(parseInt(value))} disabled={isRunning}>
                <SelectTrigger>
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={startScraping} 
              disabled={isRunning || !searchQuery.trim()}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Searching...' : 'Start Search'}
            </Button>
            <Button 
              variant="outline" 
              onClick={downloadResults} 
              disabled={results.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>

          {/* Progress and Status */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Status: {currentStatus}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Search Results ({results.length} leads)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.slice(0, 6).map((lead, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {lead.company}
                  </div>
                  <div className="text-sm text-gray-600">{lead.title}</div>
                  {lead.email && (
                    <div className="text-sm text-blue-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </div>
                  )}
                  {lead.location && (
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {lead.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {results.length > 6 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                And {results.length - 6} more leads...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}