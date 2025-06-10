import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target,
  Globe,
  Users,
  Play,
  X,
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
  TrendingUp
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

// Enterprise UI Components with Command Center Styling
const CustomCard = ({ children, className = "", onClick }: { 
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

const CustomButton = ({ children, onClick, disabled = false, className = "", variant = "default" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: string;
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95";
  
  const variantClass = variant === "outline" 
    ? "border-2 border-slate-600/50 bg-gradient-to-r from-slate-700/80 to-slate-800/80 backdrop-blur-sm hover:from-slate-600/80 hover:to-slate-700/80 text-white shadow-lg hover:shadow-xl" 
    : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white border-0 shadow-2xl hover:shadow-blue-500/25";
  
  return (
    <button 
      className={`${baseClass} ${variantClass} h-12 py-3 px-8 ${className}`}
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
    style={{
      color: 'white',
      backgroundColor: 'rgb(51 65 85 / 0.8)',
    }}
  >
    {children}
  </select>
);

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-semibold text-slate-200 ${className}`}>
    {children}
  </label>
);

export default function EnterpriseLeadScraper() {
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
    lastUpdated: "30_days",
    zipCodes: ""
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
    requestDelay: "2000",
    zipCodes: "",
    seniorityLevel: ""
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
    messageTemplate: "",
    zipCodes: ""
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
      
      const response = await fetch('/api/lead-scraper/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          platform: selectedTool,
          filters,
          maxResults: 100
        })
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

  // Tool Selection Step - Enterprise Design
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
              Enterprise Lead Intelligence Platform
            </h1>
            <p className="text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence
            </p>
          </div>

          {/* Platform Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            {/* Apollo.io */}
            <CustomCard 
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
                  <div className="text-center">
                    <div className="inline-flex items-center text-sm text-slate-400">
                      <Zap className="w-4 h-4 mr-2" />
                      Enterprise-grade accuracy
                    </div>
                  </div>
                </div>
              </div>
            </CustomCard>

            {/* Apify */}
            <CustomCard 
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
                  <div className="text-center">
                    <div className="inline-flex items-center text-sm text-slate-400">
                      <Zap className="w-4 h-4 mr-2" />
                      Custom data extraction
                    </div>
                  </div>
                </div>
              </div>
            </CustomCard>

            {/* PhantomBuster */}
            <CustomCard 
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
                  <div className="text-center">
                    <div className="inline-flex items-center text-sm text-slate-400">
                      <Zap className="w-4 h-4 mr-2" />
                      Multi-platform reach
                    </div>
                  </div>
                </div>
              </div>
            </CustomCard>
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

  // Filter Configuration Step - Enterprise Design
  if (currentStep === 'filters' && selectedTool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-8 mb-12">
            <CustomButton 
              variant="outline" 
              onClick={resetToToolSelection}
              className="text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Back to Platforms
            </CustomButton>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                {selectedTool === 'apollo' ? 'Apollo.io Enterprise Configuration' : 
                 selectedTool === 'apify' ? 'Apify Advanced Configuration' : 
                 'PhantomBuster Professional Setup'}
              </h1>
              <p className="text-xl text-slate-300">
                Configure precision targeting parameters for optimal enterprise results
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 backdrop-blur-xl border-2 border-red-400/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-400 mr-3" />
                <span className="text-red-200 text-lg font-medium">{error}</span>
              </div>
            </div>
          )}

          <CustomCard className="p-12">
            {/* Apollo.io Filters */}
            {selectedTool === 'apollo' && (
              <div className="space-y-12">
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm p-8 rounded-2xl border border-blue-400/30">
                  <div className="flex items-center mb-4">
                    <Target className="w-8 h-8 text-blue-400 mr-4" />
                    <h3 className="text-2xl font-bold text-white">Apollo.io Professional Intelligence</h3>
                  </div>
                  <p className="text-blue-200 text-lg">Target verified B2B contacts with advanced professional filters and enterprise-grade accuracy</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h4 className="text-2xl font-semibold text-white border-b-2 border-blue-400/30 pb-4">Executive Targeting</h4>
                    
                    <div className="space-y-3">
                      <Label>Job Titles (Click to Select Multiple)</Label>
                      <div className="w-full max-h-[200px] overflow-y-auto px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl">
                        {[
                          { value: "ceo", label: "Chief Executive Officer" },
                          { value: "cto", label: "Chief Technology Officer" },
                          { value: "cfo", label: "Chief Financial Officer" },
                          { value: "cmo", label: "Chief Marketing Officer" },
                          { value: "coo", label: "Chief Operating Officer" },
                          { value: "founder", label: "Founder" },
                          { value: "president", label: "President" },
                          { value: "owner", label: "Business Owner" },
                          { value: "partner", label: "Partner" },
                          { value: "vp_sales", label: "VP of Sales" },
                          { value: "vp_marketing", label: "VP of Marketing" },
                          { value: "vp_operations", label: "VP of Operations" },
                          { value: "director_sales", label: "Director of Sales" },
                          { value: "director_marketing", label: "Director of Marketing" },
                          { value: "sales_manager", label: "Sales Manager" },
                          { value: "marketing_manager", label: "Marketing Manager" },
                          { value: "operations_manager", label: "Operations Manager" },
                          { value: "general_manager", label: "General Manager" },
                          { value: "project_manager", label: "Project Manager" },
                          { value: "account_executive", label: "Account Executive" },
                          { value: "business_development", label: "Business Development Manager" },
                          { value: "product_manager", label: "Product Manager" },
                          { value: "regional_manager", label: "Regional Manager" },
                          { value: "superintendent", label: "Superintendent" },
                          { value: "foreman", label: "Foreman" },
                          { value: "estimator", label: "Estimator" },
                          { value: "service_manager", label: "Service Manager" },
                          { value: "technician", label: "Lead Technician" },
                          { value: "installer", label: "Installer" },
                          { value: "contractor", label: "Contractor" }
                        ].map((title) => {
                          const selectedTitles = apolloFilters.personTitles ? apolloFilters.personTitles.split(',') : [];
                          const isSelected = selectedTitles.includes(title.value);
                          
                          return (
                            <div
                              key={title.value}
                              className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
                                isSelected ? 'bg-blue-600/30 border border-blue-400/50' : ''
                              }`}
                              onClick={() => {
                                const currentTitles = apolloFilters.personTitles ? apolloFilters.personTitles.split(',').filter(t => t) : [];
                                let newTitles;
                                
                                if (isSelected) {
                                  newTitles = currentTitles.filter(t => t !== title.value);
                                } else {
                                  newTitles = [...currentTitles, title.value];
                                }
                                
                                setApolloFilters(prev => ({ ...prev, personTitles: newTitles.join(',') }));
                              }}
                            >
                              <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                                isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-500'
                              }`}>
                                {isSelected && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-white text-sm">{title.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {apolloFilters.personTitles && apolloFilters.personTitles.split(',').filter(t => t).map((titleValue) => {
                          const titleLabel = [
                            { value: "ceo", label: "CEO" },
                            { value: "cto", label: "CTO" },
                            { value: "cfo", label: "CFO" },
                            { value: "cmo", label: "CMO" },
                            { value: "coo", label: "COO" },
                            { value: "founder", label: "Founder" },
                            { value: "president", label: "President" },
                            { value: "owner", label: "Owner" },
                            { value: "partner", label: "Partner" },
                            { value: "vp_sales", label: "VP Sales" },
                            { value: "vp_marketing", label: "VP Marketing" },
                            { value: "vp_operations", label: "VP Operations" },
                            { value: "director_sales", label: "Dir. Sales" },
                            { value: "director_marketing", label: "Dir. Marketing" },
                            { value: "sales_manager", label: "Sales Mgr" },
                            { value: "marketing_manager", label: "Marketing Mgr" },
                            { value: "operations_manager", label: "Ops Mgr" },
                            { value: "general_manager", label: "GM" },
                            { value: "project_manager", label: "PM" },
                            { value: "account_executive", label: "AE" },
                            { value: "business_development", label: "BD Mgr" },
                            { value: "product_manager", label: "Product Mgr" },
                            { value: "regional_manager", label: "Regional Mgr" },
                            { value: "superintendent", label: "Superintendent" },
                            { value: "foreman", label: "Foreman" },
                            { value: "estimator", label: "Estimator" },
                            { value: "service_manager", label: "Service Mgr" },
                            { value: "technician", label: "Technician" },
                            { value: "installer", label: "Installer" },
                            { value: "contractor", label: "Contractor" }
                          ].find(t => t.value === titleValue)?.label || titleValue;
                          
                          return (
                            <Badge
                              key={titleValue}
                              className="bg-blue-600/20 text-blue-200 border border-blue-400/30 px-2 py-1 text-xs cursor-pointer hover:bg-red-600/20 hover:text-red-200 hover:border-red-400/30"
                              onClick={() => {
                                const currentTitles = apolloFilters.personTitles.split(',').filter(t => t);
                                const newTitles = currentTitles.filter(t => t !== titleValue);
                                setApolloFilters(prev => ({ ...prev, personTitles: newTitles.join(',') }));
                              }}
                            >
                              {titleLabel} ×
                            </Badge>
                          );
                        })}
                      </div>
                      <p className="text-sm text-slate-400">Click titles to select, click badges to remove</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Executive Seniority Level (Click to Select Multiple)</Label>
                      <div className="w-full max-h-[200px] overflow-y-auto px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl">
                        {[
                          { value: "owner", label: "Business Owner" },
                          { value: "founder", label: "Founder/Co-Founder" },
                          { value: "cxo", label: "C-Level Executive" },
                          { value: "partner", label: "Partner/Principal" },
                          { value: "vp", label: "Vice President" },
                          { value: "svp", label: "Senior Vice President" },
                          { value: "evp", label: "Executive Vice President" },
                          { value: "director", label: "Director" },
                          { value: "senior_director", label: "Senior Director" },
                          { value: "senior_manager", label: "Senior Manager" },
                          { value: "manager", label: "Manager" }
                        ].map((level) => {
                          const selectedLevels = apolloFilters.seniorityLevel ? apolloFilters.seniorityLevel.split(',') : [];
                          const isSelected = selectedLevels.includes(level.value);
                          
                          return (
                            <div
                              key={level.value}
                              className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
                                isSelected ? 'bg-blue-600/30 border border-blue-400/50' : ''
                              }`}
                              onClick={() => {
                                const currentLevels = apolloFilters.seniorityLevel ? apolloFilters.seniorityLevel.split(',').filter(l => l) : [];
                                let newLevels;
                                
                                if (isSelected) {
                                  newLevels = currentLevels.filter(l => l !== level.value);
                                } else {
                                  newLevels = [...currentLevels, level.value];
                                }
                                
                                setApolloFilters(prev => ({ ...prev, seniorityLevel: newLevels.join(',') }));
                              }}
                            >
                              <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                                isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-500'
                              }`}>
                                {isSelected && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-white text-sm">{level.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {apolloFilters.seniorityLevel && apolloFilters.seniorityLevel.split(',').filter(l => l).map((levelValue) => {
                          const levelLabel = [
                            { value: "owner", label: "Business Owner" },
                            { value: "founder", label: "Founder/Co-Founder" },
                            { value: "cxo", label: "C-Level Executive" },
                            { value: "partner", label: "Partner/Principal" },
                            { value: "vp", label: "Vice President" },
                            { value: "svp", label: "Senior Vice President" },
                            { value: "evp", label: "Executive Vice President" },
                            { value: "director", label: "Director" },
                            { value: "senior_director", label: "Senior Director" },
                            { value: "senior_manager", label: "Senior Manager" },
                            { value: "manager", label: "Manager" }
                          ].find(l => l.value === levelValue)?.label || levelValue;
                          
                          return (
                            <Badge
                              key={levelValue}
                              className="bg-blue-600/20 text-blue-200 border border-blue-400/30 px-2 py-1 text-xs cursor-pointer hover:bg-red-600/20 hover:text-red-200 hover:border-red-400/30"
                              onClick={() => {
                                const currentLevels = apolloFilters.seniorityLevel.split(',').filter(l => l);
                                const newLevels = currentLevels.filter(l => l !== levelValue);
                                setApolloFilters(prev => ({ ...prev, seniorityLevel: newLevels.join(',') }));
                              }}
                            >
                              {levelLabel} ×
                            </Badge>
                          );
                        })}
                      </div>
                      <p className="text-sm text-slate-400">Click levels to select, click badges to remove</p>
                    </div>

                    <div className="space-y-3">
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

                    <div className="space-y-3">
                      <Label>Department Focus</Label>
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
                        <option value="legal">Legal & Compliance</option>
                        <option value="procurement">Procurement & Supply Chain</option>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Target Keywords</Label>
                      <Input
                        placeholder="e.g., SaaS, AI, Machine Learning, Enterprise Software"
                        value={apolloFilters.keywords}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, keywords: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-2xl font-semibold text-white border-b-2 border-purple-400/30 pb-4">Enterprise Company Targeting</h4>
                    
                    <div className="space-y-3">
                      <Label>Industry Vertical (Click to Select Multiple)</Label>
                      <div className="w-full max-h-[300px] overflow-y-auto px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl">
                        {[
                          { category: "🧰 Trades & Services", options: [
                            { value: "hvac", label: "HVAC" },
                            { value: "plumbing", label: "Plumbing" },
                            { value: "electrical", label: "Electrical" },
                            { value: "roofing", label: "Roofing" },
                            { value: "landscaping", label: "Landscaping" },
                            { value: "general_contracting", label: "General Contracting" },
                            { value: "pest_control", label: "Pest Control" },
                            { value: "pool_services", label: "Pool Services" },
                            { value: "cleaning_services", label: "Cleaning Services" },
                            { value: "appliance_repair", label: "Appliance Repair" }
                          ]},
                          { category: "🏥 Medical & Wellness", options: [
                            { value: "chiropractors", label: "Chiropractors" },
                            { value: "dentists", label: "Dentists" },
                            { value: "physical_therapists", label: "Physical Therapists" },
                            { value: "mental_health_clinics", label: "Mental Health Clinics" },
                            { value: "medspas", label: "MedSpas" },
                            { value: "primary_care", label: "Primary Care" },
                            { value: "dermatologists", label: "Dermatologists" },
                            { value: "holistic_health", label: "Holistic Health" },
                            { value: "weight_loss_clinics", label: "Weight Loss Clinics" }
                          ]},
                          { category: "💼 Professional Services", options: [
                            { value: "law_firms", label: "Law Firms" },
                            { value: "accountants_cpas", label: "Accountants / CPAs" },
                            { value: "insurance_agencies", label: "Insurance Agencies" },
                            { value: "real_estate_brokers", label: "Real Estate Brokers" },
                            { value: "mortgage_lenders", label: "Mortgage Lenders" },
                            { value: "financial_advisors", label: "Financial Advisors" },
                            { value: "business_consultants", label: "Business Consultants" },
                            { value: "marketing_agencies", label: "Marketing Agencies" },
                            { value: "it_services", label: "IT Services" },
                            { value: "web_developers", label: "Web Developers" }
                          ]},
                          { category: "🍽️ Food & Hospitality", options: [
                            { value: "restaurants", label: "Restaurants" },
                            { value: "cafes", label: "Cafes" },
                            { value: "bars_lounges", label: "Bars & Lounges" },
                            { value: "hotels", label: "Hotels" },
                            { value: "catering", label: "Catering Services" },
                            { value: "food_trucks", label: "Food Trucks" },
                            { value: "event_venues", label: "Event Venues" },
                            { value: "wedding_venues", label: "Wedding Venues" }
                          ]},
                          { category: "🛒 Retail & E-commerce", options: [
                            { value: "clothing_stores", label: "Clothing Stores" },
                            { value: "electronics", label: "Electronics" },
                            { value: "home_goods", label: "Home Goods" },
                            { value: "automotive", label: "Automotive" },
                            { value: "sports_outdoors", label: "Sports & Outdoors" },
                            { value: "jewelry", label: "Jewelry" },
                            { value: "beauty_cosmetics", label: "Beauty & Cosmetics" },
                            { value: "pet_stores", label: "Pet Stores" }
                          ]},
                          { category: "🏢 Technology & Software", options: [
                            { value: "saas", label: "SaaS Companies" },
                            { value: "software_development", label: "Software Development" },
                            { value: "cybersecurity", label: "Cybersecurity" },
                            { value: "ai_ml", label: "AI & Machine Learning" },
                            { value: "fintech", label: "FinTech" },
                            { value: "edtech", label: "EdTech" },
                            { value: "healthtech", label: "HealthTech" },
                            { value: "proptech", label: "PropTech" }
                          ]}
                        ].map((categoryGroup) => (
                          <div key={categoryGroup.category} className="mb-4">
                            <div className="text-xs font-semibold text-slate-400 mb-2 px-2">{categoryGroup.category}</div>
                            {categoryGroup.options.map((industry) => {
                              const selectedIndustries = apolloFilters.industry ? apolloFilters.industry.split(',') : [];
                              const isSelected = selectedIndustries.includes(industry.value);
                              
                              return (
                                <div
                                  key={industry.value}
                                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
                                    isSelected ? 'bg-purple-600/30 border border-purple-400/50' : ''
                                  }`}
                                  onClick={() => {
                                    const currentIndustries = apolloFilters.industry ? apolloFilters.industry.split(',').filter(i => i) : [];
                                    let newIndustries;
                                    
                                    if (isSelected) {
                                      newIndustries = currentIndustries.filter(i => i !== industry.value);
                                    } else {
                                      newIndustries = [...currentIndustries, industry.value];
                                    }
                                    
                                    setApolloFilters(prev => ({ ...prev, industry: newIndustries.join(',') }));
                                  }}
                                >
                                  <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                                    isSelected ? 'bg-purple-500 border-purple-500' : 'border-slate-500'
                                  }`}>
                                    {isSelected && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <span className="text-white text-sm">{industry.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {apolloFilters.industry && apolloFilters.industry.split(',').filter(i => i).map((industryValue) => {
                          const allIndustries = [
                            { value: "hvac", label: "HVAC" },
                            { value: "plumbing", label: "Plumbing" },
                            { value: "electrical", label: "Electrical" },
                            { value: "roofing", label: "Roofing" },
                            { value: "landscaping", label: "Landscaping" },
                            { value: "general_contracting", label: "General Contracting" },
                            { value: "pest_control", label: "Pest Control" },
                            { value: "pool_services", label: "Pool Services" },
                            { value: "cleaning_services", label: "Cleaning Services" },
                            { value: "appliance_repair", label: "Appliance Repair" },
                            { value: "chiropractors", label: "Chiropractors" },
                            { value: "dentists", label: "Dentists" },
                            { value: "physical_therapists", label: "Physical Therapists" },
                            { value: "mental_health_clinics", label: "Mental Health" },
                            { value: "medspas", label: "MedSpas" },
                            { value: "primary_care", label: "Primary Care" },
                            { value: "dermatologists", label: "Dermatologists" },
                            { value: "holistic_health", label: "Holistic Health" },
                            { value: "weight_loss_clinics", label: "Weight Loss" },
                            { value: "law_firms", label: "Law Firms" },
                            { value: "accountants_cpas", label: "CPAs" },
                            { value: "insurance_agencies", label: "Insurance" },
                            { value: "real_estate_brokers", label: "Real Estate" },
                            { value: "mortgage_lenders", label: "Mortgage" },
                            { value: "financial_advisors", label: "Financial" },
                            { value: "business_consultants", label: "Consulting" },
                            { value: "marketing_agencies", label: "Marketing" },
                            { value: "it_services", label: "IT Services" },
                            { value: "web_developers", label: "Web Dev" },
                            { value: "restaurants", label: "Restaurants" },
                            { value: "cafes", label: "Cafes" },
                            { value: "bars_lounges", label: "Bars" },
                            { value: "hotels", label: "Hotels" },
                            { value: "catering", label: "Catering" },
                            { value: "food_trucks", label: "Food Trucks" },
                            { value: "event_venues", label: "Event Venues" },
                            { value: "wedding_venues", label: "Wedding Venues" },
                            { value: "clothing_stores", label: "Clothing" },
                            { value: "electronics", label: "Electronics" },
                            { value: "home_goods", label: "Home Goods" },
                            { value: "automotive", label: "Automotive" },
                            { value: "sports_outdoors", label: "Sports" },
                            { value: "jewelry", label: "Jewelry" },
                            { value: "beauty_cosmetics", label: "Beauty" },
                            { value: "pet_stores", label: "Pet Stores" },
                            { value: "saas", label: "SaaS" },
                            { value: "software_development", label: "Software Dev" },
                            { value: "cybersecurity", label: "Cybersecurity" },
                            { value: "ai_ml", label: "AI/ML" },
                            { value: "fintech", label: "FinTech" },
                            { value: "edtech", label: "EdTech" },
                            { value: "healthtech", label: "HealthTech" },
                            { value: "proptech", label: "PropTech" }
                          ];
                          
                          const industryLabel = allIndustries.find(i => i.value === industryValue)?.label || industryValue;
                          
                          return (
                            <Badge
                              key={industryValue}
                              className="bg-purple-600/20 text-purple-200 border border-purple-400/30 px-2 py-1 text-xs cursor-pointer hover:bg-red-600/20 hover:text-red-200 hover:border-red-400/30"
                              onClick={() => {
                                const currentIndustries = apolloFilters.industry.split(',').filter(i => i);
                                const newIndustries = currentIndustries.filter(i => i !== industryValue);
                                setApolloFilters(prev => ({ ...prev, industry: newIndustries.join(',') }));
                              }}
                            >
                              {industryLabel} ×
                            </Badge>
                          );
                        })}
                      </div>
                      <p className="text-sm text-slate-400">Click industries to select, click badges to remove</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Enterprise Company Size</Label>
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
                        <option value="1001,5000">1001-5000 employees (Major Corporation)</option>
                        <option value="5001,10000">5001-10000 employees (Global Enterprise)</option>
                        <option value="10001,">10000+ employees (Fortune 500)</option>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Geographic Location</Label>
                      <Select
                        value={apolloFilters.location}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, location: e.target.value }))}
                      >
                        <option value="">Select Location</option>
                        <optgroup label="🌎 National Regions">
                          <option value="united_states">United States</option>
                          <option value="midwest">Midwest</option>
                          <option value="northeast">Northeast</option>
                          <option value="southeast">Southeast</option>
                          <option value="southwest">Southwest</option>
                          <option value="pacific_northwest">Pacific Northwest</option>
                          <option value="southern_california">Southern California</option>
                          <option value="central_texas">Central Texas</option>
                          <option value="gulf_coast">Gulf Coast</option>
                          <option value="mid_atlantic">Mid-Atlantic</option>
                        </optgroup>
                        <optgroup label="🏙️ Major Metro Areas">
                          <option value="new_york_city">New York Metropolitan Area</option>
                          <option value="los_angeles">Greater Los Angeles</option>
                          <option value="chicago">Chicago Metropolitan</option>
                          <option value="san_francisco">San Francisco Bay Area</option>
                          <option value="boston">Boston-Cambridge</option>
                          <option value="seattle">Seattle Metropolitan</option>
                          <option value="atlanta">Atlanta Metropolitan</option>
                          <option value="denver">Denver-Boulder</option>
                          <option value="austin">Austin-Round Rock</option>
                          <option value="minneapolis_st_paul">Minneapolis–St. Paul</option>
                          <option value="st_louis">St. Louis Metro</option>
                          <option value="nashville">Nashville Metro</option>
                          <option value="phoenix">Phoenix Metro</option>
                          <option value="las_vegas">Las Vegas Metro</option>
                          <option value="tampa_bay">Tampa Bay Metro</option>
                          <option value="orlando">Orlando Metro</option>
                          <option value="charlotte">Charlotte Metro</option>
                          <option value="indianapolis">Indianapolis Metro</option>
                          <option value="cincinnati">Cincinnati Metro</option>
                          <option value="raleigh_durham">Raleigh–Durham</option>
                          <option value="salt_lake_city">Salt Lake City</option>
                          <option value="oklahoma_city">Oklahoma City</option>
                          <option value="kansas_city">Kansas City Metro</option>
                          <option value="san_antonio">San Antonio Metro</option>
                          <option value="pittsburgh">Pittsburgh Metro</option>
                          <option value="columbus">Columbus Metro</option>
                        </optgroup>
                        <optgroup label="🏛️ State-Level">
                          <option value="california">California</option>
                          <option value="new_york">New York</option>
                          <option value="texas">Texas</option>
                          <option value="florida">Florida</option>
                          <option value="illinois">Illinois</option>
                          <option value="massachusetts">Massachusetts</option>
                          <option value="washington">Washington</option>
                          <option value="colorado">Colorado</option>
                          <option value="georgia">Georgia</option>
                          <option value="north_carolina">North Carolina</option>
                          <option value="virginia">Virginia</option>
                          <option value="arizona">Arizona</option>
                          <option value="nevada">Nevada</option>
                          <option value="utah">Utah</option>
                          <option value="tennessee">Tennessee</option>
                          <option value="ohio">Ohio</option>
                          <option value="pennsylvania">Pennsylvania</option>
                          <option value="michigan">Michigan</option>
                          <option value="minnesota">Minnesota</option>
                          <option value="missouri">Missouri</option>
                        </optgroup>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>ZIP Code Targeting (Optional)</Label>
                      <Input
                        placeholder="85260, 85032, 85018"
                        value={apolloFilters.zipCodes || ''}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, zipCodes: e.target.value }))}
                      />
                      <p className="text-xs text-slate-400">Enter ZIP code(s) to hyper-target local businesses. Use commas to separate multiple codes.</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Annual Revenue Range</Label>
                      <Select
                        value={apolloFilters.revenueRange}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, revenueRange: e.target.value }))}
                      >
                        <option value="">All Revenue Ranges</option>
                        <option value="0,1M">$0 - $1M (Startup)</option>
                        <option value="1M,10M">$1M - $10M (Small Business)</option>
                        <option value="10M,50M">$10M - $50M (Mid-Market)</option>
                        <option value="50M,100M">$50M - $100M (Large Business)</option>
                        <option value="100M,500M">$100M - $500M (Enterprise)</option>
                        <option value="500M,1B">$500M - $1B (Large Enterprise)</option>
                        <option value="1B,5B">$1B - $5B (Major Corporation)</option>
                        <option value="5B,">$5B+ (Fortune 500)</option>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Data Freshness & Quality</Label>
                      <Select
                        value={apolloFilters.lastUpdated}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, lastUpdated: e.target.value }))}
                      >
                        <option value="7_days">Last 7 days (Premium Fresh)</option>
                        <option value="30_days">Last 30 days (Recommended)</option>
                        <option value="90_days">Last 90 days (Standard)</option>
                        <option value="180_days">Last 6 months (Extended)</option>
                        <option value="">All available data</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Similar enterprise styling for Apify and PhantomBuster filters... */}
            {selectedTool === 'apify' && (
              <div className="space-y-12">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm p-8 rounded-2xl border border-green-400/30">
                  <div className="flex items-center mb-4">
                    <Globe className="w-8 h-8 text-green-400 mr-4" />
                    <h3 className="text-2xl font-bold text-white">Apify Web Intelligence Platform</h3>
                  </div>
                  <p className="text-green-200 text-lg">Extract comprehensive business listings and profiles with advanced filtering and quality controls</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h4 className="text-2xl font-semibold text-white border-b-2 border-green-400/30 pb-4">Search Parameters</h4>
                    
                    <div className="space-y-3">
                      <Label>Business Search Terms</Label>
                      <Input
                        placeholder="e.g., digital marketing agencies, software companies"
                        value={apifyFilters.searchTerms}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, searchTerms: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Target Location</Label>
                      <Select
                        value={apifyFilters.location}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, location: e.target.value }))}
                      >
                        <option value="">Select Location</option>
                        <optgroup label="🌎 National Regions">
                          <option value="united_states">United States</option>
                          <option value="midwest">Midwest</option>
                          <option value="northeast">Northeast</option>
                          <option value="southeast">Southeast</option>
                          <option value="southwest">Southwest</option>
                          <option value="pacific_northwest">Pacific Northwest</option>
                          <option value="southern_california">Southern California</option>
                          <option value="central_texas">Central Texas</option>
                          <option value="gulf_coast">Gulf Coast</option>
                          <option value="mid_atlantic">Mid-Atlantic</option>
                        </optgroup>
                        <optgroup label="🏙️ Major Metro Areas">
                          <option value="new_york_city">New York Metropolitan Area</option>
                          <option value="los_angeles">Greater Los Angeles</option>
                          <option value="chicago">Chicago Metropolitan</option>
                          <option value="san_francisco">San Francisco Bay Area</option>
                          <option value="boston">Boston-Cambridge</option>
                          <option value="seattle">Seattle Metropolitan</option>
                          <option value="atlanta">Atlanta Metropolitan</option>
                          <option value="denver">Denver-Boulder</option>
                          <option value="austin">Austin-Round Rock</option>
                          <option value="minneapolis_st_paul">Minneapolis–St. Paul</option>
                          <option value="st_louis">St. Louis Metro</option>
                          <option value="nashville">Nashville Metro</option>
                          <option value="phoenix">Phoenix Metro</option>
                          <option value="las_vegas">Las Vegas Metro</option>
                          <option value="tampa_bay">Tampa Bay Metro</option>
                          <option value="orlando">Orlando Metro</option>
                          <option value="charlotte">Charlotte Metro</option>
                          <option value="indianapolis">Indianapolis Metro</option>
                          <option value="cincinnati">Cincinnati Metro</option>
                          <option value="raleigh_durham">Raleigh–Durham</option>
                          <option value="salt_lake_city">Salt Lake City</option>
                          <option value="oklahoma_city">Oklahoma City</option>
                          <option value="kansas_city">Kansas City Metro</option>
                          <option value="san_antonio">San Antonio Metro</option>
                          <option value="pittsburgh">Pittsburgh Metro</option>
                          <option value="columbus">Columbus Metro</option>
                        </optgroup>
                        <optgroup label="🏛️ State-Level">
                          <option value="california">California</option>
                          <option value="new_york">New York</option>
                          <option value="texas">Texas</option>
                          <option value="florida">Florida</option>
                          <option value="illinois">Illinois</option>
                          <option value="massachusetts">Massachusetts</option>
                          <option value="washington">Washington</option>
                          <option value="colorado">Colorado</option>
                          <option value="georgia">Georgia</option>
                          <option value="north_carolina">North Carolina</option>
                          <option value="virginia">Virginia</option>
                          <option value="arizona">Arizona</option>
                          <option value="nevada">Nevada</option>
                          <option value="utah">Utah</option>
                          <option value="tennessee">Tennessee</option>
                          <option value="ohio">Ohio</option>
                          <option value="pennsylvania">Pennsylvania</option>
                          <option value="michigan">Michigan</option>
                          <option value="minnesota">Minnesota</option>
                          <option value="missouri">Missouri</option>
                        </optgroup>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>ZIP Code Targeting (Optional)</Label>
                      <Input
                        placeholder="85260, 85032, 85018"
                        value={apifyFilters.zipCodes || ''}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, zipCodes: e.target.value }))}
                      />
                      <p className="text-xs text-slate-400">Enter ZIP code(s) to hyper-target local businesses. Use commas to separate multiple codes.</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Industry Categories (Click to Select)</Label>
                      <div className="w-full max-h-[280px] overflow-y-auto px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl">
                        {[
                          {
                            category: "🧰 Trades & Services",
                            options: [
                              { value: "hvac", label: "HVAC" },
                              { value: "plumbing", label: "Plumbing" },
                              { value: "electrical", label: "Electrical" },
                              { value: "roofing", label: "Roofing" },
                              { value: "landscaping", label: "Landscaping" },
                              { value: "general_contracting", label: "General Contracting" },
                              { value: "pest_control", label: "Pest Control" },
                              { value: "pool_services", label: "Pool Services" },
                              { value: "cleaning_services", label: "Cleaning Services" },
                              { value: "appliance_repair", label: "Appliance Repair" }
                            ]
                          },
                          {
                            category: "🏥 Healthcare & Wellness",
                            options: [
                              { value: "chiropractors", label: "Chiropractors" },
                              { value: "dentists", label: "Dentists" },
                              { value: "physical_therapists", label: "Physical Therapists" },
                              { value: "mental_health_clinics", label: "Mental Health" },
                              { value: "medspas", label: "MedSpas" },
                              { value: "primary_care", label: "Primary Care" },
                              { value: "dermatologists", label: "Dermatologists" },
                              { value: "holistic_health", label: "Holistic Health" },
                              { value: "weight_loss_clinics", label: "Weight Loss" }
                            ]
                          },
                          {
                            category: "💼 Professional Services",
                            options: [
                              { value: "law_firms", label: "Law Firms" },
                              { value: "accountants_cpas", label: "CPAs" },
                              { value: "insurance_agencies", label: "Insurance" },
                              { value: "real_estate_brokers", label: "Real Estate" },
                              { value: "mortgage_lenders", label: "Mortgage" },
                              { value: "financial_advisors", label: "Financial" },
                              { value: "business_consultants", label: "Consulting" },
                              { value: "marketing_agencies", label: "Marketing" },
                              { value: "it_services", label: "IT Services" },
                              { value: "web_developers", label: "Web Dev" }
                            ]
                          }
                        ].map((categoryGroup) => (
                          <div key={categoryGroup.category} className="mb-4">
                            <div className="text-xs font-semibold text-slate-400 mb-2 px-2">{categoryGroup.category}</div>
                            {categoryGroup.options.map((industry) => {
                              const selectedIndustries = apifyFilters.industry ? apifyFilters.industry.split(',') : [];
                              const isSelected = selectedIndustries.includes(industry.value);
                              
                              return (
                                <div
                                  key={industry.value}
                                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
                                    isSelected ? 'bg-emerald-600/30 border border-emerald-400/50' : ''
                                  }`}
                                  onClick={() => {
                                    const currentIndustries = apifyFilters.industry ? apifyFilters.industry.split(',').filter(i => i) : [];
                                    let newIndustries;
                                    
                                    if (isSelected) {
                                      newIndustries = currentIndustries.filter(i => i !== industry.value);
                                    } else {
                                      newIndustries = [...currentIndustries, industry.value];
                                    }
                                    
                                    setApifyFilters(prev => ({ ...prev, industry: newIndustries.join(',') }));
                                  }}
                                >
                                  <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                                    isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                                  }`}>
                                    {isSelected && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <span className="text-white text-sm">{industry.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {apifyFilters.industry && apifyFilters.industry.split(',').filter(i => i).map((industryValue) => {
                          const allIndustries = [
                            { value: "hvac", label: "HVAC" },
                            { value: "plumbing", label: "Plumbing" },
                            { value: "electrical", label: "Electrical" },
                            { value: "roofing", label: "Roofing" },
                            { value: "landscaping", label: "Landscaping" },
                            { value: "general_contracting", label: "General Contracting" },
                            { value: "pest_control", label: "Pest Control" },
                            { value: "pool_services", label: "Pool Services" },
                            { value: "cleaning_services", label: "Cleaning Services" },
                            { value: "appliance_repair", label: "Appliance Repair" },
                            { value: "chiropractors", label: "Chiropractors" },
                            { value: "dentists", label: "Dentists" },
                            { value: "physical_therapists", label: "Physical Therapists" },
                            { value: "mental_health_clinics", label: "Mental Health" },
                            { value: "medspas", label: "MedSpas" },
                            { value: "primary_care", label: "Primary Care" },
                            { value: "dermatologists", label: "Dermatologists" },
                            { value: "holistic_health", label: "Holistic Health" },
                            { value: "weight_loss_clinics", label: "Weight Loss" },
                            { value: "law_firms", label: "Law Firms" },
                            { value: "accountants_cpas", label: "CPAs" },
                            { value: "insurance_agencies", label: "Insurance" },
                            { value: "real_estate_brokers", label: "Real Estate" },
                            { value: "mortgage_lenders", label: "Mortgage" },
                            { value: "financial_advisors", label: "Financial" },
                            { value: "business_consultants", label: "Consulting" },
                            { value: "marketing_agencies", label: "Marketing" },
                            { value: "it_services", label: "IT Services" },
                            { value: "web_developers", label: "Web Dev" }
                          ];
                          
                          const industryLabel = allIndustries.find(ind => ind.value === industryValue)?.label || industryValue;
                          
                          return (
                            <div key={industryValue} className="bg-emerald-600/20 text-emerald-200 px-3 py-1 rounded-full text-xs flex items-center">
                              {industryLabel}
                              <X
                                className="w-3 h-3 ml-2 cursor-pointer hover:text-emerald-100"
                                onClick={() => {
                                  const currentIndustries = apifyFilters.industry.split(',').filter(i => i);
                                  const newIndustries = currentIndustries.filter(i => i !== industryValue);
                                  setApifyFilters(prev => ({ ...prev, industry: newIndustries.join(',') }));
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Executive Seniority Level (Click to Select Multiple)</Label>
                      <div className="w-full max-h-[200px] overflow-y-auto px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl">
                        {[
                          { value: "owner", label: "Business Owner" },
                          { value: "founder", label: "Founder/Co-Founder" },
                          { value: "cxo", label: "C-Level Executive" },
                          { value: "partner", label: "Partner/Principal" },
                          { value: "vp", label: "Vice President" },
                          { value: "svp", label: "Senior Vice President" },
                          { value: "evp", label: "Executive Vice President" },
                          { value: "director", label: "Director" },
                          { value: "senior_director", label: "Senior Director" },
                          { value: "senior_manager", label: "Senior Manager" },
                          { value: "manager", label: "Manager" }
                        ].map((level) => {
                          const selectedLevels = apifyFilters.seniorityLevel ? apifyFilters.seniorityLevel.split(',') : [];
                          const isSelected = selectedLevels.includes(level.value);
                          
                          return (
                            <div
                              key={level.value}
                              className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
                                isSelected ? 'bg-emerald-600/30 border border-emerald-400/50' : ''
                              }`}
                              onClick={() => {
                                const currentLevels = apifyFilters.seniorityLevel ? apifyFilters.seniorityLevel.split(',').filter(l => l) : [];
                                let newLevels;
                                
                                if (isSelected) {
                                  newLevels = currentLevels.filter(l => l !== level.value);
                                } else {
                                  newLevels = [...currentLevels, level.value];
                                }
                                
                                setApifyFilters(prev => ({ ...prev, seniorityLevel: newLevels.join(',') }));
                              }}
                            >
                              <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                                isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                              }`}>
                                {isSelected && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-white text-sm">{level.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {apifyFilters.seniorityLevel && apifyFilters.seniorityLevel.split(',').filter(l => l).map((levelValue) => {
                          const levelLabel = [
                            { value: "owner", label: "Business Owner" },
                            { value: "founder", label: "Founder/Co-Founder" },
                            { value: "cxo", label: "C-Level Executive" },
                            { value: "partner", label: "Partner/Principal" },
                            { value: "vp", label: "Vice President" },
                            { value: "svp", label: "Senior Vice President" },
                            { value: "evp", label: "Executive Vice President" },
                            { value: "director", label: "Director" },
                            { value: "senior_director", label: "Senior Director" },
                            { value: "senior_manager", label: "Senior Manager" },
                            { value: "manager", label: "Manager" }
                          ].find(l => l.value === levelValue)?.label || levelValue;
                          
                          return (
                            <Badge
                              key={levelValue}
                              className="bg-emerald-600/20 text-emerald-200 border border-emerald-400/30 px-2 py-1 text-xs cursor-pointer hover:bg-red-600/20 hover:text-red-200 hover:border-red-400/30"
                              onClick={() => {
                                const currentLevels = apifyFilters.seniorityLevel.split(',').filter(l => l);
                                const newLevels = currentLevels.filter(l => l !== levelValue);
                                setApifyFilters(prev => ({ ...prev, seniorityLevel: newLevels.join(',') }));
                              }}
                            >
                              {levelLabel} ×
                            </Badge>
                          );
                        })}
                      </div>
                      <p className="text-sm text-slate-400">Click levels to select, click badges to remove</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Exclude Keywords</Label>
                      <Input
                        placeholder="e.g., closed, temporary, spam, fake"
                        value={apifyFilters.excludeKeywords}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, excludeKeywords: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-2xl font-semibold text-white border-b-2 border-emerald-400/30 pb-4">Quality Controls</h4>
                    
                    <div className="space-y-3">
                      <Label>Minimum Reviews Required</Label>
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
                        <option value="250">250+ reviews (Top tier)</option>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Minimum Rating Threshold</Label>
                      <Select
                        value={apifyFilters.ratingThreshold}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, ratingThreshold: e.target.value }))}
                      >
                        <option value="0">Any rating</option>
                        <option value="3">3+ stars (Basic)</option>
                        <option value="3.5">3.5+ stars (Good)</option>
                        <option value="4">4+ stars (High quality)</option>
                        <option value="4.5">4.5+ stars (Premium)</option>
                        <option value="4.8">4.8+ stars (Elite)</option>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Maximum Listings to Extract</Label>
                      <Select
                        value={apifyFilters.maxListings}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, maxListings: e.target.value }))}
                      >
                        <option value="100">100 listings (Quick scan)</option>
                        <option value="250">250 listings (Standard)</option>
                        <option value="500">500 listings (Comprehensive)</option>
                        <option value="1000">1000 listings (Deep scan)</option>
                        <option value="2500">2500 listings (Enterprise)</option>
                        <option value="5000">5000 listings (Maximum)</option>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Request Delay (Safety)</Label>
                      <Select
                        value={apifyFilters.requestDelay}
                        onChange={(e) => setApifyFilters(prev => ({ ...prev, requestDelay: e.target.value }))}
                      >
                        <option value="1000">1 second (Fast)</option>
                        <option value="2000">2 seconds (Recommended)</option>
                        <option value="3000">3 seconds (Safe)</option>
                        <option value="5000">5 seconds (Conservative)</option>
                        <option value="10000">10 seconds (Maximum safety)</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTool === 'phantombuster' && (
              <div className="space-y-12">
                <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 backdrop-blur-sm p-8 rounded-2xl border border-purple-400/30">
                  <div className="flex items-center mb-4">
                    <Users className="w-8 h-8 text-purple-400 mr-4" />
                    <h3 className="text-2xl font-bold text-white">PhantomBuster Social Intelligence</h3>
                  </div>
                  <p className="text-purple-200 text-lg">Automate LinkedIn outreach and social media engagement with intelligent targeting and safety controls</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h4 className="text-2xl font-semibold text-white border-b-2 border-purple-400/30 pb-4">Social Targeting</h4>
                    
                    <div className="space-y-3">
                      <Label>Social Platform</Label>
                      <Select
                        value={phantombusterFilters.platform}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, platform: e.target.value }))}
                      >
                        <option value="linkedin">LinkedIn (Professional)</option>
                        <option value="linkedin_sales_navigator">LinkedIn Sales Navigator</option>
                        <option value="twitter">Twitter/X (Business)</option>
                        <option value="instagram">Instagram (Business)</option>
                        <option value="facebook">Facebook (Business)</option>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Target Keywords</Label>
                      <Input
                        placeholder="e.g., startup founder, marketing director, SaaS executive"
                        value={phantombusterFilters.keywords}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, keywords: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Connection Degree (LinkedIn)</Label>
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

                    <div className="space-y-3">
                      <Label>Job Titles (Select Multiple)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                        {phantombusterFilters.seniorityLevel?.split(',').filter(title => title).map((titleValue) => {
                          const allTitles = [
                            { value: "ceo", label: "CEO" },
                            { value: "founder", label: "Founder" },
                            { value: "president", label: "President" },
                            { value: "vp", label: "VP" },
                            { value: "director", label: "Director" },
                            { value: "manager", label: "Manager" },
                            { value: "lead", label: "Lead" },
                            { value: "head", label: "Head of" },
                            { value: "chief", label: "Chief" },
                            { value: "senior", label: "Senior" },
                            { value: "principal", label: "Principal" },
                            { value: "specialist", label: "Specialist" },
                            { value: "coordinator", label: "Coordinator" },
                            { value: "analyst", label: "Analyst" },
                            { value: "consultant", label: "Consultant" },
                            { value: "engineer", label: "Engineer" },
                            { value: "developer", label: "Developer" },
                            { value: "architect", label: "Architect" },
                            { value: "designer", label: "Designer" },
                            { value: "strategist", label: "Strategist" }
                          ];
                          
                          const titleLabel = allTitles.find(t => t.value === titleValue)?.label || titleValue;
                          
                          return (
                            <Badge
                              key={titleValue}
                              className="bg-purple-600/20 text-purple-200 border border-purple-400/30 px-2 py-1 text-xs cursor-pointer hover:bg-red-600/20 hover:text-red-200 hover:border-red-400/30"
                              onClick={() => {
                                const currentTitles = phantombusterFilters.seniorityLevel?.split(',').filter(t => t) || [];
                                const newTitles = currentTitles.filter(t => t !== titleValue);
                                setPhantombusterFilters(prev => ({ ...prev, seniorityLevel: newTitles.join(',') }));
                              }}
                            >
                              {titleLabel} ×
                            </Badge>
                          );
                        })}
                      </div>
                      <div className="w-full max-h-[180px] overflow-y-auto px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl">
                        {[
                          { value: "ceo", label: "Chief Executive Officer" },
                          { value: "cto", label: "Chief Technology Officer" },
                          { value: "cfo", label: "Chief Financial Officer" },
                          { value: "cmo", label: "Chief Marketing Officer" },
                          { value: "coo", label: "Chief Operating Officer" },
                          { value: "founder", label: "Founder" },
                          { value: "president", label: "President" },
                          { value: "owner", label: "Business Owner" },
                          { value: "partner", label: "Partner" },
                          { value: "vp_sales", label: "VP of Sales" },
                          { value: "vp_marketing", label: "VP of Marketing" },
                          { value: "vp_operations", label: "VP of Operations" },
                          { value: "director_sales", label: "Director of Sales" },
                          { value: "director_marketing", label: "Director of Marketing" },
                          { value: "sales_manager", label: "Sales Manager" },
                          { value: "marketing_manager", label: "Marketing Manager" },
                          { value: "operations_manager", label: "Operations Manager" },
                          { value: "general_manager", label: "General Manager" },
                          { value: "project_manager", label: "Project Manager" },
                          { value: "account_executive", label: "Account Executive" },
                          { value: "business_development", label: "Business Development Manager" },
                          { value: "product_manager", label: "Product Manager" },
                          { value: "regional_manager", label: "Regional Manager" },
                          { value: "superintendent", label: "Superintendent" },
                          { value: "foreman", label: "Foreman" },
                          { value: "estimator", label: "Estimator" },
                          { value: "service_manager", label: "Service Manager" },
                          { value: "technician", label: "Lead Technician" },
                          { value: "installer", label: "Installer" },
                          { value: "contractor", label: "Contractor" }
                        ].map((title) => {
                          const selectedTitles = phantombusterFilters.seniorityLevel ? phantombusterFilters.seniorityLevel.split(',') : [];
                          const isSelected = selectedTitles.includes(title.value);
                          
                          return (
                            <div
                              key={title.value}
                              className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
                                isSelected ? 'bg-purple-600/30 border border-purple-400/50' : ''
                              }`}
                              onClick={() => {
                                const currentTitles = phantombusterFilters.seniorityLevel ? phantombusterFilters.seniorityLevel.split(',').filter(t => t) : [];
                                let newTitles;
                                
                                if (isSelected) {
                                  newTitles = currentTitles.filter(t => t !== title.value);
                                } else {
                                  newTitles = [...currentTitles, title.value];
                                }
                                
                                setPhantombusterFilters(prev => ({ ...prev, seniorityLevel: newTitles.join(',') }));
                              }}
                            >
                              <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                                isSelected ? 'bg-purple-500 border-purple-500' : 'border-slate-500'
                              }`}>
                                {isSelected && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-white text-sm">{title.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-sm text-slate-400">Click titles to select, click badges to remove</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Connection Message Template</Label>
                      <Input
                        placeholder="Hi [firstName], I'd love to connect and explore [company]..."
                        value={phantombusterFilters.messageTemplate}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, messageTemplate: e.target.value }))}
                      />
                      <p className="text-xs text-slate-400">Use [firstName] and [company] for personalization</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-2xl font-semibold text-white border-b-2 border-violet-400/30 pb-4">Professional Filters</h4>
                    
                    <div className="space-y-3">
                      <Label>Department/Function (Select Multiple)</Label>
                      <select
                        multiple
                        value={phantombusterFilters.department ? phantombusterFilters.department.split(',') : []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value).join(',');
                          setPhantombusterFilters(prev => ({ ...prev, department: selected }));
                        }}
                        className="w-full min-h-[150px] px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
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
                        <option value="legal">Legal & Compliance</option>
                        <option value="procurement">Procurement & Supply Chain</option>
                        <option value="quality_assurance">Quality Assurance</option>
                        <option value="research_development">Research & Development</option>
                        <option value="training">Training & Development</option>
                      </select>
                      <p className="text-sm text-slate-400">Hold Ctrl/Cmd to select multiple departments</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Industry Focus (Select Multiple)</Label>
                      <select
                        multiple
                        value={phantombusterFilters.industry ? phantombusterFilters.industry.split(',') : []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value).join(',');
                          setPhantombusterFilters(prev => ({ ...prev, industry: selected }));
                        }}
                        className="w-full min-h-[250px] px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <optgroup label="🧰 Trades & Services">
                          <option value="hvac">HVAC</option>
                          <option value="plumbing">Plumbing</option>
                          <option value="electrical">Electrical</option>
                          <option value="roofing">Roofing</option>
                          <option value="landscaping">Landscaping</option>
                          <option value="general_contracting">General Contracting</option>
                          <option value="pest_control">Pest Control</option>
                          <option value="pool_services">Pool Services</option>
                          <option value="cleaning_services">Cleaning Services</option>
                          <option value="appliance_repair">Appliance Repair</option>
                        </optgroup>
                        <optgroup label="🏥 Medical & Wellness">
                          <option value="chiropractors">Chiropractors</option>
                          <option value="dentists">Dentists</option>
                          <option value="physical_therapists">Physical Therapists</option>
                          <option value="mental_health_clinics">Mental Health Clinics</option>
                          <option value="medspas">MedSpas</option>
                          <option value="primary_care">Primary Care</option>
                          <option value="dermatologists">Dermatologists</option>
                          <option value="holistic_health">Holistic Health</option>
                          <option value="weight_loss_clinics">Weight Loss Clinics</option>
                        </optgroup>
                        <optgroup label="💼 Professional Services">
                          <option value="law_firms">Law Firms</option>
                          <option value="accountants_cpas">Accountants / CPAs</option>
                          <option value="insurance_agencies">Insurance Agencies</option>
                          <option value="real_estate_brokers">Real Estate Brokers</option>
                          <option value="mortgage_lenders">Mortgage Lenders</option>
                          <option value="financial_advisors">Financial Advisors</option>
                          <option value="business_consultants">Business Consultants</option>
                        </optgroup>
                        <optgroup label="🛍️ Local Retail & Consumer">
                          <option value="auto_dealerships">Auto Dealerships</option>
                          <option value="furniture_stores">Furniture Stores</option>
                          <option value="jewelry_stores">Jewelry Stores</option>
                          <option value="boutiques">Boutiques</option>
                          <option value="vape_shops">Vape Shops</option>
                          <option value="gun_shops">Gun Shops</option>
                          <option value="nutrition_supplement_stores">Nutrition & Supplement Stores</option>
                        </optgroup>
                        <optgroup label="🧑‍🎓 Education & Training">
                          <option value="tutoring_centers">Tutoring Centers</option>
                          <option value="test_prep">Test Prep</option>
                          <option value="trade_schools">Trade Schools</option>
                          <option value="driving_schools">Driving Schools</option>
                          <option value="online_course_creators">Online Course Creators</option>
                          <option value="coaching_businesses">Coaching Businesses</option>
                        </optgroup>
                        <optgroup label="🖥️ Tech, SaaS & Digital">
                          <option value="saas_startups">SaaS Startups</option>
                          <option value="marketing_agencies">Marketing Agencies</option>
                          <option value="web_design_firms">Web Design Firms</option>
                          <option value="it_support_msps">IT Support & MSPs</option>
                          <option value="ecommerce_brands">eCommerce Brands</option>
                          <option value="cybersecurity_consultants">Cybersecurity Consultants</option>
                          <option value="data_analytics_firms">Data & Analytics Firms</option>
                        </optgroup>
                        <optgroup label="🧰 Home & Commercial Services">
                          <option value="garage_door_companies">Garage Door Companies</option>
                          <option value="flooring_installers">Flooring Installers</option>
                          <option value="window_tinting">Window Tinting</option>
                          <option value="solar_installers">Solar Installers</option>
                          <option value="security_system_installers">Security System Installers</option>
                          <option value="commercial_janitorial">Commercial Janitorial</option>
                          <option value="pressure_washing">Pressure Washing</option>
                        </optgroup>
                        <optgroup label="🏗️ Construction & Manufacturing">
                          <option value="construction_firms">Construction Firms</option>
                          <option value="fabricators">Fabricators</option>
                          <option value="welders">Welders</option>
                          <option value="machining_cnc">Machining & CNC</option>
                          <option value="custom_metalworks">Custom Metalworks</option>
                          <option value="modular_building">Modular Building</option>
                        </optgroup>
                        <optgroup label="🚚 Transportation & Logistics">
                          <option value="trucking_companies">Trucking Companies</option>
                          <option value="freight_brokers">Freight Brokers</option>
                          <option value="3pl_providers">3PL Providers</option>
                          <option value="moving_companies">Moving Companies</option>
                          <option value="auto_transporters">Auto Transporters</option>
                        </optgroup>
                        <optgroup label="🏦 Financial Services & Lending">
                          <option value="merchant_services">Merchant Services</option>
                          <option value="business_loan_brokers">Business Loan Brokers</option>
                          <option value="credit_repair_firms">Credit Repair Firms</option>
                          <option value="funding_specialists">Funding Specialists</option>
                          <option value="tax_resolution_firms">Tax Resolution Firms</option>
                        </optgroup>
                      </select>
                      <p className="text-sm text-slate-400">Hold Ctrl/Cmd to select multiple industries</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Geographic Location</Label>
                      <Select
                        value={phantombusterFilters.location}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, location: e.target.value }))}
                      >
                        <option value="">All Locations</option>
                        <optgroup label="🌎 National Regions">
                          <option value="united_states">United States</option>
                          <option value="midwest">Midwest</option>
                          <option value="northeast">Northeast</option>
                          <option value="southeast">Southeast</option>
                          <option value="southwest">Southwest</option>
                          <option value="pacific_northwest">Pacific Northwest</option>
                          <option value="southern_california">Southern California</option>
                          <option value="central_texas">Central Texas</option>
                          <option value="gulf_coast">Gulf Coast</option>
                          <option value="mid_atlantic">Mid-Atlantic</option>
                        </optgroup>
                        <optgroup label="🏙️ Major Metro Areas">
                          <option value="new_york_city">New York Metropolitan Area</option>
                          <option value="los_angeles">Greater Los Angeles</option>
                          <option value="chicago">Chicago Metropolitan</option>
                          <option value="san_francisco">San Francisco Bay Area</option>
                          <option value="boston">Boston-Cambridge</option>
                          <option value="seattle">Seattle Metropolitan</option>
                          <option value="atlanta">Atlanta Metropolitan</option>
                          <option value="denver">Denver-Boulder</option>
                          <option value="austin">Austin-Round Rock</option>
                          <option value="minneapolis_st_paul">Minneapolis–St. Paul</option>
                          <option value="st_louis">St. Louis Metro</option>
                          <option value="nashville">Nashville Metro</option>
                          <option value="phoenix">Phoenix Metro</option>
                          <option value="las_vegas">Las Vegas Metro</option>
                          <option value="tampa_bay">Tampa Bay Metro</option>
                          <option value="orlando">Orlando Metro</option>
                          <option value="charlotte">Charlotte Metro</option>
                          <option value="indianapolis">Indianapolis Metro</option>
                          <option value="cincinnati">Cincinnati Metro</option>
                          <option value="raleigh_durham">Raleigh–Durham</option>
                          <option value="salt_lake_city">Salt Lake City</option>
                          <option value="oklahoma_city">Oklahoma City</option>
                          <option value="kansas_city">Kansas City Metro</option>
                          <option value="san_antonio">San Antonio Metro</option>
                          <option value="pittsburgh">Pittsburgh Metro</option>
                          <option value="columbus">Columbus Metro</option>
                        </optgroup>
                        <optgroup label="🏛️ State-Level">
                          <option value="california">California</option>
                          <option value="new_york">New York</option>
                          <option value="texas">Texas</option>
                          <option value="florida">Florida</option>
                          <option value="illinois">Illinois</option>
                          <option value="massachusetts">Massachusetts</option>
                          <option value="washington">Washington</option>
                          <option value="colorado">Colorado</option>
                          <option value="georgia">Georgia</option>
                          <option value="north_carolina">North Carolina</option>
                          <option value="virginia">Virginia</option>
                          <option value="arizona">Arizona</option>
                          <option value="nevada">Nevada</option>
                          <option value="utah">Utah</option>
                          <option value="tennessee">Tennessee</option>
                          <option value="ohio">Ohio</option>
                          <option value="pennsylvania">Pennsylvania</option>
                          <option value="michigan">Michigan</option>
                          <option value="minnesota">Minnesota</option>
                          <option value="missouri">Missouri</option>
                        </optgroup>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>ZIP Code Targeting (Optional)</Label>
                      <Input
                        placeholder="85260, 85032, 85018"
                        value={phantombusterFilters.zipCodes || ''}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, zipCodes: e.target.value }))}
                      />
                      <p className="text-xs text-slate-400">Enter ZIP code(s) to hyper-target local businesses. Use commas to separate multiple codes.</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Company Size</Label>
                      <Select
                        value={phantombusterFilters.companySize}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, companySize: e.target.value }))}
                      >
                        <option value="">All Company Sizes</option>
                        <option value="1-10">1-10 employees (Startup)</option>
                        <option value="11-50">11-50 employees (Small Business)</option>
                        <option value="51-200">51-200 employees (Mid-Market)</option>
                        <option value="201-500">201-500 employees (Enterprise)</option>
                        <option value="501-1000">501-1000 employees (Large Enterprise)</option>
                        <option value="1000+">1000+ employees (Fortune 500)</option>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Daily Connection Limit</Label>
                      <Select
                        value={phantombusterFilters.dailyLimit}
                        onChange={(e) => setPhantombusterFilters(prev => ({ ...prev, dailyLimit: e.target.value }))}
                      >
                        <option value="20">20 per day (Ultra Conservative)</option>
                        <option value="50">50 per day (Conservative)</option>
                        <option value="100">100 per day (Recommended)</option>
                        <option value="150">150 per day (Aggressive)</option>
                        <option value="200">200 per day (Maximum)</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-12">
              <CustomButton onClick={handleStartScraping} disabled={isLoading} className="text-lg px-12 py-4">
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                    Processing Intelligence...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-3" />
                    Launch Intelligence Extraction
                  </>
                )}
              </CustomButton>
            </div>
          </CustomCard>
        </div>
      </div>
    );
  }

  // Results Step - Enterprise Design
  if (currentStep === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-8 mb-12">
            <CustomButton 
              variant="outline" 
              onClick={resetToToolSelection}
              className="text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              New Intelligence Search
            </CustomButton>
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
                  Successfully extracted {results.count} enterprise leads
                </span>
                <p className="text-green-300 mt-1">Notification sent to Slack • Data ready for export</p>
              </div>
            </div>
          </div>

          <CustomCard className="p-12">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-semibold text-white">
                Premium Lead Intelligence Preview
              </h3>
              <CustomButton variant="outline" className="text-lg">
                <Download className="w-5 h-5 mr-3" />
                Export Enterprise CSV
              </CustomButton>
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
          </CustomCard>
        </div>
      </div>
    );
  }

  return null;
}