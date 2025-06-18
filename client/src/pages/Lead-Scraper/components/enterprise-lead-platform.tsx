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
  return (
    <Card className={`${gradient} border-0 text-white shadow-2xl hover:scale-105 transition-all duration-300`}>
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4">
          {icon}
        </div>
        <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
        <p className="text-white/80 text-sm leading-relaxed">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feature Badges */}
        <div className="space-y-2">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2">
              <Badge variant="outline" className={`${badge.color} border-white/30 text-white text-xs px-3 py-1`}>
                {badge.text}
              </Badge>
            </div>
          ))}
        </div>
        
        {/* Features List */}
        <div className="pt-4 border-t border-white/20">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-white/70 text-xs mb-1">
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
              {feature}
            </div>
          ))}
        </div>
        
        <Button 
          onClick={onConfigure}
          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 mt-4"
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
          <h1 className="text-5xl font-bold text-white mb-4">
            Enterprise Lead Intelligence Platform
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Apollo.io Card */}
          <PlatformCard
            title="Apollo.io"
            description="Professional B2B intelligence with 250M+ verified contacts and advanced enterprise filtering"
            icon={<Target className="w-8 h-8 text-blue-600" />}
            gradient="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"
            badges={[
              { text: "Verified Emails", color: "bg-blue-500/30" },
              { text: "Executive Targeting", color: "bg-blue-500/30" }
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
            icon={<Globe className="w-8 h-8 text-green-600" />}
            gradient="bg-gradient-to-br from-green-600 via-green-700 to-green-800"
            badges={[
              { text: "Web Intelligence", color: "bg-green-500/30" },
              { text: "Business Listings", color: "bg-green-500/30" }
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
            icon={<Users className="w-8 h-8 text-purple-600" />}
            gradient="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800"
            badges={[
              { text: "Social Automation", color: "bg-purple-500/30" },
              { text: "Safe Outreach", color: "bg-purple-500/30" }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
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