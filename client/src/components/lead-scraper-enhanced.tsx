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

// Enhanced UI Components with Command Center Styling
const Card = ({ children, className = "", onClick }: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) => (
  <div className={`rounded-2xl border bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-gray-200/50 dark:border-gray-700/50 ${className}`} onClick={onClick}>
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
  const baseClass = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variantClass = variant === "outline" 
    ? "border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700" 
    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg";
  
  return (
    <button 
      className={`${baseClass} ${variantClass} h-11 py-2 px-6 ${className}`}
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
    className={`flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
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
    className={`flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
  >
    {children}
  </select>
);

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </label>
);

export default function EnhancedLeadScraper() {
  const [currentStep, setCurrentStep] = useState<'tool-selection' | 'filters' | 'results'>('tool-selection');
  const [selectedTool, setSelectedTool] = useState<'apollo' | 'apify' | 'phantombuster' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Enhanced Filter States
  const [apolloFilters, setApolloFilters] = useState({
    personTitles: "",
    industry: "",
    location: "",
    companySize: "",
    seniorityLevel: "",
    emailStatus: "verified",
    department: "",
    keywords: "",
    revenueRange: "",
    fundingStage: "",
    lastUpdated: "30_days"
  });

  const [apifyFilters, setApifyFilters] = useState({
    searchTerms: "",
    location: "",
    industry: "",
    resultsLimit: "100",
    minReviews: "5",
    maxListings: "1000",
    ratingThreshold: "4",
    excludeKeywords: "",
    requestDelay: "2000"
  });

  const [phantombusterFilters, setPhantombusterFilters] = useState({
    platform: "linkedin",
    keywords: "",
    connectionDegree: "2nd",
    seniorityLevel: "",
    department: "",
    industry: "",
    location: "",
    companySize: "",
    dailyLimit: "100",
    messageTemplate: ""
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
      const filters = selectedTool === 'apollo' ? apolloFilters 
                   : selectedTool === 'apify' ? apifyFilters 
                   : phantombusterFilters;
      
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
        setError(data.message || 'Scraping failed');
      }
    } catch (err) {
      setError('Network error occurred');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Lead Generation Platform
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose your preferred scraping platform and configure advanced targeting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Apollo.io */}
            <Card 
              onClick={() => handleToolSelection('apollo')}
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden p-8"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                Apollo.io
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                Professional B2B database with 250M+ verified contacts and advanced filtering
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  Verified Emails
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  Job Titles
                </span>
              </div>
            </Card>

            {/* Apify */}
            <Card 
              onClick={() => handleToolSelection('apify')}
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden p-8"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                Apify
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                Web scraping platform for LinkedIn profiles and business listings
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  Web Scraping
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  Custom Data
                </span>
              </div>
            </Card>

            {/* PhantomBuster */}
            <Card 
              onClick={() => handleToolSelection('phantombuster')}
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden p-8"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                PhantomBuster
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                Social media automation for LinkedIn, Twitter with connection management
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                  Social Media
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                  Automation
                </span>
              </div>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Real-time extraction</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Slack notifications</span>
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <Button 
              variant="outline" 
              onClick={resetToToolSelection}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {selectedTool === 'apollo' ? 'Apollo.io Configuration' : 
                 selectedTool === 'apify' ? 'Apify Configuration' : 
                 'PhantomBuster Configuration'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Configure targeting parameters for optimal results
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

          <Card className="p-8">
            {/* Apollo.io Filters */}
            {selectedTool === 'apollo' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                  <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">Apollo.io Professional Database</h3>
                  <p className="text-blue-700 dark:text-blue-300">Target verified B2B contacts with advanced professional filters</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Contact Targeting</h4>
                    
                    <div className="space-y-2">
                      <Label>Job Titles</Label>
                      <Select
                        value={apolloFilters.personTitles}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, personTitles: e.target.value }))}
                      >
                        <option value="">Select Job Title</option>
                        <option value="ceo">Chief Executive Officer</option>
                        <option value="cto">Chief Technology Officer</option>
                        <option value="cfo">Chief Financial Officer</option>
                        <option value="cmo">Chief Marketing Officer</option>
                        <option value="founder">Founder</option>
                        <option value="president">President</option>
                        <option value="vp_sales">VP of Sales</option>
                        <option value="vp_marketing">VP of Marketing</option>
                        <option value="director_sales">Director of Sales</option>
                        <option value="director_marketing">Director of Marketing</option>
                        <option value="sales_manager">Sales Manager</option>
                        <option value="marketing_manager">Marketing Manager</option>
                        <option value="account_executive">Account Executive</option>
                        <option value="business_development">Business Development</option>
                        <option value="product_manager">Product Manager</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Seniority Level</Label>
                      <Select
                        value={apolloFilters.seniorityLevel}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, seniorityLevel: e.target.value }))}
                      >
                        <option value="">All Seniority Levels</option>
                        <option value="owner">Owner</option>
                        <option value="founder">Founder</option>
                        <option value="cxo">C-Level Executive</option>
                        <option value="partner">Partner</option>
                        <option value="vp">Vice President</option>
                        <option value="director">Director</option>
                        <option value="senior_manager">Senior Manager</option>
                        <option value="manager">Manager</option>
                        <option value="individual_contributor">Individual Contributor</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Email Verification Status</Label>
                      <Select
                        value={apolloFilters.emailStatus}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, emailStatus: e.target.value }))}
                      >
                        <option value="verified">Verified (Best Deliverability)</option>
                        <option value="likely_to_engage">Likely to Engage</option>
                        <option value="high_quality">High Quality</option>
                        <option value="guessed">Guessed Format</option>
                        <option value="">All Email Types</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select
                        value={apolloFilters.department}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, department: e.target.value }))}
                      >
                        <option value="">All Departments</option>
                        <option value="sales">Sales</option>
                        <option value="marketing">Marketing</option>
                        <option value="operations">Operations</option>
                        <option value="finance">Finance</option>
                        <option value="hr">Human Resources</option>
                        <option value="it">Information Technology</option>
                        <option value="product">Product</option>
                        <option value="engineering">Engineering</option>
                        <option value="business_development">Business Development</option>
                        <option value="customer_success">Customer Success</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Company Targeting</h4>
                    
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select
                        value={apolloFilters.industry}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, industry: e.target.value }))}
                      >
                        <option value="">Select Industry</option>
                        <option value="computer_software">Computer Software</option>
                        <option value="information_technology">Information Technology</option>
                        <option value="saas">Software as a Service (SaaS)</option>
                        <option value="financial_services">Financial Services</option>
                        <option value="marketing_advertising">Marketing & Advertising</option>
                        <option value="consulting">Management Consulting</option>
                        <option value="healthcare">Healthcare & Medical</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="ecommerce">E-commerce & Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="education">Education & Training</option>
                        <option value="telecommunications">Telecommunications</option>
                        <option value="automotive">Automotive</option>
                        <option value="media">Media & Entertainment</option>
                        <option value="biotechnology">Biotechnology</option>
                        <option value="aerospace">Aerospace & Defense</option>
                        <option value="energy">Energy & Utilities</option>
                        <option value="banking">Banking</option>
                        <option value="insurance">Insurance</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Company Size</Label>
                      <Select
                        value={apolloFilters.companySize}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, companySize: e.target.value }))}
                      >
                        <option value="">All Company Sizes</option>
                        <option value="1,10">1-10 employees (Startup)</option>
                        <option value="11,50">11-50 employees (Small Business)</option>
                        <option value="51,200">51-200 employees (Mid-Market)</option>
                        <option value="201,500">201-500 employees (Enterprise)</option>
                        <option value="501,1000">501-1000 employees (Large Enterprise)</option>
                        <option value="1001,5000">1001-5000 employees</option>
                        <option value="5001,10000">5001-10000 employees</option>
                        <option value="10001,">10000+ employees (Fortune 500)</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select
                        value={apolloFilters.location}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, location: e.target.value }))}
                      >
                        <option value="">Select Location</option>
                        <option value="united_states">United States</option>
                        <option value="california">California</option>
                        <option value="new_york">New York</option>
                        <option value="texas">Texas</option>
                        <option value="florida">Florida</option>
                        <option value="san_francisco">San Francisco Bay Area</option>
                        <option value="new_york_city">New York City</option>
                        <option value="los_angeles">Los Angeles</option>
                        <option value="chicago">Chicago</option>
                        <option value="boston">Boston</option>
                        <option value="seattle">Seattle</option>
                        <option value="austin">Austin</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Revenue Range</Label>
                      <Select
                        value={apolloFilters.revenueRange}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, revenueRange: e.target.value }))}
                      >
                        <option value="">All Revenue Ranges</option>
                        <option value="0,1M">$0 - $1M</option>
                        <option value="1M,10M">$1M - $10M</option>
                        <option value="10M,100M">$10M - $100M</option>
                        <option value="100M,1B">$100M - $1B</option>
                        <option value="1B,">$1B+</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <Input
                        placeholder="e.g., SaaS, AI, Machine Learning, B2B"
                        value={apolloFilters.keywords}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, keywords: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data Freshness</Label>
                      <Select
                        value={apolloFilters.lastUpdated}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, lastUpdated: e.target.value }))}
                      >
                        <option value="7_days">Last 7 days (Freshest)</option>
                        <option value="30_days">Last 30 days (Recommended)</option>
                        <option value="90_days">Last 90 days</option>
                        <option value="180_days">Last 6 months</option>
                        <option value="">All data</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Apify Filters */}
            {selectedTool === 'apify' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                  <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">Apify Web Scraping Platform</h3>
                  <p className="text-green-700 dark:text-green-300">Extract business listings and profiles with advanced filtering</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Location Filters</h4>
                    
                    <div className="space-y-2">
                      <Label>Search Terms</Label>
                      <Input
                        placeholder="e.g., restaurants, marketing agencies"
                        value={apifyFilters.searchTerms}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, searchTerms: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select
                        value={apifyFilters.location}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, location: e.target.value }))}
                      >
                        <option value="">Select Location</option>
                        <option value="new_york_ny">New York, NY</option>
                        <option value="los_angeles_ca">Los Angeles, CA</option>
                        <option value="chicago_il">Chicago, IL</option>
                        <option value="houston_tx">Houston, TX</option>
                        <option value="phoenix_az">Phoenix, AZ</option>
                        <option value="philadelphia_pa">Philadelphia, PA</option>
                        <option value="san_antonio_tx">San Antonio, TX</option>
                        <option value="san_diego_ca">San Diego, CA</option>
                        <option value="dallas_tx">Dallas, TX</option>
                        <option value="san_jose_ca">San Jose, CA</option>
                        <option value="austin_tx">Austin, TX</option>
                        <option value="jacksonville_fl">Jacksonville, FL</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Industry Category</Label>
                      <Select
                        value={apifyFilters.industry}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, industry: e.target.value }))}
                      >
                        <option value="">All Categories</option>
                        <option value="restaurants">Restaurants & Food</option>
                        <option value="retail">Retail & Shopping</option>
                        <option value="healthcare">Healthcare & Medical</option>
                        <option value="professional_services">Professional Services</option>
                        <option value="automotive">Automotive</option>
                        <option value="beauty_wellness">Beauty & Wellness</option>
                        <option value="home_garden">Home & Garden</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="education">Education</option>
                        <option value="real_estate">Real Estate</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Exclude Keywords</Label>
                      <Input
                        placeholder="e.g., closed, temporary, spam"
                        value={apifyFilters.excludeKeywords}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, excludeKeywords: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Quality Filters</h4>
                    
                    <div className="space-y-2">
                      <Label>Minimum Reviews Required</Label>
                      <Select
                        value={apifyFilters.minReviews}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, minReviews: e.target.value }))}
                      >
                        <option value="0">No minimum</option>
                        <option value="5">5+ reviews</option>
                        <option value="10">10+ reviews</option>
                        <option value="25">25+ reviews</option>
                        <option value="50">50+ reviews</option>
                        <option value="100">100+ reviews</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Rating</Label>
                      <Select
                        value={apifyFilters.ratingThreshold}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, ratingThreshold: e.target.value }))}
                      >
                        <option value="0">Any rating</option>
                        <option value="3">3+ stars</option>
                        <option value="3.5">3.5+ stars</option>
                        <option value="4">4+ stars</option>
                        <option value="4.5">4.5+ stars</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Listings to Pull</Label>
                      <Select
                        value={apifyFilters.maxListings}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, maxListings: e.target.value }))}
                      >
                        <option value="100">100 listings</option>
                        <option value="250">250 listings</option>
                        <option value="500">500 listings</option>
                        <option value="1000">1000 listings</option>
                        <option value="2500">2500 listings</option>
                        <option value="5000">5000 listings</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Request Delay (seconds)</Label>
                      <Select
                        value={apifyFilters.requestDelay}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, requestDelay: e.target.value }))}
                      >
                        <option value="1000">1 second</option>
                        <option value="2000">2 seconds (Recommended)</option>
                        <option value="3000">3 seconds</option>
                        <option value="5000">5 seconds</option>
                        <option value="10000">10 seconds</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PhantomBuster Filters */}
            {selectedTool === 'phantombuster' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                  <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2">PhantomBuster Social Automation</h3>
                  <p className="text-purple-700 dark:text-purple-300">Automate LinkedIn outreach and connection building with smart targeting</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Contact Filters</h4>
                    
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
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <Input
                        placeholder="e.g., startup founder, marketing director"
                        value={phantombusterFilters.keywords}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, keywords: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Connection Degree (LinkedIn)</Label>
                      <Select
                        value={phantombusterFilters.connectionDegree}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, connectionDegree: e.target.value }))}
                      >
                        <option value="1st">1st connections</option>
                        <option value="2nd">2nd connections (Recommended)</option>
                        <option value="3rd">3rd+ connections</option>
                        <option value="all">All connection levels</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Seniority Level</Label>
                      <Select
                        value={phantombusterFilters.seniorityLevel}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, seniorityLevel: e.target.value }))}
                      >
                        <option value="">All Seniority Levels</option>
                        <option value="owner">Owner</option>
                        <option value="founder">Founder</option>
                        <option value="cxo">C-Level Executive</option>
                        <option value="vp">Vice President</option>
                        <option value="director">Director</option>
                        <option value="manager">Manager</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Department/Function</Label>
                      <Select
                        value={phantombusterFilters.department}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, department: e.target.value }))}
                      >
                        <option value="">All Departments</option>
                        <option value="sales">Sales</option>
                        <option value="marketing">Marketing</option>
                        <option value="operations">Operations</option>
                        <option value="finance">Finance</option>
                        <option value="hr">Human Resources</option>
                        <option value="it">Information Technology</option>
                        <option value="product">Product</option>
                        <option value="engineering">Engineering</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Execution Settings</h4>
                    
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select
                        value={phantombusterFilters.industry}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, industry: e.target.value }))}
                      >
                        <option value="">All Industries</option>
                        <option value="technology">Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="consulting">Consulting</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                        <option value="startups">Startups</option>
                        <option value="saas">SaaS</option>
                        <option value="ecommerce">E-commerce</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select
                        value={phantombusterFilters.location}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, location: e.target.value }))}
                      >
                        <option value="">All Locations</option>
                        <option value="san_francisco">San Francisco Bay Area</option>
                        <option value="new_york">New York</option>
                        <option value="los_angeles">Los Angeles</option>
                        <option value="chicago">Chicago</option>
                        <option value="boston">Boston</option>
                        <option value="seattle">Seattle</option>
                        <option value="austin">Austin</option>
                        <option value="denver">Denver</option>
                        <option value="atlanta">Atlanta</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Company Size</Label>
                      <Select
                        value={phantombusterFilters.companySize}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, companySize: e.target.value }))}
                      >
                        <option value="">All Company Sizes</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Daily Connection Limit</Label>
                      <Select
                        value={phantombusterFilters.dailyLimit}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, dailyLimit: e.target.value }))}
                      >
                        <option value="20">20 per day (Conservative)</option>
                        <option value="50">50 per day</option>
                        <option value="100">100 per day (Recommended)</option>
                        <option value="150">150 per day</option>
                        <option value="200">200 per day (Aggressive)</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Connection Message Template</Label>
                      <Input
                        placeholder="Hi [firstName], I'd love to connect..."
                        value={phantombusterFilters.messageTemplate}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, messageTemplate: e.target.value }))}
                      />
                      <p className="text-xs text-gray-500">Use [firstName] and [company] for personalization</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <Button onClick={handleStartScraping} disabled={isLoading}>
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
      </div>
    );
  }

  // Results Step
  if (currentStep === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <Button 
              variant="outline" 
              onClick={resetToToolSelection}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Search
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Scraping Results
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Found {results.count} leads using {selectedTool}
              </p>
            </div>
          </div>

          <div className="bg-green-50/90 dark:bg-green-900/20 backdrop-blur-sm border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
            <div className="flex">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-200">
                Successfully scraped {results.count} leads and sent notification to Slack
              </span>
            </div>
          </div>

          <Card className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lead Preview
              </h3>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            
            <div className="grid gap-4">
              {results.leads.slice(0, 5).map((lead, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/50 dark:bg-gray-800/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{lead.fullName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{lead.title} at {lead.company}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {lead.email}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {lead.location}
                        </span>
                      </div>
                    </div>
                    {lead.score && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{lead.score}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {results.leads.length > 5 && (
              <div className="text-center mt-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Showing 5 of {results.count} leads. Export to see all results.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return null;
}