// ✅ FINAL PRODUCTION FILE — LoggerTrackerModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoggerTrackerModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleLogIntegrityCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/validate-logger-integrity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audit_source: 'full-system-scan' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('🛡️ Logger integrity verified:', data.result);
      } else {
        console.error('❌ Logger verification failed:', data.message);
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
          <DialogTitle>🛡️ Validate Logger Integrity</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Checks if logs were tampered with, bypassed, or incorrectly marked using the Logger Integrity Tracker system.</p>
            <Button onClick={handleLogIntegrityCheck} disabled={loading} className="w-full">
              {loading ? 'Verifying...' : 'Run Integrity Check'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
export default LoggerTrackerModal;