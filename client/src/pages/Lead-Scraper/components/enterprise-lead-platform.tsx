import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Globe, Users, CheckCircle, Shield, TrendingUp, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface PlatformCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
  badges: Array<{
    text: string;
    color: string;
  }>;
  onConfigure: () => void;
}

function PlatformCard({ title, description, icon, gradient, features, badges, onConfigure }: PlatformCardProps) {
  // Determine icon background color based on title
  const getIconBackground = () => {
    if (title === 'Apollo.io') return 'bg-blue-500';
    if (title === 'Apify') return 'bg-green-500';
    if (title === 'PhantomBuster') return 'bg-purple-500';
    return 'bg-blue-500';
  };

  return (
    <Card className="bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#1e3a8a] p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 text-white">
      <CardHeader className="text-center pb-4">
        <div className={`w-20 h-20 mx-auto ${getIconBackground()} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
          {icon}
        </div>
        <CardTitle className="text-2xl font-bold text-white mb-3">{title}</CardTitle>
        <p className="text-white/80 text-sm leading-relaxed">{description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature Badges */}
        <div className="space-y-3">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center justify-center">
              <Badge variant="outline" className="bg-white/10 border-white/30 text-white text-xs px-4 py-2 rounded-full">
                {badge.text}
              </Badge>
            </div>
          ))}
        </div>
        
        {/* Features List */}
        <div className="pt-4 border-t border-white/20 space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 text-white/70 text-sm">
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              {feature}
            </div>
          ))}
        </div>
        
        <Button 
          onClick={onConfigure}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 mt-6 py-3 rounded-xl font-semibold"
        >
          Configure Platform
        </Button>
      </CardContent>
    </Card>
  );
}

interface EnterpriseLeadPlatformProps {
  onPlatformSelect?: (platform: string) => void;
  onNavigateToScraper?: () => void;
}

export default function EnterpriseLeadPlatform({ onPlatformSelect, onNavigateToScraper }: EnterpriseLeadPlatformProps) {
  const handleApolloConfig = () => {
    if (onPlatformSelect) {
      onPlatformSelect('apollo');
    }
  };
  
  const handleApifyConfig = () => {
    if (onPlatformSelect) {
      onPlatformSelect('apify');
    }
  };
  
  const handlePhantomBusterConfig = () => {
    if (onPlatformSelect) {
      onPlatformSelect('phantombuster');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500 text-center mb-4">
            Enterprise Lead Intelligence Platform
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Apollo.io Card */}
          <PlatformCard
            title="Apollo.io"
            description="Professional B2B intelligence with 250M+ verified contacts and advanced enterprise filtering"
            icon={<Target className="w-8 h-8 text-white" />}
            gradient="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800"
            badges={[
              { text: "Verified Emails", color: "bg-blue-500/80" },
              { text: "Executive Targeting", color: "bg-blue-500/80" }
            ]}
            features={[
              "Enterprise-grade accuracy",
              "250M+ verified contacts",
              "Advanced filtering options"
            ]}
            onConfigure={handleApolloConfig}
          />

          {/* Apify Card */}
          <PlatformCard
            title="Apify"
            description="Advanced web intelligence platform for LinkedIn profiles and comprehensive business listings"
            icon={<Globe className="w-8 h-8 text-white" />}
            gradient="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800"
            badges={[
              { text: "Web Intelligence", color: "bg-green-500/80" },
              { text: "Business Listings", color: "bg-green-500/80" }
            ]}
            features={[
              "Custom data extraction",
              "LinkedIn profile scraping",
              "Real-time data collection"
            ]}
            onConfigure={handleApifyConfig}
          />

          {/* PhantomBuster Card */}
          <PlatformCard
            title="PhantomBuster"
            description="Premium social media automation for LinkedIn, Twitter with intelligent connection management"
            icon={<Users className="w-8 h-8 text-white" />}
            gradient="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800"
            badges={[
              { text: "Social Automation", color: "bg-purple-500/80" },
              { text: "Safe Outreach", color: "bg-purple-500/80" }
            ]}
            features={[
              "Multi-platform reach",
              "Intelligent automation",
              "Safe connection limits"
            ]}
            onConfigure={handlePhantomBusterConfig}
          />
        </div>

        {/* Bottom Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          
          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30 text-white">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-bold mb-2">Real-time Processing</h3>
              <p className="text-white/70 text-sm">Instant lead extraction with live notifications</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 text-white">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
              <p className="text-white/70 text-sm">Bank-grade encryption and compliance</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 text-white">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-white/70 text-sm">Comprehensive reporting and insights</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}