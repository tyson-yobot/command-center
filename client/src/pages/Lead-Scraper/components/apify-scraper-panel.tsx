import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApifyScraperPanelProps {
  onScrape?: (data: any) => void;
}

const ApifyScraperPanel: React.FC<ApifyScraperPanelProps> = ({ onScrape }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apify Scraper</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Apify scraper panel - Coming soon</p>
      </CardContent>
    </Card>
  );
};

export default ApifyScraperPanel;