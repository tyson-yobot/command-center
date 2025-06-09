import React, { useState } from "react";
import { 
  Target,
  Globe,
  Users,
  Play,
  Download,
  RefreshCw,
  ArrowLeft,
  Building,
  MapPin,
  Mail,
  Phone,
  Star,
  Eye,
  CheckCircle,
  AlertCircle,
  Shield,
  Zap,
  TrendingUp,
  Save,
  Search,
  Settings,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ApolloScraperPanel from "./apollo-scraper-panel";
import ApifyScraperPanel from "./apify-scraper-panel";
import PhantomBusterScraperPanel from "./phantombuster-scraper-panel";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  location: string;
  score?: number;
}

interface ScrapingResult {
  success: boolean;
  leads: Lead[];
  count: number;
  filters: any;
}

export default function ProfessionalLeadScraper() {
  const [currentStep, setCurrentStep] = useState<'tool-selection' | 'filters' | 'results'>('tool-selection');
  const [selectedTool, setSelectedTool] = useState<'apollo' | 'apify' | 'phantombuster' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScrapingResult | null>(null);
  const { toast } = useToast();

  const handleToolSelection = (tool: 'apollo' | 'apify' | 'phantombuster') => {
    setSelectedTool(tool);
    setCurrentStep('filters');
    setError(null);
  };

  const handleApolloLaunch = async (filters: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/launch-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tool: 'apollo',
          filters 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        setCurrentStep('results');
        toast({
          title: "Apollo Scraper Launched",
          description: `✅ ${data.leadCount} leads scraped. View in Airtable`,
        });
      } else {
        setError(data.error || 'Apollo scraping failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApifyLaunch = async (filters: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/launch-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tool: 'apify',
          filters 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        setCurrentStep('results');
        toast({
          title: "Apify Scraper Launched",
          description: `✅ ${data.leadCount} listings scraped. View in Airtable`,
        });
      } else {
        setError(data.error || 'Apify scraping failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhantomBusterLaunch = async (filters: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scraping/phantombuster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        setCurrentStep('results');
        toast({
          title: "PhantomBuster Scraper Launched",
          description: `✅ ${data.count} profiles scraped. View in Airtable`,
        });
      } else {
        setError(data.message || 'PhantomBuster scraping failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToToolSelection = () => {
    setCurrentStep('tool-selection');
    setSelectedTool(null);
    setResults(null);
    setError(null);
  };

  // Tool Selection Step
  if (currentStep === 'tool-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-6 rounded-full shadow-2xl animate-pulse">
                <Target className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6">
              YoBot Lead Intelligence Platform
            </h1>
            <p className="text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Advanced multi-platform lead generation with enterprise-grade targeting and real-time intelligence
            </p>
          </div>

          {/* Platform Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            {/* Apollo.io */}
            <Card 
              onClick={() => handleToolSelection('apollo')}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-300 p-8 bg-gradient-to-br from-blue-500/10 to-blue-600/20 backdrop-blur-xl border-2 border-blue-400/30 hover:border-blue-300/60 rounded-3xl"
            >
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl mb-6 mx-auto w-fit">
                  <Globe className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Apollo.io</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Professional B2B contact database with 275M+ verified contacts and advanced filtering
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-300">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Email & Phone Verification</span>
                  </div>
                  <div className="flex items-center text-blue-300">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Company Intelligence</span>
                  </div>
                  <div className="flex items-center text-blue-300">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Technographic Filters</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Apify */}
            <Card 
              onClick={() => handleToolSelection('apify')}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-300 p-8 bg-gradient-to-br from-green-500/10 to-green-600/20 backdrop-blur-xl border-2 border-green-400/30 hover:border-green-300/60 rounded-3xl"
            >
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl mb-6 mx-auto w-fit">
                  <Search className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Apify</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Google Maps & business directory scraping with location-based targeting and reviews
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-green-300">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Google Maps Scraping</span>
                  </div>
                  <div className="flex items-center text-green-300">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Local Business Data</span>
                  </div>
                  <div className="flex items-center text-green-300">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Review & Rating Data</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* PhantomBuster */}
            <Card 
              onClick={() => handleToolSelection('phantombuster')}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-300 p-8 bg-gradient-to-br from-purple-500/10 to-purple-600/20 backdrop-blur-xl border-2 border-purple-400/30 hover:border-purple-300/60 rounded-3xl"
            >
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl mb-6 mx-auto w-fit">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">PhantomBuster</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  LinkedIn automation for connection building, profile scraping, and network expansion
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-purple-300">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>LinkedIn Profile Data</span>
                  </div>
                  <div className="flex items-center text-purple-300">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Connection Automation</span>
                  </div>
                  <div className="flex items-center text-purple-300">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Network Intelligence</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Enterprise Features Bar */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-3xl border border-slate-600/30 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Real-time Processing</h4>
                <p className="text-slate-400">Instant lead extraction with live notifications</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-2xl mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Enterprise Security</h4>
                <p className="text-slate-400">Bank-grade encryption and compliance</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-4 rounded-2xl mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h4>
                <p className="text-slate-400">Comprehensive reporting and insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter Configuration Step
  if (currentStep === 'filters' && selectedTool) {
    const toolConfig = {
      apollo: { name: 'Apollo.io Professional Configuration', color: 'blue' as const },
      apify: { name: 'Apify Advanced Configuration', color: 'green' as const },
      phantombuster: { name: 'PhantomBuster Professional Setup', color: 'purple' as const }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pb-32">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-xl border-b border-slate-700/50 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                onClick={resetToToolSelection}
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Platforms
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  {toolConfig[selectedTool].name}
                </h1>
                <p className="text-slate-300">Configure precision targeting parameters</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Preset
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-8">
          {error && (
            <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 backdrop-blur-xl border-2 border-red-400/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-400 mr-3" />
                <span className="text-red-200 text-lg font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Dynamic Scraper Panel Integration */}
          {selectedTool === 'apollo' && (
            <ApolloScraperPanel 
              onLaunch={handleApolloLaunch}
              isLoading={isLoading}
            />
          )}
          
          {selectedTool === 'apify' && (
            <ApifyScraperPanel 
              onLaunch={handleApifyLaunch}
              isLoading={isLoading}
            />
          )}
          
          {selectedTool === 'phantombuster' && (
            <PhantomBusterScraperPanel 
              onLaunch={handlePhantomBusterLaunch}
              isLoading={isLoading}
            />
          )}

        </div>
      </div>
    );
  }

  // Results Step
  if (currentStep === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                onClick={resetToToolSelection}
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Search
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Lead Generation Results
                </h1>
                <p className="text-slate-300">{results.count} leads found</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="w-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>

          {/* Results Grid */}
          <div className="grid gap-4">
            {results.leads.map((lead, index) => (
              <Card key={index} className="p-6 bg-slate-800/50 border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="font-semibold text-white">{lead.fullName}</div>
                    <div className="text-slate-400">{lead.title}</div>
                  </div>
                  <div>
                    <div className="text-slate-300">{lead.company}</div>
                    <div className="text-slate-400">{lead.location}</div>
                  </div>
                  <div>
                    <div className="text-slate-300 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {lead.email}
                    </div>
                    <div className="text-slate-300 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {lead.phone}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}