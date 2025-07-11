import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { HelpCircle, Users, Building2, Settings, Save, Search, Rocket, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useIndustryTemplates } from "@/hooks/useIndustryTemplates";

interface ApolloFilters {
  jobTitles: string[];
  seniorityLevel: string;
  department: string;
  location: string[];
  emailVerified: boolean;
  phoneAvailable: boolean;
  industry: string[];
  companySize: string;
  fundingStage: string;
  revenueRange: string;
  technologies: string[];
  excludeDomains: string;
  dataFreshness: string;
  recordLimit: number;
}

interface ApolloScraperPanelProps {
  onLaunch: (filters: ApolloFilters) => void;
  isLoading?: boolean;
}

export default function ApolloScraperPanel({ onLaunch, isLoading = false }: ApolloScraperPanelProps) {
  const { toast } = useToast();
  const { industries, isLoading: industriesLoading } = useIndustryTemplates();
  // Test mode removed - live mode only
  const [estimatedLeads, setEstimatedLeads] = useState(0);
  
  const [filters, setFilters] = useState<ApolloFilters>({
    jobTitles: [],
    seniorityLevel: "",
    department: "",
    location: [],
    emailVerified: true,
    phoneAvailable: true,
    industry: [],
    companySize: "",
    fundingStage: "",
    revenueRange: "",
    technologies: [],
    excludeDomains: "",
    dataFreshness: "30",
    recordLimit: 1000
  });

  // Comprehensive dropdown options
  const seniorityLevels = [
    "C-Level (CEO, CTO, CFO, CMO, etc.)", 
    "VP (Vice President)", 
    "SVP (Senior Vice President)",
    "EVP (Executive Vice President)", 
    "Director", 
    "Senior Manager", 
    "Manager", 
    "Senior", 
    "Mid-Level", 
    "Junior", 
    "Entry Level", 
    "Intern",
    "Owner",
    "Partner",
    "Head of",
    "Lead"
  ];

  const departments = [
    "Sales", "Marketing", "Engineering", "Product", "Design", "Operations", "Finance", 
    "Human Resources", "Customer Success", "Business Development", "Legal", "IT", 
    "Consulting", "Research", "Administrative", "Executive", "Strategy", "Analytics",
    "Data Science", "Security", "Quality Assurance", "Project Management", "Procurement",
    "Risk Management", "Compliance", "Training", "Facilities", "Communications"
  ];

  const companySizes = [
    "1-10 (Startup)", 
    "11-50 (Small Business)", 
    "51-200 (Growing Company)", 
    "201-500 (Mid-Size)", 
    "501-1000 (Large)", 
    "1001-5000 (Enterprise)", 
    "5001-10000 (Large Enterprise)", 
    "10000+ (Fortune 500)"
  ];

  const fundingStages = [
    "Bootstrapped", "Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Series D+", 
    "IPO", "Acquired", "Private Equity"
  ];

  const revenueRanges = [
    "$0-1M", "$1M-10M", "$10M-50M", "$50M-100M", "$100M-500M", "$500M-1B", "$1B+"
  ];

  const commonTechnologies = [
    "Salesforce", "HubSpot", "React", "JavaScript", "Python", "AWS", "Docker", "Kubernetes",
    "Tableau", "Power BI", "Slack", "Microsoft Office", "Google Workspace", "Zoom",
    "Shopify", "WordPress", "Adobe Creative Suite", "Figma", "Jira", "GitHub"
  ];

  const popularLocations = [
    "United States", "New York, NY", "San Francisco, CA", "Los Angeles, CA", "Chicago, IL",
    "Austin, TX", "Seattle, WA", "Boston, MA", "Denver, CO", "Atlanta, GA", "Miami, FL",
    "United Kingdom", "London, UK", "Canada", "Toronto, ON", "Vancouver, BC", "Germany",
    "Berlin, Germany", "France", "Paris, France", "Australia", "Sydney, Australia"
  ];

  const commonJobTitles = [
    "CEO", "CTO", "VP Sales", "Sales Manager", "Account Executive", "Business Development",
    "Marketing Manager", "Digital Marketing", "Content Manager", "Software Engineer",
    "Product Manager", "Data Scientist", "UX Designer", "Customer Success Manager",
    "Operations Manager", "HR Manager", "Financial Analyst", "Consultant"
  ];

  const [newJobTitle, setNewJobTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newTechnology, setNewTechnology] = useState("");
  const [isTestMode, setIsTestMode] = useState(false);

  const addTag = (field: keyof Pick<ApolloFilters, 'jobTitles' | 'location' | 'industry' | 'technologies'>, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFilters(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter("");
    }
  };

  const removeTag = (field: keyof Pick<ApolloFilters, 'jobTitles' | 'location' | 'industry' | 'technologies'>, index: number) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.jobTitles.length > 0) count++;
    if (filters.seniorityLevel) count++;
    if (filters.department) count++;
    if (filters.location.length > 0) count++;
    if (filters.emailVerified) count++;
    if (filters.phoneAvailable) count++;
    if (filters.industry.length > 0) count++;
    if (filters.companySize) count++;
    if (filters.fundingStage) count++;
    if (filters.revenueRange) count++;
    if (filters.technologies.length > 0) count++;
    if (filters.excludeDomains) count++;
    return count;
  };

  const calculateEstimatedLeads = () => {
    // Live mode only - no test data generation
    let baseCount = 10000;
    
    if (filters.jobTitles.length > 0) baseCount *= 0.7;
    if (filters.seniorityLevel) baseCount *= 0.8;
    if (filters.department) baseCount *= 0.6;
    if (filters.location.length > 0) baseCount *= 0.5;
    if (filters.emailVerified) baseCount *= 0.4;
    if (filters.phoneAvailable) baseCount *= 0.3;
    if (filters.industry.length > 0) baseCount *= 0.6;
    if (filters.companySize) baseCount *= 0.7;
    if (filters.fundingStage) baseCount *= 0.5;
    if (filters.revenueRange) baseCount *= 0.6;
    if (filters.technologies.length > 0) baseCount *= 0.4;
    
    return Math.max(50, Math.floor(baseCount));
  };

  useEffect(() => {
    setEstimatedLeads(calculateEstimatedLeads());
  }, [filters]);

  const handleLaunchScraper = async () => {
    try {
      const estimated = calculateEstimatedLeads();
      
      // Test mode removed - live scraping only

      const response = await apiRequest("POST", "/api/launch-scrape", {
        tool: "apollo",
        filters: filters
      });

      if (response.ok) {
        toast({
          title: "Apollo Scraper Launched",
          description: `Successfully initiated scraping for ${estimated} estimated leads`,
        });
        onLaunch(filters);
      } else {
        throw new Error("Failed to launch scraper");
      }
    } catch (error) {
      toast({
        title: "Launch Failed",
        description: "Failed to launch Apollo scraper. Please try again.",
        variant: "destructive"
      });
    }
  };

  const savePreset = async () => {
    try {
      await apiRequest("POST", "/api/save-scraper-preset", {
        tool: "apollo",
        name: `Apollo Preset ${new Date().toLocaleDateString()}`,
        filters: filters
      });
      
      toast({
        title: "Preset Saved",
        description: "Apollo scraper configuration has been saved",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save preset. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-indigo-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl">
        
        {/* Test Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600/50">
          <div className="flex items-center space-x-3">
            <Label htmlFor="test-mode" className="text-blue-200 font-medium">Test Company Mode</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle between fake test data (instant) vs real Apollo scraping</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="test-mode"
            checked={isTestMode}
            onCheckedChange={setIsTestMode}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>

        {/* Contact Filters Section */}
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-300">
              <Users className="h-5 w-5" />
              Contact Filters
            </CardTitle>
            <CardDescription className="text-slate-400">
              Target specific professionals and contact requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Job Titles */}
              <div className="space-y-2">
                <Label className="text-slate-200">Job Titles</Label>
                <Select onValueChange={(value) => addTag('jobTitles', value, () => {})}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select common job titles" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
                    {commonJobTitles.map((title) => (
                      <SelectItem 
                        key={title} 
                        value={title}
                        className="text-slate-200 hover:bg-slate-600"
                      >
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Or enter custom job title"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag('jobTitles', newJobTitle, setNewJobTitle)}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                  <Button
                    size="sm"
                    onClick={() => addTag('jobTitles', newJobTitle, setNewJobTitle)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {filters.jobTitles.map((title, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-200">
                      {title}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => removeTag('jobTitles', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Seniority Level */}
              <div className="space-y-2">
                <Label className="text-slate-200">Seniority Level</Label>
                <Select value={filters.seniorityLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, seniorityLevel: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select seniority level" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {seniorityLevels.map((level) => (
                      <SelectItem 
                        key={level} 
                        value={level}
                        className="text-slate-200 hover:bg-slate-600"
                      >
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label className="text-slate-200">Department</Label>
                <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
                    {departments.map((dept) => (
                      <SelectItem 
                        key={dept} 
                        value={dept}
                        className="text-slate-200 hover:bg-slate-600"
                      >
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-slate-200">Location</Label>
                <Select onValueChange={(value) => addTag('location', value, () => {})}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select popular locations" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
                    {popularLocations.map((location) => (
                      <SelectItem 
                        key={location} 
                        value={location}
                        className="text-slate-200 hover:bg-slate-600"
                      >
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Or enter custom location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag('location', newLocation, setNewLocation)}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                  <Button
                    size="sm"
                    onClick={() => addTag('location', newLocation, setNewLocation)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {filters.location.map((loc, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-200">
                      {loc}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => removeTag('location', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Quality Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-600/50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-verified"
                  checked={filters.emailVerified}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, emailVerified: !!checked }))}
                  className="border-slate-500"
                />
                <Label htmlFor="email-verified" className="text-slate-200">Email Verified</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phone-available"
                  checked={filters.phoneAvailable}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, phoneAvailable: !!checked }))}
                  className="border-slate-500"
                />
                <Label htmlFor="phone-available" className="text-slate-200">Phone Number Available</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Filters Section */}
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-300">
              <Building2 className="h-5 w-5" />
              Company Filters
            </CardTitle>
            <CardDescription className="text-slate-400">
              Target companies by industry, size, and characteristics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Industry */}
              <div className="space-y-2">
                <Label className="text-slate-200">Industry</Label>
                <div className="flex gap-2">
                  <Select value={newIndustry} onValueChange={setNewIndustry}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                      <SelectValue placeholder="Select industry to add" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {industriesLoading ? (
                        <SelectItem value="loading" disabled>Loading industries...</SelectItem>
                      ) : (
                        industries.map((industry) => (
                          <SelectItem 
                            key={industry.id} 
                            value={industry.name}
                            className="text-slate-200 hover:bg-slate-600"
                          >
                            {industry.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => addTag('industry', newIndustry, setNewIndustry)}
                    disabled={!newIndustry || industriesLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {filters.industry.map((ind, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-200">
                      {ind}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => removeTag('industry', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label className="text-slate-200">Company Size</Label>
                <Select value={filters.companySize} onValueChange={(value) => setFilters(prev => ({ ...prev, companySize: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {companySizes.map((size) => (
                      <SelectItem 
                        key={size} 
                        value={size}
                        className="text-slate-200 hover:bg-slate-600"
                      >
                        {size} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Funding Stage */}
              <div className="space-y-2">
                <Label className="text-slate-200">Funding Stage</Label>
                <Select value={filters.fundingStage} onValueChange={(value) => setFilters(prev => ({ ...prev, fundingStage: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select funding stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {fundingStages.map((stage) => (
                      <SelectItem 
                        key={stage} 
                        value={stage}
                        className="text-slate-200 hover:bg-slate-600"
                      >
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Revenue Range */}
              <div className="space-y-2">
                <Label className="text-slate-200">Revenue Range</Label>
                <Select value={filters.revenueRange} onValueChange={(value) => setFilters(prev => ({ ...prev, revenueRange: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {revenueRanges.map((range) => (
                      <SelectItem 
                        key={range} 
                        value={range}
                        className="text-slate-200 hover:bg-slate-600"
                      >
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <Label className="text-slate-200">Technologies Used</Label>
                <Select onValueChange={(value) => addTag('technologies', value, () => {})}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select technologies" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
                    {commonTechnologies.map((tech) => (
                      <SelectItem 
                        key={tech} 
                        value={tech}
                        className="text-slate-200 hover:bg-slate-600"
                      >
                        {tech}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Or enter custom technology"
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag('technologies', newTechnology, setNewTechnology)}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                  <Button
                    size="sm"
                    onClick={() => addTag('technologies', newTechnology, setNewTechnology)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {filters.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-200">
                      {tech}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => removeTag('technologies', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Exclude Domains */}
            <div className="space-y-2">
              <Label className="text-slate-200">Exclude Domains/Companies</Label>
              <Input
                placeholder="e.g., competitor1.com, competitor2.com"
                value={filters.excludeDomains}
                onChange={(e) => setFilters(prev => ({ ...prev, excludeDomains: e.target.value }))}
                className="bg-slate-700/50 border-slate-600 text-slate-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Scraping Settings Section */}
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-300">
              <Settings className="h-5 w-5" />
              Scraping Settings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure scraping parameters and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <div className="space-y-1">
                <div className="font-medium text-slate-200">
                  {isTestMode ? "Test Company Mode" : "YoBot Live Mode"}
                </div>
                <div className="text-sm text-slate-400">
                  {isTestMode 
                    ? "Uses sample data for testing - no real scraping performed" 
                    : "Live scraping with real Apollo.io data"
                  }
                </div>
              </div>
              <Switch
                checked={isTestMode}
                onCheckedChange={setIsTestMode}
                className="data-[state=checked]:bg-yellow-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Data Freshness */}
              <div className="space-y-2">
                <Label className="text-slate-200">Data Freshness (days)</Label>
                <Select value={filters.dataFreshness} onValueChange={(value) => setFilters(prev => ({ ...prev, dataFreshness: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select data age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Record Limit */}
              <div className="space-y-2">
                <Label className="text-slate-200">Record Limit</Label>
                <Input
                  type="number"
                  min="1"
                  max="10000"
                  value={filters.recordLimit}
                  onChange={(e) => setFilters(prev => ({ ...prev, recordLimit: parseInt(e.target.value) || 1000 }))}
                  className="bg-slate-700/50 border-slate-600 text-slate-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-slate-900/90 backdrop-blur-xl p-4 rounded-lg border border-slate-600/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-blue-300 border-blue-300">
              {getFilterCount()} filters applied
            </Badge>
            <div className="text-sm text-slate-300">
              Estimated leads: <span className="font-semibold text-blue-300">{estimatedLeads.toLocaleString()}</span>
            </div>
            {isTestMode && (
              <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-300">
                Test Mode
              </Badge>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={savePreset}
              className="text-white border transition-all duration-200 hover:shadow-[0_0_8px_rgba(13,130,218,0.5)]"
              style={{ 
                backgroundColor: '#0d82da',
                borderColor: '#0d82da'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0864b1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0d82da';
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={handleLaunchScraper}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Rocket className="h-4 w-4 mr-2" />
              {isLoading ? "Launching..." : "Launch Apollo Scraper"}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}