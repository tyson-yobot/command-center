// ✅ FINAL PRODUCTION FILE — AdminPanelModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleUpdateBot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/update-bot-behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'admin' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('✅ Bot updated:', data.result);
      } else {
        console.error('❌ Bot update error:', data.message);
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
          <DialogTitle>🔧 Admin Panel Controls</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">This will push a full behavior refresh to the YoBot backend using admin override mode.</p>
            <Button onClick={handleUpdateBot} disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Run Admin Override Update'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
