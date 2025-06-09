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
import { HelpCircle, MapPin, Star, Settings, Save, Search, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ApifyFilters {
  searchTerms: string[];
  location: string;
  radius: number;
  industryCategory: string;
  excludeKeywords: string[];
  minimumReviews: number;
  minimumRating: number;
  maxListings: number;
  delayBetweenRequests: number;
  extractContactInfo: boolean;
}

interface ApifyScraperPanelProps {
  onLaunch: (filters: ApifyFilters) => void;
  isLoading?: boolean;
}

export default function ApifyScraperPanel({ onLaunch, isLoading = false }: ApifyScraperPanelProps) {
  const { toast } = useToast();
  const [isTestMode, setIsTestMode] = useState(false);
  const [estimatedListings, setEstimatedListings] = useState(0);
  
  const [filters, setFilters] = useState<ApifyFilters>({
    searchTerms: [],
    location: "",
    radius: 25,
    industryCategory: "",
    excludeKeywords: [],
    minimumReviews: 5,
    minimumRating: 3.0,
    maxListings: 1000,
    delayBetweenRequests: 2,
    extractContactInfo: true
  });

  const [newSearchTerm, setNewSearchTerm] = useState("");
  const [newExcludeKeyword, setNewExcludeKeyword] = useState("");

  const addTag = (field: keyof Pick<ApifyFilters, 'searchTerms' | 'excludeKeywords'>, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFilters(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter("");
    }
  };

  const removeTag = (field: keyof Pick<ApifyFilters, 'searchTerms' | 'excludeKeywords'>, index: number) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.searchTerms.length > 0) count++;
    if (filters.location) count++;
    if (filters.industryCategory) count++;
    if (filters.excludeKeywords.length > 0) count++;
    if (filters.minimumReviews > 0) count++;
    if (filters.minimumRating > 0) count++;
    if (filters.extractContactInfo) count++;
    return count;
  };

  const calculateEstimatedListings = () => {
    if (isTestMode) {
      return Math.floor(Math.random() * 300) + 50;
    }
    
    let baseCount = 5000;
    
    if (filters.searchTerms.length > 0) baseCount *= Math.min(filters.searchTerms.length * 0.3, 1);
    if (filters.location) baseCount *= 0.6;
    if (filters.industryCategory) baseCount *= 0.7;
    if (filters.excludeKeywords.length > 0) baseCount *= 0.8;
    if (filters.minimumReviews > 5) baseCount *= 0.6;
    if (filters.minimumRating > 3.5) baseCount *= 0.5;
    
    return Math.max(25, Math.min(filters.maxListings, Math.floor(baseCount)));
  };

  useEffect(() => {
    setEstimatedListings(calculateEstimatedListings());
  }, [filters, isTestMode]);

  const handleLaunchScraper = async () => {
    try {
      const estimated = calculateEstimatedListings();
      
      if (isTestMode) {
        toast({
          title: "Test Mode Activated",
          description: `Apify scraper running in test mode. Estimated ${estimated} test listings.`,
        });
        
        const testFilters = { ...filters, testMode: true };
        onLaunch(testFilters);
        return;
      }

      const response = await apiRequest("POST", "/api/launch-scrape", {
        tool: "apify",
        filters: filters
      });

      if (response.ok) {
        toast({
          title: "Apify Scraper Launched",
          description: `Successfully initiated scraping for ${estimated} estimated listings`,
        });
        onLaunch(filters);
      } else {
        throw new Error("Failed to launch scraper");
      }
    } catch (error) {
      toast({
        title: "Launch Failed",
        description: "Failed to launch Apify scraper. Please try again.",
        variant: "destructive"
      });
    }
  };

  const savePreset = async () => {
    try {
      await apiRequest("POST", "/api/save-scraper-preset", {
        tool: "apify",
        name: `Apify Preset ${new Date().toLocaleDateString()}`,
        filters: filters
      });
      
      toast({
        title: "Preset Saved",
        description: "Apify scraper configuration has been saved",
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
      <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/80 via-green-900/60 to-emerald-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl">
        
        {/* Test Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600/50">
          <div className="flex items-center space-x-3">
            <Label htmlFor="test-mode" className="text-green-200 font-medium">Test Company Mode</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle between fake test data (instant) vs real Apify scraping</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="test-mode"
            checked={isTestMode}
            onCheckedChange={setIsTestMode}
            className="data-[state=checked]:bg-green-500"
          />
        </div>

        {/* Location Filters Section */}
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-300">
              <MapPin className="h-5 w-5" />
              Location Filters
            </CardTitle>
            <CardDescription className="text-slate-400">
              Target specific geographic areas and search parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Search Terms */}
              <div className="space-y-2">
                <Label className="text-slate-200">Search Terms</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., restaurants, hotels, gyms"
                    value={newSearchTerm}
                    onChange={(e) => setNewSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag('searchTerms', newSearchTerm, setNewSearchTerm)}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                  <Button
                    size="sm"
                    onClick={() => addTag('searchTerms', newSearchTerm, setNewSearchTerm)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {filters.searchTerms.map((term, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-600/20 text-green-200">
                      {term}
                      <button
                        className="ml-1 text-xs"
                        onClick={() => removeTag('searchTerms', index)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-slate-200">Location (City/State/ZIP)</Label>
                <Input
                  placeholder="e.g., New York, NY or 10001"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-slate-200"
                />
              </div>

              {/* Radius */}
              <div className="space-y-2">
                <Label className="text-slate-200">Search Radius (miles)</Label>
                <Select 
                  value={filters.radius.toString()} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, radius: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 miles</SelectItem>
                    <SelectItem value="10">10 miles</SelectItem>
                    <SelectItem value="25">25 miles</SelectItem>
                    <SelectItem value="50">50 miles</SelectItem>
                    <SelectItem value="100">100 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Industry Category */}
              <div className="space-y-2">
                <Label className="text-slate-200">Industry Category</Label>
                <Select 
                  value={filters.industryCategory} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, industryCategory: value }))}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurants">Restaurants & Food</SelectItem>
                    <SelectItem value="retail">Retail & Shopping</SelectItem>
                    <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                    <SelectItem value="professional">Professional Services</SelectItem>
                    <SelectItem value="entertainment">Entertainment & Recreation</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="home-services">Home Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exclude Keywords */}
            <div className="space-y-2">
              <Label className="text-slate-200">Exclude Keywords</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., closed, temporary, franchise"
                  value={newExcludeKeyword}
                  onChange={(e) => setNewExcludeKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag('excludeKeywords', newExcludeKeyword, setNewExcludeKeyword)}
                  className="bg-slate-700/50 border-slate-600 text-slate-200"
                />
                <Button
                  size="sm"
                  onClick={() => addTag('excludeKeywords', newExcludeKeyword, setNewExcludeKeyword)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.excludeKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-600/20 text-red-200">
                    {keyword}
                    <button
                      className="ml-1 text-xs"
                      onClick={() => removeTag('excludeKeywords', index)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Filters Section */}
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-300">
              <Star className="h-5 w-5" />
              Quality Filters
            </CardTitle>
            <CardDescription className="text-slate-400">
              Set quality thresholds and data extraction preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Minimum Reviews */}
              <div className="space-y-2">
                <Label className="text-slate-200">Minimum Reviews Required</Label>
                <Select 
                  value={filters.minimumReviews.toString()} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, minimumReviews: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select minimum reviews" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No minimum</SelectItem>
                    <SelectItem value="1">1+ reviews</SelectItem>
                    <SelectItem value="5">5+ reviews</SelectItem>
                    <SelectItem value="10">10+ reviews</SelectItem>
                    <SelectItem value="25">25+ reviews</SelectItem>
                    <SelectItem value="50">50+ reviews</SelectItem>
                    <SelectItem value="100">100+ reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2">
                <Label className="text-slate-200">Minimum Rating</Label>
                <Select 
                  value={filters.minimumRating.toString()} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, minimumRating: parseFloat(value) }))}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select minimum rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No minimum</SelectItem>
                    <SelectItem value="2.0">2.0+ stars</SelectItem>
                    <SelectItem value="2.5">2.5+ stars</SelectItem>
                    <SelectItem value="3.0">3.0+ stars</SelectItem>
                    <SelectItem value="3.5">3.5+ stars</SelectItem>
                    <SelectItem value="4.0">4.0+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Listings */}
              <div className="space-y-2">
                <Label className="text-slate-200">Max Listings to Pull</Label>
                <Input
                  type="number"
                  min="1"
                  max="10000"
                  value={filters.maxListings}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxListings: parseInt(e.target.value) || 1000 }))}
                  className="bg-slate-700/50 border-slate-600 text-slate-200"
                />
              </div>

              {/* Delay Between Requests */}
              <div className="space-y-2">
                <Label className="text-slate-200">Delay Between Requests (seconds)</Label>
                <Select 
                  value={filters.delayBetweenRequests.toString()} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, delayBetweenRequests: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select delay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 second</SelectItem>
                    <SelectItem value="2">2 seconds</SelectItem>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Extract Contact Info Checkbox */}
            <div className="pt-4 border-t border-slate-600/50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extract-contact"
                  checked={filters.extractContactInfo}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, extractContactInfo: !!checked }))}
                  className="border-slate-500"
                />
                <Label htmlFor="extract-contact" className="text-slate-200">Extract Contact Info (email, phone, website)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attempts to extract contact information from business listings</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-slate-900/90 backdrop-blur-xl p-4 rounded-lg border border-slate-600/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-300 border-green-300">
              {getFilterCount()} filters applied
            </Badge>
            <div className="text-sm text-slate-300">
              Estimated listings: <span className="font-semibold text-green-300">{estimatedListings.toLocaleString()}</span>
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Rocket className="h-4 w-4 mr-2" />
              {isLoading ? "Launching..." : "Launch Apify Scraper"}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}