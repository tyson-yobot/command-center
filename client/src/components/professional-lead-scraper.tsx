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
  AlertCircle,
  Shield,
  Zap,
  TrendingUp,
  Save,
  Search,
  Settings,
  HelpCircle
} from "lucide-react";
import ApolloScraperPanel from "./apollo-scraper-panel";
import ApifyScraperPanel from "./apify-scraper-panel";
import PhantomBusterScraperPanel from "./phantombuster-scraper-panel";
import { useToast } from "@/hooks/use-toast";

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

// Professional UI Components
const Card = ({ children, className = "", onClick }: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) => (
  <div 
    className={`rounded-3xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl ${className}`} 
    onClick={onClick}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, disabled = false, className = "", variant = "default", size = "default" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: string;
  size?: string;
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95";
  
  const sizeClass = size === "sm" ? "h-9 px-4 text-sm" : size === "lg" ? "h-14 px-10 text-lg" : "h-12 px-8 text-sm";
  
  const variantClass = variant === "outline" 
    ? "border-2 border-slate-600/50 bg-gradient-to-r from-slate-700/80 to-slate-800/80 backdrop-blur-sm hover:from-slate-600/80 hover:to-slate-700/80 text-white shadow-lg hover:shadow-xl" 
    : variant === "secondary"
    ? "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-lg"
    : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white border-0 shadow-2xl hover:shadow-blue-500/25";
  
  return (
    <button 
      className={`${baseClass} ${sizeClass} ${variantClass} ${className}`}
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
    className={`flex h-12 w-full rounded-xl border-2 border-slate-600/50 bg-gradient-to-r from-slate-700/80 to-slate-800/80 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ${className}`}
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
    className={`flex h-12 w-full rounded-xl border-2 border-slate-600/50 bg-gradient-to-r from-slate-700/80 to-slate-800/80 backdrop-blur-sm px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ${className}`}
  >
    {children}
  </select>
);

const Label = ({ children, className = "", tooltip }: { 
  children: React.ReactNode; 
  className?: string;
  tooltip?: string;
}) => (
  <div className="flex items-center gap-2">
    <label className={`text-sm font-semibold text-slate-200 ${className}`}>
      {children}
    </label>
    {tooltip && (
      <div className="relative group">
        <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {tooltip}
        </div>
      </div>
    )}
  </div>
);

const Checkbox = ({ checked, onChange, label, className = "" }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}) => (
  <div className={`flex items-center space-x-3 ${className}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
    />
    <span className="text-sm text-slate-200">{label}</span>
  </div>
);

const SectionHeader = ({ title, icon: Icon, color = "blue" }: {
  title: string;
  icon: React.ComponentType<any>;
  color?: string;
}) => {
  const colorClasses = {
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-200",
    green: "from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-200",
    purple: "from-purple-500/20 to-violet-500/20 border-purple-400/30 text-purple-200"
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} backdrop-blur-sm p-6 rounded-2xl border mb-8`}>
      <div className="flex items-center">
        <Icon className="w-6 h-6 mr-3" />
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
    </div>
  );
};

