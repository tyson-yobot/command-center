import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Building, Target, X } from 'lucide-react';
import ApifyScraperPanel from '../pages/Lead-Scraper/components/apify-scraper-panel';
import ApolloScraperPanel from '../pages/Lead-Scraper/components/apollo-scraper-panel';
import PhantomBusterScraperPanel from '../pages/Lead-Scraper/components/phantombuster-scraper-panel';
import { useToast } from '@/hooks/use-toast';

interface LeadScraperPopupProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'apollo' | 'apify' | 'phantombuster';
}

export function LeadScraperPopup({ isOpen, onClose, defaultTab = 'apollo' }: LeadScraperPopupProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);

  const handleApolloLaunch = async (filters: any) => {
    setIsLoading(true);
    try {
      // Apollo scraping logic
      toast({
        title: "Apollo Scraper Launched",
        description: "Professional lead scraping started successfully",
      });
    } catch (error) {
      toast({
        title: "Launch Failed",
        description: "Failed to start Apollo scraper",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApifyLaunch = async (filters: any) => {
    setIsLoading(true);
    try {
      // Apify scraping logic
      toast({
        title: "Apify Scraper Launched",
        description: "Business listing scraping started successfully",
      });
    } catch (error) {
      toast({
        title: "Launch Failed",
        description: "Failed to start Apify scraper",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhantomBusterLaunch = async (filters: any) => {
    setIsLoading(true);
    try {
      // PhantomBuster scraping logic
      toast({
        title: "PhantomBuster Scraper Launched",
        description: "Social media scraping started successfully",
      });
    } catch (error) {
      toast({
        title: "Launch Failed",
        description: "Failed to start PhantomBuster scraper",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border-slate-600/50 text-white overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-600/50 pb-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Advanced Lead Scraper
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 mb-6">
              <TabsTrigger 
                value="apollo" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Users className="w-4 h-4" />
                Apollo
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 text-xs">
                  Professional
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="apify" 
                className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <Building className="w-4 h-4" />
                Apify
                <Badge variant="secondary" className="bg-green-500/20 text-green-200 text-xs">
                  Business
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="phantombuster" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Target className="w-4 h-4" />
                PhantomBuster
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 text-xs">
                  Social
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="apollo" className="mt-0">
              <ApolloScraperPanel onLaunch={handleApolloLaunch} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="apify" className="mt-0">
              <ApifyScraperPanel onLaunch={handleApifyLaunch} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="phantombuster" className="mt-0">
              <PhantomBusterScraperPanel onLaunch={handlePhantomBusterLaunch} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}