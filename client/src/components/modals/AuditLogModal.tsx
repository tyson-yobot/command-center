// ✅ FINAL PRODUCTION FILE — AuditLogModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleFetchAuditLog = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fetch-audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'full' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('✅ Audit log pulled:', data.result);
      } else {
        console.error('❌ Audit log fetch error:', data.message);
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
          <DialogTitle>📜 Pull Full Audit Log</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">This will retrieve and log the full audit trail from the YoBot backend, including admin overrides, automation triggers, and flagged actions.</p>
            <Button onClick={handleFetchAuditLog} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Retrieve Audit Log'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