export default function ProfessionalLeadScraper() {
  const [currentStep, setCurrentStep] = useState<'tool-selection' | 'filters' | 'results'>('tool-selection');
  const [selectedTool, setSelectedTool] = useState<'apollo' | 'apify' | 'phantombuster' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Apollo.io Filter States
  const [apolloFilters, setApolloFilters] = useState({
    // Contact Filters
    jobTitles: [] as string[],
    seniorityLevel: "",
    department: "",
    location: [] as string[],
    emailVerified: true,
    phoneAvailable: false,
    
    // Company Filters  
    industry: "",
    companySize: "",
    fundingStage: "",
    revenueRange: "",
    technologies: [] as string[],
    excludeDomains: "",
    
    // Scraping Settings
    dataFreshness: "30_days",
    recordLimit: "1000"
  });

  // Apify Filter States
  const [apifyFilters, setApifyFilters] = useState({
    // Location Filters
    searchTerms: "",
    location: [] as string[],
    radius: "25",
    industryCategory: "",
    excludeKeywords: [] as string[],
    
    // Quality Filters
    minReviews: "5",
    minRating: "4",
    maxListings: "1000",
    requestDelay: "2",
    extractContactInfo: true
  });

  // PhantomBuster Filter States
  const [phantombusterFilters, setPhantombusterFilters] = useState({
    // Contact Filters
    platform: "linkedin",
    keywords: "",
    connectionDegree: "2nd",
    seniorityLevel: "",
    department: "",
    
    // Company Filters
    industry: "",
    companySize: "",
    location: [] as string[],
    
    // Execution Settings
    apiOrPhantom: "api",
    dailyLimit: "100",
    autoConnect: false,
    messageTemplate: "",
    retryAttempts: "3"
  });

  const { toast } = useToast();

  const handleToolSelection = (tool: 'apollo' | 'apify' | 'phantombuster') => {
    setSelectedTool(tool);
    setCurrentStep('filters');
    setError(null);
  };

  const handleApolloLaunch = async (filters: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scraping/apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        setCurrentStep('results');
        toast({
          title: "Apollo Scraper Launched",
          description: `✅ ${data.count} leads scraped. View in Airtable`,
        });
      } else {
        setError(data.message || 'Apollo scraping failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApifyLaunch = async (filters: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scraping/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        setCurrentStep('results');
        toast({
          title: "Apify Scraper Launched",
          description: `✅ ${data.count} listings scraped. View in Airtable`,
        });
      } else {
        setError(data.message || 'Apify scraping failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhantomBusterLaunch = async (filters: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scraping/phantombuster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        setCurrentStep('results');
        toast({
          title: "PhantomBuster Scraper Launched",
          description: `✅ ${data.count} profiles scraped. View in Airtable`,
        });
      } else {
        setError(data.message || 'PhantomBuster scraping failed');
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

  const updateFiltersCount = () => {
    if (selectedTool === 'apollo') {
      const count = Object.entries(apolloFilters).filter(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'boolean') return value;
        return value !== "" && value !== "1000" && value !== "30_days";
      }).length;
      setFiltersApplied(count);
    } else if (selectedTool === 'apify') {
      const count = Object.entries(apifyFilters).filter(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'boolean') return value;
        return value !== "" && value !== "25" && value !== "5" && value !== "4" && value !== "1000" && value !== "2";
      }).length;
      setFiltersApplied(count);
    } else if (selectedTool === 'phantombuster') {
      const count = Object.entries(phantombusterFilters).filter(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'boolean') return value;
        return value !== "" && value !== "linkedin" && value !== "2nd" && value !== "api" && value !== "100" && value !== "3";
      }).length;
      setFiltersApplied(count);
    }
  };

  React.useEffect(() => {
    updateFiltersCount();
  }, [apolloFilters, apifyFilters, phantombusterFilters, selectedTool]);

  // Tool Selection Step
  if (currentStep === 'tool-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-6 rounded-full shadow-2xl animate-pulse">
                <Target className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6">
              YoBot Lead Intelligence Platform
            </h1>
            <p className="text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence
            </p>
          </div>

          {/* Platform Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            {/* Apollo.io */}
            <Card 
              onClick={() => handleToolSelection('apollo')}
              className="group cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 overflow-hidden p-10 transform hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <div className="flex justify-center mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 text-center">
                    Apollo.io
                  </h3>
                  <p className="text-slate-300 text-center mb-8 leading-relaxed text-lg">
                    Professional B2B intelligence with 250M+ verified contacts and advanced enterprise filtering
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300 rounded-full text-sm font-semibold backdrop-blur-sm">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Verified Emails
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300 rounded-full text-sm font-semibold backdrop-blur-sm">
                      <TrendingUp className="w-4 h-4 inline mr-2" />
                      Executive Targeting
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Apify */}
            <Card 
              onClick={() => handleToolSelection('apify')}
              className="group cursor-pointer hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 overflow-hidden p-10 transform hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <div className="flex justify-center mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                      <Globe className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 text-center">
                    Apify
                  </h3>
                  <p className="text-slate-300 text-center mb-8 leading-relaxed text-lg">
                    Advanced web intelligence platform for LinkedIn profiles and comprehensive business listings
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300 rounded-full text-sm font-semibold backdrop-blur-sm">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Web Intelligence
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300 rounded-full text-sm font-semibold backdrop-blur-sm">
                      <Building className="w-4 h-4 inline mr-2" />
                      Business Listings
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* PhantomBuster */}
            <Card 
              onClick={() => handleToolSelection('phantombuster')}
              className="group cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden p-10 transform hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <div className="flex justify-center mb-8">
                    <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-6 rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 text-center">
                    PhantomBuster
                  </h3>
                  <p className="text-slate-300 text-center mb-8 leading-relaxed text-lg">
                    Premium social media automation for LinkedIn, Twitter with intelligent connection management
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-400/30 text-purple-300 rounded-full text-sm font-semibold backdrop-blur-sm">
                      <Users className="w-4 h-4 inline mr-2" />
                      Social Automation
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-400/30 text-purple-300 rounded-full text-sm font-semibold backdrop-blur-sm">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Safe Outreach
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Enterprise Features Bar */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-3xl border border-slate-600/30 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Real-time Processing</h4>
                <p className="text-slate-400">Instant lead extraction with live notifications</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-2xl mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Enterprise Security</h4>
                <p className="text-slate-400">Bank-grade encryption and compliance</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-4 rounded-2xl mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h4>
                <p className="text-slate-400">Comprehensive reporting and insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter Configuration Step
  if (currentStep === 'filters' && selectedTool) {
    const toolConfig = {
      apollo: { name: 'Apollo.io Professional Configuration', color: 'blue' as const },
      apify: { name: 'Apify Advanced Configuration', color: 'green' as const },
      phantombuster: { name: 'PhantomBuster Professional Setup', color: 'purple' as const }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pb-32">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-xl border-b border-slate-700/50 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                onClick={resetToToolSelection}
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Platforms
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  {toolConfig[selectedTool].name}
                </h1>
                <p className="text-slate-300">Configure precision targeting parameters</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-300">{filtersApplied} filters applied</span>
              <Button variant="secondary" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Preset
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-8">
          {error && (
            <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 backdrop-blur-xl border-2 border-red-400/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-400 mr-3" />
                <span className="text-red-200 text-lg font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Dynamic Scraper Panel Integration */}
          {selectedTool === 'apollo' && (
            <ApolloScraperPanel 
              onLaunch={handleApolloLaunch}
              isLoading={isLoading}
            />
          )}
          
          {selectedTool === 'apify' && (
            <ApifyScraperPanel 
              onLaunch={handleApifyLaunch}
              isLoading={isLoading}
            />
          )}
          
          {selectedTool === 'phantombuster' && (
            <PhantomBusterScraperPanel 
              onLaunch={handlePhantomBusterLaunch}
              isLoading={isLoading}
            />
          )}

        </div>
      </div>
    );
  }

  // Results Step
  if (currentStep === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                onClick={resetToToolSelection}
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Search
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Lead Generation Results
                </h1>
                <p className="text-slate-300">{results.count} leads found</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="w-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>

          {/* Results Grid */}
          <div className="grid gap-4">
            {results.leads.map((lead, index) => (
              <Card key={index} className="p-6 bg-slate-800/50 border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="font-semibold text-white">{lead.fullName}</div>
                    <div className="text-slate-400">{lead.title}</div>
                  </div>
                  <div>
                    <div className="text-slate-300">{lead.company}</div>
                    <div className="text-slate-400">{lead.location}</div>
                  </div>
                  <div>
                    <div className="text-slate-300 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {lead.email}
                    </div>
                    <div className="text-slate-300 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {lead.phone}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
                          <option value="Chief Technology Officer">Chief Technology Officer</option>
                          <option value="Chief Financial Officer">Chief Financial Officer</option>
                          <option value="Chief Marketing Officer">Chief Marketing Officer</option>
                          <option value="Chief Operating Officer">Chief Operating Officer</option>
                          <option value="Founder">Founder</option>
                          <option value="President">President</option>
                          <option value="Vice President of Sales">Vice President of Sales</option>
                          <option value="Vice President of Marketing">Vice President of Marketing</option>
                          <option value="Director of Sales">Director of Sales</option>
                          <option value="Director of Marketing">Director of Marketing</option>
                          <option value="Sales Manager">Sales Manager</option>
                          <option value="Marketing Manager">Marketing Manager</option>
                          <option value="Account Executive">Account Executive</option>
                          <option value="Business Development Manager">Business Development Manager</option>
                        </Select>
                        {apolloFilters.jobTitles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {apolloFilters.jobTitles.map((title, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-sm flex items-center">
                                {title}
                                <button
                                  onClick={() => setApolloFilters(prev => ({
                                    ...prev,
                                    jobTitles: prev.jobTitles.filter((_, i) => i !== index)
                                  }))}
                                  className="ml-2 text-blue-400 hover:text-blue-300"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label tooltip="Filter by executive seniority level">Seniority Level</Label>
                        <Select
                          value={apolloFilters.seniorityLevel}
                          onChange={(e) => setApolloFilters(prev => ({ ...prev, seniorityLevel: e.target.value }))}
                        >
                          <option value="">All Seniority Levels</option>
                          <option value="owner">Business Owner</option>
                          <option value="founder">Founder/Co-Founder</option>
                          <option value="cxo">C-Level Executive</option>
                          <option value="partner">Partner/Principal</option>
                          <option value="vp">Vice President</option>
                          <option value="director">Director</option>
                          <option value="senior_manager">Senior Manager</option>
                          <option value="manager">Manager</option>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label tooltip="Target specific department functions">Department</Label>
                        <Select
                          value={apolloFilters.department}
                          onChange={(e) => setApolloFilters(prev => ({ ...prev, department: e.target.value }))}
                        >
                          <option value="">All Departments</option>
                          <option value="sales">Sales & Revenue</option>
                          <option value="marketing">Marketing & Growth</option>
                          <option value="operations">Operations & Strategy</option>
                          <option value="finance">Finance & Accounting</option>
                          <option value="hr">Human Resources</option>
                          <option value="it">Information Technology</option>
                          <option value="product">Product & Innovation</option>
                          <option value="engineering">Engineering & Development</option>
                          <option value="business_development">Business Development</option>
                          <option value="customer_success">Customer Success</option>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label tooltip="Add multiple locations to target">Location (Multi-select)</Label>
                        <Select
                          value=""
                          onChange={(e) => {
                            if (e.target.value && !apolloFilters.location.includes(e.target.value)) {
                              setApolloFilters(prev => ({
                                ...prev,
                                location: [...prev.location, e.target.value]
                              }));
                            }
                          }}
                        >
                          <option value="">Add Location</option>
                          <option value="San Francisco Bay Area">San Francisco Bay Area</option>
                          <option value="New York Metropolitan">New York Metropolitan</option>
                          <option value="Greater Los Angeles">Greater Los Angeles</option>
                          <option value="Chicago Metropolitan">Chicago Metropolitan</option>
                          <option value="Boston-Cambridge">Boston-Cambridge</option>
                          <option value="Seattle Metropolitan">Seattle Metropolitan</option>
                          <option value="Austin-Round Rock">Austin-Round Rock</option>
                          <option value="Denver-Boulder">Denver-Boulder</option>
                          <option value="Atlanta Metropolitan">Atlanta Metropolitan</option>
                        </Select>
                        {apolloFilters.location.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {apolloFilters.location.map((loc, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-sm flex items-center">
                                {loc}
                                <button
                                  onClick={() => setApolloFilters(prev => ({
                                    ...prev,
                                    location: prev.location.filter((_, i) => i !== index)
                                  }))}
                                  className="ml-2 text-blue-400 hover:text-blue-300"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Checkbox
                          checked={apolloFilters.emailVerified}
                          onChange={(checked) => setApolloFilters(prev => ({ ...prev, emailVerified: checked }))}
                          label="Email Verified Only (Higher deliverability)"
                        />
                        <Checkbox
                          checked={apolloFilters.phoneAvailable}
                          onChange={(checked) => setApolloFilters(prev => ({ ...prev, phoneAvailable: checked }))}
                          label="Phone Number Available"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Filters Section */}
                <div>
                  <SectionHeader title="Company Filters" icon={Building} color="blue" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label tooltip="Target specific industry verticals">Industry</Label>
                        <Select
                          value={apolloFilters.industry}
                          onChange={(e) => setApolloFilters(prev => ({ ...prev, industry: e.target.value }))}
                        >
                          <option value="">Select Industry</option>
                          <option value="computer_software">Computer Software & SaaS</option>
                          <option value="information_technology">Information Technology Services</option>
                          <option value="financial_services">Financial Services & FinTech</option>
                          <option value="healthcare">Healthcare & Medical Technology</option>
                          <option value="consulting">Management Consulting</option>
                          <option value="manufacturing">Manufacturing & Industrial</option>
                          <option value="real_estate">Real Estate & PropTech</option>
                          <option value="ecommerce">E-commerce & Retail Technology</option>
                          <option value="education">Education Technology (EdTech)</option>
                          <option value="marketing_advertising">Marketing & Advertising Technology</option>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label tooltip="Filter by company employee count">Company Size</Label>
                        <Select
                          value={apolloFilters.companySize}
                          onChange={(e) => setApolloFilters(prev => ({ ...prev, companySize: e.target.value }))}
                        >
                          <option value="">All Company Sizes</option>
                          <option value="1-10">1-10 employees (Startup)</option>
                          <option value="11-50">11-50 employees (Small Business)</option>
                          <option value="51-200">51-200 employees (Mid-Market)</option>
                          <option value="201-500">201-500 employees (Enterprise)</option>
                          <option value="501-1000">501-1000 employees (Large Enterprise)</option>
                          <option value="1001-5000">1001-5000 employees (Major Corporation)</option>
                          <option value="5001-10000">5001-10000 employees (Global Enterprise)</option>
                          <option value="10001+">10000+ employees (Fortune 500)</option>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label tooltip="Target by funding stage">Funding Stage</Label>
                        <Select
                          value={apolloFilters.fundingStage}
                          onChange={(e) => setApolloFilters(prev => ({ ...prev, fundingStage: e.target.value }))}
                        >
                          <option value="">All Funding Stages</option>
                          <option value="seed">Seed</option>
                          <option value="series_a">Series A</option>
                          <option value="series_b">Series B</option>
                          <option value="series_c">Series C</option>
                          <option value="series_d">Series D+</option>
                          <option value="ipo">IPO</option>
                          <option value="private_equity">Private Equity</option>
                          <option value="acquired">Acquired</option>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label tooltip="Filter by annual revenue range">Revenue Range</Label>
                        <Select
                          value={apolloFilters.revenueRange}
                          onChange={(e) => setApolloFilters(prev => ({ ...prev, revenueRange: e.target.value }))}
                        >
                          <option value="">All Revenue Ranges</option>
                          <option value="0-1M">$0 - $1M (Startup)</option>
                          <option value="1M-10M">$1M - $10M (Small Business)</option>
                          <option value="10M-50M">$10M - $50M (Mid-Market)</option>
                          <option value="50M-100M">$50M - $100M (Large Business)</option>
                          <option value="100M-500M">$100M - $500M (Enterprise)</option>
                          <option value="500M-1B">$500M - $1B (Large Enterprise)</option>
                          <option value="1B+">$1B+ (Fortune 500)</option>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label tooltip="Target companies using specific technologies">Technologies Used</Label>
                        <Input
                          placeholder="e.g., Salesforce, HubSpot, AWS, Slack"
                          value={apolloFilters.technologies.join(', ')}
                          onChange={(e) => setApolloFilters(prev => ({ 
                            ...prev, 
                            technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                          }))}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label tooltip="Exclude specific domains or companies">Exclude Domains/Companies</Label>
                        <Input
                          placeholder="e.g., competitor1.com, competitor2.com"
                          value={apolloFilters.excludeDomains}
                          onChange={(e) => setApolloFilters(prev => ({ ...prev, excludeDomains: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scraping Settings Section */}
                <div>
                  <SectionHeader title="Scraping Settings" icon={Settings} color="blue" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label tooltip="How recent the data should be">Data Freshness</Label>
                        <Select
                          value={apolloFilters.dataFreshness}
                          onChange={(e) => setApolloFilters(prev => ({ ...prev, dataFreshness: e.target.value }))}
                        >
                          <option value="7_days">Last 7 days (Premium Fresh)</option>
                          <option value="30_days">Last 30 days (Recommended)</option>
                          <option value="90_days">Last 90 days (Standard)</option>
                          <option value="180_days">Last 6 months (Extended)</option>
                          <option value="all">All available data</option>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label tooltip="Maximum number of records to extract">Record Limit</Label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={apolloFilters.recordLimit}
                          onChange={(e) => setApolloFilters(prev => ({ ...prev, recordLimit: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Similar sections for Apify and PhantomBuster would follow the same pattern... */}
            {/* For brevity, I'll implement the key structure but you can extend based on the specification */}

            {selectedTool === 'apify' && (
              <div className="space-y-12">
                <SectionHeader title="Location Filters" icon={MapPin} color="green" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label tooltip="What type of businesses to search for">Search Terms</Label>
                      <Input
                        placeholder="e.g., restaurants, marketing agencies, dentists"
                        value={apifyFilters.searchTerms}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, searchTerms: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label tooltip="Search radius in miles">Radius (miles)</Label>
                      <Input
                        type="number"
                        placeholder="25"
                        value={apifyFilters.radius}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, radius: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label tooltip="Industry category to focus on">Industry Category</Label>
                      <Select
                        value={apifyFilters.industryCategory}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, industryCategory: e.target.value }))}
                      >
                        <option value="">All Categories</option>
                        <option value="restaurants">Restaurants & Food Services</option>
                        <option value="retail">Retail & Shopping</option>
                        <option value="healthcare">Healthcare & Medical</option>
                        <option value="professional_services">Professional Services</option>
                        <option value="automotive">Automotive Services</option>
                        <option value="beauty_wellness">Beauty & Wellness</option>
                        <option value="home_garden">Home & Garden Services</option>
                        <option value="entertainment">Entertainment & Recreation</option>
                        <option value="education">Education & Training</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="financial_services">Financial Services</option>
                        <option value="technology">Technology Services</option>
                        <option value="construction">Construction & Contractors</option>
                        <option value="legal">Legal Services</option>
                        <option value="consulting">Business Consulting</option>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Checkbox
                        checked={apifyFilters.extractContactInfo}
                        onChange={(checked) => setApifyFilters(prev => ({ ...prev, extractContactInfo: checked }))}
                        label="Extract Contact Information"
                      />
                    </div>
                  </div>
                </div>

                <SectionHeader title="Quality Filters" icon={Star} color="green" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label tooltip="Minimum number of reviews required">Minimum Reviews Required</Label>
                      <Select
                        value={apifyFilters.minReviews}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, minReviews: e.target.value }))}
                      >
                        <option value="0">No minimum reviews</option>
                        <option value="5">5+ reviews (Basic quality)</option>
                        <option value="10">10+ reviews (Good quality)</option>
                        <option value="25">25+ reviews (High quality)</option>
                        <option value="50">50+ reviews (Premium quality)</option>
                        <option value="100">100+ reviews (Enterprise quality)</option>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label tooltip="Minimum star rating threshold">Minimum Rating</Label>
                      <Select
                        value={apifyFilters.minRating}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, minRating: e.target.value }))}
                      >
                        <option value="0">Any rating</option>
                        <option value="3">3+ stars (Basic)</option>
                        <option value="3.5">3.5+ stars (Good)</option>
                        <option value="4">4+ stars (High quality)</option>
                        <option value="4.5">4.5+ stars (Premium)</option>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label tooltip="Maximum number of listings to extract">Max Listings to Pull</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={apifyFilters.maxListings}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, maxListings: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label tooltip="Delay between requests in seconds">Delay Between Requests (seconds)</Label>
                      <Input
                        type="number"
                        placeholder="2"
                        value={apifyFilters.requestDelay}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, requestDelay: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTool === 'phantombuster' && (
              <div className="space-y-12">
                <SectionHeader title="Contact Filters" icon={Users} color="purple" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label tooltip="Social media platform to target">Platform</Label>
                      <Select
                        value={phantombusterFilters.platform}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, platform: e.target.value }))}
                      >
                        <option value="linkedin">LinkedIn (Professional)</option>
                        <option value="twitter">Twitter/X (Business)</option>
                        <option value="instagram">Instagram (Business)</option>
                        <option value="facebook">Facebook (Business)</option>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label tooltip="Keywords to search for in profiles">Keywords</Label>
                      <Input
                        placeholder="e.g., startup founder, marketing director"
                        value={phantombusterFilters.keywords}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, keywords: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label tooltip="LinkedIn connection degree">Connection Degree</Label>
                      <Select
                        value={phantombusterFilters.connectionDegree}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, connectionDegree: e.target.value }))}
                      >
                        <option value="1st">1st connections (Direct)</option>
                        <option value="2nd">2nd connections (Recommended)</option>
                        <option value="3rd">3rd+ connections (Extended)</option>
                        <option value="all">All connection levels</option>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label tooltip="Target seniority level">Seniority Level</Label>
                      <Select
                        value={phantombusterFilters.seniorityLevel}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, seniorityLevel: e.target.value }))}
                      >
                        <option value="">All Seniority Levels</option>
                        <option value="owner">Business Owner</option>
                        <option value="founder">Founder/Co-Founder</option>
                        <option value="cxo">C-Level Executive</option>
                        <option value="vp">Vice President</option>
                        <option value="director">Director</option>
                        <option value="manager">Manager</option>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label tooltip="Department or function to target">Department/Function</Label>
                      <Select
                        value={phantombusterFilters.department}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, department: e.target.value }))}
                      >
                        <option value="">All Departments</option>
                        <option value="sales">Sales & Revenue</option>
                        <option value="marketing">Marketing & Growth</option>
                        <option value="operations">Operations & Strategy</option>
                        <option value="finance">Finance & Accounting</option>
                        <option value="hr">Human Resources</option>
                        <option value="it">Information Technology</option>
                        <option value="product">Product & Innovation</option>
                        <option value="engineering">Engineering & Development</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <SectionHeader title="Execution Settings" icon={Settings} color="purple" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label tooltip="API or Phantom browser execution">Use API or Phantom</Label>
                      <Select
                        value={phantombusterFilters.apiOrPhantom}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, apiOrPhantom: e.target.value }))}
                      >
                        <option value="api">API (Faster)</option>
                        <option value="phantom">Phantom Browser (More Natural)</option>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label tooltip="Daily connection limit for safety">Daily Connection Limit</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={phantombusterFilters.dailyLimit}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, dailyLimit: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-4">
                      <Checkbox
                        checked={phantombusterFilters.autoConnect}
                        onChange={(checked) => setPhantombusterFilters(prev => ({ ...prev, autoConnect: checked }))}
                        label="Auto-connect with Message"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    {phantombusterFilters.autoConnect && (
                      <div className="space-y-3">
                        <Label tooltip="Use {firstName} and {company} for personalization">Message Template</Label>
                        <textarea
                          placeholder="Hi {firstName}, I'd love to connect and explore {company}..."
                          value={phantombusterFilters.messageTemplate}
                          onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, messageTemplate: e.target.value }))}
                          className="flex w-full rounded-xl border-2 border-slate-600/50 bg-gradient-to-r from-slate-700/80 to-slate-800/80 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 min-h-[100px]"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <Label tooltip="Number of retry attempts on failure">Retry Attempts</Label>
                      <Input
                        type="number"
                        placeholder="3"
                        value={phantombusterFilters.retryAttempts}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, retryAttempts: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-xl border-t border-slate-700/50 p-6 z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-slate-300">
                🔄 {filtersApplied} filters applied
              </span>
              <Button variant="secondary" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Estimate Leads
              </Button>
            </div>
            <Button onClick={handleStartScraping} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                  Processing Intelligence...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-3" />
                  Launch {selectedTool?.charAt(0).toUpperCase() + selectedTool?.slice(1)} Scraper
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Results Step - Professional Design
  if (currentStep === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-8 mb-12">
            <Button 
              variant="outline" 
              onClick={resetToToolSelection}
              className="text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              New Intelligence Search
            </Button>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                Intelligence Results
              </h1>
              <p className="text-xl text-slate-300">
                Extracted {results.count} high-quality leads using {selectedTool?.toUpperCase()} platform
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border-2 border-green-400/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-400 mr-4" />
              <div>
                <span className="text-green-200 text-xl font-semibold">
                  ✅ {results.count} leads scraped. View in Airtable »
                </span>
                <p className="text-green-300 mt-1">Notification sent to Slack • Data ready for export</p>
              </div>
            </div>
          </div>

          <Card className="p-12">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-semibold text-white">
                Premium Lead Intelligence Preview
              </h3>
              <Button variant="outline" className="text-lg">
                <Download className="w-5 h-5 mr-3" />
                Export Enterprise CSV
              </Button>
            </div>
            
            <div className="grid gap-6">
              {results.leads.slice(0, 5).map((lead, index) => (
                <div key={index} className="border-2 border-slate-600/30 rounded-2xl p-6 bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-white mb-2">{lead.fullName}</h4>
                      <p className="text-lg text-slate-300 mb-3">{lead.title} at {lead.company}</p>
                      <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {lead.email}
                        </span>
                        {lead.phone && (
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {lead.phone}
                          </span>
                        )}
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {lead.location}
                        </span>
                      </div>
                    </div>
                    {lead.score && (
                      <div className="flex items-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl px-4 py-2">
                        <Star className="w-5 h-5 text-yellow-400 mr-2" />
                        <span className="text-lg font-semibold text-yellow-300">{lead.score}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {results.leads.length > 5 && (
              <div className="text-center mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-2xl">
                <p className="text-slate-300 text-lg">
                  Showing 5 of {results.count} premium leads. Export complete dataset for full intelligence package.
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