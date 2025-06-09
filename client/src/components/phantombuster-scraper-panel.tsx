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
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Users, Building2, Settings, Save, Search, Rocket, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useIndustryTemplates } from "@/hooks/useIndustryTemplates";

interface PhantomBusterFilters {
  platform: string;
  keywords: string[];
  connectionDegree: string;
  seniorityLevel: string;
  department: string;
  industry: string[];
  companySize: string;
  location: string[];
  executionMethod: string;
  dailyConnectionLimit: number;
  autoConnectWithMessage: boolean;
  connectionMessage: string;
  retryAttempts: number;
}

interface PhantomBusterScraperPanelProps {
  onLaunch: (filters: PhantomBusterFilters) => void;
  isLoading?: boolean;
}

export default function PhantomBusterScraperPanel({ onLaunch, isLoading = false }: PhantomBusterScraperPanelProps) {
  const { toast } = useToast();
  const { industries, isLoading: industriesLoading } = useIndustryTemplates();
  const [isTestMode, setIsTestMode] = useState(false);
  const [estimatedProfiles, setEstimatedProfiles] = useState(0);
  
  const [filters, setFilters] = useState<PhantomBusterFilters>({
    platform: "",
    keywords: [],
    connectionDegree: "",
    seniorityLevel: "",
    department: "",
    industry: [],
    companySize: "",
    location: [],
    executionMethod: "dashboard",
    dailyConnectionLimit: 100,
    autoConnectWithMessage: false,
    connectionMessage: "Hi! I'd love to connect and learn more about your work.",
    retryAttempts: 3
  });

  const [newKeyword, setNewKeyword] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const addTag = (field: keyof Pick<PhantomBusterFilters, 'keywords' | 'industry' | 'location'>, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFilters(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter("");
    }
  };

  const removeTag = (field: keyof Pick<PhantomBusterFilters, 'keywords' | 'industry' | 'location'>, index: number) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.platform) count++;
    if (filters.keywords.length > 0) count++;
    if (filters.connectionDegree) count++;
    if (filters.seniorityLevel) count++;
    if (filters.department) count++;
    if (filters.industry.length > 0) count++;
    if (filters.companySize) count++;
    if (filters.location.length > 0) count++;
    if (filters.autoConnectWithMessage) count++;
    return count;
  };

  const calculateEstimatedProfiles = () => {
    if (isTestMode) {
      return Math.floor(Math.random() * 400) + 50;
    }
    
    let baseCount = 8000;
    
    if (filters.platform === "linkedin") baseCount *= 1.2;
    else if (filters.platform === "x-twitter") baseCount *= 0.8;
    
    if (filters.keywords.length > 0) baseCount *= Math.min(filters.keywords.length * 0.4, 1);
    if (filters.connectionDegree === "1st") baseCount *= 0.3;
    else if (filters.connectionDegree === "2nd") baseCount *= 0.6;
    else if (filters.connectionDegree === "3rd") baseCount *= 0.9;
    
    if (filters.seniorityLevel) baseCount *= 0.7;
    if (filters.department) baseCount *= 0.6;
    if (filters.industry.length > 0) baseCount *= 0.5;
    if (filters.companySize) baseCount *= 0.7;
    if (filters.location.length > 0) baseCount *= 0.6;
    
    return Math.max(30, Math.min(filters.dailyConnectionLimit * 7, Math.floor(baseCount)));
  };

  useEffect(() => {
    setEstimatedProfiles(calculateEstimatedProfiles());
  }, [filters, isTestMode]);

  const handleLaunchScraper = async () => {
    try {
      const estimated = calculateEstimatedProfiles();
      
      if (isTestMode) {
        toast({
          title: "Test Mode Activated",
          description: `PhantomBuster scraper running in test mode. Estimated ${estimated} test profiles.`,
        });
        
        const testFilters = { ...filters, testMode: true };
        onLaunch(testFilters);
        return;
      }

      const response = await apiRequest("POST", "/api/launch-scrape", {
        tool: "phantom",
        filters: filters
      });

      if (response.ok) {
        toast({
          title: "PhantomBuster Scraper Launched",
          description: `Successfully initiated scraping for ${estimated} estimated profiles`,
        });
        onLaunch(filters);
      } else {
        throw new Error("Failed to launch scraper");
      }
    } catch (error) {
      toast({
        title: "Launch Failed",
        description: "Failed to launch PhantomBuster scraper. Please try again.",
        variant: "destructive"
      });
    }
  };

  const savePreset = async () => {
    try {
      await apiRequest("POST", "/api/save-scraper-preset", {
        tool: "phantom",
        name: `PhantomBuster Preset ${new Date().toLocaleDateString()}`,
        filters: filters
      });
      
      toast({
        title: "Preset Saved",
        description: "PhantomBuster scraper configuration has been saved",
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
      <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-violet-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl">
        
        {/* Test Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600/50">
          <div className="flex items-center space-x-3">
            <Label htmlFor="test-mode" className="text-purple-200 font-medium">Test Company Mode</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle between fake test data (instant) vs real PhantomBuster scraping</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="test-mode"
            checked={isTestMode}
            onCheckedChange={setIsTestMode}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>

        {/* Contact Filters Section */}
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-300">
              <Users className="h-5 w-5" />
              Contact Filters
            </CardTitle>
            <CardDescription className="text-slate-400">
              Target specific professionals and platform preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Platform */}
              <div className="space-y-2">
                <Label className="text-slate-200">Platform</Label>
                <Select value={filters.platform} onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="x-twitter">X (formerly Twitter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label className="text-slate-200">Keywords (title-style search)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., CEO, Software Engineer, Marketing"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag('keywords', newKeyword, setNewKeyword)}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                  <Button
                    size="sm"
                    onClick={() => addTag('keywords', newKeyword, setNewKeyword)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {filters.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-200">
                      {keyword}
                      <button
                        className="ml-1 text-xs"
                        onClick={() => removeTag('keywords', index)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Connection Degree */}
              <div className="space-y-2">
                <Label className="text-slate-200">Connection Degree</Label>
                <Select value={filters.connectionDegree} onValueChange={(value) => setFilters(prev => ({ ...prev, connectionDegree: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select connection degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Connections</SelectItem>
                    <SelectItem value="2nd">2nd Connections</SelectItem>
                    <SelectItem value="3rd">3rd+ Connections</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Seniority Level */}
              <div className="space-y-2">
                <Label className="text-slate-200">Seniority Level</Label>
                <Select value={filters.seniorityLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, seniorityLevel: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
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

              {/* Department/Function */}
              <div className="space-y-2">
                <Label className="text-slate-200">Department/Function</Label>
                <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Filters Section */}
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-300">
              <Building2 className="h-5 w-5" />
              Company Filters
            </CardTitle>
            <CardDescription className="text-slate-400">
              Target companies by industry, size, and location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Industry */}
              <div className="space-y-2">
                <Label className="text-slate-200">Industry</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag('industry', newIndustry, setNewIndustry)}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                  <Button
                    size="sm"
                    onClick={() => addTag('industry', newIndustry, setNewIndustry)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {filters.industry.map((ind, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-200">
                      {ind}
                      <button
                        className="ml-1 text-xs"
                        onClick={() => removeTag('industry', index)}
                      >
                        ×
                      </button>
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
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1001-5000">1001-5000 employees</SelectItem>
                    <SelectItem value="5000+">5000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-200">Location</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., San Francisco, New York, London"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag('location', newLocation, setNewLocation)}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                  <Button
                    size="sm"
                    onClick={() => addTag('location', newLocation, setNewLocation)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {filters.location.map((loc, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-200">
                      {loc}
                      <button
                        className="ml-1 text-xs"
                        onClick={() => removeTag('location', index)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Execution Settings Section */}
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-300">
              <Settings className="h-5 w-5" />
              Execution Settings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure scraping method, limits, and connection preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Execution Method */}
              <div className="space-y-2">
                <Label className="text-slate-200">Execution Method</Label>
                <Select value={filters.executionMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, executionMethod: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select execution method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Use YoBot Dashboard</SelectItem>
                    <SelectItem value="browser">Use Phantom Browser</SelectItem>
                    <SelectItem value="rerun">Re-run Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Daily Connection Limit */}
              <div className="space-y-2">
                <Label className="text-slate-200">Daily Connection Limit</Label>
                <Input
                  type="number"
                  min="1"
                  max="500"
                  value={filters.dailyConnectionLimit}
                  onChange={(e) => setFilters(prev => ({ ...prev, dailyConnectionLimit: parseInt(e.target.value) || 100 }))}
                  className="bg-slate-700/50 border-slate-600 text-slate-200"
                />
              </div>

              {/* Retry Attempts */}
              <div className="space-y-2">
                <Label className="text-slate-200">Retry Attempts</Label>
                <Select 
                  value={filters.retryAttempts.toString()} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, retryAttempts: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select retry attempts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 attempt</SelectItem>
                    <SelectItem value="2">2 attempts</SelectItem>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Auto-connect Options */}
            <div className="space-y-4 pt-4 border-t border-slate-600/50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-connect"
                  checked={filters.autoConnectWithMessage}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, autoConnectWithMessage: !!checked }))}
                  className="border-slate-500"
                />
                <Label htmlFor="auto-connect" className="text-slate-200">Auto-connect With Message</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Automatically send connection requests with personalized messages</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {filters.autoConnectWithMessage && (
                <div className="space-y-2">
                  <Label className="text-slate-200 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Connection Message Template
                  </Label>
                  <Textarea
                    placeholder="Hi! I'd love to connect and learn more about your work in [industry]. Looking forward to connecting!"
                    value={filters.connectionMessage}
                    onChange={(e) => setFilters(prev => ({ ...prev, connectionMessage: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-slate-200 min-h-[80px]"
                    maxLength={300}
                  />
                  <div className="text-xs text-slate-400">
                    {filters.connectionMessage.length}/300 characters
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-slate-900/90 backdrop-blur-xl p-4 rounded-lg border border-slate-600/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-purple-300 border-purple-300">
              {getFilterCount()} filters applied
            </Badge>
            <div className="text-sm text-slate-300">
              Estimated profiles: <span className="font-semibold text-purple-300">{estimatedProfiles.toLocaleString()}</span>
            </div>
            {isTestMode && (
              <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-300">
                Test Mode
              </Badge>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={savePreset}
              className="border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={handleLaunchScraper}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Rocket className="h-4 w-4 mr-2" />
              {isLoading ? "Launching..." : "Launch Phantom Scraper"}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}