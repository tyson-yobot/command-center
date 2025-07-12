// ✅ FINAL PRODUCTION FILE — ContentCreatorModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContentCreatorModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleGenerateContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-social-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'full-auto' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('✅ Content generated:', data.result);
      } else {
        console.error('❌ Content generation failed:', data.message);
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
          <DialogTitle>📝 Generate Branded Content</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Creates on-brand, AI-generated social posts using the latest prompt scripts and voice profiles in Airtable.</p>
            <Button onClick={handleGenerateContent} disabled={loading} className="w-full">
              {loading ? 'Generating...' : 'Run Content Generator'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
