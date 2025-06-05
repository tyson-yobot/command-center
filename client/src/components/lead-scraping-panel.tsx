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
    { value: 'linkedin', label: 'LinkedIn Sales Navigator', description: 'LinkedIn lead generation' },
    { value: 'google', label: 'Google Maps', description: 'Local business scraping' },
    { value: 'yellow-pages', label: 'Yellow Pages', description: 'Directory scraping' }
  ];

  const handleScrape = async () => {
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      let endpoint = '';
      let payload: any = {};

      switch (scrapingTool) {
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
        {/* Tool Selection */}
        <div className="space-y-2">
          <Label className="text-white">Scraping Tool</Label>
          <Select value={scrapingTool} onValueChange={setScrapingTool}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {scrapingTools.map((tool) => (
                <SelectItem key={tool.value} value={tool.value} className="text-white">
                  <div className="flex items-center gap-2">
                    {getToolIcon(tool.value)}
                    <div>
                      <div>{tool.label}</div>
                      <div className="text-xs text-slate-400">{tool.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Action Button */}
        <Button 
          onClick={handleScrape}
          disabled={isLoading || !title || !location || !keywords}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scraping {scrapingTools.find(t => t.value === scrapingTool)?.label}...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Launch {scrapingTools.find(t => t.value === scrapingTool)?.label} Scraper
            </>
          )}
        </Button>

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
        )}
      </CardContent>
    </Card>
  );
}