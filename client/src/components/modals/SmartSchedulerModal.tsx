// ✅ FINAL PRODUCTION FILE — SmartSchedulerModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartSchedulerModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleRunScheduler = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/smart-schedule-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aggregate: true })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('📅 Smart calendar updated:', data.result);
      } else {
        console.error('❌ Calendar sync failed:', data.message);
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
          <DialogTitle>📅 Sync Smart Scheduler</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Aggregates Tyson and Dan's synced calendars into a unified schedule view for voice assistant and booking logic.</p>
            <Button onClick={handleRunScheduler} disabled={loading} className="w-full">
              {loading ? 'Syncing...' : 'Run Smart Scheduler'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
export default SmartSchedulerModal;