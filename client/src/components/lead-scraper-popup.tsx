import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Search, Target, Users, Building, MapPin, Briefcase, Globe, Phone, Mail, Linkedin, Facebook, Instagram, Twitter, Download, Settings, Play, Pause, RefreshCw } from 'lucide-react';

interface LeadScraperPopupProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'apollo' | 'apify' | 'phantombuster';
}

export function LeadScraperPopup({ isOpen, onClose, defaultTab = 'apollo' }: LeadScraperPopupProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [apolloConfig, setApolloConfig] = useState({
    searchTerms: '',
    location: '',
    companySize: 'any',
    industry: 'any',
    jobTitles: '',
    seniority: 'any',
    departments: [],
    excludeTerms: '',
    includeEmails: true,
    includePhones: true,
    verifyContacts: true
  });

  const [apifyConfig, setApifyConfig] = useState({
    searchQuery: '',
    location: '',
    radius: '25',
    categories: [],
    businessTypes: [],
    minRating: '4.0',
    includeWebsite: true,
    includePhone: true,
    includeAddress: true,
    maxResults: '1000'
  });

  const [phantombusterConfig, setPhantombusterConfig] = useState({
    platforms: [],
    searchTerms: '',
    connectionDegree: 'all',
    location: '',
    industry: 'any',
    includeProfiles: true,
    includeContacts: true,
    followConnections: false,
    messageTemplates: ''
  });

  if (!isOpen) return null;

  const apolloSeniorityLevels = [
    'Entry Level', 'Mid Level', 'Senior Level', 'Director Level', 'VP Level', 'C-Level', 'Owner'
  ];

  const apolloDepartments = [
    'Sales', 'Marketing', 'Engineering', 'Operations', 'Finance', 'HR', 'Customer Success', 'Product', 'Legal', 'IT'
  ];

  const apifyCategories = [
    'Restaurants', 'Real Estate', 'Healthcare', 'Retail', 'Professional Services', 'Technology', 'Manufacturing', 'Education', 'Non-Profit', 'Government'
  ];

  const apifyBusinessTypes = [
    'Small Business', 'Medium Business', 'Enterprise', 'Franchise', 'Startup', 'Non-Profit'
  ];

  const phantombusterPlatforms = [
    'LinkedIn', 'Instagram', 'Facebook', 'Twitter', 'Sales Navigator', 'Google Maps', 'Yellow Pages'
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-xl border border-blue-400/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-400/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Enterprise Lead Intelligence Platform</h2>
              <p className="text-blue-200">Advanced lead generation and prospecting tools</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white hover:bg-white/10 p-2"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'apollo' | 'apify' | 'phantombuster')}>
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800/50">
              <TabsTrigger value="apollo" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Apollo.io</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="apify" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Apify</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="phantombuster" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>PhantomBuster</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Apollo Tab */}
            <TabsContent value="apollo">
              <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-400/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-400" />
                    Apollo.io Lead Generation
                    <Badge className="ml-2 bg-blue-500 text-white">Premium</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Search Configuration */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Search Parameters</h3>
                      
                      <div>
                        <Label className="text-blue-200">Search Terms</Label>
                        <Input
                          value={apolloConfig.searchTerms}
                          onChange={(e) => setApolloConfig({...apolloConfig, searchTerms: e.target.value})}
                          placeholder="e.g., CEO, Marketing Director, Sales Manager"
                          className="bg-blue-900/30 border-blue-400/50 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-blue-200">Location</Label>
                        <Input
                          value={apolloConfig.location}
                          onChange={(e) => setApolloConfig({...apolloConfig, location: e.target.value})}
                          placeholder="e.g., New York, USA"
                          className="bg-blue-900/30 border-blue-400/50 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-blue-200">Company Size</Label>
                        <Select value={apolloConfig.companySize} onValueChange={(value) => setApolloConfig({...apolloConfig, companySize: value})}>
                          <SelectTrigger className="bg-blue-900/30 border-blue-400/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Size</SelectItem>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501-1000">501-1000 employees</SelectItem>
                            <SelectItem value="1001+">1001+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-blue-200">Industry</Label>
                        <Select value={apolloConfig.industry} onValueChange={(value) => setApolloConfig({...apolloConfig, industry: value})}>
                          <SelectTrigger className="bg-blue-900/30 border-blue-400/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Industry</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="real-estate">Real Estate</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Advanced Filters</h3>
                      
                      <div>
                        <Label className="text-blue-200">Seniority Level</Label>
                        <Select value={apolloConfig.seniority} onValueChange={(value) => setApolloConfig({...apolloConfig, seniority: value})}>
                          <SelectTrigger className="bg-blue-900/30 border-blue-400/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Level</SelectItem>
                            {apolloSeniorityLevels.map(level => (
                              <SelectItem key={level} value={level.toLowerCase().replace(' ', '_')}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-blue-200">Departments</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {apolloDepartments.map(dept => (
                            <div key={dept} className="flex items-center space-x-2">
                              <Checkbox
                                checked={apolloConfig.departments.includes(dept)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setApolloConfig({...apolloConfig, departments: [...apolloConfig.departments, dept]});
                                  } else {
                                    setApolloConfig({...apolloConfig, departments: apolloConfig.departments.filter(d => d !== dept)});
                                  }
                                }}
                              />
                              <Label className="text-blue-200 text-sm">{dept}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={apolloConfig.includeEmails}
                            onCheckedChange={(checked) => setApolloConfig({...apolloConfig, includeEmails: !!checked})}
                          />
                          <Label className="text-blue-200">Include Email Addresses</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={apolloConfig.includePhones}
                            onCheckedChange={(checked) => setApolloConfig({...apolloConfig, includePhones: !!checked})}
                          />
                          <Label className="text-blue-200">Include Phone Numbers</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={apolloConfig.verifyContacts}
                            onCheckedChange={(checked) => setApolloConfig({...apolloConfig, verifyContacts: !!checked})}
                          />
                          <Label className="text-blue-200">Verify Contact Information</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-blue-400/30">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Start Apollo Search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Apify Tab */}
            <TabsContent value="apify">
              <Card className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-400/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-400" />
                    Apify Local Business Scraper
                    <Badge className="ml-2 bg-green-500 text-white">Premium</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Search Configuration */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Search Parameters</h3>
                      
                      <div>
                        <Label className="text-green-200">Search Query</Label>
                        <Input
                          value={apifyConfig.searchQuery}
                          onChange={(e) => setApifyConfig({...apifyConfig, searchQuery: e.target.value})}
                          placeholder="e.g., restaurants, dentists, lawyers"
                          className="bg-green-900/30 border-green-400/50 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-green-200">Location</Label>
                        <Input
                          value={apifyConfig.location}
                          onChange={(e) => setApifyConfig({...apifyConfig, location: e.target.value})}
                          placeholder="e.g., New York, NY"
                          className="bg-green-900/30 border-green-400/50 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-green-200">Search Radius (miles)</Label>
                        <Select value={apifyConfig.radius} onValueChange={(value) => setApifyConfig({...apifyConfig, radius: value})}>
                          <SelectTrigger className="bg-green-900/30 border-green-400/50 text-white">
                            <SelectValue />
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
                        <Label className="text-green-200">Minimum Rating</Label>
                        <Select value={apifyConfig.minRating} onValueChange={(value) => setApifyConfig({...apifyConfig, minRating: value})}>
                          <SelectTrigger className="bg-green-900/30 border-green-400/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3.0">3.0+ stars</SelectItem>
                            <SelectItem value="3.5">3.5+ stars</SelectItem>
                            <SelectItem value="4.0">4.0+ stars</SelectItem>
                            <SelectItem value="4.5">4.5+ stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Advanced Options</h3>
                      
                      <div>
                        <Label className="text-green-200">Business Categories</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {apifyCategories.map(category => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox
                                checked={apifyConfig.categories.includes(category)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setApifyConfig({...apifyConfig, categories: [...apifyConfig.categories, category]});
                                  } else {
                                    setApifyConfig({...apifyConfig, categories: apifyConfig.categories.filter(c => c !== category)});
                                  }
                                }}
                              />
                              <Label className="text-green-200 text-sm">{category}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-green-200">Business Types</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {apifyBusinessTypes.map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                checked={apifyConfig.businessTypes.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setApifyConfig({...apifyConfig, businessTypes: [...apifyConfig.businessTypes, type]});
                                  } else {
                                    setApifyConfig({...apifyConfig, businessTypes: apifyConfig.businessTypes.filter(t => t !== type)});
                                  }
                                }}
                              />
                              <Label className="text-green-200 text-sm">{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={apifyConfig.includeWebsite}
                            onCheckedChange={(checked) => setApifyConfig({...apifyConfig, includeWebsite: !!checked})}
                          />
                          <Label className="text-green-200">Include Website URLs</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={apifyConfig.includePhone}
                            onCheckedChange={(checked) => setApifyConfig({...apifyConfig, includePhone: !!checked})}
                          />
                          <Label className="text-green-200">Include Phone Numbers</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={apifyConfig.includeAddress}
                            onCheckedChange={(checked) => setApifyConfig({...apifyConfig, includeAddress: !!checked})}
                          />
                          <Label className="text-green-200">Include Full Addresses</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-green-400/30">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Start Apify Search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PhantomBuster Tab */}
            <TabsContent value="phantombuster">
              <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-400/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-400" />
                    PhantomBuster Social Scraper
                    <Badge className="ml-2 bg-purple-500 text-white">Premium</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Platform Selection */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Platform Selection</h3>
                      
                      <div>
                        <Label className="text-purple-200">Target Platforms</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {phantombusterPlatforms.map(platform => (
                            <div key={platform} className="flex items-center space-x-2">
                              <Checkbox
                                checked={phantombusterConfig.platforms.includes(platform)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setPhantombusterConfig({...phantombusterConfig, platforms: [...phantombusterConfig.platforms, platform]});
                                  } else {
                                    setPhantombusterConfig({...phantombusterConfig, platforms: phantombusterConfig.platforms.filter(p => p !== platform)});
                                  }
                                }}
                              />
                              <Label className="text-purple-200 text-sm">{platform}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-purple-200">Search Terms</Label>
                        <Input
                          value={phantombusterConfig.searchTerms}
                          onChange={(e) => setPhantombusterConfig({...phantombusterConfig, searchTerms: e.target.value})}
                          placeholder="e.g., marketing manager, software engineer"
                          className="bg-purple-900/30 border-purple-400/50 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-purple-200">Connection Degree</Label>
                        <Select value={phantombusterConfig.connectionDegree} onValueChange={(value) => setPhantombusterConfig({...phantombusterConfig, connectionDegree: value})}>
                          <SelectTrigger className="bg-purple-900/30 border-purple-400/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Connections</SelectItem>
                            <SelectItem value="1st">1st Degree</SelectItem>
                            <SelectItem value="2nd">2nd Degree</SelectItem>
                            <SelectItem value="3rd">3rd Degree</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Advanced Configuration */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Advanced Configuration</h3>
                      
                      <div>
                        <Label className="text-purple-200">Location Filter</Label>
                        <Input
                          value={phantombusterConfig.location}
                          onChange={(e) => setPhantombusterConfig({...phantombusterConfig, location: e.target.value})}
                          placeholder="e.g., San Francisco, CA"
                          className="bg-purple-900/30 border-purple-400/50 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-purple-200">Industry Filter</Label>
                        <Select value={phantombusterConfig.industry} onValueChange={(value) => setPhantombusterConfig({...phantombusterConfig, industry: value})}>
                          <SelectTrigger className="bg-purple-900/30 border-purple-400/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Industry</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-purple-200">Message Templates</Label>
                        <Textarea
                          value={phantombusterConfig.messageTemplates}
                          onChange={(e) => setPhantombusterConfig({...phantombusterConfig, messageTemplates: e.target.value})}
                          placeholder="Enter personalized connection messages..."
                          className="bg-purple-900/30 border-purple-400/50 text-white"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={phantombusterConfig.includeProfiles}
                            onCheckedChange={(checked) => setPhantombusterConfig({...phantombusterConfig, includeProfiles: !!checked})}
                          />
                          <Label className="text-purple-200">Include Full Profiles</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={phantombusterConfig.includeContacts}
                            onCheckedChange={(checked) => setPhantombusterConfig({...phantombusterConfig, includeContacts: !!checked})}
                          />
                          <Label className="text-purple-200">Extract Contact Information</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={phantombusterConfig.followConnections}
                            onCheckedChange={(checked) => setPhantombusterConfig({...phantombusterConfig, followConnections: !!checked})}
                          />
                          <Label className="text-purple-200">Auto-Follow Connections</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-purple-400/30">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Start PhantomBuster
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}