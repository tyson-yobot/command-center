// ✅ FINAL PRODUCTION FILE — CopilotModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CopilotModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleActivateCopilot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/activate-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: 'yobot-live' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('✅ Copilot activated:', data.result);
      } else {
        console.error('❌ Copilot activation failed:', data.message);
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
          <DialogTitle>🤖 Launch YoBot Copilot</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Starts the YoBot® Copilot to assist with task execution, dynamic suggestions, and smart system routing.</p>
            <Button onClick={handleActivateCopilot} disabled={loading} className="w-full">
              {loading ? 'Launching...' : 'Start Copilot AI'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
export default CopilotModal;