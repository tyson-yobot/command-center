
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PhantomBusterScraperPanelProps {
  onLaunch: (filters: any) => Promise<void>;
  isLoading: boolean;
}

const PhantomBusterScraperPanel: React.FC<PhantomBusterScraperPanelProps> = ({ onLaunch, isLoading }) => {  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-white">PhantomBuster Social Scraper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-white/70">
          Automate social media scraping from platforms like LinkedIn to extract profiles and company information.
        </p>
        <Button
          onClick={() => onLaunch({ sourceType: 'phantombuster' })}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
        >
          {isLoading ? 'Scraping...' : 'Launch PhantomBuster Scraper'}
        </Button>
      </CardContent>    </Card>
  );
};

export default PhantomBusterScraperPanel;