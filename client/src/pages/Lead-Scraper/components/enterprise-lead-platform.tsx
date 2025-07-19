
import React from 'react';import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

interface EnterpriseLeadPlatformProps {
  onNavigate: (view: string) => void;
}

const EnterpriseLeadPlatform: React.FC<EnterpriseLeadPlatformProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Enterprise Lead Intelligence Platform</CardTitle>
          <CardDescription className="text-white/70">
            Access powerful scraping tools to build high-quality lead lists.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Select a scraper, define your criteria, and export thousands of verified leads from platforms like Apollo, Google Maps, and LinkedIn.
          </p>
          <Button
            onClick={() => onNavigate('scraper')}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-black font-bold"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Launch Scraper
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};export default EnterpriseLeadPlatform;