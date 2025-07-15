// ✅ FINAL PRODUCTION FILE — DiagnosticsModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleRunDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/run-diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'full-scan' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('✅ Diagnostics report:', data.result);
      } else {
        console.error('❌ Diagnostics failed:', data.message);
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
          <DialogTitle>🧪 Run System Diagnostics</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Executes a full backend health check and scans for failure points, latency bottlenecks, or data mismatches.</p>
            <Button onClick={handleRunDiagnostics} disabled={loading} className="w-full">
              {loading ? 'Running...' : 'Start Diagnostics Scan'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
export default DiagnosticsModal;