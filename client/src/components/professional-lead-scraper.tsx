import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Play, 
  Pause, 
  Settings, 
  Target,
  Building,
  Users,
  MapPin,
  Star,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  Briefcase,
  User,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  FileDown,
  Save,
  Plus,
  Minus
} from "lucide-react";

// Inline UI components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, disabled = false, className = "", variant = "default", size = "default" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: string;
  size?: string;
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const sizeClass = size === "sm" ? "h-8 px-3 text-xs" : size === "lg" ? "h-12 px-8" : "h-10 px-4 py-2";
  const variantClass = variant === "outline" ? "border border-input hover:bg-accent hover:text-accent-foreground" : 
                       variant === "secondary" ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" :
                       variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" :
                       "bg-primary text-primary-foreground hover:bg-primary/90";
  
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
    className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Select = ({ value, onChange, children, className = "" }: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </select>
);

const Badge = ({ children, className = "", variant = "default" }: { 
  children: React.ReactNode; 
  className?: string;
  variant?: string;
}) => {
  const variantClass = variant === "secondary" ? "bg-secondary text-secondary-foreground" :
                       variant === "destructive" ? "bg-destructive text-destructive-foreground" :
                       variant === "outline" ? "border border-input" :
                       "bg-primary text-primary-foreground";
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClass} ${className}`}>
      {children}
    </div>
  );
};

const Checkbox = ({ checked, onChange, label, className = "" }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border border-input"
    />
    {label && <label className="text-sm">{label}</label>}
  </div>
);

const Tabs = ({ value, onValueChange, children, className = "" }: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    {React.Children.map(children, child => 
      React.isValidElement(child) ? React.cloneElement(child as any, { activeTab: value, onTabChange: onValueChange }) : child
    )}
  </div>
);

const TabsList = ({ children, activeTab, onTabChange }: {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
    {React.Children.map(children, child => 
      React.isValidElement(child) ? React.cloneElement(child as any, { activeTab, onTabChange }) : child
    )}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, onTabChange }: {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}) => (
  <button
    onClick={() => onTabChange?.(value)}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all ${
      activeTab === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, activeTab }: {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
}) => (
  activeTab === value ? <div className="mt-2">{children}</div> : null
);

interface ApolloFilters {
  personTitles: string[];
  companyKeywords: string[];
  industries: string[];
  companySize: { min: number; max: number };
  locations: string[];
  technologies: string[];
  fundingStage: string[];
  revenue: { min: number; max: number };
  emailStatus: string;
  phoneStatus: string;
}

interface ApifyFilters {
  searchTerms: string[];
  locations: string[];
  categoryIds: string[];
  maxReviews: number;
  minRating: number;
  maxResults: number;
  includeImages: boolean;
  includeReviews: boolean;
  language: string;
}

interface PhantomBusterFilters {
  searchUrls: string[];
  profileFilters: string[];
  connectionDegree: string;
  industries: string[];
  locations: string[];
  companySize: string;
  seniority: string[];
  functions: string[];
  excludePrivate: boolean;
  maxProfiles: number;
}

interface ScrapingResult {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  revenue?: string;
  technologies?: string[];
  source: 'apollo' | 'apify' | 'phantom';
  confidence: number;
  lastUpdated: string;
}

export default function ProfessionalLeadScraper() {
  const [activeEngine, setActiveEngine] = useState<'apollo' | 'apify' | 'phantom'>('apollo');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ScrapingResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  // Apollo.io filters - exact match to their interface
  const [apolloFilters, setApolloFilters] = useState<ApolloFilters>({
    personTitles: [],
    companyKeywords: [],
    industries: [],
    companySize: { min: 1, max: 10000 },
    locations: [],
    technologies: [],
    fundingStage: [],
    revenue: { min: 0, max: 1000000000 },
    emailStatus: 'verified',
    phoneStatus: 'any'
  });

  // Apify filters - exact match to their Google Maps scraper
  const [apifyFilters, setApifyFilters] = useState<ApifyFilters>({
    searchTerms: [],
    locations: [],
    categoryIds: [],
    maxReviews: 100,
    minRating: 0,
    maxResults: 1000,
    includeImages: true,
    includeReviews: true,
    language: 'en'
  });

  // PhantomBuster filters - exact match to their LinkedIn scraper
  const [phantomFilters, setPhantomFilters] = useState<PhantomBusterFilters>({
    searchUrls: [],
    profileFilters: [],
    connectionDegree: '1st',
    industries: [],
    locations: [],
    companySize: 'any',
    seniority: [],
    functions: [],
    excludePrivate: true,
    maxProfiles: 2500
  });

  const apolloIndustries = [
    'Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail',
    'Real Estate', 'Education', 'Government', 'Non-Profit', 'Media & Entertainment',
    'Transportation', 'Energy', 'Telecommunications', 'Construction', 'Hospitality',
    'Professional Services', 'Insurance', 'Automotive', 'Aerospace', 'Agriculture'
  ];

  const apolloTechnologies = [
    'Salesforce', 'HubSpot', 'Microsoft Office 365', 'Google Workspace', 'Slack',
    'Zoom', 'AWS', 'Microsoft Azure', 'Shopify', 'WordPress', 'Mailchimp',
    'Stripe', 'PayPal', 'QuickBooks', 'Zendesk', 'Intercom', 'Docker', 'MongoDB'
  ];

  const apolloFundingStages = [
    'Bootstrapped', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C',
    'Series D+', 'IPO', 'Acquired', 'Private Equity'
  ];

  const linkedinSeniorities = [
    'Intern', 'Entry', 'Associate', 'Mid-Senior', 'Director', 'Executive',
    'Senior', 'Manager', 'Vice President', 'C-Level', 'Owner', 'Partner'
  ];

  const linkedinFunctions = [
    'Accounting', 'Administrative', 'Arts and Design', 'Business Development',
    'Community & Social Services', 'Consulting', 'Education', 'Engineering',
    'Entrepreneurship', 'Finance', 'Healthcare Services', 'Human Resources',
    'Information Technology', 'Legal', 'Marketing', 'Media & Communications',
    'Military & Protective Services', 'Operations', 'Product Management',
    'Program and Project Management', 'Purchasing', 'Quality Assurance',
    'Real Estate', 'Research', 'Sales', 'Support'
  ];

  const handleStartScraping = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    try {
      let endpoint = '';
      let payload = {};

      switch (activeEngine) {
        case 'apollo':
          endpoint = '/api/scraping/apollo';
          payload = {
            filters: apolloFilters,
            maxResults: 1000
          };
          break;
        case 'apify':
          endpoint = '/api/scraping/apify';
          payload = {
            filters: apifyFilters,
            maxResults: apifyFilters.maxResults
          };
          break;
        case 'phantom':
          endpoint = '/api/scraping/phantom';
          payload = {
            filters: phantomFilters,
            maxResults: phantomFilters.maxProfiles
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
        setTotalResults(data.leads.length);
        setProgress(100);
      }
    } catch (error) {
      console.error('Scraping error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportResults = () => {
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
    a.download = `leads_${activeEngine}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Professional Lead Scraper</h1>
          <p className="text-blue-200">Apollo.io • Apify • PhantomBuster Integration</p>
        </div>

        {/* Engine Selection */}
        <Card className="mb-6 bg-slate-800/50 border-blue-500/30">
          <CardContent className="p-6">
            <Tabs value={activeEngine} onValueChange={(value) => setActiveEngine(value as any)}>
              <TabsList>
                <TabsTrigger value="apollo">
                  <Target className="h-4 w-4 mr-2" />
                  Apollo.io
                </TabsTrigger>
                <TabsTrigger value="apify">
                  <Globe className="h-4 w-4 mr-2" />
                  Apify
                </TabsTrigger>
                <TabsTrigger value="phantom">
                  <Users className="h-4 w-4 mr-2" />
                  PhantomBuster
                </TabsTrigger>
              </TabsList>

              {/* Apollo.io Interface */}
              <TabsContent value="apollo">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Person Criteria</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Person Titles</label>
                      <Input
                        placeholder="CEO, CTO, Marketing Manager..."
                        value={apolloFilters.personTitles.join(', ')}
                        onChange={(e) => setApolloFilters({
                          ...apolloFilters,
                          personTitles: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Email Status</label>
                      <Select
                        value={apolloFilters.emailStatus}
                        onChange={(value) => setApolloFilters({ ...apolloFilters, emailStatus: value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="any">Any Email</option>
                        <option value="verified">Verified Email</option>
                        <option value="likely">Likely Email</option>
                        <option value="none">No Email</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Phone Status</label>
                      <Select
                        value={apolloFilters.phoneStatus}
                        onChange={(value) => setApolloFilters({ ...apolloFilters, phoneStatus: value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="any">Any Phone</option>
                        <option value="verified">Verified Phone</option>
                        <option value="likely">Likely Phone</option>
                        <option value="none">No Phone</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Company Criteria</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Company Keywords</label>
                      <Input
                        placeholder="Software, SaaS, Startup..."
                        value={apolloFilters.companyKeywords.join(', ')}
                        onChange={(e) => setApolloFilters({
                          ...apolloFilters,
                          companyKeywords: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Industries</label>
                      <Select
                        value={apolloFilters.industries[0] || ''}
                        onChange={(value) => setApolloFilters({
                          ...apolloFilters,
                          industries: value ? [value] : []
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="">Select Industry</option>
                        {apolloIndustries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Company Size</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={apolloFilters.companySize.min.toString()}
                          onChange={(e) => setApolloFilters({
                            ...apolloFilters,
                            companySize: { ...apolloFilters.companySize, min: parseInt(e.target.value) || 1 }
                          })}
                          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={apolloFilters.companySize.max.toString()}
                          onChange={(e) => setApolloFilters({
                            ...apolloFilters,
                            companySize: { ...apolloFilters.companySize, max: parseInt(e.target.value) || 10000 }
                          })}
                          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Technologies</label>
                      <Select
                        value={apolloFilters.technologies[0] || ''}
                        onChange={(value) => setApolloFilters({
                          ...apolloFilters,
                          technologies: value ? [value] : []
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="">Select Technology</option>
                        {apolloTechnologies.map(tech => (
                          <option key={tech} value={tech}>{tech}</option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Location & Revenue</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Locations</label>
                      <Input
                        placeholder="United States, California, San Francisco..."
                        value={apolloFilters.locations.join(', ')}
                        onChange={(e) => setApolloFilters({
                          ...apolloFilters,
                          locations: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Funding Stage</label>
                      <Select
                        value={apolloFilters.fundingStage[0] || ''}
                        onChange={(value) => setApolloFilters({
                          ...apolloFilters,
                          fundingStage: value ? [value] : []
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="">Select Funding Stage</option>
                        {apolloFundingStages.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Annual Revenue Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min Revenue"
                          value={apolloFilters.revenue.min.toString()}
                          onChange={(e) => setApolloFilters({
                            ...apolloFilters,
                            revenue: { ...apolloFilters.revenue, min: parseInt(e.target.value) || 0 }
                          })}
                          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        />
                        <Input
                          type="number"
                          placeholder="Max Revenue"
                          value={apolloFilters.revenue.max.toString()}
                          onChange={(e) => setApolloFilters({
                            ...apolloFilters,
                            revenue: { ...apolloFilters.revenue, max: parseInt(e.target.value) || 1000000000 }
                          })}
                          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Apify Interface */}
              <TabsContent value="apify">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Search Parameters</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Search Terms</label>
                      <Input
                        placeholder="restaurant, hotel, dentist..."
                        value={apifyFilters.searchTerms.join(', ')}
                        onChange={(e) => setApifyFilters({
                          ...apifyFilters,
                          searchTerms: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Locations</label>
                      <Input
                        placeholder="New York, NY, USA"
                        value={apifyFilters.locations.join(', ')}
                        onChange={(e) => setApifyFilters({
                          ...apifyFilters,
                          locations: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Language</label>
                      <Select
                        value={apifyFilters.language}
                        onChange={(value) => setApifyFilters({ ...apifyFilters, language: value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Filters & Limits</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Max Results</label>
                      <Input
                        type="number"
                        value={apifyFilters.maxResults.toString()}
                        onChange={(e) => setApifyFilters({
                          ...apifyFilters,
                          maxResults: parseInt(e.target.value) || 1000
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Minimum Rating</label>
                      <Select
                        value={apifyFilters.minRating.toString()}
                        onChange={(value) => setApifyFilters({
                          ...apifyFilters,
                          minRating: parseFloat(value)
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="0">Any Rating</option>
                        <option value="1">1+ Stars</option>
                        <option value="2">2+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Checkbox
                        checked={apifyFilters.includeImages}
                        onChange={(checked) => setApifyFilters({ ...apifyFilters, includeImages: checked })}
                        label="Include Images"
                        className="text-slate-300"
                      />
                      <Checkbox
                        checked={apifyFilters.includeReviews}
                        onChange={(checked) => setApifyFilters({ ...apifyFilters, includeReviews: checked })}
                        label="Include Reviews"
                        className="text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* PhantomBuster Interface */}
              <TabsContent value="phantom">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">LinkedIn Search</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Search URLs</label>
                      <Input
                        placeholder="LinkedIn search URLs..."
                        value={phantomFilters.searchUrls.join(', ')}
                        onChange={(e) => setPhantomFilters({
                          ...phantomFilters,
                          searchUrls: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Connection Degree</label>
                      <Select
                        value={phantomFilters.connectionDegree}
                        onChange={(value) => setPhantomFilters({ ...phantomFilters, connectionDegree: value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="1st">1st Connections</option>
                        <option value="2nd">2nd Connections</option>
                        <option value="3rd">3rd+ Connections</option>
                        <option value="all">All Connections</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Max Profiles</label>
                      <Input
                        type="number"
                        value={phantomFilters.maxProfiles.toString()}
                        onChange={(e) => setPhantomFilters({
                          ...phantomFilters,
                          maxProfiles: parseInt(e.target.value) || 2500
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Professional Criteria</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Industries</label>
                      <Select
                        value={phantomFilters.industries[0] || ''}
                        onChange={(value) => setPhantomFilters({
                          ...phantomFilters,
                          industries: value ? [value] : []
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="">Select Industry</option>
                        {apolloIndustries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Seniority Level</label>
                      <Select
                        value={phantomFilters.seniority[0] || ''}
                        onChange={(value) => setPhantomFilters({
                          ...phantomFilters,
                          seniority: value ? [value] : []
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="">Select Seniority</option>
                        {linkedinSeniorities.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Function</label>
                      <Select
                        value={phantomFilters.functions[0] || ''}
                        onChange={(value) => setPhantomFilters({
                          ...phantomFilters,
                          functions: value ? [value] : []
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="">Select Function</option>
                        {linkedinFunctions.map(func => (
                          <option key={func} value={func}>{func}</option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Company & Location</h3>
                    
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Locations</label>
                      <Input
                        placeholder="United States, Europe..."
                        value={phantomFilters.locations.join(', ')}
                        onChange={(e) => setPhantomFilters({
                          ...phantomFilters,
                          locations: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Company Size</label>
                      <Select
                        value={phantomFilters.companySize}
                        onChange={(value) => setPhantomFilters({ ...phantomFilters, companySize: value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      >
                        <option value="any">Any Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1001-5000">1001-5000 employees</option>
                        <option value="5001+">5001+ employees</option>
                      </Select>
                    </div>

                    <div>
                      <Checkbox
                        checked={phantomFilters.excludePrivate}
                        onChange={(checked) => setPhantomFilters({ ...phantomFilters, excludePrivate: checked })}
                        label="Exclude Private Profiles"
                        className="text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-600">
              <Button
                onClick={handleStartScraping}
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Scraping
                  </>
                )}
              </Button>

              {results.length > 0 && (
                <Button
                  onClick={handleExportResults}
                  variant="outline"
                  className="text-blue-400 border-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export ({results.length} leads)
                </Button>
              )}

              <div className="ml-auto text-slate-300">
                <span className="text-sm">
                  {totalResults > 0 && `${totalResults} results found`}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {isRunning && (
              <div className="mt-4">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Display */}
        {results.length > 0 && (
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">Scraping Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.slice(0, 50).map((lead, index) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedResults.includes(lead.id)}
                        onChange={(checked) => {
                          if (checked) {
                            setSelectedResults([...selectedResults, lead.id]);
                          } else {
                            setSelectedResults(selectedResults.filter(id => id !== lead.id));
                          }
                        }}
                      />
                      <div>
                        <h3 className="font-medium text-white">{lead.name}</h3>
                        <p className="text-sm text-slate-400">
                          {lead.title} at {lead.company}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
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
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {lead.source}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(lead.confidence)}% match
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {results.length > 50 && (
                  <div className="text-center py-4">
                    <p className="text-slate-400">
                      Showing 50 of {results.length} results. Export to view all.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}