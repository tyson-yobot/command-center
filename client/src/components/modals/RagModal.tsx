// ✅ FINAL PRODUCTION FILE — RAGModal.tsx
// 🔒 100% Automation | No placeholders | Fully wired to Flask backend

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RAGModal = ({ isOpen, onClose }: ModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleRunRAG = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/run-rag-indexer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_all: true })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('📂 RAG index refresh complete:', data.result);
      } else {
        console.error('❌ RAG indexing failed:', data.message);
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
          <DialogTitle>📂 Refresh RAG Index</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">Rebuilds the RAG index using all available uploaded PDFs and markdown files to ensure latest knowledge coverage.</p>
            <Button onClick={handleRunRAG} disabled={loading} className="w-full">
              {loading ? 'Indexing...' : 'Run RAG Indexer'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
