import React, { useState } from 'react';
import { ArrowLeft, Target, Globe, Users, Brain, Shield, BarChart3, Play, Settings, CheckCircle, Download, ExternalLink, Slack, Plus, Info } from 'lucide-react';
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
      color: 'green',
      description: 'Instant lead extraction with live notifications',
      features: ['✔ Live Updates', '✔ Real-time Sync', '✔ Instant Notifications']
    },
    {
      id: 'security',
      name: 'Enterprise Security',
      icon: Shield,
      color: 'blue',
      description: 'Bank-grade encryption and compliance',
      features: ['✔ Data Protection', '✔ Secure APIs', '✔ Compliance Ready']
    },
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      icon: BarChart3,
      color: 'purple',
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
                className={`rounded-2xl p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer ${
                  platform.color === 'blue' ? 'bg-gradient-to-br from-blue-900/80 to-blue-800/60 border border-blue-700/50' :
                  platform.color === 'green' ? 'bg-gradient-to-br from-green-900/80 to-green-800/60 border border-green-700/50' :
                  'bg-gradient-to-br from-purple-900/80 to-purple-800/60 border border-purple-700/50'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    platform.color === 'blue' ? 'bg-blue-600' :
                    platform.color === 'green' ? 'bg-green-600' :
                    'bg-purple-600'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      platform.color === 'blue' ? 'text-blue-100' :
                      platform.color === 'green' ? 'text-green-100' :
                      'text-purple-100'
                    }`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    platform.color === 'blue' ? 'text-blue-100' :
                    platform.color === 'green' ? 'text-green-100' :
                    'text-purple-100'
                  }`}>{platform.name}</h3>
                  <p className={`text-sm mb-3 ${
                    platform.color === 'blue' ? 'text-blue-200' :
                    platform.color === 'green' ? 'text-green-200' :
                    'text-purple-200'
                  }`}>
                    {platform.description}
                  </p>
                  <div className="space-y-1">
                    {platform.features.map((feature, index) => (
                      <span
                        key={index}
                        className={`text-xs px-3 py-1 rounded-full mr-2 mb-1 inline-block ${
                          platform.color === 'blue' ? 'bg-blue-800 text-blue-100' :
                          platform.color === 'green' ? 'bg-green-800 text-green-100' :
                          'bg-purple-800 text-purple-100'
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
                className={`rounded-2xl p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer ${
                  feature.color === 'blue' ? 'bg-gradient-to-br from-blue-900/80 to-blue-800/60 border border-blue-700/50' :
                  feature.color === 'green' ? 'bg-gradient-to-br from-green-900/80 to-green-800/60 border border-green-700/50' :
                  'bg-gradient-to-br from-purple-900/80 to-purple-800/60 border border-purple-700/50'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    feature.color === 'blue' ? 'bg-blue-600' :
                    feature.color === 'green' ? 'bg-green-600' :
                    'bg-purple-600'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      feature.color === 'blue' ? 'text-blue-100' :
                      feature.color === 'green' ? 'text-green-100' :
                      'text-purple-100'
                    }`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    feature.color === 'blue' ? 'text-blue-100' :
                    feature.color === 'green' ? 'text-green-100' :
                    'text-purple-100'
                  }`}>{feature.name}</h3>
                  <p className={`text-sm mb-3 ${
                    feature.color === 'blue' ? 'text-blue-200' :
                    feature.color === 'green' ? 'text-green-200' :
                    'text-purple-200'
                  }`}>
                    {feature.description}
                  </p>
                  <div className="space-y-1">
                    {feature.features.map((feat, index) => (
                      <span
                        key={index}
                        className={`text-xs px-3 py-1 rounded-full mr-2 mb-1 inline-block ${
                          feature.color === 'blue' ? 'bg-blue-800 text-blue-100' :
                          feature.color === 'green' ? 'bg-green-800 text-green-100' :
                          'bg-purple-800 text-purple-100'
                        }`}
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

  // The rest of the component remains as before...
  if (currentScreen === 'overview') {
    return renderOverview();
  }

  // Return overview for now (other screens not shown for brevity)
  return renderOverview();
}