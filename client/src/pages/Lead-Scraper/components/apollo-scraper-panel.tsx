
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ApolloScraperPanelProps {
  onLaunch: (filters: any) => Promise<void>;
  isLoading: boolean;
}

const ApolloScraperPanel: React.FC<ApolloScraperPanelProps> = ({ onLaunch, isLoading }) => {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-white">Apollo Professional Scraper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-white/70">          Target professionals on Apollo.io by title, company, location, and more to get verified emails and phone numbers.
        </p>
        <Button
          onClick={() => onLaunch({ sourceType: 'apollo' })}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          {isLoading ? 'Scraping...' : 'Launch Apollo Scraper'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApolloScraperPanel;