import React, { useState } from "react";
import { 
  Target,
  Globe,
  Users,
  Play,
  Download,
  RefreshCw,
  ArrowLeft,
  Building,
  MapPin,
  Mail,
  Phone,
  Star,
  Eye
} from "lucide-react";

// Inline UI components
const Card = ({ children, className = "", onClick }: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) => (
  <div className={`rounded-lg border shadow-sm ${className}`} onClick={onClick}>
    {children}
  </div>
);

const Button = ({ children, onClick, disabled = false, className = "", variant = "default" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: string;
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variantClass = variant === "outline" ? "border border-input hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90";
  
  return (
    <button 
      className={`${baseClass} ${variantClass} h-10 py-2 px-4 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ placeholder, value, onChange, className = "", type = "text" }: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

export default function DedicatedLeadScraper() {
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [estimatedCount, setEstimatedCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');

  // Apollo.io state
  const [apolloFilters, setApolloFilters] = useState({
    jobTitles: [] as string[],
    departments: '',
    seniority: '',
    industries: [] as string[],
    locations: '',
    companySize: '',
    fundingStage: '',
    revenueRange: '',
    technologies: [] as string[],
    emailVerified: true,
    phoneAvailable: false,
    saveToAirtable: true,
    saveToHubSpot: true
  });

  // Apify state
  const [apifyFilters, setApifyFilters] = useState({
    platform: 'Google Maps',
    category: '',
    ratingThreshold: 4.0,
    reviewCountMin: 10,
    region: '',
    zipRadius: '',
    paginationLimit: 1000,
    delayBetweenRequests: 1000,
    extractContactInfo: true
  });

  // PhantomBuster state
  const [phantomFilters, setPhantomFilters] = useState({
    profileUrls: '',
    jobTitles: [] as string[],
    seniority: '',
    industry: '',
    companySize: '',
    connectionDegree: '1st',
    autoConnectMessage: '',
    retryFailed: true,
    usePhantomAPI: true,
    showLiveLogging: false,
    linkedinCookiePresent: false
  });

  const handlePreviewCount = async () => {
    const baseCount = selectedEngine === 'apollo' ? 15000 : selectedEngine === 'apify' ? 8000 : 12000;
    const randomVariation = Math.floor(Math.random() * 5000);
    setEstimatedCount(baseCount + randomVariation);
    setEstimatedTime(selectedEngine === 'apollo' ? '2-4 minutes' : selectedEngine === 'apify' ? '5-8 minutes' : '3-6 minutes');
  };

  const handleStartScraping = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      let endpoint = '';
      let payload = {};

      switch (selectedEngine) {
        case 'apollo':
          endpoint = '/api/scraping/apollo';
          payload = {
            filters: apolloFilters,
            maxResults: 1000,
            saveToAirtable: apolloFilters.saveToAirtable,
            saveToHubSpot: apolloFilters.saveToHubSpot
          };
          break;
        case 'apify':
          endpoint = '/api/scraping/apify';
          payload = {
            filters: apifyFilters
          };
          break;
        case 'phantom':
          endpoint = '/api/scraping/phantom';
          payload = {
            filters: phantomFilters
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success && data.leads) {
        setResults(data.leads);
      }
    } catch (error) {
      console.error('Scraping error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportResults = () => {
    if (results.length === 0) return;
    
    const csvContent = [
      ['Name', 'Title', 'Company', 'Email', 'Phone', 'Location', 'LinkedIn', 'Source'].join(','),
      ...results.map(lead => [
        lead.name || '',
        lead.title || '',
        lead.company || '',
        lead.email || '',
        lead.phone || '',
        lead.location || '',
        lead.linkedin || '',
        lead.source
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${selectedEngine}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Step 1: Tool Selection */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Professional Lead Scraper</h1>
          <p className="text-xl text-blue-200">Select your lead generation platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Apollo.io */}
          <Card 
            className={`p-6 cursor-pointer transition-colors ${
              selectedEngine === 'apollo' 
                ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400' 
                : 'bg-slate-800/50 border-blue-500/30 hover:bg-slate-700/50'
            }`}
            onClick={() => setSelectedEngine('apollo')}
          >
            <div className="text-center">
              <Target className="h-12 w-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Apollo.io</h3>
              <p className="text-slate-300 text-sm mb-4">B2B contact database</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Select Apollo.io
              </Button>
            </div>
          </Card>

          {/* Apify */}
          <Card 
            className={`p-6 cursor-pointer transition-colors ${
              selectedEngine === 'apify' 
                ? 'bg-green-600/30 border-green-400 ring-2 ring-green-400' 
                : 'bg-slate-800/50 border-blue-500/30 hover:bg-slate-700/50'
            }`}
            onClick={() => setSelectedEngine('apify')}
          >
            <div className="text-center">
              <Globe className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Apify</h3>
              <p className="text-slate-300 text-sm mb-4">Google Maps scraper</p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Select Apify
              </Button>
            </div>
          </Card>

          {/* PhantomBuster */}
          <Card 
            className={`p-6 cursor-pointer transition-colors ${
              selectedEngine === 'phantom' 
                ? 'bg-purple-600/30 border-purple-400 ring-2 ring-purple-400' 
                : 'bg-slate-800/50 border-blue-500/30 hover:bg-slate-700/50'
            }`}
            onClick={() => setSelectedEngine('phantom')}
          >
            <div className="text-center">
              <Users className="h-12 w-12 text-purple-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">PhantomBuster</h3>
              <p className="text-slate-300 text-sm mb-4">LinkedIn scraper</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Select PhantomBuster
              </Button>
            </div>
          </Card>
        </div>

        {/* Step 2: Dynamic Filter Builder */}
        {selectedEngine && (
          <Card className="bg-slate-800/50 border-blue-500/30 mb-6">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                {selectedEngine === 'apollo' && <Target className="h-8 w-8 text-blue-400" />}
                {selectedEngine === 'apify' && <Globe className="h-8 w-8 text-green-400" />}
                {selectedEngine === 'phantom' && <Users className="h-8 w-8 text-purple-400" />}
                <h2 className="text-2xl font-bold text-white">
                  {selectedEngine === 'apollo' && 'Apollo.io Configuration'}
                  {selectedEngine === 'apify' && 'Apify Configuration'}
                  {selectedEngine === 'phantom' && 'PhantomBuster Configuration'}
                </h2>
              </div>

              {/* Apollo.io Filters Panel */}
              {selectedEngine === 'apollo' && (
                <div className="bg-gray-900 text-white rounded-xl p-6 shadow-lg space-y-4">
                  <h2 className="text-2xl font-semibold">🔵 Apollo.io Filters</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="jobTitles"
                      placeholder="🎯 Job Titles (e.g. Owner, Manager)"
                      value={apolloFilters.jobTitles.join(', ')}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, jobTitles: e.target.value.split(',').map(t => t.trim()) })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <input
                      type="text"
                      name="industry"
                      placeholder="🏭 Industry (e.g. Real Estate)"
                      value={apolloFilters.industries.join(', ')}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, industries: e.target.value.split(',').map(t => t.trim()) })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <input
                      type="text"
                      name="location"
                      placeholder="🌍 Location (City, State, etc.)"
                      value={apolloFilters.locations}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, locations: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <select
                      name="companySize"
                      value={apolloFilters.companySize}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, companySize: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    >
                      <option value="">🏢 Company Size</option>
                      <option value="1-10">1–10</option>
                      <option value="11-50">11–50</option>
                      <option value="51-200">51–200</option>
                      <option value="201-500">201–500</option>
                      <option value="500+">500+</option>
                    </select>

                    <select
                      name="fundingStage"
                      value={apolloFilters.fundingStage}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, fundingStage: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    >
                      <option value="">💰 Funding Stage</option>
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Series B">Series B</option>
                      <option value="Series C+">Series C+</option>
                      <option value="Public">Public</option>
                    </select>

                    <select
                      name="revenueRange"
                      value={apolloFilters.revenueRange}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, revenueRange: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    >
                      <option value="">📊 Revenue Range</option>
                      <option value="0-1M">0–1M</option>
                      <option value="1–10M">1–10M</option>
                      <option value="10–50M">10–50M</option>
                      <option value="50M+">50M+</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={apolloFilters.emailVerified}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, emailVerified: e.target.checked })}
                      />
                      ✅ Email Verified Only
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={apolloFilters.phoneAvailable}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, phoneAvailable: e.target.checked })}
                      />
                      📞 Phone Available
                    </label>
                  </div>
                </div>
              )}

              {/* Apify Filters Panel */}
              {selectedEngine === 'apify' && (
                <div className="bg-gray-900 text-white rounded-xl p-6 shadow-lg space-y-4">
                  <h2 className="text-2xl font-semibold">🌐 Apify Filters</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="platform"
                      value={apifyFilters.platform}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, platform: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    >
                      <option value="Google Maps">Google Maps</option>
                      <option value="Yelp">Yelp</option>
                      <option value="Custom">Custom Crawler</option>
                    </select>

                    <input
                      type="text"
                      name="category"
                      placeholder="📍 Business Category (e.g. Dentists)"
                      value={apifyFilters.category}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, category: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <input
                      type="text"
                      name="location"
                      placeholder="🌍 Location (City or Zip)"
                      value={apifyFilters.region}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, region: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <input
                      type="number"
                      name="radiusMiles"
                      placeholder="🗺️ Radius (miles)"
                      value={apifyFilters.zipRadius}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, zipRadius: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <input
                      type="number"
                      name="ratingMin"
                      placeholder="⭐️ Min Rating"
                      value={apifyFilters.ratingThreshold}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, ratingThreshold: parseFloat(e.target.value) })}
                      className="p-2 rounded bg-gray-800 w-full"
                      min="1"
                      max="5"
                    />

                    <input
                      type="number"
                      name="reviewCountMin"
                      placeholder="💬 Min Reviews"
                      value={apifyFilters.reviewCountMin}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, reviewCountMin: parseInt(e.target.value) })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <input
                      type="number"
                      name="paginationLimit"
                      placeholder="🗂️ Max Results"
                      value={apifyFilters.paginationLimit}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, paginationLimit: parseInt(e.target.value) })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <input
                      type="number"
                      name="delayMs"
                      placeholder="⏳ Delay per Request (ms)"
                      value={apifyFilters.delayBetweenRequests}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, delayBetweenRequests: parseInt(e.target.value) })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={apifyFilters.extractContactInfo}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, extractContactInfo: e.target.checked })}
                      />
                      👤 Extract Contact Info
                    </label>
                  </div>
                </div>
              )}

              {/* PhantomBuster Filters Panel */}
              {selectedEngine === 'phantom' && (
                <div className="bg-gray-900 text-white rounded-xl p-6 shadow-lg space-y-4">
                  <h2 className="text-2xl font-semibold">🔹 PhantomBuster Filters</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="connectionDegree"
                      value={phantomFilters.connectionDegree}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, connectionDegree: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    >
                      <option value="1st">1st Degree</option>
                      <option value="2nd">2nd Degree</option>
                      <option value="3rd">3rd Degree</option>
                    </select>

                    <input
                      type="text"
                      name="jobTitles"
                      placeholder="🎯 Job Titles (e.g. Founder)"
                      value={phantomFilters.jobTitles.join(', ')}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, jobTitles: e.target.value.split(',').map(t => t.trim()) })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <input
                      type="text"
                      name="industries"
                      placeholder="🏭 Industries (comma separated)"
                      value={phantomFilters.industry}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, industry: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <input
                      type="text"
                      name="location"
                      placeholder="🌍 Location (City, State)"
                      value={phantomFilters.profileUrls}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, profileUrls: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    />

                    <select
                      name="companySize"
                      value={phantomFilters.companySize}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, companySize: e.target.value })}
                      className="p-2 rounded bg-gray-800 w-full"
                    >
                      <option value="">🏢 Company Size</option>
                      <option value="1-10">1–10</option>
                      <option value="11-50">11–50</option>
                      <option value="51-200">51–200</option>
                      <option value="201-500">201–500</option>
                      <option value="500+">500+</option>
                    </select>

                    <select
                      name="mode"
                      value={phantomFilters.usePhantomAPI ? "API" : "Phantom"}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, usePhantomAPI: e.target.value === "API" })}
                      className="p-2 rounded bg-gray-800 w-full"
                    >
                      <option value="Phantom">Use Phantom</option>
                      <option value="API">Use API</option>
                    </select>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={phantomFilters.retryFailed}
                        onChange={(e) => setPhantomFilters({ ...phantomFilters, retryFailed: e.target.checked })}
                      />
                      📞 Auto-connect with message
                    </label>

                    {phantomFilters.retryFailed && (
                      <textarea
                        placeholder="✉️ Connection Message..."
                        value={phantomFilters.autoConnectMessage}
                        onChange={(e) => setPhantomFilters({ ...phantomFilters, autoConnectMessage: e.target.value })}
                        rows={3}
                        className="w-full p-2 rounded bg-gray-800"
                      />
                    )}

                    <label className="block">
                      ♻️ Retry Attempts:
                      <input
                        type="number"
                        value={phantomFilters.retryFailed ? 1 : 0}
                        onChange={(e) => setPhantomFilters({ ...phantomFilters, retryFailed: parseInt(e.target.value) > 0 })}
                        className="p-2 rounded bg-gray-800 w-full mt-1"
                        min="0"
                        max="10"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                onClick={handleStartScraping}
                disabled={isRunning}
                className={`mt-6 ${
                  selectedEngine === 'apollo' ? 'bg-blue-600 hover:bg-blue-500' :
                  selectedEngine === 'apify' ? 'bg-green-600 hover:bg-green-500' :
                  'bg-purple-600 hover:bg-purple-500'
                } text-white font-semibold py-2 px-6 rounded-xl`}
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin inline" />
                    Scraping...
                  </>
                ) : (
                  <>
                    🚀 Launch {selectedEngine === 'apollo' ? 'Apollo' : selectedEngine === 'apify' ? 'Apify' : 'Phantom'} Scraper
                  </>
                )}
              </button>
            </div>
          </Card>
        )}

        {/* Results Display */}
        {results.length > 0 && (
          <Card className="bg-slate-800/50 border-blue-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Scraping Results</h3>
                <Button
                  onClick={handleExportResults}
                  variant="outline"
                  className="text-white border-slate-600 hover:bg-slate-700"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export CSV
                </Button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.slice(0, 20).map((lead, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">{lead.name}</h4>
                      <p className="text-sm text-slate-400">{lead.title} at {lead.company}</p>
                      <div className="flex items-center gap-4 mt-2">
                        {lead.email && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-green-400">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Source: {selectedEngine}</div>
                    </div>
                  </div>
                ))}
                
                {results.length > 20 && (
                  <div className="text-center py-4">
                    <p className="text-slate-400">
                      Showing 20 of {results.length} results. Export to view all.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}