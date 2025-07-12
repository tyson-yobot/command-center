// ✅ FINAL PRODUCTION FILE — MetricsPanelModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetricsPanelModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleFetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fetch-dashboard-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'refresh' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('📊 Metrics loaded:', data.result);
      } else {
        console.error('❌ Metrics panel failed:', data.message);
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
          <DialogTitle>📊 Refresh Metrics Panel</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Pulls the latest KPIs and performance summaries from Airtable into the Command Center dashboard.</p>
            <Button onClick={handleFetchMetrics} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Refresh Metrics'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
