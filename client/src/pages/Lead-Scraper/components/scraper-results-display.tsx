import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScraperResultsDisplayProps {
  results?: any[];
  onExport?: () => void;
}

const ScraperResultsDisplay: React.FC<ScraperResultsDisplayProps> = ({ results, onExport }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scraper Results</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Scraper results display - Coming soon</p>
        {results && <p className="text-sm">Found {results.length} results</p>}
      </CardContent>
    </Card>
  );
};

export default ScraperResultsDisplay;