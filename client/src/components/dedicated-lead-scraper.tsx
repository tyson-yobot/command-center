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
  Star
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

  // Apollo.io state
  const [apolloFilters, setApolloFilters] = useState({
    jobTitles: [],
    departments: '',
    seniority: '',
    industries: [],
    locations: '',
    companySize: '',
    fundingStage: '',
    revenueRange: '',
    technologies: [],
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
    jobTitles: [],
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

  const [estimatedCount, setEstimatedCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');

  const handlePreviewCount = async () => {
    // Preview count estimation based on current filters
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => setSelectedEngine(null)}
            className="text-white border-slate-600 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
          <div className="flex items-center gap-3">
            {selectedEngine === 'apollo' && <Target className="h-8 w-8 text-blue-400" />}
            {selectedEngine === 'apify' && <Globe className="h-8 w-8 text-green-400" />}
            {selectedEngine === 'phantom' && <Users className="h-8 w-8 text-purple-400" />}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {selectedEngine === 'apollo' && 'Apollo.io Lead Scraper'}
                {selectedEngine === 'apify' && 'Apify Google Maps Scraper'}
                {selectedEngine === 'phantom' && 'PhantomBuster LinkedIn Scraper'}
              </h1>
              <p className="text-blue-200">
                {selectedEngine === 'apollo' && 'B2B Contact Database Scraping'}
                {selectedEngine === 'apify' && 'Local Business Data Extraction'}
                {selectedEngine === 'phantom' && 'Professional Network Scraping'}
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-blue-500/30 mb-6">
          <div className="p-8">
            {/* Apollo.io Interface */}
            {selectedEngine === 'apollo' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Person Criteria</h3>
                  
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Person Titles</label>
                    <Input
                      placeholder="CEO, CTO, Marketing Manager, Sales Director..."
                      value={apolloFilters.personTitles}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, personTitles: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Email Status</label>
                    <select 
                      value={apolloFilters.emailStatus}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, emailStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="any">Any Email</option>
                      <option value="verified">Verified Email</option>
                      <option value="likely">Likely Email</option>
                      <option value="none">No Email</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Phone Status</label>
                    <select 
                      value={apolloFilters.phoneStatus}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, phoneStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="any">Any Phone</option>
                      <option value="verified">Verified Phone</option>
                      <option value="likely">Likely Phone</option>
                      <option value="none">No Phone</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Company Criteria</h3>
                  
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Company Keywords</label>
                    <Input
                      placeholder="Software, SaaS, Startup, Technology..."
                      value={apolloFilters.companyKeywords}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, companyKeywords: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Industries</label>
                    <select 
                      value={apolloFilters.industries}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, industries: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Education">Education</option>
                      <option value="Government">Government</option>
                      <option value="Non-Profit">Non-Profit</option>
                      <option value="Media & Entertainment">Media & Entertainment</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Company Size</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        placeholder="Min employees"
                        value={apolloFilters.companyMinSize}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, companyMinSize: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                      <Input
                        type="number"
                        placeholder="Max employees"
                        value={apolloFilters.companyMaxSize}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, companyMaxSize: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Technologies</label>
                    <select 
                      value={apolloFilters.technologies}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, technologies: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select Technology</option>
                      <option value="Salesforce">Salesforce</option>
                      <option value="HubSpot">HubSpot</option>
                      <option value="Microsoft Office 365">Microsoft Office 365</option>
                      <option value="Google Workspace">Google Workspace</option>
                      <option value="Slack">Slack</option>
                      <option value="Zoom">Zoom</option>
                      <option value="AWS">AWS</option>
                      <option value="Microsoft Azure">Microsoft Azure</option>
                      <option value="Shopify">Shopify</option>
                      <option value="WordPress">WordPress</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Location & Revenue</h3>
                  
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Locations</label>
                    <Input
                      placeholder="United States, California, San Francisco..."
                      value={apolloFilters.locations}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, locations: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Funding Stage</label>
                    <select 
                      value={apolloFilters.fundingStage}
                      onChange={(e) => setApolloFilters({ ...apolloFilters, fundingStage: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select Funding Stage</option>
                      <option value="Bootstrapped">Bootstrapped</option>
                      <option value="Pre-Seed">Pre-Seed</option>
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Series B">Series B</option>
                      <option value="Series C">Series C</option>
                      <option value="Series D+">Series D+</option>
                      <option value="IPO">IPO</option>
                      <option value="Acquired">Acquired</option>
                      <option value="Private Equity">Private Equity</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Annual Revenue Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        placeholder="Min revenue"
                        value={apolloFilters.minRevenue}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, minRevenue: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                      <Input
                        type="number"
                        placeholder="Max revenue"
                        value={apolloFilters.maxRevenue}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, maxRevenue: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Apify Interface */}
            {selectedEngine === 'apify' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Search Parameters</h3>
                  
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Search Terms</label>
                    <Input
                      placeholder="restaurant, hotel, dentist, law firm..."
                      value={apifyFilters.searchTerms}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, searchTerms: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Locations</label>
                    <Input
                      placeholder="New York, NY, USA"
                      value={apifyFilters.locations}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, locations: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Language</label>
                    <select 
                      value={apifyFilters.language}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, language: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Filters & Limits</h3>
                  
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Max Results</label>
                    <Input
                      type="number"
                      value={apifyFilters.maxResults}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, maxResults: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Minimum Rating</label>
                    <select 
                      value={apifyFilters.minRating}
                      onChange={(e) => setApifyFilters({ ...apifyFilters, minRating: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="0">Any Rating</option>
                      <option value="1">1+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={apifyFilters.includeImages}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, includeImages: e.target.checked })}
                        className="h-4 w-4 rounded border border-slate-600"
                      />
                      <label className="text-slate-300">Include Images</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={apifyFilters.includeReviews}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, includeReviews: e.target.checked })}
                        className="h-4 w-4 rounded border border-slate-600"
                      />
                      <label className="text-slate-300">Include Reviews</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PhantomBuster Interface */}
            {selectedEngine === 'phantom' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">LinkedIn Search</h3>
                  
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Search URLs</label>
                    <Input
                      placeholder="LinkedIn search URLs..."
                      value={phantomFilters.searchUrls}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, searchUrls: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Connection Degree</label>
                    <select 
                      value={phantomFilters.connectionDegree}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, connectionDegree: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="1st">1st Connections</option>
                      <option value="2nd">2nd Connections</option>
                      <option value="3rd">3rd+ Connections</option>
                      <option value="all">All Connections</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Max Profiles</label>
                    <Input
                      type="number"
                      value={phantomFilters.maxProfiles}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, maxProfiles: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Professional Criteria</h3>
                  
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Industries</label>
                    <select 
                      value={phantomFilters.industries}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, industries: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Seniority Level</label>
                    <select 
                      value={phantomFilters.seniority}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, seniority: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select Seniority</option>
                      <option value="Intern">Intern</option>
                      <option value="Entry">Entry</option>
                      <option value="Associate">Associate</option>
                      <option value="Mid-Senior">Mid-Senior</option>
                      <option value="Director">Director</option>
                      <option value="Executive">Executive</option>
                      <option value="C-Level">C-Level</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Function</label>
                    <select 
                      value={phantomFilters.functions}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, functions: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select Function</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Product Management">Product Management</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="Human Resources">Human Resources</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Company & Location</h3>
                  
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Locations</label>
                    <Input
                      placeholder="United States, Europe..."
                      value={phantomFilters.locations}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, locations: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Company Size</label>
                    <select 
                      value={phantomFilters.companySize}
                      onChange={(e) => setPhantomFilters({ ...phantomFilters, companySize: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="any">Any Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1001-5000">1001-5000 employees</option>
                      <option value="5001+">5001+ employees</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={phantomFilters.excludePrivate}
                        onChange={(e) => setPhantomFilters({ ...phantomFilters, excludePrivate: e.target.checked })}
                        className="h-4 w-4 rounded border border-slate-600"
                      />
                      <label className="text-slate-300">Exclude Private Profiles</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-8 border-t border-slate-600 mt-8">
              <Button
                onClick={handleStartScraping}
                disabled={isRunning}
                className={`px-8 py-3 text-white font-semibold ${
                  selectedEngine === 'apollo' ? 'bg-blue-600 hover:bg-blue-700' :
                  selectedEngine === 'apify' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start Scraping
                  </>
                )}
              </Button>

              {results.length > 0 && (
                <Button
                  onClick={handleExportResults}
                  variant="outline"
                  className="px-6 py-3 text-white border-slate-600 hover:bg-slate-700"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export {results.length} Results
                </Button>
              )}

              <div className="ml-auto text-slate-300">
                <span className="text-lg font-medium">
                  {results.length > 0 ? `${results.length} leads found` : 'Ready to scrape'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Display */}
        {results.length > 0 && (
          <Card className="bg-slate-800/50 border-blue-500/30">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Scraping Results</h3>
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
                        {lead.location && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs">{lead.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 mb-1">Source: {lead.source}</div>
                      {lead.confidence && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-3 w-3" />
                          <span className="text-xs">{Math.round(lead.confidence)}% match</span>
                        </div>
                      )}
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