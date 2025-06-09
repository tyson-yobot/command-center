import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useModeContext } from '../App';
import { 
  Search, 
  Users, 
  Building2, 
  Settings, 
  Play, 
  Download,
  Filter,
  MapPin,
  Briefcase,
  Target
} from 'lucide-react';

export default function LeadScrapingPage() {
  const { isTestMode } = useModeContext();
  const [searchTerms, setSearchTerms] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
  const [companySize, setCompanySize] = React.useState('');
  const [maxResults, setMaxResults] = React.useState('50');
  const [emailVerified, setEmailVerified] = React.useState(true);
  const [phoneAvailable, setPhoneAvailable] = React.useState(true);
  const [industries, setIndustries] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [locations, setLocations] = React.useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = React.useState<string[]>([]);
  const [newKeyword, setNewKeyword] = React.useState('');
  const [newLocation, setNewLocation] = React.useState('');
  const [scrapingResults, setScrapingResults] = React.useState<any[]>([]);

  // Load industries from Airtable Industry Templates table
  React.useEffect(() => {
    const loadIndustries = async () => {
      try {
        const response = await fetch('/api/airtable/industry-templates');
        const data = await response.json();
        if (data.success && data.industries) {
          setIndustries(data.industries);
        }
      } catch (error) {
        console.error('Failed to load industries:', error);
        // Fallback to basic list if API fails
        setIndustries(['Technology', 'Healthcare', 'Finance', 'Education', 'Retail']);
      }
    };
    loadIndustries();
  }, []);

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees',
    '201-500 employees', '501-1000 employees', '1000+ employees'
  ];

  const maxResultsOptions = [
    '25 leads', '50 leads', '100 leads', '250 leads', '500 leads', '1000 leads'
  ];

  // Handler functions for Add buttons
  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const addIndustry = (industryName: string) => {
    if (!selectedIndustries.includes(industryName)) {
      setSelectedIndustries([...selectedIndustries, industryName]);
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const removeLocation = (location: string) => {
    setLocations(locations.filter(l => l !== location));
  };

  const removeIndustry = (industry: string) => {
    setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
  };

  const startScraping = async (platform: string) => {
    setLoading(true);
    try {
      const payload = {
        searchTerms,
        keywords,
        locations,
        industries: selectedIndustries,
        jobTitle,
        companySize,
        maxResults: parseInt(maxResults),
        emailVerified,
        phoneAvailable,
        isTestMode,
        platform
      };

      const response = await fetch('/api/scraping/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        setScrapingResults(result.results || []);
      }
    } catch (error) {
      console.error('Scraping failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Lead Scraping Center</h1>
              <p className="text-blue-200">Apollo • Apify • PhantomBuster Integration</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isTestMode ? "secondary" : "default"} className="px-4 py-2">
              {isTestMode ? "🧪 Test Mode" : "🚀 Live Mode"}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="apollo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-sm">
            <TabsTrigger value="apollo" className="data-[state=active]:bg-blue-600">
              💙 Apollo
            </TabsTrigger>
            <TabsTrigger value="apify" className="data-[state=active]:bg-green-600">
              💚 Apify
            </TabsTrigger>
            <TabsTrigger value="phantombuster" className="data-[state=active]:bg-purple-600">
              💜 PhantomBuster
            </TabsTrigger>
          </TabsList>

          {/* Apollo Tab */}
          <TabsContent value="apollo" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Search className="w-5 h-5 text-blue-400" />
                  <span>Lead Search Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Filters */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span>🧑 Contact Filters</span>
                    </h3>
                    
                    <div>
                      <Label htmlFor="searchTerms" className="text-white">Search Terms *</Label>
                      <Input
                        id="searchTerms"
                        placeholder="e.g., CEO, software engineer, marketing director"
                        value={searchTerms}
                        onChange={(e) => setSearchTerms(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    {/* Keywords Management */}
                    <div>
                      <Label className="text-white">Keywords</Label>
                      <div className="flex space-x-2 mb-2">
                        <Input
                          placeholder="Add keyword"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                        />
                        <Button onClick={addKeyword} className="bg-blue-600 hover:bg-blue-700">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-200">
                            {keyword}
                            <button 
                              onClick={() => removeKeyword(keyword)}
                              className="ml-2 text-blue-300 hover:text-white"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Locations Management */}
                    <div>
                      <Label className="text-white">Locations</Label>
                      <div className="flex space-x-2 mb-2">
                        <Input
                          placeholder="Add location"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                        />
                        <Button onClick={addLocation} className="bg-blue-600 hover:bg-blue-700">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {locations.map((location, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-600/20 text-green-200">
                            {location}
                            <button 
                              onClick={() => removeLocation(location)}
                              className="ml-2 text-green-300 hover:text-white"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="jobTitle" className="text-white">Job Title</Label>
                      <Input
                        id="jobTitle"
                        placeholder="e.g., CEO, Director, Manager"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Company Filters */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Building2 className="w-5 h-5 text-blue-400" />
                      <span>🏢 Company/Business Filters</span>
                    </h3>

                    {/* Industries Management */}
                    <div>
                      <Label className="text-white">Industries</Label>
                      <Select value="" onValueChange={addIndustry}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Add Industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.filter(ind => !selectedIndustries.includes(ind)).map((ind) => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedIndustries.map((industry, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-200">
                            {industry}
                            <button 
                              onClick={() => removeIndustry(industry)}
                              className="ml-2 text-purple-300 hover:text-white"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="companySize" className="text-white">Company Size</Label>
                      <Select value={companySize} onValueChange={setCompanySize}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Execution Settings */}
                <div className="space-y-4 border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <span>⚙️ Scraping Settings</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="maxResults" className="text-white">Max Results</Label>
                      <Select value={maxResults} onValueChange={setMaxResults}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {maxResultsOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <Label htmlFor="emailVerified" className="text-white">Email Verified</Label>
                      <Switch
                        id="emailVerified"
                        checked={emailVerified}
                        onCheckedChange={setEmailVerified}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <Label htmlFor="phoneAvailable" className="text-white">Phone Available</Label>
                      <Switch
                        id="phoneAvailable"
                        checked={phoneAvailable}
                        onCheckedChange={setPhoneAvailable}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center pt-6 border-t border-slate-700">
                  <Button 
                    onClick={() => startScraping('apollo')}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start Apollo Search
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apify Tab */}
          <TabsContent value="apify" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span>Google Maps Business Scraping</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-green-200">Configure Apify Google Maps scraping parameters...</p>
                
                {/* Action Buttons */}
                <div className="flex justify-center pt-6 border-t border-slate-700">
                  <Button 
                    onClick={() => startScraping('apify')}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start Apify Search
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PhantomBuster Tab */}
          <TabsContent value="phantombuster" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Social Media Lead Extraction</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-purple-200">Configure PhantomBuster LinkedIn and X (formerly Twitter) scraping...</p>
                
                {/* Action Buttons */}
                <div className="flex justify-center pt-6 border-t border-slate-700">
                  <Button 
                    onClick={() => startScraping('phantombuster')}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start PhantomBuster Search
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results Section */}
        {scrapingResults.length > 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Download className="w-5 h-5 text-blue-400" />
                <span>Scraping Results ({scrapingResults.length} leads)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {scrapingResults.slice(0, 5).map((result, index) => (
                  <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-semibold">{result.fullName || result.businessName}</h4>
                        <p className="text-slate-300">{result.title || result.category}</p>
                        <p className="text-slate-400">{result.company || result.address}</p>
                      </div>
                      <Badge variant="outline" className="text-blue-200 border-blue-500">
                        {result.source}
                      </Badge>
                    </div>
                  </div>
                ))}
                {scrapingResults.length > 5 && (
                  <p className="text-slate-400 text-center">
                    ... and {scrapingResults.length - 5} more results
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-blue-300 border-blue-500">
                <Filter className="w-4 h-4 mr-2" />
                7 filters applied
              </Badge>
              <Badge variant="outline" className="text-green-300 border-green-500">
                ⏱ ~{maxResults} estimated leads
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-500/20">
                💾 Save Preset
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Play className="w-4 h-4 mr-2" />
                🚀 Launch Scraping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}