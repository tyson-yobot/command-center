import React, { useState } from 'react';
import { ArrowLeft, Target, Globe, Users, Brain, Shield, BarChart3, Play, Settings, CheckCircle, Download, ExternalLink, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

type Screen = 'overview' | 'apollo' | 'apify' | 'phantombuster' | 'results';

export default function LeadScraperDashboard() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('overview');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [apolloFilters, setApolloFilters] = useState({
    jobTitles: [] as string[],
    seniorityLevel: '',
    department: '',
    location: '',
    emailVerified: false,
    phoneAvailable: false,
    industry: [] as string[],
    companySize: '',
    fundingStage: '',
    revenueRange: '',
    technologies: '',
    excludeDomains: '',
    dataFreshness: 30,
    recordLimit: 1000
  });

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

  const renderOverview = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Enterprise Lead Intelligence Platform
          </h1>
          <p className="text-blue-100 text-lg max-w-3xl mx-auto">
            Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence
          </p>
        </div>

        {/* Platform Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {platforms.map((platform) => {
            const IconComponent = platform.icon;
            
            return (
              <Card
                key={platform.id}
                onClick={() => handlePlatformSelect(platform.id)}
                className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50 cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-slate-700/70"
              >
                <CardHeader className="text-center pb-4">
                  <div className={`
                    w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center
                    ${platform.color === 'blue' ? 'bg-blue-600' : 
                      platform.color === 'green' ? 'bg-green-600' : 'bg-purple-600'}
                  `}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">{platform.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 mb-4 leading-relaxed">
                    {platform.description}
                  </CardDescription>
                  <div className="space-y-2">
                    {platform.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className={`
                          w-4 h-4 mr-2
                          ${platform.color === 'blue' ? 'text-blue-400' : 
                            platform.color === 'green' ? 'text-green-400' : 'text-purple-400'}
                        `} />
                        <span className="text-sm text-slate-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {additionalFeatures.map((feature) => {
            const IconComponent = feature.icon;
            
            return (
              <Card
                key={feature.id}
                className="bg-slate-800/40 backdrop-blur-sm border-slate-600/30"
              >
                <CardHeader>
                  <div className="flex items-center">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center mr-4
                      ${feature.color === 'blue' ? 'bg-blue-600/20' : 
                        feature.color === 'green' ? 'bg-green-600/20' : 'bg-purple-600/20'}
                    `}>
                      <IconComponent className={`
                        w-6 h-6
                        ${feature.color === 'blue' ? 'text-blue-400' : 
                          feature.color === 'green' ? 'text-green-400' : 'text-purple-400'}
                      `} />
                    </div>
                    <CardTitle className="text-lg text-white">{feature.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            onClick={() => setCurrentScreen('overview')}
            variant="ghost"
            className="text-white hover:bg-white/10 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Apollo.io Configuration</h1>
              <p className="text-blue-100">Professional B2B intelligence platform</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Contact Filters */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Contact Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">Job Titles</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select job titles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="cto">CTO</SelectItem>
                    <SelectItem value="vp-sales">VP of Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Seniority Level</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                <Label className="text-slate-300">Department</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Location</Label>
                <Input
                  placeholder="Enter location"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="email-verified" />
                <Label htmlFor="email-verified" className="text-slate-300">Email Verified</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="phone-available" />
                <Label htmlFor="phone-available" className="text-slate-300">Phone Number Available</Label>
              </div>
            </CardContent>
          </Card>

          {/* Company Filters */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Company Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">Industry</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                <Label className="text-slate-300">Company Size</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                <Label className="text-slate-300">Funding Stage</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select funding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Revenue Range</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select revenue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                    <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                    <SelectItem value="50m+">$50M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Technologies Used</Label>
                <Input
                  placeholder="e.g., Salesforce, HubSpot"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <Label className="text-slate-300">Exclude Domains/Companies</Label>
                <Textarea
                  placeholder="Enter domains to exclude"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scraping Settings */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Scraping Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Data Freshness (days)</Label>
              <Input
                type="number"
                defaultValue={30}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Record Limit</Label>
              <Input
                type="number"
                defaultValue={1000}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-4">
            <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
              7 filters applied
            </Badge>
            <span className="text-slate-400">Estimated Leads: 4,000</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={() => setCurrentScreen('results')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch Apollo Scraper
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApifyConfig = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            onClick={() => setCurrentScreen('overview')}
            variant="ghost"
            className="text-white hover:bg-white/10 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Apify Configuration</h1>
              <p className="text-blue-100">Advanced web intelligence platform</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Location Filters */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Location Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">Search Terms</Label>
                <Input
                  placeholder="Enter search keywords"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <Label className="text-slate-300">Location</Label>
                <Input
                  placeholder="City, State, Country"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <Label className="text-slate-300">Search Radius</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                <Label className="text-slate-300">Industry Category</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurants">Restaurants</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Exclude Keywords</Label>
                <Input
                  placeholder="Keywords to exclude"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quality Filters */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Quality Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">Min Reviews</Label>
                <Input
                  type="number"
                  placeholder="Minimum number of reviews"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <Label className="text-slate-300">Min Rating</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                <Label className="text-slate-300">Max Listings to Pull</Label>
                <Input
                  type="number"
                  defaultValue={500}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">Delay Between Requests (ms)</Label>
                <Input
                  type="number"
                  defaultValue={1000}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="extract-contact" />
                <Label htmlFor="extract-contact" className="text-slate-300">
                  Extract Contact Info
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
              3 filters applied
            </Badge>
            <span className="text-slate-400">Estimated Listings: 1,000</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={() => setCurrentScreen('results')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch Apify Scraper
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhantomBusterConfig = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            onClick={() => setCurrentScreen('overview')}
            variant="ghost"
            className="text-white hover:bg-white/10 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">PhantomBuster Configuration</h1>
              <p className="text-blue-100">Premium social media automation platform</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Contact Filters */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Contact Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">Platform</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                <Label className="text-slate-300">Keywords</Label>
                <Input
                  placeholder="Enter keywords"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <Label className="text-slate-300">Connection Degree</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                <Label className="text-slate-300">Seniority Level</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                <Label className="text-slate-300">Department/Function</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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

          {/* Company Filters & Execution Settings */}
          <div className="space-y-6">
            <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Company Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Industry</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                  <Label className="text-slate-300">Company Size</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                  <Label className="text-slate-300">Location</Label>
                  <Input
                    placeholder="Enter location"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Execution Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Execution Method</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                  <Label className="text-slate-300">Daily Connection Limit</Label>
                  <Input
                    type="number"
                    defaultValue={20}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Retry Attempts</Label>
                  <Input
                    type="number"
                    defaultValue={3}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-4">
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
              0 filters applied
            </Badge>
            <span className="text-slate-400">Estimated Profiles: 700</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={() => setCurrentScreen('results')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch PhantomBuster Scraper
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            onClick={() => setCurrentScreen('overview')}
            variant="ghost"
            className="text-white hover:bg-white/10 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Platform Selection
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Intelligence Results</h1>
            <p className="text-blue-100">
              Extracted 1,247 high-quality leads using {selectedPlatform || 'Apollo'}
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-600/20 backdrop-blur-sm border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
                <div>
                  <p className="text-green-300 font-medium">Slack Notification</p>
                  <p className="text-green-200 text-sm">Sent to #leads-channel</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-600/20 backdrop-blur-sm border-blue-500/30">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full text-blue-300 hover:text-blue-200 hover:bg-blue-600/20 p-0 h-auto"
              >
                <ExternalLink className="w-8 h-8 mr-3" />
                <div className="text-left">
                  <p className="font-medium">View in Airtable</p>
                  <p className="text-sm">Open database</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-purple-600/20 backdrop-blur-sm border-purple-500/30">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full text-purple-300 hover:text-purple-200 hover:bg-purple-600/20 p-0 h-auto"
              >
                <Download className="w-8 h-8 mr-3" />
                <div className="text-left">
                  <p className="font-medium">CSV Export</p>
                  <p className="text-sm">Download results</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results List */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-white">Lead Results</CardTitle>
            <CardDescription className="text-slate-300">
              Most recent high-quality leads extracted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Sarah Johnson", company: "TechFlow Inc", email: "sarah.j@techflow.com", phone: "+1 (555) 123-4567" },
                { name: "Michael Chen", company: "DataSync Solutions", email: "m.chen@datasync.io", phone: "+1 (555) 234-5678" },
                { name: "Emily Rodriguez", company: "CloudBase Systems", email: "emily.r@cloudbase.com", phone: "+1 (555) 345-6789" },
                { name: "David Kim", company: "AI Innovations", email: "david.kim@aiinnovations.co", phone: "+1 (555) 456-7890" },
                { name: "Lisa Thompson", company: "ScaleUp Ventures", email: "lisa.t@scaleup.com", phone: "+1 (555) 567-8901" }
              ].map((lead, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{lead.name}</p>
                      <p className="text-slate-400 text-sm">{lead.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 text-sm">{lead.email}</p>
                    <p className="text-slate-400 text-sm">{lead.phone}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-600/50">
              <p className="text-center text-slate-400">
                Total results: <span className="text-white font-medium">1,247 leads</span>
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