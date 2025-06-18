import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Settings, ArrowLeft, ExternalLink, Download, CheckCircle, AlertCircle } from 'lucide-react';

type Screen = 'overview' | 'apollo' | 'apify' | 'phantombuster' | 'results';

interface ScraperResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone?: string;
  position?: string;
  source: string;
}

export default function LeadScraperFinal() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [scraperResults, setScraperResults] = useState<ScraperResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Live check - NO FAKE DATA
  const ENV = process.env.NODE_ENV;
  const hasLiveResults = scraperResults.length > 0;

  // Launch scraper trigger
  const handleLaunchScraper = async (platform: string, config: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, config }),
      });

      if (!response.ok) {
        throw new Error("Scraper failed to trigger. Try again.");
      }

      const result = await response.json();
      setSuccess(`${platform} scraper launched successfully. Results will appear when complete.`);
      
      // Wait for webhook to confirm → then show results
      // Polling for completion
      pollForResults(result.jobId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scraper failed to trigger. Try again.");
      setIsLoading(false);
    }
  };

  const pollForResults = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/scrape/status/${jobId}`);
        const data = await response.json();
        
        if (data.status === 'completed' && data.results) {
          setScraperResults(data.results);
          setCurrentScreen('results');
          setIsLoading(false);
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          setError("Scraping job failed. Please try again.");
          setIsLoading(false);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    // Clear polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (isLoading) {
        setIsLoading(false);
        setError("Scraping timeout. Please check your configuration and try again.");
      }
    }, 600000);
  };

  const renderOverview = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#1E3A8A] py-12 px-4 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Enterprise Lead Intelligence Platform
          </h1>
          <p className="text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Advanced AI-powered lead generation with real-time data extraction from premium business databases
          </p>
        </div>

        {/* Platform Selection Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Apollo.io Professional */}
          <Card 
            className="bg-gradient-to-br from-blue-900/40 to-blue-700/20 border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer"
            onClick={() => setCurrentScreen('apollo')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">A</span>
              </div>
              <CardTitle className="text-2xl text-white mb-2">Apollo.io Professional</CardTitle>
              <CardDescription className="text-blue-200 text-lg">
                Premium B2B contact database with 275M+ verified profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">275M+ Contacts</Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Real-time Verification</Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">CRM Integration</Badge>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Configure Apollo Scraper
              </Button>
            </CardContent>
          </Card>

          {/* Apify Web Scraper */}
          <Card 
            className="bg-gradient-to-br from-green-900/40 to-green-700/20 border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 cursor-pointer"
            onClick={() => setCurrentScreen('apify')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">A</span>
              </div>
              <CardTitle className="text-2xl text-white mb-2">Apify Web Scraper</CardTitle>
              <CardDescription className="text-green-200 text-lg">
                Advanced web scraping with AI-powered data extraction
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Custom Crawling</Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">JS Rendering</Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Scale Automation</Badge>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Configure Apify Scraper
              </Button>
            </CardContent>
          </Card>

          {/* PhantomBuster */}
          <Card 
            className="bg-gradient-to-br from-purple-900/40 to-purple-700/20 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
            onClick={() => setCurrentScreen('phantombuster')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">P</span>
              </div>
              <CardTitle className="text-2xl text-white mb-2">PhantomBuster</CardTitle>
              <CardDescription className="text-purple-200 text-lg">
                Social media automation and lead extraction platform
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">LinkedIn Scraping</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">Social Analytics</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">API Integration</Badge>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Configure PhantomBuster
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white text-xl">Real-time Processing</CardTitle>
              <CardDescription className="text-slate-300">
                Live data extraction with webhook confirmations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white text-xl">Quality Assurance</CardTitle>
              <CardDescription className="text-slate-300">
                Email verification and data validation protocols
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white text-xl">Export & Integration</CardTitle>
              <CardDescription className="text-slate-300">
                Direct Airtable sync, CSV export, and CRM integration
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderApolloConfig = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#1E3A8A] py-12 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => setCurrentScreen('overview')}
            variant="ghost"
            className="text-white hover:bg-slate-700/50 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Platform Selection
          </Button>
        </div>

        <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-white text-3xl mb-2">Apollo.io Professional Configuration</CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Configure your B2B lead extraction parameters for Apollo.io database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="company-size" className="text-white text-base">Company Size</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-1000">201-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="industry" className="text-white text-base">Industry</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="job-titles" className="text-white text-base">Target Job Titles</Label>
              <Textarea
                id="job-titles"
                placeholder="CEO, CTO, VP of Sales, Marketing Director..."
                className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-white text-base">Geographic Location</Label>
              <Input
                id="location"
                placeholder="United States, California, San Francisco..."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="lead-count" className="text-white text-base">Maximum Lead Count</Label>
              <Select>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select lead count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 leads</SelectItem>
                  <SelectItem value="500">500 leads</SelectItem>
                  <SelectItem value="1000">1,000 leads</SelectItem>
                  <SelectItem value="2500">2,500 leads</SelectItem>
                  <SelectItem value="5000">5,000 leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Save Preset
              </Button>
              
              <Button
                onClick={() => handleLaunchScraper('apollo', {})}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Launching Apollo Scraper...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Launch Apollo Scraper
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">{success}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderApifyConfig = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#1E3A8A] py-12 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => setCurrentScreen('overview')}
            variant="ghost"
            className="text-white hover:bg-slate-700/50 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Platform Selection
          </Button>
        </div>

        <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-white text-3xl mb-2">Apify Web Scraper Configuration</CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Configure custom web scraping parameters for targeted lead extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="target-urls" className="text-white text-base">Target URLs</Label>
              <Textarea
                id="target-urls"
                placeholder="https://example.com/directory
https://example.com/team
https://example.com/about"
                className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="crawl-depth" className="text-white text-base">Crawl Depth</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select crawl depth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 level deep</SelectItem>
                    <SelectItem value="2">2 levels deep</SelectItem>
                    <SelectItem value="3">3 levels deep</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="extraction-type" className="text-white text-base">Data Extraction Type</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select extraction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contacts">Contact Information</SelectItem>
                    <SelectItem value="companies">Company Details</SelectItem>
                    <SelectItem value="products">Product Information</SelectItem>
                    <SelectItem value="custom">Custom Fields</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="css-selectors" className="text-white text-base">CSS Selectors (Optional)</Label>
              <Textarea
                id="css-selectors"
                placeholder=".contact-info, .team-member, .email-address"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Save Preset
              </Button>
              
              <Button
                onClick={() => handleLaunchScraper('apify', {})}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Launching Apify Scraper...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Launch Apify Scraper
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">{success}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPhantomBusterConfig = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#1E3A8A] py-12 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => setCurrentScreen('overview')}
            variant="ghost"
            className="text-white hover:bg-slate-700/50 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Platform Selection
          </Button>
        </div>

        <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-white text-3xl mb-2">PhantomBuster Configuration</CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Configure social media automation and lead extraction parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="platform" className="text-white text-base">Target Platform</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="extraction-method" className="text-white text-base">Extraction Method</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="search">Search Results</SelectItem>
                    <SelectItem value="company">Company Employees</SelectItem>
                    <SelectItem value="network">Network Connections</SelectItem>
                    <SelectItem value="group">Group Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="search-terms" className="text-white text-base">Search Terms / Company Names</Label>
              <Textarea
                id="search-terms"
                placeholder="Software Engineer, Product Manager, Startup CEO..."
                className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="location-filter" className="text-white text-base">Location Filter</Label>
              <Input
                id="location-filter"
                placeholder="San Francisco Bay Area, New York, United States..."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Save Preset
              </Button>
              
              <Button
                onClick={() => handleLaunchScraper('phantombuster', {})}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Launching PhantomBuster...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Launch PhantomBuster Scraper
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">{success}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderResults = () => {
    // Live check - NO FAKE DATA
    if (ENV === 'production' && !hasLiveResults) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#1E3A8A] py-12 px-4 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50 rounded-lg p-12">
              <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No leads available</h2>
              <p className="text-slate-300 text-lg">Please run a scraper first.</p>
              <Button
                onClick={() => setCurrentScreen('overview')}
                className="mt-6 bg-blue-600 hover:bg-blue-700"
              >
                Back to Platform Selection
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#1E3A8A] py-12 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => setCurrentScreen('overview')}
              variant="ghost"
              className="text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Platform Selection
            </Button>
          </div>

          {/* Success Confirmation */}
          <Card className="bg-green-900/20 border-green-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="text-white text-xl font-semibold">Scraping Complete!</h3>
                  <p className="text-green-200">Results have been processed and are ready for export.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Airtable
            </Button>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Results List - Only Live Data */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Lead Results</CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Live data from your scraping session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scraperResults.map((lead, index) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-6 bg-slate-700/40 rounded-xl border border-slate-600/30 hover:bg-slate-700/60 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-semibold text-lg">
                          {lead.firstName?.[0] || ''}
                          {lead.lastName?.[0] || ''}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{lead.firstName} {lead.lastName}</p>
                        <p className="text-slate-400 text-base">{lead.company}</p>
                        {lead.position && <p className="text-slate-500 text-sm">{lead.position}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300 text-base">{lead.email}</p>
                      {lead.phone && <p className="text-slate-400 text-base">{lead.phone}</p>}
                      <Badge className="mt-2 bg-blue-500/20 text-blue-300 border-blue-400/30">
                        {lead.source}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-600/50">
                <p className="text-center text-slate-300 text-xl">
                  Total results: <span className="text-white font-semibold">{scraperResults.length} leads</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  switch (currentScreen) {
    case 'apollo':
      return renderApolloConfig();
    case 'apify':
      return renderApifyConfig();
    case 'phantombuster':
      return renderPhantomBusterConfig();
    case 'results':
      return renderResults();
    default:
      return renderOverview();
  }
}