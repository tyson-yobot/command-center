import React, { useState } from 'react';
import { X, Target, Settings, Globe, Users, Brain, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LeadScraperPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadScraperPopup: React.FC<LeadScraperPopupProps> = ({ isOpen, onClose }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Enterprise Lead Intelligence Platform
          </h2>
          <p className="text-blue-100 text-sm">
            Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence
          </p>
        </div>

        {/* Platform Selection Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {platforms.map((platform) => {
              const IconComponent = platform.icon;
              const isSelected = selectedPlatform === platform.id;
              
              return (
                <div
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`
                    bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 cursor-pointer
                    border transition-all duration-200 hover:scale-105
                    ${isSelected 
                      ? 'border-white/30 bg-slate-700/70' 
                      : 'border-slate-600/50 hover:border-slate-500/70'
                    }
                  `}
                >
                  <div className="text-center mb-3">
                    <div className={`
                      w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center
                      ${platform.color === 'blue' ? 'bg-blue-600' : 
                        platform.color === 'green' ? 'bg-green-600' : 'bg-purple-600'}
                    `}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                    {platform.description}
                  </p>
                  
                  <div className="space-y-2">
                    {platform.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`
                          w-2 h-2 rounded-full mr-2
                          ${platform.color === 'blue' ? 'bg-blue-400' : 
                            platform.color === 'green' ? 'bg-green-400' : 'bg-purple-400'}
                        `} />
                        <span className="text-xs text-slate-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {additionalFeatures.map((feature) => {
              const IconComponent = feature.icon;
              
              return (
                <div
                  key={feature.id}
                  className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30"
                >
                  <div className="flex items-center mb-2">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center mr-3
                      ${feature.color === 'blue' ? 'bg-blue-600/20' : 
                        feature.color === 'green' ? 'bg-green-600/20' : 'bg-purple-600/20'}
                    `}>
                      <IconComponent className={`
                        w-4 h-4
                        ${feature.color === 'blue' ? 'text-blue-400' : 
                          feature.color === 'green' ? 'text-green-400' : 'text-purple-400'}
                      `} />
                    </div>
                    <h4 className="font-medium text-white text-sm">{feature.name}</h4>
                  </div>
                  <p className="text-slate-400 text-xs">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                {selectedPlatform === 'apollo' ? '7 filters applied' :
                 selectedPlatform === 'apify' ? '3 filters applied' :
                 selectedPlatform === 'phantombuster' ? '0 filters applied' :
                 'Select platform'}
              </Badge>
              {selectedPlatform && (
                <span className="text-slate-400 text-sm">
                  Estimated {
                    selectedPlatform === 'apollo' ? 'leads: 4,000' :
                    selectedPlatform === 'apify' ? 'listings: 1,000' :
                    'profiles: 700'
                  }
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                className="bg-slate-700/50 hover:bg-slate-600/70 text-white border-slate-500/50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              
              {selectedPlatform && (
                <Button className={`
                  text-white font-medium
                  ${selectedPlatform === 'apollo' ? 'bg-blue-600 hover:bg-blue-700' :
                    selectedPlatform === 'apify' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-purple-600 hover:bg-purple-700'}
                `}>
                  Launch {platforms.find(p => p.id === selectedPlatform)?.name} Scraper
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};