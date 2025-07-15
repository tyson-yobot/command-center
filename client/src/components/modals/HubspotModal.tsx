// ✅ FINAL PRODUCTION FILE — HubspotModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HubspotModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleSyncHubspot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync-hubspot-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'full-sync', source: 'command-center' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('🔄 HubSpot sync complete:', data.result);
      } else {
        console.error('❌ HubSpot sync failed:', data.message);
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
          <DialogTitle>🔄 Sync HubSpot Records</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Triggers a full sync of deals, contacts, and tickets between HubSpot and the Command Center backend.</p>
            <Button onClick={handleSyncHubspot} disabled={loading} className="w-full">
              {loading ? 'Syncing...' : 'Run HubSpot Sync'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
export default HubspotModal;