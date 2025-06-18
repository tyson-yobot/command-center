import React, { useState } from 'react';
import { ArrowLeft, Target, Globe, Users, Brain, Shield, BarChart3, Play, Settings, CheckCircle, Download, ExternalLink, Slack, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

type Screen = 'overview' | 'apollo' | 'apify' | 'phantombuster' | 'results';

export default function LeadScraperDashboard() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('overview');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  const platforms = [
    {
      id: 'apollo',
      name: 'Apollo.io',
      icon: Target,
      color: 'blue',
      description: 'Professional B2B intelligence with 250M+ verified contacts and advanced enterprise filtering',
      features: ['Verified Emails', 'Executive Targeting', 'Enterprise-grade accuracy']
    },
    {
      id: 'apify',
      name: 'Apify',
      icon: Globe,
      color: 'green',
      description: 'Advanced web intelligence platform for LinkedIn profiles and comprehensive business listings',
      features: ['Web Intelligence', 'Business Listings', 'Custom data extraction']
    },
    {
      id: 'phantombuster',
      name: 'PhantomBuster',
      icon: Users,
      color: 'purple',
      description: 'Premium social media automation for LinkedIn, Twitter with intelligent connection management',
      features: ['Social Automation', 'Safe Outreach', 'Multi-platform reach']
    }
  ];

  const additionalFeatures = [
    {
      id: 'realtime',
      name: 'Real-time Processing',
      icon: Brain,
      color: 'green',
      description: 'Instant lead extraction with live notifications'
    },
    {
      id: 'security',
      name: 'Enterprise Security',
      icon: Shield,
      color: 'blue',
      description: 'Bank-grade encryption and compliance'
    },
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      icon: BarChart3,
      color: 'purple',
      description: 'Comprehensive reporting and insights'
    }
  ];

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    setCurrentScreen(platformId as Screen);
  };

  const handleBackToCommandCenter = () => {
    window.location.href = '/command-center';
  };

  const renderOverview = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <Target className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Enterprise Lead Intelligence Platform
          </h1>
          <p className="text-blue-100 text-xl max-w-4xl mx-auto leading-relaxed">
            Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence
          </p>
        </div>

        {/* Platform Selection Grid - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {platforms.map((platform) => {
            const IconComponent = platform.icon;
            
            return (
              <Card
                key={platform.id}
                onClick={() => handlePlatformSelect(platform.id)}
                className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-slate-700/70 group"
              >
                <CardHeader className="text-center pb-6">
                  <div className={`
                    w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300
                    ${platform.color === 'blue' ? 'bg-blue-600 group-hover:bg-blue-500' : 
                      platform.color === 'green' ? 'bg-green-600 group-hover:bg-green-500' : 'bg-purple-600 group-hover:bg-purple-500'}
                  `}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">{platform.name}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <CardDescription className="text-slate-300 mb-6 text-base leading-relaxed">
                    {platform.description}
                  </CardDescription>
                  <div className="space-y-3">
                    {platform.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`
                          w-5 h-5 rounded-full mr-3 flex items-center justify-center
                          ${platform.color === 'blue' ? 'bg-blue-500/20' : 
                            platform.color === 'green' ? 'bg-green-500/20' : 'bg-purple-500/20'}
                        `}>
                          <CheckCircle className={`
                            w-3 h-3
                            ${platform.color === 'blue' ? 'text-blue-400' : 
                              platform.color === 'green' ? 'text-green-400' : 'text-purple-400'}
                          `} />
                        </div>
                        <span className="text-slate-400 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Features Grid - Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {additionalFeatures.map((feature) => {
            const IconComponent = feature.icon;
            
            return (
              <Card
                key={feature.id}
                className="bg-slate-800/40 backdrop-blur-sm border-slate-600/30 hover:bg-slate-700/50 transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center">
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center mr-5 shadow-lg
                      ${feature.color === 'blue' ? 'bg-blue-600/20' : 
                        feature.color === 'green' ? 'bg-green-600/20' : 'bg-purple-600/20'}
                    `}>
                      <IconComponent className={`
                        w-7 h-7
                        ${feature.color === 'blue' ? 'text-blue-400' : 
                          feature.color === 'green' ? 'text-green-400' : 'text-purple-400'}
                      `} />
                    </div>
                    <CardTitle className="text-xl text-white">{feature.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderApolloConfig = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              onClick={() => setCurrentScreen('overview')}
              variant="ghost"
              className="text-white hover:bg-white/10 mr-6 px-4 py-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Platforms
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Apollo.io Professional Configuration</h1>
              <p className="text-blue-100 text-lg">Configure precision targeting parameters</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50 px-6 py-2"
          >
            <Settings className="w-4 h-4 mr-2" />
            Save Preset
          </Button>
        </div>

        {/* Test Company Mode Toggle */}
        <div className="mb-6">
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardContent className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Label className="text-white text-base font-medium">Test Company Mode</Label>
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <Switch className="data-[state=checked]:bg-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Filters */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-xl">
              <Users className="w-5 h-5 mr-3" />
              Contact Filters
            </CardTitle>
            <CardDescription className="text-slate-400">
              Target specific professionals and contact requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Job Titles</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., CEO, VP Sales, Marketing Director"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-10 flex-1"
                  />
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 h-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Seniority Level</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-10">
                    <SelectValue placeholder="Select seniority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="individual">Individual Contributor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Department</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-10">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Location</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., New York, San Francisco, Remote"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-10 flex-1"
                  />
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 h-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox id="email-verified" className="border-slate-400" />
                <Label htmlFor="email-verified" className="text-slate-300 text-sm">Email Verified</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="phone-available" className="border-slate-400" />
                <Label htmlFor="phone-available" className="text-slate-300 text-sm">Phone Number Available</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Filters */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-xl">
              <Target className="w-5 h-5 mr-3" />
              Company Filters
            </CardTitle>
            <CardDescription className="text-slate-400">
              Target companies by industry, size, and characteristics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Industry</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-10 flex-1"
                  />
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 h-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Company Size</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-10">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">1-50 employees</SelectItem>
                    <SelectItem value="scaleup">51-200 employees</SelectItem>
                    <SelectItem value="enterprise">200+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Funding Stage</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-10">
                    <SelectValue placeholder="Select funding stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Revenue Range</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-10">
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                    <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                    <SelectItem value="50m+">$50M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Technologies Used</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., Salesforce, HubSpot, AWS, React"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-10 flex-1"
                  />
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 h-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Exclude Domains/Companies</Label>
                <Input
                  placeholder="e.g., competitor1.com, competitor2.com"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scraping Settings */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-xl">
              <Settings className="w-5 h-5 mr-3" />
              Scraping Settings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure scraping parameters and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">Data Freshness (days)</Label>
              <Input
                type="number"
                defaultValue={30}
                className="bg-slate-700/50 border-slate-600 text-white h-10"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">Record Limit</Label>
              <Input
                type="number"
                defaultValue={4000}
                className="bg-slate-700/50 border-slate-600 text-white h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-800/70 rounded-2xl p-6 border border-slate-600/50 shadow-xl">
          <div className="flex items-center space-x-6">
            <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 px-4 py-2 text-base">
              7 filters applied
            </Badge>
            <span className="text-slate-300 text-lg">Estimated leads: 4,000</span>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50 px-6 py-3"
            >
              <Settings className="w-5 h-5 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={() => setCurrentScreen('results')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Launch Apollo Scraper
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApifyConfig = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            onClick={() => setCurrentScreen('overview')}
            variant="ghost"
            className="text-white hover:bg-white/10 mr-6 px-4 py-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Apify Configuration</h1>
              <p className="text-blue-100 text-lg">Advanced web intelligence platform</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Location Filters */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <Globe className="w-6 h-6 mr-3" />
                Location Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-slate-300 text-base mb-2 block">Search Terms</Label>
                <Input
                  placeholder="Enter search keywords"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-12"
                />
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Location</Label>
                <Input
                  placeholder="City, State, Country"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-12"
                />
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Search Radius</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5km">5 km</SelectItem>
                    <SelectItem value="10km">10 km</SelectItem>
                    <SelectItem value="25km">25 km</SelectItem>
                    <SelectItem value="50km">50 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Industry Category</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurants">Restaurants</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Exclude Keywords</Label>
                <Input
                  placeholder="Keywords to exclude (comma separated)"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quality Filters */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <BarChart3 className="w-6 h-6 mr-3" />
                Quality Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-slate-300 text-base mb-2 block">Min Reviews</Label>
                <Input
                  type="number"
                  placeholder="Minimum number of reviews"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-12"
                />
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Min Rating</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Minimum rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Max Listings to Pull</Label>
                <Input
                  type="number"
                  defaultValue={500}
                  className="bg-slate-700/50 border-slate-600 text-white h-12"
                />
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Delay Between Requests (ms)</Label>
                <Input
                  type="number"
                  defaultValue={1000}
                  className="bg-slate-700/50 border-slate-600 text-white h-12"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox id="extract-contact" className="border-slate-400" />
                <Label htmlFor="extract-contact" className="text-slate-300 text-base">
                  Extract Contact Info
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-800/70 rounded-2xl p-6 border border-slate-600/50 shadow-xl">
          <div className="flex items-center space-x-6">
            <Badge className="bg-green-600/20 text-green-300 border-green-500/30 px-4 py-2 text-base">
              3 Filters Applied
            </Badge>
            <span className="text-slate-300 text-lg">Estimated Listings: 1,000</span>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50 px-6 py-3"
            >
              <Settings className="w-5 h-5 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={() => setCurrentScreen('results')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Launch Apify Scraper
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhantomBusterConfig = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            onClick={() => setCurrentScreen('overview')}
            variant="ghost"
            className="text-white hover:bg-white/10 mr-6 px-4 py-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">PhantomBuster Configuration</h1>
              <p className="text-blue-100 text-lg">Premium social media automation platform</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Contact Filters */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <Users className="w-6 h-6 mr-3" />
                Contact Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-slate-300 text-base mb-2 block">Platform</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Keywords</Label>
                <Input
                  placeholder="Enter keywords"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-12"
                />
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Connection Degree</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Connections</SelectItem>
                    <SelectItem value="2nd">2nd Connections</SelectItem>
                    <SelectItem value="3rd">3rd+ Connections</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Seniority Level</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Select seniority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Department/Function</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Company Filters */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <Target className="w-6 h-6 mr-3" />
                Company Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-slate-300 text-base mb-2 block">Industry</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="fintech">Fintech</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Company Size</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">1-50</SelectItem>
                    <SelectItem value="scaleup">51-200</SelectItem>
                    <SelectItem value="enterprise">200+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Location</Label>
                <Input
                  placeholder="Enter location"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Execution Settings */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <Settings className="w-6 h-6 mr-3" />
                Execution Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-slate-300 text-base mb-2 block">Execution Method</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="drip">Drip Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Daily Connection Limit</Label>
                <Input
                  type="number"
                  defaultValue={20}
                  className="bg-slate-700/50 border-slate-600 text-white h-12"
                />
              </div>

              <div>
                <Label className="text-slate-300 text-base mb-2 block">Retry Attempts</Label>
                <Input
                  type="number"
                  defaultValue={3}
                  className="bg-slate-700/50 border-slate-600 text-white h-12"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-800/70 rounded-2xl p-6 border border-slate-600/50 shadow-xl">
          <div className="flex items-center space-x-6">
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 px-4 py-2 text-base">
              0 Filters Applied
            </Badge>
            <span className="text-slate-300 text-lg">Estimated Profiles: 700</span>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50 px-6 py-3"
            >
              <Settings className="w-5 h-5 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={() => setCurrentScreen('results')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Launch PhantomBuster Scraper
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              onClick={() => setCurrentScreen('overview')}
              variant="ghost"
              className="text-white hover:bg-white/10 mr-6 px-4 py-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Platform Selection
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Intelligence Results</h1>
              <p className="text-blue-100 text-xl">
                Extracted 1,247 high-quality leads using {selectedPlatform === 'apollo' ? 'Apollo.io' : selectedPlatform === 'apify' ? 'Apify' : 'PhantomBuster'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleBackToCommandCenter}
            className="bg-slate-700/50 hover:bg-slate-600/70 text-white border border-slate-500/50 px-6 py-3"
          >
            Back to Command Center
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-green-600/20 backdrop-blur-sm border-green-500/30 hover:bg-green-600/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Slack className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-green-300 font-semibold text-lg">Slack Notification Status</p>
                  <p className="text-green-200">Sent to #leads-channel</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-600/20 backdrop-blur-sm border-blue-500/30 hover:bg-blue-600/30 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-300 font-semibold text-lg">View in Airtable</p>
                  <p className="text-blue-200">Open database</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-600/20 backdrop-blur-sm border-purple-500/30 hover:bg-purple-600/30 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-purple-300 font-semibold text-lg">CSV Export</p>
                  <p className="text-purple-200">Download results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results List */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Lead Results</CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Most recent high-quality leads extracted from your target criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Sarah Johnson", company: "TechFlow Inc", email: "sarah.j@techflow.com", phone: "+1 (555) 123-4567" },
                { name: "Michael Chen", company: "DataSync Solutions", email: "m.chen@datasync.io", phone: "+1 (555) 234-5678" },
                { name: "Emily Rodriguez", company: "CloudBase Systems", email: "emily.r@cloudbase.com", phone: "+1 (555) 345-6789" },
                { name: "David Kim", company: "AI Innovations", email: "david.kim@aiinnovations.co", phone: "+1 (555) 456-7890" },
                { name: "Lisa Thompson", company: "ScaleUp Ventures", email: "lisa.t@scaleup.com", phone: "+1 (555) 567-8901" },
                { name: "Robert Martinez", company: "Future Systems", email: "r.martinez@futuresys.com", phone: "+1 (555) 678-9012" },
                { name: "Amanda Foster", company: "NextGen Analytics", email: "amanda.f@nextgen.io", phone: "+1 (555) 789-0123" },
                { name: "James Wilson", company: "Quantum Labs", email: "james.w@quantumlabs.net", phone: "+1 (555) 890-1234" }
              ].map((lead, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-6 bg-slate-700/40 rounded-xl border border-slate-600/30 hover:bg-slate-700/60 transition-all duration-200"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-lg">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{lead.name}</p>
                      <p className="text-slate-400 text-base">{lead.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 text-base">{lead.email}</p>
                    <p className="text-slate-400 text-base">{lead.phone}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-600/50">
              <p className="text-center text-slate-300 text-xl">
                Total results: <span className="text-white font-semibold">1,247 leads</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  switch (currentScreen) {
    case 'apollo':
      return renderApolloConfig();
    case 'apify':
      return renderApifyConfig();
    case 'phantombuster':
      return renderPhantomBusterConfig();
    case 'results':
      return renderResults();
    default:
      return renderOverview();
  }
}