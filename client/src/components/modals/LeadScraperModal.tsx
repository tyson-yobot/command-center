// ✅ FINAL PRODUCTION FILE — LeadScraperModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadScraperModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleScrapeLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/run-lead-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ include_email: true, include_phone: true })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('🔍 Lead scraping complete:', data.result);
      } else {
        console.error('❌ Lead scraping failed:', data.message);
      }
    } catch (error) {
      console.error('🚨 Server error:', error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>🔍 Run Lead Scraper</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Launches the YoBot lead scraping engine using Apollo, PhantomBuster, and Apify profiles with required contact fields.</p>
            <Button onClick={handleScrapeLeads} disabled={loading} className="w-full">
              {loading ? 'Scraping...' : 'Start Lead Scraper'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
export default LeadScraperModal;