import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApolloScraperPanelProps {
  onScrape?: (data: any) => void;
}

const ApolloScraperPanel: React.FC<ApolloScraperPanelProps> = ({ onScrape }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apollo Scraper</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Apollo scraper panel - Coming soon</p>
      </CardContent>
    </Card>
  );
};

export default ApolloScraperPanel;