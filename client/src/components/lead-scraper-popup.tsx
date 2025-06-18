import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { X, Target, Globe, Users, ArrowLeft, Settings, Play } from 'lucide-react';

interface LeadScraperPopupProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'apollo' | 'apify' | 'phantombuster';
}

export function LeadScraperPopup({ isOpen, onClose, defaultTab = 'apollo' }: LeadScraperPopupProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'apollo' | 'apify' | 'phantombuster' | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  if (!isOpen) return null;

  const handlePlatformSelect = (platform: 'apollo' | 'apify' | 'phantombuster') => {
    setSelectedPlatform(platform);
    setShowConfig(true);
  };

  const handleBackToPlatforms = () => {
    setShowConfig(false);
    setSelectedPlatform(null);
  };

  // Main platform selection screen
  if (!showConfig) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-purple-900 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="text-center px-6 py-8 relative">
            <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Enterprise Lead Intelligence Platform</h2>
            <p className="text-blue-100 text-lg">Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence</p>
            
            <Button 
              onClick={onClose}
              variant="ghost" 
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Platform Cards */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Apollo Card */}
              <div 
                className="cursor-pointer bg-slate-800/50 rounded-lg p-6 text-center hover:bg-slate-700/50 transition-all"
                onClick={() => handlePlatformSelect('apollo')}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white text-xl font-bold mb-3">Apollo.io</h3>
                <p className="text-slate-300 text-sm mb-4">Professional B2B intelligence with 250M+ verified contacts and advanced enterprise filtering</p>
                
                <div className="space-y-2">
                  <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500 text-xs px-3 py-1">✓ Verified Emails</Badge>
                  <br />
                  <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500 text-xs px-3 py-1">✓ Executive Targeting</Badge>
                  <br />
                  <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500 text-xs px-3 py-1">✓ Enterprise-grade accuracy</Badge>
                </div>
              </div>

              {/* Apify Card */}
              <div 
                className="cursor-pointer bg-slate-800/50 rounded-lg p-6 text-center hover:bg-slate-700/50 transition-all"
                onClick={() => handlePlatformSelect('apify')}
              >
                <div className="w-16 h-16 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white text-xl font-bold mb-3">Apify</h3>
                <p className="text-slate-300 text-sm mb-4">Advanced web intelligence platform for LinkedIn profiles and comprehensive business listings</p>
                
                <div className="space-y-2">
                  <Badge className="bg-green-600/20 text-green-400 border border-green-500 text-xs px-3 py-1">✓ Web Intelligence</Badge>
                  <br />
                  <Badge className="bg-green-600/20 text-green-400 border border-green-500 text-xs px-3 py-1">✓ Business Listings</Badge>
                  <br />
                  <Badge className="bg-green-600/20 text-green-400 border border-green-500 text-xs px-3 py-1">✓ Custom data extraction</Badge>
                </div>
              </div>

              {/* PhantomBuster Card */}
              <div 
                className="cursor-pointer bg-slate-800/50 rounded-lg p-6 text-center hover:bg-slate-700/50 transition-all"
                onClick={() => handlePlatformSelect('phantombuster')}
              >
                <div className="w-16 h-16 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white text-xl font-bold mb-3">PhantomBuster</h3>
                <p className="text-slate-300 text-sm mb-4">Premium social media automation for LinkedIn, Twitter with intelligent connection management</p>
                
                <div className="space-y-2">
                  <Badge className="bg-purple-600/20 text-purple-400 border border-purple-500 text-xs px-3 py-1">✓ Social Automation</Badge>
                  <br />
                  <Badge className="bg-purple-600/20 text-purple-400 border border-purple-500 text-xs px-3 py-1">✓ Safe Outreach</Badge>
                  <br />
                  <Badge className="bg-purple-600/20 text-purple-400 border border-purple-500 text-xs px-3 py-1">✓ Multi-platform reach</Badge>
                </div>
              </div>
            </div>

            {/* Bottom Feature Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Real-time Processing</h4>
                <p className="text-slate-400 text-sm">Instant lead extraction with live notifications</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Enterprise Security</h4>
                <p className="text-slate-400 text-sm">Bank-grade encryption and compliance</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Advanced Analytics</h4>
                <p className="text-slate-400 text-sm">Comprehensive reporting and insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Configuration screens
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleBackToPlatforms}
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Platforms
              </Button>
              <div>
                <h2 className="text-xl font-bold">
                  {selectedPlatform === 'apollo' && 'Apollo.io Professional Configuration'}
                  {selectedPlatform === 'apify' && 'Apify Advanced Configuration'}
                  {selectedPlatform === 'phantombuster' && 'PhantomBuster Professional Setup'}
                </h2>
                <p className="text-blue-100 text-sm">Configure precision targeting parameters</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button className="bg-slate-700 hover:bg-slate-600 text-white">
                Save Preset
              </Button>
              <Button 
                onClick={onClose}
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Configuration Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-100px)] space-y-5">
          {/* Test Company Mode Toggle */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label className="text-white font-medium">Test Company Mode</Label>
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">?</div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Apollo Configuration */}
          {selectedPlatform === 'apollo' && (
            <>
              {/* Contact Filters */}
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader className="px-4 py-3 pb-4">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Contact Filters</span>
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Target specific professionals and contact requirements</p>
                </CardHeader>
                <CardContent className="px-4 py-3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Job Titles</Label>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="e.g., CEO, VP Sales, Marketing Director"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <Button className="bg-blue-600 hover:bg-blue-700">+</Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Seniority Level</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select seniority level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="director">Director Level</SelectItem>
                          <SelectItem value="vp">VP Level</SelectItem>
                          <SelectItem value="c-level">C-Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Department</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Location</Label>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="e.g., New York, San Francisco, Remote"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <Button className="bg-blue-600 hover:bg-blue-700">+</Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox />
                      <Label className="text-blue-400">Email Verified</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox />
                      <Label className="text-slate-400">Phone Number Available</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Filters */}
              <Card className="bg-slate-800/50 border-slate-600 mt-5">
                <CardHeader className="px-4 py-3 pb-4">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Company Filters</span>
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Target companies by industry, size, and characteristics</p>
                </CardHeader>
                <CardContent className="px-4 py-3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Industry</Label>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="e.g., Technology, Healthcare, Finance"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <Button className="bg-blue-600 hover:bg-blue-700">+</Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Company Size</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">1-10 employees</SelectItem>
                          <SelectItem value="small">11-50 employees</SelectItem>
                          <SelectItem value="medium">51-200 employees</SelectItem>
                          <SelectItem value="large">201-1000 employees</SelectItem>
                          <SelectItem value="enterprise">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Funding Stage</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select funding stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                          <SelectItem value="seed">Seed</SelectItem>
                          <SelectItem value="series-a">Series A</SelectItem>
                          <SelectItem value="series-b">Series B+</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Revenue Range</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select revenue range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                          <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                          <SelectItem value="50m-100m">$50M - $100M</SelectItem>
                          <SelectItem value="100m+">$100M+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Technologies Used</Label>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="e.g., Salesforce, HubSpot, AWS, React"
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700">+</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Exclude Domains/Companies</Label>
                    <Input 
                      placeholder="e.g., competitor1.com, competitor2.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Scraping Settings */}
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Scraping Settings</span>
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Configure scraping parameters and limits</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Data Freshness (days)</Label>
                      <Input 
                        placeholder="30"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Record Limit</Label>
                      <Input 
                        placeholder="1000"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Apify Configuration */}
          {selectedPlatform === 'apify' && (
            <>
              {/* Location Filters */}
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Location Filters</span>
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Target specific geographic areas and search parameters</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Search Terms</Label>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="e.g., restaurants, hotels, gyms"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <Button className="bg-green-600 hover:bg-green-700">Add</Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Location (City/State/ZIP)</Label>
                      <Input 
                        placeholder="e.g., New York, NY or 10001"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Search Radius (miles)</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="25 miles" />
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
                    <div>
                      <Label className="text-white">Industry Category</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurants">Restaurants</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="services">Professional Services</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Exclude Keywords</Label>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="e.g., closed, temporary, franchise"
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                      />
                      <Button className="bg-green-600 hover:bg-green-700">Add</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Filters */}
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Quality Filters</span>
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Set quality thresholds and data extraction preferences</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Minimum Reviews Required</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="5+ reviews" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1+ reviews</SelectItem>
                          <SelectItem value="5">5+ reviews</SelectItem>
                          <SelectItem value="10">10+ reviews</SelectItem>
                          <SelectItem value="25">25+ reviews</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Minimum Rating</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3.0+ stars</SelectItem>
                          <SelectItem value="3.5">3.5+ stars</SelectItem>
                          <SelectItem value="4">4.0+ stars</SelectItem>
                          <SelectItem value="4.5">4.5+ stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Max Listings to Pull</Label>
                      <Input 
                        placeholder="1000"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Delay Between Requests (seconds)</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="2 seconds" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 second</SelectItem>
                          <SelectItem value="2">2 seconds</SelectItem>
                          <SelectItem value="3">3 seconds</SelectItem>
                          <SelectItem value="5">5 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <Label className="text-blue-400">Extract Contact Info (email, phone, website)</Label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* PhantomBuster Configuration */}
          {selectedPlatform === 'phantombuster' && (
            <>
              {/* Contact Filters */}
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Contact Filters</span>
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Target specific professionals and platform preferences</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Platform</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Keywords (title-style search)</Label>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="e.g., CEO, Software Engineer, Marketing"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <Button className="bg-purple-600 hover:bg-purple-700">Add</Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Connection Degree</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select connection degree" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st">1st connections</SelectItem>
                          <SelectItem value="2nd">2nd connections</SelectItem>
                          <SelectItem value="3rd">3rd+ connections</SelectItem>
                          <SelectItem value="all">All connections</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Seniority Level</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select seniority level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="director">Director Level</SelectItem>
                          <SelectItem value="vp">VP Level</SelectItem>
                          <SelectItem value="c-level">C-Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Department/Function</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Company Filters */}
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Company Filters</span>
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Target companies by industry, size, and location</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Industry</Label>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="e.g., Technology, Healthcare, Finance"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <Button className="bg-purple-600 hover:bg-purple-700">Add</Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Company Size</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">1-10 employees</SelectItem>
                          <SelectItem value="small">11-50 employees</SelectItem>
                          <SelectItem value="medium">51-200 employees</SelectItem>
                          <SelectItem value="large">201-1000 employees</SelectItem>
                          <SelectItem value="enterprise">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Location</Label>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="e.g., San Francisco, New York, London"
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                      />
                      <Button className="bg-purple-600 hover:bg-purple-700">Add</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Execution Settings */}
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Execution Settings</span>
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Configure scraping method, limits, and connection preferences</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Execution Method</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Use YoBot Dashboard" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yobot">Use YoBot Dashboard</SelectItem>
                          <SelectItem value="phantom">PhantomBuster Cloud</SelectItem>
                          <SelectItem value="local">Local Browser</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Daily Connection Limit</Label>
                      <Input 
                        placeholder="100"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Retry Attempts</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="3 attempts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 attempt</SelectItem>
                          <SelectItem value="3">3 attempts</SelectItem>
                          <SelectItem value="5">5 attempts</SelectItem>
                          <SelectItem value="10">10 attempts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between bg-slate-800/50 border border-slate-600 rounded-lg px-6 py-4 mt-5">
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-600/20 text-blue-400">
                {selectedPlatform === 'apollo' && '7 filters applied'}
                {selectedPlatform === 'apify' && '3 filters applied'}
                {selectedPlatform === 'phantombuster' && '0 filters applied'}
              </Badge>
              <span className="text-slate-400 text-sm">
                Estimated {selectedPlatform === 'apollo' ? 'leads: 4,000' : selectedPlatform === 'apify' ? 'listings: 1,000' : 'profiles: 700'}
              </span>
            </div>
            <div className="flex space-x-3">
              <Button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2">
                Save Preset
              </Button>
              <Button 
                className={`${
                  selectedPlatform === 'apollo' ? 'bg-blue-600 hover:bg-blue-700' :
                  selectedPlatform === 'apify' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-purple-600 hover:bg-purple-700'
                } text-white px-4 py-2`}
              >
                <Play className="w-4 h-4 mr-2" />
                Launch {selectedPlatform === 'apollo' ? 'Apollo' : selectedPlatform === 'apify' ? 'Apify' : 'Phantom'} Scraper
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}