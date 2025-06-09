import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, Play, Pause, Settings, Target, Users, Building } from 'lucide-react';

export default function LeadScraper() {
  const [activeModule, setActiveModule] = useState('apollo');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const { toast } = useToast();

  // Apollo Configuration
  const [apolloConfig, setApolloConfig] = useState({
    keyword: '',
    location: '',
    industry: '',
    companySize: '1-50',
    title: '',
    limit: 100
  });

  // Apify Configuration
  const [apifyConfig, setApifyConfig] = useState({
    searchQuery: '',
    maxResults: 100,
    dataType: 'companies',
    includeEmails: true,
    includePhones: true
  });

  // PhantomBuster Configuration
  const [phantomConfig, setPhantomConfig] = useState({
    linkedinUrl: '',
    searchTerms: '',
    connectionLevel: 'all',
    resultsPerPage: 100,
    maxPages: 5
  });

  const runScrape = async (module: string) => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      let config;
      let endpoint;
      
      switch (module) {
        case 'apollo':
          config = apolloConfig;
          endpoint = '/api/lead-scraper/apollo';
          break;
        case 'apify':
          config = apifyConfig;
          endpoint = '/api/lead-scraper/apify';
          break;
        case 'phantom':
          config = phantomConfig;
          endpoint = '/api/lead-scraper/phantom';
          break;
        default:
          throw new Error('Invalid module selected');
      }

      console.log('Starting scrape with config:', config);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results || []);
        setProgress(100);
        toast({
          title: "Scrape Complete",
          description: `Found ${data.results?.length || 0} leads using ${module}`,
        });
      } else {
        throw new Error(data.error || 'Scrape failed');
      }
    } catch (error: any) {
      console.error('Scrape error:', error);
      toast({
        title: "Scrape Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = async () => {
    try {
      const response = await fetch('/api/export-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results, format: 'csv' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `leads-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Export Complete",
          description: "Leads exported successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export leads",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Lead Scraper Tool</h1>
          <p className="text-gray-300">Configure and run lead generation from Apollo, Apify, and PhantomBuster</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Scraper Configuration
                </CardTitle>
                
                {/* Module Selector */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setActiveModule('apollo')}
                    variant={activeModule === 'apollo' ? 'default' : 'outline'}
                    className="text-white"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Apollo
                  </Button>
                  <Button
                    onClick={() => setActiveModule('apify')}
                    variant={activeModule === 'apify' ? 'default' : 'outline'}
                    className="text-white"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Apify
                  </Button>
                  <Button
                    onClick={() => setActiveModule('phantom')}
                    variant={activeModule === 'phantom' ? 'default' : 'outline'}
                    className="text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    PhantomBuster
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Apollo Configuration */}
                {activeModule === 'apollo' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="keyword" className="text-white">Keywords</Label>
                        <Input
                          id="keyword"
                          value={apolloConfig.keyword}
                          onChange={(e) => setApolloConfig({...apolloConfig, keyword: e.target.value})}
                          placeholder="CEO, founder, manager"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-white">Location</Label>
                        <Input
                          id="location"
                          value={apolloConfig.location}
                          onChange={(e) => setApolloConfig({...apolloConfig, location: e.target.value})}
                          placeholder="San Francisco, CA"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="industry" className="text-white">Industry</Label>
                        <Input
                          id="industry"
                          value={apolloConfig.industry}
                          onChange={(e) => setApolloConfig({...apolloConfig, industry: e.target.value})}
                          placeholder="Technology, Healthcare"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="companySize" className="text-white">Company Size</Label>
                        <Select onValueChange={(value) => setApolloConfig({...apolloConfig, companySize: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-50">1-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-1000">201-1000 employees</SelectItem>
                            <SelectItem value="1000+">1000+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="title" className="text-white">Job Title</Label>
                      <Input
                        id="title"
                        value={apolloConfig.title}
                        onChange={(e) => setApolloConfig({...apolloConfig, title: e.target.value})}
                        placeholder="Chief Executive Officer"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Apify Configuration */}
                {activeModule === 'apify' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="searchQuery" className="text-white">Search Query</Label>
                      <Textarea
                        id="searchQuery"
                        value={apifyConfig.searchQuery}
                        onChange={(e) => setApifyConfig({...apifyConfig, searchQuery: e.target.value})}
                        placeholder="restaurants in New York"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxResults" className="text-white">Max Results</Label>
                        <Input
                          id="maxResults"
                          type="number"
                          value={apifyConfig.maxResults}
                          onChange={(e) => setApifyConfig({...apifyConfig, maxResults: parseInt(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dataType" className="text-white">Data Type</Label>
                        <Select onValueChange={(value) => setApifyConfig({...apifyConfig, dataType: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="companies">Companies</SelectItem>
                            <SelectItem value="people">People</SelectItem>
                            <SelectItem value="places">Places</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* PhantomBuster Configuration */}
                {activeModule === 'phantom' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="linkedinUrl" className="text-white">LinkedIn Search URL</Label>
                      <Input
                        id="linkedinUrl"
                        value={phantomConfig.linkedinUrl}
                        onChange={(e) => setPhantomConfig({...phantomConfig, linkedinUrl: e.target.value})}
                        placeholder="https://www.linkedin.com/search/results/people/"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="searchTerms" className="text-white">Search Terms</Label>
                      <Input
                        id="searchTerms"
                        value={phantomConfig.searchTerms}
                        onChange={(e) => setPhantomConfig({...phantomConfig, searchTerms: e.target.value})}
                        placeholder="CEO, founder, director"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="connectionLevel" className="text-white">Connection Level</Label>
                        <Select onValueChange={(value) => setPhantomConfig({...phantomConfig, connectionLevel: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="1st">1st Connections</SelectItem>
                            <SelectItem value="2nd">2nd Connections</SelectItem>
                            <SelectItem value="3rd">3rd+ Connections</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="maxPages" className="text-white">Max Pages</Label>
                        <Input
                          id="maxPages"
                          type="number"
                          value={phantomConfig.maxPages}
                          onChange={(e) => setPhantomConfig({...phantomConfig, maxPages: parseInt(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => runScrape(activeModule)}
                    disabled={isRunning}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Scrape
                      </>
                    )}
                  </Button>
                  
                  {results.length > 0 && (
                    <Button
                      onClick={exportResults}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Results
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Scraping in progress...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div>
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Results ({results.length})
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No results yet</p>
                    <p className="text-sm">Configure and run a scrape to see results</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {results.slice(0, 10).map((result: any, index) => (
                      <div key={index} className="p-3 bg-gray-700/50 rounded-lg">
                        <div className="font-medium text-white">{result.name || result.title}</div>
                        <div className="text-sm text-gray-300">{result.company || result.organization}</div>
                        {result.email && (
                          <div className="text-xs text-blue-400">{result.email}</div>
                        )}
                        {result.location && (
                          <div className="text-xs text-gray-400">{result.location}</div>
                        )}
                      </div>
                    ))}
                    {results.length > 10 && (
                      <div className="text-center text-sm text-gray-400 py-2">
                        And {results.length - 10} more results...
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}