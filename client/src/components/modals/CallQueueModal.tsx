// ✅ FINAL PRODUCTION FILE — CallQueueModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallQueueModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleQueueSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/refresh-call-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'hubspot' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('✅ Call queue refreshed:', data.result);
      } else {
        console.error('❌ Queue sync failed:', data.message);
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
          <DialogTitle>📞 Refresh Call Queue</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Loads the latest verified leads from HubSpot and places them into the YoBot call queue.</p>
            <Button onClick={handleQueueSync} disabled={loading} className="w-full">
              {loading ? 'Syncing...' : 'Load Call Queue'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
export default CallQueueModal;