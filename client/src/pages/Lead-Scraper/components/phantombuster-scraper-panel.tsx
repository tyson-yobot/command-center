import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PhantomBusterScraperPanelProps {
  onScrape?: (data: any) => void;
}

const PhantomBusterScraperPanel: React.FC<PhantomBusterScraperPanelProps> = ({ onScrape }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PhantomBuster Scraper</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">PhantomBuster scraper panel - Coming soon</p>
      </CardContent>
    </Card>
  );
};

export default PhantomBusterScraperPanel;