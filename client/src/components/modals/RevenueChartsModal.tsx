// ✅ FINAL PRODUCTION FILE — RevenueChartsModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevenueChartsModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleRenderCharts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/render-revenue-charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ view: 'monthly-breakdown' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('📈 Revenue charts rendered:', data.result);
      } else {
        console.error('❌ Revenue chart rendering failed:', data.message);
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
          <DialogTitle>📈 Generate Revenue Charts</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Generates updated revenue charts and projections for the current YoBot monthly and annual dashboard views.</p>
            <Button onClick={handleRenderCharts} disabled={loading} className="w-full">
              {loading ? 'Generating...' : 'Refresh Revenue Charts'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
export default RevenueChartsModal;