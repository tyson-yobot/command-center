// ✅ FINAL PRODUCTION FILE — CalendarModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleSyncCalendar = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendar: 'tyson' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('✅ Calendar sync complete:', data.result);
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
          <DialogTitle>📅 Smart Calendar Sync</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">This will pull your current calendar events and sync them into the Smart Calendar tracker for real-time availability updates.</p>
            <Button onClick={handleSyncCalendar} disabled={loading} className="w-full">
              {loading ? 'Syncing...' : 'Start Calendar Sync'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
