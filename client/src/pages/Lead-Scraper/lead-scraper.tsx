import React, { useState } from 'react';
import { ArrowLeft, Target, Globe, Users, Brain, Shield, BarChart3, Play, Settings, CheckCircle, Download, ExternalLink, Slack, Plus, Info, Loader2 } from 'lucide-react';
import robotHeadImage from '@assets/A_flat_vector_illustration_features_a_robot_face_i_1750274873156.png';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

type Screen = 'overview' | 'apollo' | 'apify' | 'phantombuster' | 'scraping' | 'results';

export default function LeadScraperDashboard() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('overview');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const [scrapingResults, setScrapingResults] = useState<any>(null);

  const platforms = [
    {
      id: 'apollo',
      name: 'Apollo.io',
      icon: Target,
      color: 'blue',
      description: 'Professional B2B intelligence with 250M+ verified contacts and advanced enterprise filtering',
      features: ['✔ Verified Emails', '✔ Executive Targeting', '✔ Enterprise-grade accuracy']
    },
    {
      id: 'apify',
      name: 'Apify',
      icon: Globe,
      color: 'green',
      description: 'Advanced web intelligence platform for LinkedIn profiles and comprehensive business listings',
      features: ['✔ Web Intelligence', '✔ Business Listings', '✔ Custom data extraction']
    },
    {
      id: 'phantombuster',
      name: 'PhantomBuster',
      icon: Users,
      color: 'purple',
      description: 'Premium social media automation for LinkedIn, Twitter with intelligent connection management',
      features: ['✔ Safe Outreach', '✔ Social Automation', '✔ Multi-platform reach']
    }
  ];

  const systemFeatures = [
    {
      id: 'realtime',
      name: 'Real-Time Processing',
      icon: Brain,
      description: 'Instant lead extraction with live notifications',
      features: ['✔ Live Updates', '✔ Real-time Sync', '✔ Instant Notifications']
    },
    {
      id: 'security',
      name: 'Enterprise Security',
      icon: Shield,
      description: 'Bank-grade encryption and compliance',
      features: ['✔ Data Protection', '✔ Secure APIs', '✔ Compliance Ready']
    },
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      icon: BarChart3,
      description: 'Comprehensive reporting and insights',
      features: ['✔ Performance Metrics', '✔ Lead Scoring', '✔ ROI Analysis']
    }
  ];

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    setCurrentScreen(platformId as Screen);
  };

  const handleBackToCommandCenter = () => {
    window.location.href = '/command-center';
  };

  // Real scraper launch functions
  const launchApolloScraper = async () => {
    setIsScrapingInProgress(true);
    setSelectedPlatform('apollo');
    setCurrentScreen('scraping');
    
    try {
      const response = await fetch('/api/scraper/apollo/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          mode: 'live'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setScrapingResults(result);
        setCurrentScreen('results');
      } else {
        console.error('Apollo scraping failed:', result.error);
        setCurrentScreen('apollo');
      }
    } catch (error) {
      console.error('Apollo scraping error:', error);
      setCurrentScreen('apollo');
    } finally {
      setIsScrapingInProgress(false);
    }
  };

  const launchApifyScraper = async () => {
    setIsScrapingInProgress(true);
    setSelectedPlatform('apify');
    setCurrentScreen('scraping');
    
    try {
      const response = await fetch('/api/scraper/apify/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          mode: 'live'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setScrapingResults(result);
        setCurrentScreen('results');
      } else {
        console.error('Apify scraping failed:', result.error);
        setCurrentScreen('apify');
      }
    } catch (error) {
      console.error('Apify scraping error:', error);
      setCurrentScreen('apify');
    } finally {
      setIsScrapingInProgress(false);
    }
  };

  const launchPhantomBusterScraper = async () => {
    setIsScrapingInProgress(true);
    setSelectedPlatform('phantombuster');
    setCurrentScreen('scraping');
    
    try {
      const response = await fetch('/api/scraper/phantombuster/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          mode: 'live'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setScrapingResults(result);
        setCurrentScreen('results');
      } else {
        console.error('PhantomBuster scraping failed:', result.error);
        setCurrentScreen('phantombuster');
      }
    } catch (error) {
      console.error('PhantomBuster scraping error:', error);
      setCurrentScreen('phantombuster');
    } finally {
      setIsScrapingInProgress(false);
    }
  };

  const renderOverview = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#1E3A8A] py-12 px-4 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={robotHeadImage} 
              alt="YoBot" 
              className="w-16 h-16 object-cover rounded-full"
            />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400 mb-4">
            Enterprise Lead Intelligence Platform
          </h1>
          <p className="text-lg text-blue-100 text-center mb-8 max-w-4xl mx-auto" style={{ maxWidth: '70ch' }}>
            Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence.
          </p>
        </div>

        {/* Platform Selection Grid - Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-6 mb-8">
          {platforms.map((platform) => {
            const IconComponent = platform.icon;
            
            return (
              <div
                key={platform.id}
                onClick={() => handlePlatformSelect(platform.id)}
                className="rounded-2xl bg-gradient-to-br from-[#111827] to-[#1F2937] p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                <div className="text-center">
                  <IconComponent className="w-10 h-10 mx-auto mb-4 text-white" />
                  <h3 className="text-xl font-semibold text-white mb-2">{platform.name}</h3>
                  <p className="text-sm text-blue-200 mb-3">
                    {platform.description}
                  </p>
                  <div className="space-y-1">
                    {platform.features.map((feature, index) => (
                      <span
                        key={index}
                        className={`text-xs px-3 py-1 rounded-full mr-2 mb-1 inline-block ${
                          platform.color === 'blue' ? 'bg-blue-900 text-blue-200' :
                          platform.color === 'green' ? 'bg-green-900 text-green-200' :
                          'bg-purple-900 text-purple-200'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Features Grid - Bottom Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {systemFeatures.map((feature) => {
            const IconComponent = feature.icon;
            
            return (
              <div
                key={feature.id}
                className="rounded-2xl bg-gradient-to-br from-[#111827] to-[#1F2937] p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                <div className="text-center">
                  <IconComponent className="w-10 h-10 mx-auto mb-4 text-white" />
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.name}</h3>
                  <p className="text-sm text-blue-200 mb-3">
                    {feature.description}
                  </p>
                  <div className="space-y-1">
                    {feature.features.map((feat, index) => (
                      <span
                        key={index}
                        className="text-xs bg-slate-800 text-slate-200 px-3 py-1 rounded-full mr-2 mb-1 inline-block"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderApolloConfig = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              onClick={() => setCurrentScreen('overview')}
              variant="ghost"
              className="text-white hover:bg-white/10 mr-4 px-2 py-1 text-sm"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Platforms
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Apollo.io Professional Configuration</h1>
              <p className="text-blue-200 text-sm">Configure precision targeting parameters</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50 px-3 py-1 text-sm"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-1" />
            Save Preset
          </Button>
        </div>

        {/* Test Company Mode Toggle */}
        <div className="mb-6">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label className="text-white text-sm font-medium">Test Company Mode</Label>
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              <Switch className="data-[state=checked]:bg-blue-600" />
            </div>
          </div>
        </div>

        {/* Contact Filters */}
        <div className="mb-6">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/40 rounded-lg">
            <div className="border-b border-slate-600/30 p-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 text-blue-400 mr-2" />
                <h3 className="text-white font-medium text-base">Contact Filters</h3>
              </div>
              <p className="text-slate-400 text-xs mt-1">Target specific professionals and contact requirements</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 text-xs mb-1 block">Job Titles</Label>
                  <div className="flex space-x-1">
                    <Input
                      placeholder="e.g., CEO, VP Sales, Marketing Director"
                      className="bg-slate-700 border-slate-500 text-white placeholder:text-slate-400 text-sm h-9 flex-1"
                    />
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 h-8 rounded text-xs"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 text-xs mb-1 block">Seniority Level</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/60 border-slate-500/40 text-white h-8 text-xs rounded">
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
                  <Label className="text-slate-300 text-xs mb-1 block">Department</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/60 border-slate-500/40 text-white h-8 text-xs rounded">
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
                  <Label className="text-slate-300 text-xs mb-1 block">Location</Label>
                  <div className="flex space-x-1">
                    <Input
                      placeholder="e.g., New York, San Francisco, Remote"
                      className="bg-slate-700/60 border-slate-500/40 text-white placeholder:text-slate-500 text-xs h-8 flex-1 rounded"
                    />
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 h-8 rounded text-xs"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-verified" className="w-4 h-4 border-slate-400" />
                  <Label htmlFor="email-verified" className="text-slate-300 text-xs">Email Verified</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="phone-available" className="w-4 h-4 border-slate-400" />
                  <Label htmlFor="phone-available" className="text-slate-300 text-xs">Phone Number Available</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Filters */}
        <div className="mb-6">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/40 rounded-lg">
            <div className="border-b border-slate-600/30 p-4">
              <div className="flex items-center">
                <Target className="w-4 h-4 text-blue-400 mr-2" />
                <h3 className="text-white font-medium text-base">Company Filters</h3>
              </div>
              <p className="text-slate-400 text-xs mt-1">Target companies by industry, size, and characteristics</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 text-xs mb-1 block">Industry</Label>
                  <div className="flex space-x-1">
                    <Input
                      placeholder="e.g., Technology, Healthcare, Finance"
                      className="bg-slate-700/60 border-slate-500/40 text-white placeholder:text-slate-500 text-xs h-8 flex-1 rounded"
                    />
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 h-8 rounded text-xs"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 text-xs mb-1 block">Company Size</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/60 border-slate-500/40 text-white h-8 text-xs rounded">
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
                  <Label className="text-slate-300 text-xs mb-1 block">Funding Stage</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/60 border-slate-500/40 text-white h-8 text-xs rounded">
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
                  <Label className="text-slate-300 text-xs mb-1 block">Revenue Range</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/60 border-slate-500/40 text-white h-8 text-xs rounded">
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
                  <Label className="text-slate-300 text-xs mb-1 block">Technologies Used</Label>
                  <div className="flex space-x-1">
                    <Input
                      placeholder="e.g., Salesforce, HubSpot, AWS, React"
                      className="bg-slate-700/60 border-slate-500/40 text-white placeholder:text-slate-500 text-xs h-8 flex-1 rounded"
                    />
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 h-8 rounded text-xs"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 text-xs mb-1 block">Exclude Domains/Companies</Label>
                  <Input
                    placeholder="e.g., competitor1.com, competitor2.com"
                    className="bg-slate-700/60 border-slate-500/40 text-white placeholder:text-slate-500 text-xs h-8 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scraping Settings */}
        <div className="mb-8">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/40 rounded-lg">
            <div className="border-b border-slate-600/30 p-4">
              <div className="flex items-center">
                <Settings className="w-4 h-4 text-blue-400 mr-2" />
                <h3 className="text-white font-medium text-base">Scraping Settings</h3>
              </div>
              <p className="text-slate-400 text-xs mt-1">Configure scraping parameters and limits</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 text-xs mb-1 block">Data Freshness (days)</Label>
                  <Input
                    type="number"
                    defaultValue={30}
                    className="bg-slate-700/60 border-slate-500/40 text-white text-xs h-8 rounded"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs mb-1 block">Record Limit</Label>
                  <Input
                    type="number"
                    defaultValue={4000}
                    className="bg-slate-700/60 border-slate-500/40 text-white text-xs h-8 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-800/70 rounded-lg p-4 border border-slate-600/50">
          <div className="flex items-center space-x-4">
            <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 px-3 py-1 text-sm">
              7 filters applied
            </Badge>
            <span className="text-slate-300 text-sm">Estimated leads: 4,000</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50 px-4 py-2 text-sm"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={launchApolloScraper}
              disabled={isScrapingInProgress}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              size="sm"
            >
              {isScrapingInProgress ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              onClick={() => setCurrentScreen('overview')}
              variant="ghost"
              className="text-white hover:bg-white/10 mr-6 px-2 py-1"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Platforms
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Apify Advanced Configuration</h1>
              <p className="text-blue-200 text-sm">Configure precision targeting parameters</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50 px-4 py-2 text-sm"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Save Preset
          </Button>
        </div>

        {/* Test Company Mode Toggle */}
        <div className="mb-6">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label className="text-white text-sm font-medium">Test Company Mode</Label>
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              <Switch className="data-[state=checked]:bg-green-600" />
            </div>
          </div>
        </div>

        {/* Location Filters */}
        <div className="mb-6">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-lg">
            <div className="border-b border-slate-600/30 p-4">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-white mr-3" />
                <div>
                  <h3 className="text-white font-medium">Location Filters</h3>
                  <p className="text-slate-400 text-sm">Target specific geographic areas and search parameters</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">Search Terms</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="e.g., restaurants, hotels, gyms"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-sm h-9 flex-1"
                    />
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white px-3 h-9"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">Location (City/State/ZIP)</Label>
                  <Input
                    placeholder="e.g., New York, NY or 10001"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-sm h-9"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">Search Radius (miles)</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
                      <SelectValue placeholder="25 miles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 miles</SelectItem>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">Industry Category</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurants">Restaurants</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label className="text-slate-300 text-sm mb-2 block">Exclude Keywords</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="e.g., closed, temporary, franchise"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-sm h-9 flex-1"
                    />
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white px-3 h-9"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Filters */}
        <div className="mb-8">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-lg">
            <div className="border-b border-slate-600/30 p-4">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-white mr-3" />
                <div>
                  <h3 className="text-white font-medium">Quality Filters</h3>
                  <p className="text-slate-400 text-sm">Set quality thresholds and data extraction preferences</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">Minimum Reviews Required</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
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
                  <Label className="text-slate-300 text-sm mb-2 block">Minimum Rating</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
                      <SelectValue placeholder="Select minimum rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">Max Listings to Pull</Label>
                  <Input
                    type="number"
                    defaultValue={1000}
                    className="bg-slate-700/50 border-slate-600 text-white text-sm h-9"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">Delay Between Requests (seconds)</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
                      <SelectValue placeholder="2 seconds" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 second</SelectItem>
                      <SelectItem value="2">2 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="extract-contact-apify" className="border-slate-400" />
                <Label htmlFor="extract-contact-apify" className="text-slate-300 text-sm">
                  Extract Contact Info (email, phone, website)
                </Label>
                <Info className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-800/70 rounded-lg p-4 border border-slate-600/50">
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-600/20 text-green-300 border-green-500/30 px-3 py-1 text-sm">
              3 filters applied
            </Badge>
            <span className="text-slate-300 text-sm">Estimated listings: 1,000</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50 px-4 py-2 text-sm"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={launchApifyScraper}
              disabled={isScrapingInProgress}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
              size="sm"
            >
              {isScrapingInProgress ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              onClick={() => setCurrentScreen('overview')}
              variant="ghost"
              className="text-white hover:bg-white/10 mr-6 px-2 py-1"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Platforms
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">PhantomBuster Configuration</h1>
              <p className="text-blue-200 text-sm">Configure precision targeting parameters</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50 px-4 py-2 text-sm"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Save Preset
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Contact Filters */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-lg">
            <div className="border-b border-slate-600/30 p-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-white mr-3" />
                <div>
                  <h3 className="text-white font-medium">Contact Filters</h3>
                  <p className="text-slate-400 text-sm">Target specific profiles</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Platform</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
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
                <Label className="text-slate-300 text-sm mb-2 block">Keywords</Label>
                <Input
                  placeholder="Enter keywords"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-sm h-9"
                />
              </div>

              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Connection Degree</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
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
                <Label className="text-slate-300 text-sm mb-2 block">Seniority Level</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
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
                <Label className="text-slate-300 text-sm mb-2 block">Department/Function</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Company Filters */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-lg">
            <div className="border-b border-slate-600/30 p-4">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-white mr-3" />
                <div>
                  <h3 className="text-white font-medium">Company Filters</h3>
                  <p className="text-slate-400 text-sm">Target specific companies</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Industry</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
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
                <Label className="text-slate-300 text-sm mb-2 block">Company Size</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
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
                <Label className="text-slate-300 text-sm mb-2 block">Location</Label>
                <Input
                  placeholder="Enter location"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-sm h-9"
                />
              </div>
            </div>
          </div>

          {/* Execution Settings */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-lg">
            <div className="border-b border-slate-600/30 p-4">
              <div className="flex items-center">
                <Settings className="w-5 h-5 text-white mr-3" />
                <div>
                  <h3 className="text-white font-medium">Execution Settings</h3>
                  <p className="text-slate-400 text-sm">Configure automation rules</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Execution Method</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-9 text-sm">
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
                <Label className="text-slate-300 text-sm mb-2 block">Daily Connection Limit</Label>
                <Input
                  type="number"
                  defaultValue={20}
                  className="bg-slate-700/50 border-slate-600 text-white text-sm h-9"
                />
              </div>

              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Retry Attempts</Label>
                <Input
                  type="number"
                  defaultValue={3}
                  className="bg-slate-700/50 border-slate-600 text-white text-sm h-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-800/70 rounded-lg p-4 border border-slate-600/50">
          <div className="flex items-center space-x-4">
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 px-3 py-1 text-sm">
              0 filters applied
            </Badge>
            <span className="text-slate-300 text-sm">Estimated profiles: 700</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50 px-4 py-2 text-sm"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Save Preset
            </Button>
            
            <Button
              onClick={launchPhantomBusterScraper}
              disabled={isScrapingInProgress}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm"
              size="sm"
            >
              {isScrapingInProgress ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Launch PhantomBuster Scraper
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScrapingInProgress = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-12">
          {/* Animated Loading Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          </div>

          {/* Status Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              {selectedPlatform === 'apollo' && 'Apollo Scraper Running'}
              {selectedPlatform === 'apify' && 'Apify Scraper Running'}
              {selectedPlatform === 'phantombuster' && 'PhantomBuster Scraper Running'}
            </h1>
            <p className="text-blue-200 text-lg mb-6">
              Scraping in progress... Your leads are being extracted and processed.
            </p>
            <div className="text-slate-300 text-base">
              <p className="mb-2">⏳ Estimated time: 1–2 minutes</p>
              <p className="mb-4">This screen will update automatically when data is ready.</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-lg">
              <span className="text-white">Initializing scraper...</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-lg">
              <span className="text-white">Extracting lead data...</span>
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg opacity-50">
              <span className="text-slate-400">Sending Slack notification...</span>
              <div className="w-5 h-5 rounded-full border-2 border-slate-500"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg opacity-50">
              <span className="text-slate-400">Syncing to Airtable...</span>
              <div className="w-5 h-5 rounded-full border-2 border-slate-500"></div>
            </div>
          </div>

          {/* Cancel Button */}
          <Button
            onClick={() => setCurrentScreen('overview')}
            variant="outline"
            className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50"
          >
            Cancel and Return to Overview
          </Button>
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
    case 'scraping':
      return renderScrapingInProgress();
    case 'results':
      return renderResults();
    default:
      return renderOverview();
  }
}