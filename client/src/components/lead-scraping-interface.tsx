import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Download, 
  Settings, 
  Filter, 
  MapPin, 
  Building, 
  Users, 
  Mail, 
  Phone,
  Globe,
  Target,
  Clock,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface LeadScrapingProps {
  onScrapingStart?: () => void;
  onScrapingComplete?: (results: any) => void;
}

export function LeadScrapingInterface({ onScrapingStart, onScrapingComplete }: LeadScrapingProps) {
  const [selectedTool, setSelectedTool] = useState<'phantombuster' | 'apify' | 'apollo'>('phantombuster');
  const [scrapingConfig, setScrapingConfig] = useState({
    // PhantomBuster config
    phantombuster: {
      data_source: 'LinkedIn Sales Navigator',
      search_query: '',
      location: '',
      industries: [] as string[],
      company_sizes: [] as string[],
      job_titles: [] as string[],
      connections: [] as string[],
      profile_language: [] as string[],
      years_experience: [] as string[],
      current_role: [],
      max_results: 100,
      phantom_id: '',
      session_cookie: ''
    },
    // Apify config
    apify: {
      data_source: 'LinkedIn Company Scraper',
      search_terms: '',
      locations: [] as string[],
      industries: [] as string[],
      company_filters: [] as string[],
      job_levels: [] as string[],
      business_types: [] as string[],
      rating_filter: [] as string[],
      price_range: [] as string[],
      max_profiles: 50,
      actor_id: 'apify/linkedin-company-scraper'
    },
    // Apollo config
    apollo: {
      data_sources: [] as string[],
      company_name: '',
      domain: '',
      industries: [] as string[],
      locations: [] as string[],
      employee_ranges: [] as string[],
      job_titles: [] as string[],
      email_verification: false,
      phone_verification: false,
      max_contacts: 25
    }
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const { toast } = useToast();

  // PhantomBuster scraping mutation
  const phantombusterMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await apiRequest('POST', '/api/phantombuster/scrape', config);
      return response.json();
    },
    onSuccess: (data) => {
      handleScrapingComplete(data);
    },
    onError: (error) => {
      toast({
        title: "PhantomBuster Error",
        description: "Failed to start PhantomBuster scraping. Please check your API credentials.",
        variant: "destructive"
      });
      setIsRunning(false);
    }
  });

  // Apify scraping mutation
  const apifyMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await apiRequest('POST', '/api/apify/scrape', config);
      return response.json();
    },
    onSuccess: (data) => {
      handleScrapingComplete(data);
    },
    onError: (error) => {
      toast({
        title: "Apify Error", 
        description: "Failed to start Apify scraping. Please check your API credentials.",
        variant: "destructive"
      });
      setIsRunning(false);
    }
  });

  // Apollo scraping mutation
  const apolloMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await apiRequest('POST', '/api/apollo/scrape', config);
      return response.json();
    },
    onSuccess: (data) => {
      handleScrapingComplete(data);
    },
    onError: (error) => {
      toast({
        title: "Apollo Error",
        description: "Failed to start Apollo scraping. Please check your API credentials.", 
        variant: "destructive"
      });
      setIsRunning(false);
    }
  });

  const handleScrapingComplete = (data: any) => {
    setResults(data.results || []);
    setProgress(100);
    setCurrentStatus('Complete');
    setIsRunning(false);
    
    toast({
      title: "Scraping Complete",
      description: `Found ${data.results?.length || 0} leads`
    });
    
    if (onScrapingComplete) {
      onScrapingComplete(data);
    }
  };

  const startScraping = () => {
    const config = scrapingConfig[selectedTool];
    
    setIsRunning(true);
    setProgress(0);
    setCurrentStatus('Starting...');
    setResults([]);
    
    if (onScrapingStart) {
      onScrapingStart();
    }

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 1000);

    // Start the appropriate scraping tool
    switch (selectedTool) {
      case 'phantombuster':
        setCurrentStatus('Running PhantomBuster...');
        phantombusterMutation.mutate(config);
        break;
      case 'apify':
        setCurrentStatus('Running Apify actor...');
        apifyMutation.mutate(config);
        break;
      case 'apollo':
        setCurrentStatus('Searching Apollo.io...');
        apolloMutation.mutate(config);
        break;
    }
  };

  const updateConfig = (tool: string, field: string, value: string | string[]) => {
    setScrapingConfig(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const toggleArrayValue = (tool: string, field: string, value: string) => {
    setScrapingConfig(prev => {
      const currentArray = prev[tool as keyof typeof prev][field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [tool]: {
          ...prev[tool as keyof typeof prev],
          [field]: newArray
        }
      };
    });
  };

  // Filter options for each platform (matching their actual websites)
  const filterOptions = {
    // PhantomBuster data sources
    phantomSources: [
      'LinkedIn Sales Navigator', 'LinkedIn Company Pages', 'LinkedIn People Search',
      'Google Maps', 'Yellow Pages', 'Indeed', 'Facebook Pages', 'Instagram',
      'Twitter/X', 'TikTok', 'YouTube', 'Glassdoor', 'AngelList', 'Crunchbase'
    ],
    
    // Apify data sources  
    apifySources: [
      'LinkedIn Company Scraper', 'LinkedIn People Scraper', 'Google Maps Scraper',
      'Instagram Scraper', 'Facebook Pages Scraper', 'Amazon Scraper',
      'Indeed Job Scraper', 'Twitter Scraper', 'YouTube Scraper', 'Yelp Scraper',
      'Real Estate Scraper', 'E-commerce Scraper', 'News Scraper'
    ],

    // Apollo data sources
    apolloSources: [
      'LinkedIn Database', 'Company Websites', 'Public Records', 'Social Media',
      'Email Verification', 'Phone Verification', 'CRM Enrichment'
    ],

    industries: [
      'Accounting', 'Airlines/Aviation', 'Alternative Medicine', 'Animation',
      'Apparel & Fashion', 'Architecture & Planning', 'Arts & Crafts', 'Automotive',
      'Banking', 'Biotechnology', 'Broadcast Media', 'Building Materials',
      'Business Supplies & Equipment', 'Capital Markets', 'Chemicals', 'Civic & Social Organization',
      'Civil Engineering', 'Commercial Real Estate', 'Computer & Network Security', 'Computer Games',
      'Computer Hardware', 'Computer Networking', 'Computer Software', 'Construction',
      'Consumer Electronics', 'Consumer Goods', 'Consumer Services', 'Cosmetics',
      'Dairy', 'Defense & Space', 'Design', 'E-Learning',
      'Education Management', 'Electrical/Electronic Manufacturing', 'Entertainment', 'Environmental Services',
      'Events Services', 'Executive Office', 'Facilities Services', 'Farming',
      'Financial Services', 'Fine Art', 'Fishery', 'Food & Beverages',
      'Food Production', 'Fund-Raising', 'Furniture', 'Gambling & Casinos',
      'Glass/Ceramics/Concrete', 'Government Administration', 'Government Relations', 'Graphic Design',
      'Health/Wellness/Fitness', 'Higher Education', 'Hospital & Health Care', 'Hospitality',
      'Human Resources', 'Import & Export', 'Individual & Family Services', 'Industrial Automation',
      'Information Services', 'Information Technology & Services', 'Insurance', 'International Affairs',
      'Internet', 'Investment Banking', 'Investment Management', 'Judiciary',
      'Law Enforcement', 'Law Practice', 'Legal Services', 'Leisure/Travel/Tourism',
      'Libraries', 'Logistics & Supply Chain', 'Luxury Goods & Jewelry', 'Machinery',
      'Management Consulting', 'Maritime', 'Market Research', 'Marketing & Advertising',
      'Mechanical/Industrial Engineering', 'Media Production', 'Medical Devices', 'Medical Practice',
      'Mental Health Care', 'Military', 'Mining & Metals', 'Motion Pictures & Film',
      'Museums & Institutions', 'Music', 'Nanotechnology', 'Newspapers',
      'Non-Profit Organization Management', 'Oil & Energy', 'Online Media', 'Outsourcing/Offshoring',
      'Package/Freight Delivery', 'Packaging & Containers', 'Paper & Forest Products', 'Performing Arts',
      'Pharmaceuticals', 'Philanthropy', 'Photography', 'Plastics',
      'Political Organization', 'Primary/Secondary Education', 'Printing', 'Professional Training & Coaching',
      'Program Development', 'Public Policy', 'Public Relations & Communications', 'Public Safety',
      'Publishing', 'Railroad Manufacture', 'Ranching', 'Real Estate',
      'Recreational Facilities & Services', 'Religious Institutions', 'Renewables & Environment', 'Research',
      'Restaurants', 'Retail', 'Security & Investigations', 'Semiconductors',
      'Shipbuilding', 'Sporting Goods', 'Sports', 'Staffing & Recruiting',
      'Supermarkets', 'Telecommunications', 'Textiles', 'Think Tanks',
      'Tobacco', 'Translation & Localization', 'Transportation/Trucking/Railroad', 'Utilities',
      'Venture Capital & Private Equity', 'Veterinary', 'Warehousing', 'Wholesale',
      'Wine & Spirits', 'Wireless', 'Writing & Editing'
    ],

    companySizes: [
      'Self-employed', '1-10 employees', '11-50 employees', '51-200 employees', 
      '201-500 employees', '501-1000 employees', '1001-5000 employees',
      '5001-10000 employees', '10001+ employees'
    ],

    jobTitles: [
      'C-Suite (CEO, CTO, CFO, COO)', 'President', 'Vice President', 'SVP', 'EVP',
      'Director', 'Senior Director', 'Managing Director', 'General Manager',
      'Manager', 'Senior Manager', 'Team Lead', 'Senior', 'Lead',
      'Principal', 'Staff', 'Specialist', 'Coordinator', 'Analyst',
      'Associate', 'Assistant', 'Intern', 'Founder', 'Co-founder', 'Owner',
      'Partner', 'Head of', 'Chief', 'Developer', 'Engineer', 'Architect',
      'Designer', 'Consultant', 'Advisor', 'Representative', 'Account Executive'
    ],

    locations: [
      'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
      'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'India',
      'Singapore', 'Japan', 'South Korea', 'Brazil', 'Mexico', 'Argentina',
      'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
      'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
      'Austin, TX', 'Jacksonville, FL', 'San Francisco, CA', 'Indianapolis, IN', 'Columbus, OH',
      'Fort Worth, TX', 'Charlotte, NC', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
      'Boston, MA', 'Nashville, TN', 'Oklahoma City, OK', 'Las Vegas, NV', 'Portland, OR',
      'Detroit, MI', 'Louisville, KY', 'Memphis, TN', 'Baltimore, MD', 'Milwaukee, WI'
    ],

    employeeRanges: [
      '1', '2-10', '11-50', '51-200', '201-500', '501-1000', 
      '1001-5000', '5001-10000', '10001+'
    ],

    jobLevels: [
      'Internship', 'Entry level', 'Associate', 'Mid-Senior level', 
      'Director', 'Executive', 'Senior Executive'
    ],

    // LinkedIn specific filters
    linkedinFilters: {
      connections: ['1st connections', '2nd connections', '3rd+ connections'],
      profileLanguage: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Chinese'],
      yearsOfExperience: ['0-1 years', '2-5 years', '6-10 years', '11-15 years', '16-20 years', '20+ years'],
      currentRole: ['Current role', 'Past role', 'Any role'],
      schoolAttended: ['Any school', 'Top universities', 'Community colleges'],
      fieldOfStudy: ['Business', 'Engineering', 'Computer Science', 'Marketing', 'Finance', 'Other']
    },

    // Google Maps specific filters
    googleMapsFilters: {
      businessType: ['Restaurant', 'Retail Store', 'Service Business', 'Healthcare', 'Professional Services'],
      rating: ['4+ stars', '3+ stars', 'Any rating'],
      priceRange: ['$', '$$', '$$$', '$$$$', 'Any price'],
      openStatus: ['Open now', 'Open 24 hours', 'Any hours'],
      distance: ['Within 1 mile', 'Within 5 miles', 'Within 10 miles', 'Within 25 miles', 'Any distance']
    }
  };

  const renderPhantomBusterConfig = () => (
    <div className="space-y-6">
      {/* Data Source Selection */}
      <div>
        <Label className="text-base font-medium mb-3 block">Data Source</Label>
        <Select value={scrapingConfig.phantombuster.data_source} onValueChange={(value) => updateConfig('phantombuster', 'data_source', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.phantomSources.map((source) => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pb-search">Search Query</Label>
          <Input
            id="pb-search"
            value={scrapingConfig.phantombuster.search_query}
            onChange={(e) => updateConfig('phantombuster', 'search_query', e.target.value)}
            placeholder="e.g., CEO OR Founder OR CTO"
          />
        </div>
        <div>
          <Label htmlFor="pb-location">Primary Location</Label>
          <Input
            id="pb-location"
            value={scrapingConfig.phantombuster.location}
            onChange={(e) => updateConfig('phantombuster', 'location', e.target.value)}
            placeholder="e.g., New York, NY"
          />
        </div>
      </div>

      {/* Industries Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Industries ({scrapingConfig.phantombuster.industries.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
          {filterOptions.industries.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`pb-industry-${industry}`}
                checked={scrapingConfig.phantombuster.industries.includes(industry)}
                onCheckedChange={() => toggleArrayValue('phantombuster', 'industries', industry)}
              />
              <Label htmlFor={`pb-industry-${industry}`} className="text-xs">{industry}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Company Sizes Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Company Sizes ({scrapingConfig.phantombuster.company_sizes.length} selected)</Label>
        <div className="grid grid-cols-3 gap-2">
          {filterOptions.companySizes.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`pb-size-${size}`}
                checked={scrapingConfig.phantombuster.company_sizes.includes(size)}
                onCheckedChange={() => toggleArrayValue('phantombuster', 'company_sizes', size)}
              />
              <Label htmlFor={`pb-size-${size}`} className="text-sm">{size}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Job Titles Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Job Titles ({scrapingConfig.phantombuster.job_titles.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
          {filterOptions.jobTitles.map((title) => (
            <div key={title} className="flex items-center space-x-2">
              <Checkbox
                id={`pb-title-${title}`}
                checked={scrapingConfig.phantombuster.job_titles.includes(title)}
                onCheckedChange={() => toggleArrayValue('phantombuster', 'job_titles', title)}
              />
              <Label htmlFor={`pb-title-${title}`} className="text-xs">{title}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* LinkedIn Specific Filters */}
      {scrapingConfig.phantombuster.data_source.includes('LinkedIn') && (
        <>
          {/* Connection Level */}
          <div>
            <Label className="text-base font-medium mb-3 block">Connection Level ({scrapingConfig.phantombuster.connections.length} selected)</Label>
            <div className="grid grid-cols-3 gap-2">
              {filterOptions.linkedinFilters.connections.map((connection) => (
                <div key={connection} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pb-connection-${connection}`}
                    checked={scrapingConfig.phantombuster.connections.includes(connection)}
                    onCheckedChange={() => toggleArrayValue('phantombuster', 'connections', connection)}
                  />
                  <Label htmlFor={`pb-connection-${connection}`} className="text-sm">{connection}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Language */}
          <div>
            <Label className="text-base font-medium mb-3 block">Profile Language ({scrapingConfig.phantombuster.profile_language.length} selected)</Label>
            <div className="grid grid-cols-4 gap-2">
              {filterOptions.linkedinFilters.profileLanguage.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pb-language-${language}`}
                    checked={scrapingConfig.phantombuster.profile_language.includes(language)}
                    onCheckedChange={() => toggleArrayValue('phantombuster', 'profile_language', language)}
                  />
                  <Label htmlFor={`pb-language-${language}`} className="text-sm">{language}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Years of Experience */}
          <div>
            <Label className="text-base font-medium mb-3 block">Years of Experience ({scrapingConfig.phantombuster.years_experience.length} selected)</Label>
            <div className="grid grid-cols-3 gap-2">
              {filterOptions.linkedinFilters.yearsOfExperience.map((years) => (
                <div key={years} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pb-experience-${years}`}
                    checked={scrapingConfig.phantombuster.years_experience.includes(years)}
                    onCheckedChange={() => toggleArrayValue('phantombuster', 'years_experience', years)}
                  />
                  <Label htmlFor={`pb-experience-${years}`} className="text-sm">{years}</Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Google Maps Specific Filters */}
      {scrapingConfig.phantombuster.data_source === 'Google Maps' && (
        <>
          <div>
            <Label className="text-base font-medium mb-3 block">Business Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {filterOptions.googleMapsFilters.businessType.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pb-business-${type}`}
                    checked={scrapingConfig.phantombuster.business_types?.includes(type)}
                    onCheckedChange={() => toggleArrayValue('phantombuster', 'business_types', type)}
                  />
                  <Label htmlFor={`pb-business-${type}`} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Rating Filter</Label>
            <div className="grid grid-cols-3 gap-2">
              {filterOptions.googleMapsFilters.rating.map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pb-rating-${rating}`}
                    checked={scrapingConfig.phantombuster.rating_filter?.includes(rating)}
                    onCheckedChange={() => toggleArrayValue('phantombuster', 'rating_filter', rating)}
                  />
                  <Label htmlFor={`pb-rating-${rating}`} className="text-sm">{rating}</Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pb-max-results">Max Results</Label>
          <Input
            id="pb-max-results"
            type="number"
            value={scrapingConfig.phantombuster.max_results}
            onChange={(e) => updateConfig('phantombuster', 'max_results', e.target.value)}
            min="1"
            max="1000"
          />
        </div>
        <div>
          <Label htmlFor="pb-phantom-id">Phantom ID</Label>
          <Input
            id="pb-phantom-id"
            value={scrapingConfig.phantombuster.phantom_id}
            onChange={(e) => updateConfig('phantombuster', 'phantom_id', e.target.value)}
            placeholder="Your PhantomBuster Phantom ID"
          />
        </div>
      </div>
    </div>
  );

  const renderApifyConfig = () => (
    <div className="space-y-6">
      {/* Data Source Selection */}
      <div>
        <Label className="text-base font-medium mb-3 block">Apify Actor/Data Source</Label>
        <Select value={scrapingConfig.apify.data_source} onValueChange={(value) => updateConfig('apify', 'data_source', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.apifySources.map((source) => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="apify-search">Search Terms</Label>
          <Input
            id="apify-search"
            value={scrapingConfig.apify.search_terms}
            onChange={(e) => updateConfig('apify', 'search_terms', e.target.value)}
            placeholder="e.g., software engineer, data scientist"
          />
        </div>
        <div>
          <Label htmlFor="apify-max-profiles">Max Results</Label>
          <Input
            id="apify-max-profiles"
            type="number"
            value={scrapingConfig.apify.max_profiles}
            onChange={(e) => updateConfig('apify', 'max_profiles', e.target.value)}
            min="1"
            max="2000"
          />
        </div>
      </div>

      {/* Locations Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Locations ({scrapingConfig.apify.locations.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
          {filterOptions.locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={`apify-location-${location}`}
                checked={scrapingConfig.apify.locations.includes(location)}
                onCheckedChange={() => toggleArrayValue('apify', 'locations', location)}
              />
              <Label htmlFor={`apify-location-${location}`} className="text-xs">{location}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Industries Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Industries ({scrapingConfig.apify.industries.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
          {filterOptions.industries.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`apify-industry-${industry}`}
                checked={scrapingConfig.apify.industries.includes(industry)}
                onCheckedChange={() => toggleArrayValue('apify', 'industries', industry)}
              />
              <Label htmlFor={`apify-industry-${industry}`} className="text-xs">{industry}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Job Levels Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Job Levels ({scrapingConfig.apify.job_levels.length} selected)</Label>
        <div className="grid grid-cols-3 gap-2">
          {filterOptions.jobLevels.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`apify-level-${level}`}
                checked={scrapingConfig.apify.job_levels.includes(level)}
                onCheckedChange={() => toggleArrayValue('apify', 'job_levels', level)}
              />
              <Label htmlFor={`apify-level-${level}`} className="text-sm">{level}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Google Maps Specific Filters */}
      {scrapingConfig.apify.data_source === 'Google Maps Scraper' && (
        <>
          <div>
            <Label className="text-base font-medium mb-3 block">Business Types ({scrapingConfig.apify.business_types.length} selected)</Label>
            <div className="grid grid-cols-3 gap-2">
              {filterOptions.googleMapsFilters.businessType.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`apify-business-${type}`}
                    checked={scrapingConfig.apify.business_types.includes(type)}
                    onCheckedChange={() => toggleArrayValue('apify', 'business_types', type)}
                  />
                  <Label htmlFor={`apify-business-${type}`} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Rating Filter ({scrapingConfig.apify.rating_filter.length} selected)</Label>
            <div className="grid grid-cols-3 gap-2">
              {filterOptions.googleMapsFilters.rating.map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`apify-rating-${rating}`}
                    checked={scrapingConfig.apify.rating_filter.includes(rating)}
                    onCheckedChange={() => toggleArrayValue('apify', 'rating_filter', rating)}
                  />
                  <Label htmlFor={`apify-rating-${rating}`} className="text-sm">{rating}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Price Range ({scrapingConfig.apify.price_range.length} selected)</Label>
            <div className="grid grid-cols-4 gap-2">
              {filterOptions.googleMapsFilters.priceRange.map((price) => (
                <div key={price} className="flex items-center space-x-2">
                  <Checkbox
                    id={`apify-price-${price}`}
                    checked={scrapingConfig.apify.price_range.includes(price)}
                    onCheckedChange={() => toggleArrayValue('apify', 'price_range', price)}
                  />
                  <Label htmlFor={`apify-price-${price}`} className="text-sm">{price}</Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Company Filters */}
      <div>
        <Label htmlFor="apify-company">Company Keywords (comma-separated)</Label>
        <Input
          id="apify-company"
          value={scrapingConfig.apify.company_filters.join(', ')}
          onChange={(e) => updateConfig('apify', 'company_filters', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="e.g., Google, Microsoft, Amazon, Apple"
        />
      </div>
    </div>
  );

  const renderApolloConfig = () => (
    <div className="space-y-6">
      {/* Data Sources Selection */}
      <div>
        <Label className="text-base font-medium mb-3 block">Data Sources ({scrapingConfig.apollo.data_sources.length} selected)</Label>
        <div className="grid grid-cols-3 gap-2">
          {filterOptions.apolloSources.map((source) => (
            <div key={source} className="flex items-center space-x-2">
              <Checkbox
                id={`apollo-source-${source}`}
                checked={scrapingConfig.apollo.data_sources.includes(source)}
                onCheckedChange={() => toggleArrayValue('apollo', 'data_sources', source)}
              />
              <Label htmlFor={`apollo-source-${source}`} className="text-sm">{source}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="apollo-company">Company Name</Label>
          <Input
            id="apollo-company"
            value={scrapingConfig.apollo.company_name}
            onChange={(e) => updateConfig('apollo', 'company_name', e.target.value)}
            placeholder="e.g., Salesforce"
          />
        </div>
        <div>
          <Label htmlFor="apollo-domain">Domain</Label>
          <Input
            id="apollo-domain"
            value={scrapingConfig.apollo.domain}
            onChange={(e) => updateConfig('apollo', 'domain', e.target.value)}
            placeholder="e.g., salesforce.com"
          />
        </div>
      </div>

      {/* Industries Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Industries ({scrapingConfig.apollo.industries.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
          {filterOptions.industries.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`apollo-industry-${industry}`}
                checked={scrapingConfig.apollo.industries.includes(industry)}
                onCheckedChange={() => toggleArrayValue('apollo', 'industries', industry)}
              />
              <Label htmlFor={`apollo-industry-${industry}`} className="text-xs">{industry}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Locations Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Locations ({scrapingConfig.apollo.locations.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
          {filterOptions.locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={`apollo-location-${location}`}
                checked={scrapingConfig.apollo.locations.includes(location)}
                onCheckedChange={() => toggleArrayValue('apollo', 'locations', location)}
              />
              <Label htmlFor={`apollo-location-${location}`} className="text-xs">{location}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Ranges Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Employee Ranges ({scrapingConfig.apollo.employee_ranges.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2">
          {filterOptions.employeeRanges.map((range) => (
            <div key={range} className="flex items-center space-x-2">
              <Checkbox
                id={`apollo-range-${range}`}
                checked={scrapingConfig.apollo.employee_ranges.includes(range)}
                onCheckedChange={() => toggleArrayValue('apollo', 'employee_ranges', range)}
              />
              <Label htmlFor={`apollo-range-${range}`} className="text-sm">{range}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Job Titles Filter */}
      <div>
        <Label className="text-base font-medium mb-3 block">Job Titles ({scrapingConfig.apollo.job_titles.length} selected)</Label>
        <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
          {filterOptions.jobTitles.map((title) => (
            <div key={title} className="flex items-center space-x-2">
              <Checkbox
                id={`apollo-title-${title}`}
                checked={scrapingConfig.apollo.job_titles.includes(title)}
                onCheckedChange={() => toggleArrayValue('apollo', 'job_titles', title)}
              />
              <Label htmlFor={`apollo-title-${title}`} className="text-xs">{title}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Options */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="apollo-email-verification"
            checked={scrapingConfig.apollo.email_verification}
            onCheckedChange={(checked) => updateConfig('apollo', 'email_verification', checked as boolean)}
          />
          <Label htmlFor="apollo-email-verification" className="text-sm">Email Verification</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="apollo-phone-verification"
            checked={scrapingConfig.apollo.phone_verification}
            onCheckedChange={(checked) => updateConfig('apollo', 'phone_verification', checked as boolean)}
          />
          <Label htmlFor="apollo-phone-verification" className="text-sm">Phone Verification</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="apollo-max-contacts">Max Contacts</Label>
        <Input
          id="apollo-max-contacts"
          type="number"
          value={scrapingConfig.apollo.max_contacts}
          onChange={(e) => updateConfig('apollo', 'max_contacts', e.target.value)}
          min="1"
          max="1000"
        />
      </div>
    </div>
  );

  const renderResults = () => (
    <ScrollArea className="h-96">
      <div className="space-y-2">
        {results.map((lead, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{lead.name || 'N/A'}</span>
                  <Badge variant="outline">{lead.title || 'Unknown Title'}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {lead.company && (
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {lead.company}
                    </div>
                  )}
                  {lead.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {lead.location}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {lead.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lead.email}
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </div>
                  )}
                </div>
              </div>
              <Badge variant={lead.verified ? "default" : "secondary"}>
                {lead.verified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Lead Scraping Interface
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tool Selection */}
        <div>
          <Label>Scraping Tool</Label>
          <Tabs value={selectedTool} onValueChange={(value) => setSelectedTool(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="phantombuster">PhantomBuster</TabsTrigger>
              <TabsTrigger value="apify">Apify</TabsTrigger>
              <TabsTrigger value="apollo">Apollo.io</TabsTrigger>
            </TabsList>
            
            <TabsContent value="phantombuster" className="mt-4">
              {renderPhantomBusterConfig()}
            </TabsContent>
            
            <TabsContent value="apify" className="mt-4">
              {renderApifyConfig()}
            </TabsContent>
            
            <TabsContent value="apollo" className="mt-4">
              {renderApolloConfig()}
            </TabsContent>
          </Tabs>
        </div>

        {/* Progress and Status */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{currentStatus}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={startScraping}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Lead Scrape
              </>
            )}
          </Button>
          
          {results.length > 0 && (
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export ({results.length})
            </Button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <Label>Results ({results.length} leads found)</Label>
            {renderResults()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}