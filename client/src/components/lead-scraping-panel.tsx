import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Target, 
  Database, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Users,
  MapPin,
  Building,
  Globe
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LeadScrapingPanelProps {
  onResults?: (results: any) => void;
}

export default function LeadScrapingPanel({ onResults }: LeadScrapingPanelProps) {
  const [scrapingTool, setScrapingTool] = useState<string>('apollo');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  // Search parameters
  const [title, setTitle] = useState('Owner');
  const [location, setLocation] = useState('United States');
  const [keywords, setKeywords] = useState('construction');
  const [resultsLimit, setResultsLimit] = useState(25);
  
  // Advanced options
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState('');

  const scrapingTools = [
    { value: 'apollo', label: 'Apollo.io', description: 'Professional contact database' },
    { value: 'phantombuster', label: 'PhantomBuster', description: 'Social media scraping' },
    { value: 'apify', label: 'Apify', description: 'Web scraping automation' },
    { value: 'linkedin', label: 'LinkedIn Sales Navigator', description: 'LinkedIn lead generation' },
    { value: 'google', label: 'Google Maps', description: 'Local business scraping' }
  ];

  const handleScrapeWithTool = async (tool: string) => {
    setScrapingTool(tool);
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      let endpoint = '';
      let payload: any = {};

      switch (tool) {
        case 'apollo':
          endpoint = '/api/apollo/scrape-leads';
          payload = {
            title,
            location,
            company_keywords: keywords,
            per_page: resultsLimit
          };
          break;
        
        case 'phantombuster':
          endpoint = '/leads/scrape';
          payload = {
            source: 'PhantomBuster',
            title,
            location,
            keywords,
            limit: resultsLimit
          };
          break;
        
        case 'linkedin':
          endpoint = '/leads/scrape';
          payload = {
            source: 'LinkedIn',
            title,
            location,
            keywords,
            limit: resultsLimit
          };
          break;
        
        case 'google':
          endpoint = '/leads/scrape';
          payload = {
            source: 'Google Maps',
            title,
            location,
            keywords,
            limit: resultsLimit
          };
          break;
        
        default:
          endpoint = '/leads/scrape';
          payload = {
            source: scrapingTool,
            title,
            location,
            keywords,
            limit: resultsLimit
          };
      }

      const response = await apiRequest('POST', endpoint, payload);
      setResults(response);
      onResults?.(response);
      
    } catch (err: any) {
      setError(err.message || 'Scraping failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'apollo': return <Database className="w-4 h-4" />;
      case 'phantombuster': return <Target className="w-4 h-4" />;
      case 'linkedin': return <Users className="w-4 h-4" />;
      case 'google': return <MapPin className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-slate-800/50 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Search className="w-5 h-5" />
          Lead Generation Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Individual Tool Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Apollo Control */}
          <div className="p-4 bg-slate-700/50 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Apollo.io</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open('https://app.apollo.io', '_blank')}
                className="text-xs"
              >
                Open Platform
              </Button>
            </div>
            <p className="text-xs text-slate-400 mb-3">Professional contact database</p>
            <Button
              onClick={() => handleScrapeWithTool('apollo')}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              {isLoading && scrapingTool === 'apollo' ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="w-3 h-3 mr-2" />
                  Launch Apollo
                </>
              )}
            </Button>
          </div>

          {/* PhantomBuster Control */}
          <div className="p-4 bg-slate-700/50 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">PhantomBuster</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open('https://phantombuster.com', '_blank')}
                className="text-xs"
              >
                Open Platform
              </Button>
            </div>
            <p className="text-xs text-slate-400 mb-3">Social media scraping</p>
            <Button
              onClick={() => handleScrapeWithTool('phantombuster')}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              {isLoading && scrapingTool === 'phantombuster' ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="w-3 h-3 mr-2" />
                  Launch PhantomBuster
                </>
              )}
            </Button>
          </div>

          {/* Apify Control */}
          <div className="p-4 bg-slate-700/50 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">Apify</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open('https://apify.com', '_blank')}
                className="text-xs"
              >
                Open Platform
              </Button>
            </div>
            <p className="text-xs text-slate-400 mb-3">Web scraping automation</p>
            <Button
              onClick={() => handleScrapeWithTool('apify')}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {isLoading && scrapingTool === 'apify' ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="w-3 h-3 mr-2" />
                  Launch Apify
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Job Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Owner, CEO, Manager"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Texas, United States"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Company Keywords</Label>
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., construction, roofing, HVAC"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Results Limit</Label>
            <Select value={resultsLimit.toString()} onValueChange={(value) => setResultsLimit(parseInt(value))}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="10" className="text-white">10 leads</SelectItem>
                <SelectItem value="25" className="text-white">25 leads</SelectItem>
                <SelectItem value="50" className="text-white">50 leads</SelectItem>
                <SelectItem value="100" className="text-white">100 leads</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Industry Filter</Label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Construction, Technology"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-2">
          <Label className="text-white">Exclude Keywords (Optional)</Label>
          <Input
            value={excludeKeywords}
            onChange={(e) => setExcludeKeywords(e.target.value)}
            placeholder="e.g., nonprofit, government"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        {/* Quick Launch Section */}
        <div className="border-t border-slate-600 pt-4">
          <div className="text-center text-slate-400 text-sm mb-3">
            Configure your search parameters above, then click on any scraping tool to launch lead generation.
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('https://app.apollo.io', '_blank')}
              className="text-xs"
            >
              Apollo Platform
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('https://phantombuster.com', '_blank')}
              className="text-xs"
            >
              PhantomBuster Platform
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('https://apify.com', '_blank')}
              className="text-xs"
            >
              Apify Platform
            </Button>
          </div>
        </div>

        {/* Results Display */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>Scraping Error</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span>Scraping Complete</span>
              </div>
              <div className="space-y-2">
                {results.data?.people && (
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                    Found {results.data.people.length} leads
                  </Badge>
                )}
                {results.message && (
                  <p className="text-green-300 text-sm">{results.message}</p>
                )}
                {results.search_params && (
                  <div className="text-xs text-slate-400">
                    Search: {results.search_params.title} in {results.search_params.location}
                  </div>
                )}
              </div>
            </div>

            {/* Processing Results */}
            {results.processingResults && (
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <Database className="w-4 h-4" />
                  <span>Lead Processing Results</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Total Leads:</span>
                      <span className="text-white font-medium">{results.processingResults.total_leads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-300">Processed:</span>
                      <span className="text-green-400 font-medium">{results.processingResults.processed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-300">Invalid:</span>
                      <span className="text-yellow-400 font-medium">{results.processingResults.skipped_invalid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-300">Duplicates:</span>
                      <span className="text-orange-400 font-medium">{results.processingResults.skipped_duplicate}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Airtable:</span>
                      <span className="text-blue-400 font-medium">{results.processingResults.airtable_success}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">HubSpot:</span>
                      <span className="text-purple-400 font-medium">{results.processingResults.hubspot_success}</span>
                    </div>
                    {results.processingResults.errors && results.processingResults.errors.length > 0 && (
                      <div className="text-xs text-red-400 mt-2">
                        {results.processingResults.errors.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}