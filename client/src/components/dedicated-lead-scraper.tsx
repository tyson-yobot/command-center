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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Contact Filters</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Job Titles (multi-select)</label>
                      <Input
                        placeholder="CEO, Marketing Manager, Director..."
                        value={apolloFilters.jobTitles.join(', ')}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, jobTitles: e.target.value.split(',').map(t => t.trim()) })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Departments</label>
                      <select 
                        value={apolloFilters.departments}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, departments: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="">Select Department</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="HR">HR</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Operations">Operations</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Seniority</label>
                      <select 
                        value={apolloFilters.seniority}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, seniority: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="">Select Seniority</option>
                        <option value="Entry">Entry</option>
                        <option value="Manager">Manager</option>
                        <option value="Director">Director</option>
                        <option value="VP">VP</option>
                        <option value="C-Level">C-Level</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={apolloFilters.emailVerified}
                          onChange={(e) => setApolloFilters({ ...apolloFilters, emailVerified: e.target.checked })}
                          className="h-4 w-4 rounded border border-slate-600"
                        />
                        <label className="text-slate-300">Email Verified Only</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={apolloFilters.phoneAvailable}
                          onChange={(e) => setApolloFilters({ ...apolloFilters, phoneAvailable: e.target.checked })}
                          className="h-4 w-4 rounded border border-slate-600"
                        />
                        <label className="text-slate-300">Phone Available Only</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Company Filters</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Industries (multi-select)</label>
                      <Input
                        placeholder="Technology, Healthcare, Finance..."
                        value={apolloFilters.industries.join(', ')}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, industries: e.target.value.split(',').map(t => t.trim()) })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Locations</label>
                      <Input
                        placeholder="City, State, Country"
                        value={apolloFilters.locations}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, locations: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Company Size</label>
                      <select 
                        value={apolloFilters.companySize}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, companySize: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="">Any Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1001+">1001+ employees</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Technologies Used</label>
                      <Input
                        placeholder="Salesforce, HubSpot, AWS..."
                        value={apolloFilters.technologies.join(', ')}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, technologies: e.target.value.split(',').map(t => t.trim()) })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Funding & Revenue</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Funding Stage</label>
                      <select 
                        value={apolloFilters.fundingStage}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, fundingStage: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="">Any Stage</option>
                        <option value="Seed">Seed</option>
                        <option value="Series A">Series A</option>
                        <option value="Series B">Series B</option>
                        <option value="Series C">Series C</option>
                        <option value="Series D+">Series D+</option>
                        <option value="IPO">IPO</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Revenue Range</label>
                      <select 
                        value={apolloFilters.revenueRange}
                        onChange={(e) => setApolloFilters({ ...apolloFilters, revenueRange: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="">Any Revenue</option>
                        <option value="0-1M">$0 - $1M</option>
                        <option value="1M-10M">$1M - $10M</option>
                        <option value="10M-100M">$10M - $100M</option>
                        <option value="100M+">$100M+</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={apolloFilters.saveToAirtable}
                          onChange={(e) => setApolloFilters({ ...apolloFilters, saveToAirtable: e.target.checked })}
                          className="h-4 w-4 rounded border border-slate-600"
                        />
                        <label className="text-slate-300">Save to Airtable</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={apolloFilters.saveToHubSpot}
                          onChange={(e) => setApolloFilters({ ...apolloFilters, saveToHubSpot: e.target.checked })}
                          className="h-4 w-4 rounded border border-slate-600"
                        />
                        <label className="text-slate-300">Save to HubSpot</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Apify Filters Panel */}
              {selectedEngine === 'apify' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Business Targeting</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Platform</label>
                      <select 
                        value={apifyFilters.platform}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, platform: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="Google Maps">Google Maps</option>
                        <option value="Yelp">Yelp</option>
                        <option value="Custom Scraper">Custom Scraper</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Category</label>
                      <Input
                        placeholder="Restaurants, Clinics, Law Firms..."
                        value={apifyFilters.category}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, category: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Rating Threshold</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={apifyFilters.ratingThreshold}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, ratingThreshold: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-slate-300 mt-1">{apifyFilters.ratingThreshold} stars+</div>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Review Count Minimum</label>
                      <Input
                        type="number"
                        value={apifyFilters.reviewCountMin.toString()}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, reviewCountMin: parseInt(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Location & Scrape Settings</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Region</label>
                      <Input
                        placeholder="City, State or Geographic Area"
                        value={apifyFilters.region}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, region: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Zip or Radius</label>
                      <Input
                        placeholder="90210 or 25 miles"
                        value={apifyFilters.zipRadius}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, zipRadius: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Pagination Limit</label>
                      <Input
                        type="number"
                        value={apifyFilters.paginationLimit.toString()}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, paginationLimit: parseInt(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Delay Between Requests (ms)</label>
                      <Input
                        type="number"
                        value={apifyFilters.delayBetweenRequests.toString()}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, delayBetweenRequests: parseInt(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={apifyFilters.extractContactInfo}
                        onChange={(e) => setApifyFilters({ ...apifyFilters, extractContactInfo: e.target.checked })}
                        className="h-4 w-4 rounded border border-slate-600"
                      />
                      <label className="text-slate-300">Contact Info Extraction</label>
                    </div>
                  </div>
                </div>
              )}

              {/* PhantomBuster Filters Panel */}
              {selectedEngine === 'phantom' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">LinkedIn Filters</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Profile URLs Upload</label>
                      <textarea
                        placeholder="Paste LinkedIn URLs or upload CSV..."
                        value={phantomFilters.profileUrls}
                        onChange={(e) => setPhantomFilters({ ...phantomFilters, profileUrls: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 h-20"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Job Titles (multi-select)</label>
                      <Input
                        placeholder="CEO, Director, Manager..."
                        value={phantomFilters.jobTitles.join(', ')}
                        onChange={(e) => setPhantomFilters({ ...phantomFilters, jobTitles: e.target.value.split(',').map(t => t.trim()) })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Connection Degree</label>
                      <div className="space-y-2">
                        {['1st', '2nd', '3rd'].map(degree => (
                          <div key={degree} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="connectionDegree"
                              value={degree}
                              checked={phantomFilters.connectionDegree === degree}
                              onChange={(e) => setPhantomFilters({ ...phantomFilters, connectionDegree: e.target.value })}
                              className="h-4 w-4"
                            />
                            <label className="text-slate-300">{degree} Connections</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Professional Criteria</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Seniority</label>
                      <select 
                        value={phantomFilters.seniority}
                        onChange={(e) => setPhantomFilters({ ...phantomFilters, seniority: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="">Any Seniority</option>
                        <option value="Intern">Intern</option>
                        <option value="Entry">Entry</option>
                        <option value="Associate">Associate</option>
                        <option value="Mid-Senior">Mid-Senior</option>
                        <option value="Director">Director</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Industry</label>
                      <select 
                        value={phantomFilters.industry}
                        onChange={(e) => setPhantomFilters({ ...phantomFilters, industry: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="">Any Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Financial Services">Financial Services</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Company Size</label>
                      <select 
                        value={phantomFilters.companySize}
                        onChange={(e) => setPhantomFilters({ ...phantomFilters, companySize: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="">Any Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Behavior Settings</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Auto Connect With Message</label>
                      <textarea
                        placeholder="Hi [First Name], I'd like to connect..."
                        value={phantomFilters.autoConnectMessage}
                        onChange={(e) => setPhantomFilters({ ...phantomFilters, autoConnectMessage: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 h-20"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={phantomFilters.retryFailed}
                          onChange={(e) => setPhantomFilters({ ...phantomFilters, retryFailed: e.target.checked })}
                          className="h-4 w-4 rounded border border-slate-600"
                        />
                        <label className="text-slate-300">Retry Failed Scrapes</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={phantomFilters.usePhantomAPI}
                          onChange={(e) => setPhantomFilters({ ...phantomFilters, usePhantomAPI: e.target.checked })}
                          className="h-4 w-4 rounded border border-slate-600"
                        />
                        <label className="text-slate-300">Use Phantom vs API</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={phantomFilters.showLiveLogging}
                          onChange={(e) => setPhantomFilters({ ...phantomFilters, showLiveLogging: e.target.checked })}
                          className="h-4 w-4 rounded border border-slate-600"
                        />
                        <label className="text-slate-300">Show Live Logging Stream</label>
                      </div>
                    </div>

                    {!phantomFilters.linkedinCookiePresent && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
                        <p className="text-yellow-400 text-sm">⚠️ LinkedIn login cookie not detected. Please log in to LinkedIn first.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-600">
                <Button
                  onClick={handlePreviewCount}
                  variant="outline"
                  className="px-6 py-3 text-white border-slate-600 hover:bg-slate-700"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Preview Count
                </Button>

                {estimatedCount > 0 && (
                  <div className="text-slate-300">
                    <span className="font-medium">{estimatedCount.toLocaleString()} estimated results</span>
                    <span className="text-sm ml-2">({estimatedTime})</span>
                  </div>
                )}

                <Button
                  onClick={handleStartScraping}
                  disabled={isRunning}
                  className={`px-8 py-3 text-white font-semibold ml-auto ${
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
                      Launch Scraper
                    </>
                  )}
                </Button>
              </div>
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