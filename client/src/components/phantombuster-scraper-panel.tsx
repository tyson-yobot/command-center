import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Users, Building2, Settings, Save, Search, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhantomBusterFilters {
  platform: string;
  keywords: string;
  connectionDegree: string;
  seniorityLevel: string;
  department: string;
  industry: string;
  companySize: string;
  location: string[];
  useApi: string;
  dailyConnectionLimit: number;
  autoConnect: boolean;
  messageTemplate: string;
  retryAttempts: number;
}

interface PhantomBusterScraperPanelProps {
  onLaunch: (filters: PhantomBusterFilters) => void;
  isLoading?: boolean;
}

export default function PhantomBusterScraperPanel({ onLaunch, isLoading = false }: PhantomBusterScraperPanelProps) {
  const { toast } = useToast();
  const [filters, setFilters] = useState<PhantomBusterFilters>({
    platform: "linkedin",
    keywords: "",
    connectionDegree: "2nd",
    seniorityLevel: "",
    department: "",
    industry: "",
    companySize: "",
    location: [],
    useApi: "api",
    dailyConnectionLimit: 100,
    autoConnect: false,
    messageTemplate: "Hi {firstName}, I'd love to connect with you based on your experience at {company}.",
    retryAttempts: 3
  });

  const [newLocation, setNewLocation] = useState("");

  const addLocation = () => {
    if (newLocation.trim()) {
      setFilters(prev => ({
        ...prev,
        location: [...prev.location, newLocation.trim()]
      }));
      setNewLocation("");
    }
  };

  const removeLocation = (index: number) => {
    setFilters(prev => ({
      ...prev,
      location: prev.location.filter((_, i) => i !== index)
    }));
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.keywords) count++;
    if (filters.connectionDegree !== "2nd") count++;
    if (filters.seniorityLevel) count++;
    if (filters.department) count++;
    if (filters.industry) count++;
    if (filters.companySize) count++;
    if (filters.location.length > 0) count++;
    if (filters.autoConnect) count++;
    return count;
  };

  const handleLaunch = () => {
    onLaunch(filters);
  };

  const savePreset = () => {
    localStorage.setItem('phantombuster-filters', JSON.stringify(filters));
    toast({
      title: "Filter preset saved",
      description: "Your PhantomBuster filter configuration has been saved.",
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        
        {/* Contact Filters Section */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Users className="h-5 w-5" />
              Contact Filters
            </CardTitle>
            <CardDescription>Target specific professionals and contact characteristics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Platform */}
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={filters.platform} onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Search for profiles containing these terms</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="keywords"
                value={filters.keywords}
                onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="e.g., founder, marketing, CEO"
              />
            </div>

            {/* Connection Degree */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Connection Degree</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>How far from your network to search</TooltipContent>
                </Tooltip>
              </div>
              <Select value={filters.connectionDegree} onValueChange={(value) => setFilters(prev => ({ ...prev, connectionDegree: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connection degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st connections</SelectItem>
                  <SelectItem value="2nd">2nd connections</SelectItem>
                  <SelectItem value="3rd">3rd+ connections</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Seniority Level */}
            <div className="space-y-2">
              <Label>Seniority Level</Label>
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
              <Label>Department/Function</Label>
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
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </CardContent>
        </Card>

        {/* Company Filters Section */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Building2 className="h-5 w-5" />
              Company Filters
            </CardTitle>
            <CardDescription>Filter by company characteristics and location</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Industry */}
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="media">Media & Entertainment</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Location */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="location">Location</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Add multiple locations to target</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., San Francisco Bay Area"
                  onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addLocation}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.location.map((loc, index) => (
                  <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                    {loc}
                    <button 
                      onClick={() => removeLocation(index)}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Execution Settings Section */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Settings className="h-5 w-5" />
              Execution Settings
            </CardTitle>
            <CardDescription>Configure automation behavior and connection settings</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Use API or Phantom */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Execution Method</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>API is faster, Phantom is more human-like</TooltipContent>
                </Tooltip>
              </div>
              <Select value={filters.useApi} onValueChange={(value) => setFilters(prev => ({ ...prev, useApi: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select execution method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">Use API</SelectItem>
                  <SelectItem value="phantom">Use Phantom Browser</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Daily Connection Limit */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="dailyConnectionLimit">Daily Connection Limit</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>LinkedIn recommends max 100 connections per day</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="dailyConnectionLimit"
                type="number"
                value={filters.dailyConnectionLimit}
                onChange={(e) => setFilters(prev => ({ ...prev, dailyConnectionLimit: parseInt(e.target.value) || 100 }))}
                min="1"
                max="200"
              />
            </div>

            {/* Retry Attempts */}
            <div className="space-y-2">
              <Label htmlFor="retryAttempts">Retry Attempts</Label>
              <Input
                id="retryAttempts"
                type="number"
                value={filters.retryAttempts}
                onChange={(e) => setFilters(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) || 3 }))}
                min="1"
                max="10"
              />
            </div>

            {/* Auto-connect checkbox */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="autoConnect" 
                  checked={filters.autoConnect}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, autoConnect: !!checked }))}
                />
                <Label htmlFor="autoConnect">Auto-connect With Message</Label>
              </div>
            </div>

            {/* Message Template */}
            {filters.autoConnect && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="messageTemplate">Message Template</Label>
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                    <TooltipContent>Use {firstName}, {lastName}, {company} tokens</TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="messageTemplate"
                  value={filters.messageTemplate}
                  onChange={(e) => setFilters(prev => ({ ...prev, messageTemplate: e.target.value }))}
                  placeholder="Hi {firstName}, I'd love to connect with you based on your experience at {company}."
                  rows={3}
                />
                <div className="text-xs text-gray-500">
                  Available tokens: {"{firstName}"}, {"{lastName}"}, {"{company}"}, {"{title}"}
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-purple-200 dark:border-purple-800 p-4 rounded-b-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              {getFilterCount()} filters applied
            </Badge>
            <span className="text-sm text-gray-500">Est. profiles: ~{Math.max(25, 300 - getFilterCount() * 30)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={savePreset} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Preset
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Preview Summary
            </Button>
            <Button 
              onClick={handleLaunch} 
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Rocket className="h-4 w-4" />
              {isLoading ? "Launching..." : "Launch Phantom Scraper"}
            </Button>
          </div>
        </div>

      </div>
    </TooltipProvider>
  );
}