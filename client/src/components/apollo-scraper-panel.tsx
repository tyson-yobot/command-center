import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Users, Building2, Settings, Save, Search, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [filters, setFilters] = useState<ApolloFilters>({
    jobTitles: [],
    seniorityLevel: "",
    department: "",
    location: [],
    emailVerified: true,
    phoneAvailable: false,
    industry: [],
    companySize: "",
    fundingStage: "",
    revenueRange: "",
    technologies: [],
    excludeDomains: "",
    dataFreshness: "30",
    recordLimit: 1000
  });

  const [newJobTitle, setNewJobTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newTechnology, setNewTechnology] = useState("");

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

  const handleLaunch = () => {
    onLaunch(filters);
  };

  const savePreset = () => {
    localStorage.setItem('apollo-filters', JSON.stringify(filters));
    toast({
      title: "Filter preset saved",
      description: "Your Apollo filter configuration has been saved.",
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        
        {/* Contact Filters Section */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Users className="h-5 w-5" />
              Contact Filters
            </CardTitle>
            <CardDescription>Filter by contact characteristics and information</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Job Titles */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="jobTitles">Job Titles</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Add multiple job titles to target specific roles</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Input
                  id="jobTitles"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g., CEO, Marketing Director"
                  onKeyPress={(e) => e.key === 'Enter' && addTag('jobTitles', newJobTitle, setNewJobTitle)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => addTag('jobTitles', newJobTitle, setNewJobTitle)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.jobTitles.map((title, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {title}
                    <button 
                      onClick={() => removeTag('jobTitles', index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Seniority Level */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Seniority Level</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Filter by professional experience level</TooltipContent>
                </Tooltip>
              </div>
              <Select value={filters.seniorityLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, seniorityLevel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select seniority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="vp">VP Level</SelectItem>
                  <SelectItem value="c-level">C-Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="location">Location</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Add cities, states, or zip codes</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  onKeyPress={(e) => e.key === 'Enter' && addTag('location', newLocation, setNewLocation)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => addTag('location', newLocation, setNewLocation)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.location.map((loc, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {loc}
                    <button 
                      onClick={() => removeTag('location', index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Email/Phone Checkboxes */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="emailVerified" 
                  checked={filters.emailVerified}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, emailVerified: !!checked }))}
                />
                <Label htmlFor="emailVerified">Email Verified Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="phoneAvailable" 
                  checked={filters.phoneAvailable}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, phoneAvailable: !!checked }))}
                />
                <Label htmlFor="phoneAvailable">Phone Number Available</Label>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Company Filters Section */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Building2 className="h-5 w-5" />
              Company Filters
            </CardTitle>
            <CardDescription>Filter by company characteristics and firmographics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Industry */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="industry">Industry</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Target specific industry verticals</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Input
                  id="industry"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="e.g., SaaS, Healthcare"
                  onKeyPress={(e) => e.key === 'Enter' && addTag('industry', newIndustry, setNewIndustry)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => addTag('industry', newIndustry, setNewIndustry)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.industry.map((ind, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {ind}
                    <button 
                      onClick={() => removeTag('industry', index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <Label>Company Size</Label>
              <Select value={filters.companySize} onValueChange={(value) => setFilters(prev => ({ ...prev, companySize: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1001+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Funding Stage */}
            <div className="space-y-2">
              <Label>Funding Stage</Label>
              <Select value={filters.fundingStage} onValueChange={(value) => setFilters(prev => ({ ...prev, fundingStage: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select funding stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="series-a">Series A</SelectItem>
                  <SelectItem value="series-b">Series B</SelectItem>
                  <SelectItem value="series-c">Series C+</SelectItem>
                  <SelectItem value="ipo">IPO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Revenue Range */}
            <div className="space-y-2">
              <Label>Revenue Range</Label>
              <Select value={filters.revenueRange} onValueChange={(value) => setFilters(prev => ({ ...prev, revenueRange: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1m">$0 - $1M</SelectItem>
                  <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                  <SelectItem value="10m-100m">$10M - $100M</SelectItem>
                  <SelectItem value="100m-1b">$100M - $1B</SelectItem>
                  <SelectItem value="1b+">$1B+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Technologies */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="technologies">Technologies Used</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Target companies using specific tools</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Input
                  id="technologies"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  placeholder="e.g., Salesforce, HubSpot, AWS"
                  onKeyPress={(e) => e.key === 'Enter' && addTag('technologies', newTechnology, setNewTechnology)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => addTag('technologies', newTechnology, setNewTechnology)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.technologies.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {tech}
                    <button 
                      onClick={() => removeTag('technologies', index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Exclude Domains */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="excludeDomains">Exclude Domains/Companies</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Exclude specific companies or domains</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="excludeDomains"
                value={filters.excludeDomains}
                onChange={(e) => setFilters(prev => ({ ...prev, excludeDomains: e.target.value }))}
                placeholder="e.g., competitor.com, unwanted-company.com"
              />
            </div>

          </CardContent>
        </Card>

        {/* Scraping Settings Section */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Settings className="h-5 w-5" />
              Scraping Settings
            </CardTitle>
            <CardDescription>Configure data collection parameters</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Data Freshness */}
            <div className="space-y-2">
              <Label>Data Freshness</Label>
              <Select value={filters.dataFreshness} onValueChange={(value) => setFilters(prev => ({ ...prev, dataFreshness: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data freshness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Record Limit */}
            <div className="space-y-2">
              <Label htmlFor="recordLimit">Record Limit</Label>
              <Input
                id="recordLimit"
                type="number"
                value={filters.recordLimit}
                onChange={(e) => setFilters(prev => ({ ...prev, recordLimit: parseInt(e.target.value) || 1000 }))}
                min="1"
                max="10000"
              />
            </div>

          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-blue-200 dark:border-blue-800 p-4 rounded-b-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {getFilterCount()} filters applied
            </Badge>
            <span className="text-sm text-gray-500">Est. leads: ~{Math.max(50, 500 - getFilterCount() * 50)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={savePreset} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Preset
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Estimate Leads
            </Button>
            <Button 
              onClick={handleLaunch} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Rocket className="h-4 w-4" />
              {isLoading ? "Launching..." : "Launch Apollo Scraper"}
            </Button>
          </div>
        </div>

      </div>
    </TooltipProvider>
  );
}