// ✅ FINAL PRODUCTION FILE — EmergencyModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleEmergencyShutdown = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/emergency-shutdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override: true })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('🛑 Emergency shutdown triggered:', data.result);
      } else {
        console.error('❌ Emergency shutdown failed:', data.message);
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
          <DialogTitle>🛑 Trigger Emergency Shutdown</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-red-400">This command immediately halts all system activity, shuts down live processes, and alerts admin channels. Only use in true emergencies.</p>
            <Button onClick={handleEmergencyShutdown} disabled={loading} className="w-full bg-red-700 hover:bg-red-800">
              {loading ? 'Executing...' : 'Execute Emergency Shutdown'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
export default EmergencyModal;