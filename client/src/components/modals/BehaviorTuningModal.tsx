// ✅ FINAL PRODUCTION FILE — BehaviorTuningModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BehaviorTuningModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleTuneBehavior = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tune-behavior-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: 'performance-optimized' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('✅ Behavior tuning complete:', data.result);
      } else {
        console.error('❌ Tuning error:', data.message);
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
          <DialogTitle>🧠 Run Behavior Tuning</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Applies AI fine-tuning to behavior profiles based on system activity, sentiment logs, and dynamic rule sets.</p>
            <Button onClick={handleTuneBehavior} disabled={loading} className="w-full">
              {loading ? 'Tuning...' : 'Optimize Bot Behavior'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
