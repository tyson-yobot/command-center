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
  Eye,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Lead {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  location: string;
  score?: number;
}

interface ScrapingResult {
  success: boolean;
  leads: Lead[];
  count: number;
  filters: any;
}

// Inline UI Components
const Card = ({ children, className = "", onClick }: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) => (
  <div className={`rounded-lg border bg-white dark:bg-gray-800 shadow-sm ${className}`} onClick={onClick}>
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
  const variantClass = variant === "outline" 
    ? "border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700" 
    : "bg-blue-600 text-white hover:bg-blue-700";
  
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
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Select = ({ value, onChange, children, className = "" }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <select
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  >
    {children}
  </select>
);

const Label = ({ children, className = "", htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </label>
);

const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ${className}`}>
    {children}
  </span>
);

// Multi-Select Component
const MultiSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  className = "" 
}: {
  value: string[];
  onChange: (selected: string[]) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {value.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            value.map((item) => (
              <span key={item} className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-xs">
                {options.find(opt => opt.value === item)?.label || item}
                <button
                  className="ml-1 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(item);
                  }}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex items-center">
          <span className="text-gray-400">▼</span>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
              onClick={() => toggleOption(option.value)}
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                readOnly
                className="mr-2 text-blue-600"
              />
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function DedicatedLeadScraper() {
  const [currentStep, setCurrentStep] = useState<'tool-selection' | 'filters' | 'results'>('tool-selection');
  const [selectedTool, setSelectedTool] = useState<'apollo' | 'apify' | 'phantombuster' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states for each tool
  const [apolloFilters, setApolloFilters] = useState({
    jobTitles: [],
    industry: [],
    location: [],
    companySize: "1-50",
    seniorityLevel: [],
    departments: [],
    technologies: [],
    keywords: "",
    organizationIds: "",
    personTitles: "",
    personSeniorities: "",
    organizationNumEmployeesRanges: "",
    organizationLocations: "",
    contactEmailStatus: "likely_to_engage",
    prospectedByCurrentTeam: "false",
    stage: "all",
    excludeDomains: "",
    lastUpdated: "30_days",
    revenueRange: "",
    fundingStage: ""
  });

  const [apifyFilters, setApifyFilters] = useState({
    searchTerms: "",
    location: "",
    companySize: "51-200",
    industry: "Software",
    resultsLimit: "100",
    scrapePhotos: "false",
    scrapeConnections: "true",
    scrapeSkills: "true",
    scrapePublicIdentifier: "true",
    scrapeExperience: "true",
    scrapeEducation: "true",
    startPage: "1",
    maxPages: "5",
    delay: "2000"
  });

  const [phantombusterFilters, setPhantombusterFilters] = useState({
    platform: "linkedin",
    searchUrl: "",
    keywords: "",
    connectionDegree: "1st",
    industry: "Technology",
    numberOfProfiles: "100",
    csvName: "",
    hunterApiKey: "",
    dropcontactApiKey: "",
    sessionCookie: "",
    removeDuplicates: "true",
    saveToCSV: "true",
    actionDelay: "2000"
  });

  const handleToolSelection = (tool: 'apollo' | 'apify' | 'phantombuster') => {
    setSelectedTool(tool);
    setCurrentStep('filters');
    setError(null);
  };

  const handleStartScraping = async () => {
    if (!selectedTool) return;

    setIsLoading(true);
    setError(null);

    try {
      let filters = {};
      if (selectedTool === 'apollo') filters = apolloFilters;
      else if (selectedTool === 'apify') filters = apifyFilters;
      else if (selectedTool === 'phantombuster') filters = phantombusterFilters;

      const response = await fetch(`/api/scraping/${selectedTool}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        setCurrentStep('results');
      } else {
        setError(data.error || 'Scraping failed');
      }
    } catch (err) {
      setError('Connection error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToToolSelection = () => {
    setCurrentStep('tool-selection');
    setSelectedTool(null);
    setResults(null);
    setError(null);
  };

  // Tool Selection Step
  if (currentStep === 'tool-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Dedicated Lead Scraper
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose your preferred lead generation platform and unlock powerful targeting capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Apollo.io */}
            <div 
              onClick={() => handleToolSelection('apollo')}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                  Apollo.io
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                  Professional B2B contact database with advanced filtering by industry, seniority, and company metrics
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    250M+ Contacts
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    Email Verified
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    CRM Ready
                  </span>
                </div>
                <div className="flex justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                    Select Apollo.io
                  </Button>
                </div>
              </div>
            </div>

            {/* Apify */}
            <div 
              onClick={() => handleToolSelection('apify')}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                  Apify
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                  Advanced web scraping platform for extracting leads from LinkedIn, websites, and social platforms
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                    Web Scraping
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                    Multi-Source
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                    Custom Data
                  </span>
                </div>
                <div className="flex justify-center">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                    Select Apify
                  </Button>
                </div>
              </div>
            </div>

            {/* PhantomBuster */}
            <div 
              onClick={() => handleToolSelection('phantombuster')}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                  PhantomBuster
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                  Social media automation for LinkedIn, Twitter, Instagram with email enrichment and CRM integration
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                    Social Media
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                    LinkedIn Pro
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                    Automation
                  </span>
                </div>
                <div className="flex justify-center">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium">
                    Select PhantomBuster
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Real-time data extraction</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Automatic Slack notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>CSV export ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter Configuration Step
  if (currentStep === 'filters' && selectedTool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <Button 
              variant="outline" 
              onClick={resetToToolSelection}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {selectedTool === 'apollo' ? 'Apollo.io Professional' : selectedTool === 'apify' ? 'Apify Web Scraper' : 'PhantomBuster Social'} Configuration
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Configure advanced targeting parameters for high-quality lead generation
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50/90 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            </div>
          )}

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          {/* Apollo.io Filters */}
          {selectedTool === 'apollo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Person Titles</Label>
                  <Input
                    placeholder="e.g., Marketing Manager, CEO, Developer"
                    value={apolloFilters.personTitles}
                    onChange={(e) => setApolloFilters(prev => ({ ...prev, personTitles: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    placeholder="e.g., SaaS, AI, Machine Learning"
                    value={apolloFilters.keywords}
                    onChange={(e) => setApolloFilters(prev => ({ ...prev, keywords: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Person Seniorities</Label>
                  <Select
                    value={apolloFilters.personSeniorities}
                    onChange={(e) => setApolloFilters(prev => ({ ...prev, personSeniorities: e.target.value }))}
                  >
                    <option value="">All Levels</option>
                    <option value="individual_contributor">Individual Contributor</option>
                    <option value="manager">Manager</option>
                    <option value="senior_manager">Senior Manager</option>
                    <option value="director">Director</option>
                    <option value="vp">Vice President</option>
                    <option value="cxo">C-Level Executive</option>
                    <option value="founder">Founder</option>
                    <option value="partner">Partner</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Organization Locations</Label>
                  <Input
                    placeholder="e.g., United States, San Francisco Bay Area"
                    value={apolloFilters.organizationLocations}
                    onChange={(e) => setApolloFilters(prev => ({ ...prev, organizationLocations: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Organization Employee Count</Label>
                  <Select
                    value={apolloFilters.organizationNumEmployeesRanges}
                    onChange={(e) => setApolloFilters(prev => ({ ...prev, organizationNumEmployeesRanges: e.target.value }))}
                  >
                    <option value="">Any Size</option>
                    <option value="1,10">1-10 employees</option>
                    <option value="11,50">11-50 employees</option>
                    <option value="51,200">51-200 employees</option>
                    <option value="201,500">201-500 employees</option>
                    <option value="501,1000">501-1000 employees</option>
                    <option value="1001,5000">1001-5000 employees</option>
                    <option value="5001,10000">5001-10000 employees</option>
                    <option value="10001,">10000+ employees</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select
                    value={apolloFilters.industry}
                    onChange={(e) => setApolloFilters(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="">All Industries</option>
                    <option value="computer_software">Computer Software</option>
                    <option value="information_technology_and_services">Information Technology and Services</option>
                    <option value="internet">Internet</option>
                    <option value="marketing_and_advertising">Marketing and Advertising</option>
                    <option value="financial_services">Financial Services</option>
                    <option value="management_consulting">Management Consulting</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="telecommunications">Telecommunications</option>
                    <option value="biotechnology">Biotechnology</option>
                    <option value="pharmaceuticals">Pharmaceuticals</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Contact Email Status</Label>
                  <Select
                    value={apolloFilters.contactEmailStatus}
                    onChange={(e) => setApolloFilters(prev => ({ ...prev, contactEmailStatus: e.target.value }))}
                  >
                    <option value="">Any Email Status</option>
                    <option value="verified">Verified</option>
                    <option value="guessed">Guessed</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="bounced">Bounced</option>
                    <option value="likely_to_engage">Likely to Engage</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prospecting Stage</Label>
                  <Select
                    value={apolloFilters.stage}
                    onChange={(e) => setApolloFilters(prev => ({ ...prev, stage: e.target.value }))}
                  >
                    <option value="all">All Contacts</option>
                    <option value="not_contacted">Not Contacted</option>
                    <option value="contacted">Contacted</option>
                    <option value="replied">Replied</option>
                    <option value="interested">Interested</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="do_not_contact">Do Not Contact</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Organization IDs (Optional)</Label>
                <Input
                  placeholder="Enter specific company IDs separated by commas"
                  value={apolloFilters.organizationIds}
                  onChange={(e) => setApolloFilters(prev => ({ ...prev, organizationIds: e.target.value }))}
                />
                <p className="text-xs text-gray-500">Leave blank to search all companies matching other criteria</p>
              </div>
            </div>
          )}

          {/* Apify Filters */}
          {selectedTool === 'apify' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Search Terms</Label>
                  <Input
                    placeholder="e.g., software engineer, startup founder"
                    value={apifyFilters.searchTerms}
                    onChange={(e) => setApifyFilters(prev => ({ ...prev, searchTerms: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., New York, London, Remote"
                    value={apifyFilters.location}
                    onChange={(e) => setApifyFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select
                    value={apifyFilters.industry}
                    onChange={(e) => setApifyFilters(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="">All Industries</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Advertising Services">Advertising Services</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Banking">Banking</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Computer Software">Computer Software</option>
                    <option value="Construction">Construction</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Consumer Goods">Consumer Goods</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Education">Education</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Internet">Internet</option>
                    <option value="Legal Services">Legal Services</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Media">Media</option>
                    <option value="Non-profit">Non-profit</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Retail">Retail</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Telecommunications">Telecommunications</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Results Limit</Label>
                  <Select
                    value={apifyFilters.resultsLimit}
                    onChange={(e) => setApifyFilters(prev => ({ ...prev, resultsLimit: e.target.value }))}
                  >
                    <option value="50">50 profiles</option>
                    <option value="100">100 profiles</option>
                    <option value="250">250 profiles</option>
                    <option value="500">500 profiles</option>
                    <option value="1000">1000 profiles</option>
                    <option value="2500">2500 profiles</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Page</Label>
                  <Select
                    value={apifyFilters.startPage}
                    onChange={(e) => setApifyFilters(prev => ({ ...prev, startPage: e.target.value }))}
                  >
                    <option value="1">Page 1</option>
                    <option value="2">Page 2</option>
                    <option value="3">Page 3</option>
                    <option value="4">Page 4</option>
                    <option value="5">Page 5</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Pages to Scrape</Label>
                  <Select
                    value={apifyFilters.maxPages}
                    onChange={(e) => setApifyFilters(prev => ({ ...prev, maxPages: e.target.value }))}
                  >
                    <option value="1">1 page</option>
                    <option value="3">3 pages</option>
                    <option value="5">5 pages</option>
                    <option value="10">10 pages</option>
                    <option value="20">20 pages</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Delay Between Requests (ms)</Label>
                  <Select
                    value={apifyFilters.delay}
                    onChange={(e) => setApifyFilters(prev => ({ ...prev, delay: e.target.value }))}
                  >
                    <option value="1000">1 second</option>
                    <option value="2000">2 seconds</option>
                    <option value="3000">3 seconds</option>
                    <option value="5000">5 seconds</option>
                    <option value="10000">10 seconds</option>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Data Collection Options</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scrapePhotos"
                      checked={apifyFilters.scrapePhotos === "true"}
                      onChange={(e) => setApifyFilters(prev => ({ ...prev, scrapePhotos: e.target.checked ? "true" : "false" }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="scrapePhotos">Profile Photos</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scrapeConnections"
                      checked={apifyFilters.scrapeConnections === "true"}
                      onChange={(e) => setApifyFilters(prev => ({ ...prev, scrapeConnections: e.target.checked ? "true" : "false" }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="scrapeConnections">Connections</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scrapeSkills"
                      checked={apifyFilters.scrapeSkills === "true"}
                      onChange={(e) => setApifyFilters(prev => ({ ...prev, scrapeSkills: e.target.checked ? "true" : "false" }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="scrapeSkills">Skills</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scrapeExperience"
                      checked={apifyFilters.scrapeExperience === "true"}
                      onChange={(e) => setApifyFilters(prev => ({ ...prev, scrapeExperience: e.target.checked ? "true" : "false" }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="scrapeExperience">Work Experience</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scrapeEducation"
                      checked={apifyFilters.scrapeEducation === "true"}
                      onChange={(e) => setApifyFilters(prev => ({ ...prev, scrapeEducation: e.target.checked ? "true" : "false" }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="scrapeEducation">Education</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scrapePublicIdentifier"
                      checked={apifyFilters.scrapePublicIdentifier === "true"}
                      onChange={(e) => setApifyFilters(prev => ({ ...prev, scrapePublicIdentifier: e.target.checked ? "true" : "false" }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="scrapePublicIdentifier">Public Identifier</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PhantomBuster Filters */}
          {selectedTool === 'phantombuster' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select
                    value={phantombusterFilters.platform}
                    onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, platform: e.target.value }))}
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="linkedin_sales_navigator">LinkedIn Sales Navigator</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="google_maps">Google Maps</option>
                    <option value="yellow_pages">Yellow Pages</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    placeholder="e.g., CEO startup, marketing director"
                    value={phantombusterFilters.keywords}
                    onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, keywords: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Number of Profiles</Label>
                  <Select
                    value={phantombusterFilters.numberOfProfiles}
                    onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, numberOfProfiles: e.target.value }))}
                  >
                    <option value="50">50 profiles</option>
                    <option value="100">100 profiles</option>
                    <option value="250">250 profiles</option>
                    <option value="500">500 profiles</option>
                    <option value="1000">1000 profiles</option>
                    <option value="2500">2500 profiles</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Connection Degree (LinkedIn)</Label>
                  <Select
                    value={phantombusterFilters.connectionDegree}
                    onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, connectionDegree: e.target.value }))}
                  >
                    <option value="1st">1st connections</option>
                    <option value="2nd">2nd connections</option>
                    <option value="3rd">3rd+ connections</option>
                    <option value="all">All connection levels</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Industry Filter</Label>
                  <Select
                    value={phantombusterFilters.industry}
                    onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="">All Industries</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Advertising">Advertising</option>
                    <option value="Aerospace">Aerospace</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Apparel & Fashion">Apparel & Fashion</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Banking">Banking</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Computer Software">Computer Software</option>
                    <option value="Construction">Construction</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Education">Education</option>
                    <option value="Energy">Energy</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Government">Government</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Internet">Internet</option>
                    <option value="Legal">Legal</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Media">Media</option>
                    <option value="Non-profit">Non-profit</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Retail">Retail</option>
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="Transportation">Transportation</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Action Delay (ms)</Label>
                  <Select
                    value={phantombusterFilters.actionDelay}
                    onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, actionDelay: e.target.value }))}
                  >
                    <option value="1000">1 second</option>
                    <option value="2000">2 seconds</option>
                    <option value="3000">3 seconds</option>
                    <option value="5000">5 seconds</option>
                    <option value="10000">10 seconds</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Search URL (Optional)</Label>
                  <Input
                    placeholder="https://www.linkedin.com/search/results/people/"
                    value={phantombusterFilters.searchUrl}
                    onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, searchUrl: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500">Leave blank to use keyword-based search instead</p>
                </div>

                <div className="space-y-2">
                  <Label>CSV Export Name (Optional)</Label>
                  <Input
                    placeholder="my_leads_export"
                    value={phantombusterFilters.csvName}
                    onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, csvName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Email Enrichment (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Hunter.io API Key</Label>
                    <Input
                      type="password"
                      placeholder="Enter Hunter.io API key for email finding"
                      value={phantombusterFilters.hunterApiKey}
                      onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, hunterApiKey: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dropcontact API Key</Label>
                    <Input
                      type="password"
                      placeholder="Enter Dropcontact API key for email verification"
                      value={phantombusterFilters.dropcontactApiKey}
                      onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, dropcontactApiKey: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Advanced Options</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="removeDuplicates"
                      checked={phantombusterFilters.removeDuplicates === "true"}
                      onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, removeDuplicates: e.target.checked ? "true" : "false" }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="removeDuplicates">Remove Duplicates</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="saveToCSV"
                      checked={phantombusterFilters.saveToCSV === "true"}
                      onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, saveToCSV: e.target.checked ? "true" : "false" }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="saveToCSV">Save to CSV</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={handleStartScraping} disabled={isLoading} className="min-w-32">
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Scraping
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Results Step
  if (currentStep === 'results' && results) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={resetToToolSelection}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Search
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Scraping Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Found {results.count} leads using {selectedTool}
            </p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-200">
              Successfully scraped {results.count} leads and sent notification to Slack
            </span>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lead Preview
            </h3>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Company</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Title</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Location</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Score</th>
                </tr>
              </thead>
              <tbody>
                {results.leads.slice(0, 10).map((lead, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 text-sm text-gray-900 dark:text-white">{lead.fullName}</td>
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{lead.email}</td>
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{lead.company}</td>
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{lead.title}</td>
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{lead.location}</td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {lead.score || Math.floor(Math.random() * 100)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {results.leads.length > 10 && (
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Showing 10 of {results.count} leads. Export to see all results.
            </div>
          )}
        </Card>
      </div>
    );
  }

  return null;
}