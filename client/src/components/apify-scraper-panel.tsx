import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, MapPin, Star, Settings, Save, Search, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApifyFilters {
  searchTerms: string;
  location: string[];
  radius: number;
  industryCategory: string;
  excludeKeywords: string[];
  minimumReviews: string;
  minimumRating: string;
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
  const [filters, setFilters] = useState<ApifyFilters>({
    searchTerms: "",
    location: [],
    radius: 25,
    industryCategory: "",
    excludeKeywords: [],
    minimumReviews: "5",
    minimumRating: "3",
    maxListings: 1000,
    delayBetweenRequests: 2,
    extractContactInfo: true
  });

  const [newLocation, setNewLocation] = useState("");
  const [newExcludeKeyword, setNewExcludeKeyword] = useState("");

  const addTag = (field: keyof Pick<ApifyFilters, 'location' | 'excludeKeywords'>, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFilters(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter("");
    }
  };

  const removeTag = (field: keyof Pick<ApifyFilters, 'location' | 'excludeKeywords'>, index: number) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.searchTerms) count++;
    if (filters.location.length > 0) count++;
    if (filters.industryCategory) count++;
    if (filters.excludeKeywords.length > 0) count++;
    if (filters.minimumReviews !== "5") count++;
    if (filters.minimumRating !== "3") count++;
    if (filters.extractContactInfo) count++;
    return count;
  };

  const handleLaunch = () => {
    onLaunch(filters);
  };

  const savePreset = () => {
    localStorage.setItem('apify-filters', JSON.stringify(filters));
    toast({
      title: "Filter preset saved",
      description: "Your Apify filter configuration has been saved.",
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        
        {/* Location Filters Section */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <MapPin className="h-5 w-5" />
              Location Filters
            </CardTitle>
            <CardDescription>Configure geographic and search parameters</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Search Terms */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="searchTerms">Search Terms</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>What type of businesses to search for</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="searchTerms"
                value={filters.searchTerms}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerms: e.target.value }))}
                placeholder="e.g., dentists, gyms, restaurants"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="location">Location</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Add cities, states, or zip codes to search</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., Los Angeles, CA"
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
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {loc}
                    <button 
                      onClick={() => removeTag('location', index)}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="radius">Radius (miles)</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Search radius around specified locations</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="radius"
                type="number"
                value={filters.radius}
                onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) || 25 }))}
                min="1"
                max="100"
              />
            </div>

            {/* Industry Category */}
            <div className="space-y-2">
              <Label>Industry Category</Label>
              <Select value={filters.industryCategory} onValueChange={(value) => setFilters(prev => ({ ...prev, industryCategory: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurants">Restaurants & Food</SelectItem>
                  <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                  <SelectItem value="retail">Retail & Shopping</SelectItem>
                  <SelectItem value="services">Professional Services</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                  <SelectItem value="fitness">Fitness & Recreation</SelectItem>
                  <SelectItem value="education">Education & Training</SelectItem>
                  <SelectItem value="realestate">Real Estate</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Exclude Keywords */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="excludeKeywords">Exclude Keywords</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Filter out businesses containing these terms</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Input
                  id="excludeKeywords"
                  value={newExcludeKeyword}
                  onChange={(e) => setNewExcludeKeyword(e.target.value)}
                  placeholder="e.g., spam, temp, closed"
                  onKeyPress={(e) => e.key === 'Enter' && addTag('excludeKeywords', newExcludeKeyword, setNewExcludeKeyword)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => addTag('excludeKeywords', newExcludeKeyword, setNewExcludeKeyword)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.excludeKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {keyword}
                    <button 
                      onClick={() => removeTag('excludeKeywords', index)}
                      className="ml-1 text-green-600 hover:text-green-800"
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
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Star className="h-5 w-5" />
              Quality Filters
            </CardTitle>
            <CardDescription>Filter by business quality and reputation metrics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Minimum Reviews */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Minimum Reviews Required</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Only businesses with this many reviews or more</TooltipContent>
                </Tooltip>
              </div>
              <Select value={filters.minimumReviews} onValueChange={(value) => setFilters(prev => ({ ...prev, minimumReviews: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum reviews" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No minimum</SelectItem>
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
              <div className="flex items-center gap-2">
                <Label>Minimum Rating</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Only businesses with this star rating or higher</TooltipContent>
                </Tooltip>
              </div>
              <Select value={filters.minimumRating} onValueChange={(value) => setFilters(prev => ({ ...prev, minimumRating: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No minimum</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                  <SelectItem value="5">5 stars only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Listings */}
            <div className="space-y-2">
              <Label htmlFor="maxListings">Max Listings to Pull</Label>
              <Input
                id="maxListings"
                type="number"
                value={filters.maxListings}
                onChange={(e) => setFilters(prev => ({ ...prev, maxListings: parseInt(e.target.value) || 1000 }))}
                min="1"
                max="10000"
              />
            </div>

            {/* Delay Between Requests */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="delayBetweenRequests">Delay Between Requests (seconds)</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                  <TooltipContent>Slower = more reliable, faster = higher risk</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="delayBetweenRequests"
                type="number"
                value={filters.delayBetweenRequests}
                onChange={(e) => setFilters(prev => ({ ...prev, delayBetweenRequests: parseInt(e.target.value) || 2 }))}
                min="1"
                max="10"
              />
            </div>

            {/* Extract Contact Info */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="extractContactInfo" 
                  checked={filters.extractContactInfo}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, extractContactInfo: !!checked }))}
                />
                <Label htmlFor="extractContactInfo">Extract Contact Info (phone, email, website)</Label>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-green-200 dark:border-green-800 p-4 rounded-b-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-600 border-green-200">
              {getFilterCount()} filters applied
            </Badge>
            <span className="text-sm text-gray-500">Est. listings: ~{Math.max(100, 800 - getFilterCount() * 80)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={savePreset} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Preset
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Estimate Listings
            </Button>
            <Button 
              onClick={handleLaunch} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Rocket className="h-4 w-4" />
              {isLoading ? "Launching..." : "Launch Apify Scraper"}
            </Button>
          </div>
        </div>

      </div>
    </TooltipProvider>
  );
}