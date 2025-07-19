
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ApifyScraperPanelProps {
  onLaunch: (filters: any) => Promise<void>;
  isLoading: boolean;
}

const ApifyScraperPanel: React.FC<ApifyScraperPanelProps> = ({ onLaunch, isLoading }) => {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-white">Apify Business Scraper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-white/70">
          Launch the Apify actor to scrape business listings from various online sources like Google Maps.
        </p>
        <Button
          onClick={() => onLaunch({ sourceType: 'apify' })}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          {isLoading ? 'Scraping...' : 'Launch Apify Scraper'}
        </Button>
      </CardContent>    </Card>
  );
};

export default ApifyScraperPanel;