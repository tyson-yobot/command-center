// ✅ FINAL PRODUCTION FILE — SlackMonitorModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlackMonitorModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleScanSlack = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scan-slack-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channels: ['#yobot-alerts', '#errors'], days: 3 })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('📡 Slack scan complete:', data.result);
      } else {
        console.error('❌ Slack monitoring failed:', data.message);
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
          <DialogTitle>📡 Scan Slack Channels</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Scans critical Slack channels for recent alert messages, error logs, or keyword-triggered events from the past 72 hours.</p>
            <Button onClick={handleScanSlack} disabled={loading} className="w-full">
              {loading ? 'Scanning...' : 'Start Slack Monitor'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
