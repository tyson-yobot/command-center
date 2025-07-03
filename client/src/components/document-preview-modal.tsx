import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, FileText, Download, Trash2, Clock } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName?: string;
}

interface DocumentContent {
  success: boolean;
  content: string;
  extractedText: string;
  metadata: {
    filename: string;
    category: string;
    keyTerms: string[];
    fileSize: number;
    uploadTime: string;
  };
}

export function DocumentPreviewModal({ isOpen, onClose, documentId, documentName }: DocumentPreviewModalProps) {
  const [documentContent, setDocumentContent] = useState<DocumentContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocumentContent();
    }
  }, [isOpen, documentId]);

  const fetchDocumentContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/knowledge/preview/${documentId}`);
      const data = await response.json();
      
      if (data.success) {
        setDocumentContent(data);
      } else {
        setError(data.error || 'Failed to load document content');
      }
    } catch (err) {
      setError('Network error while loading document');
      console.error('Document preview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`/api/knowledge/delete/${documentId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          onClose();
          window.location.reload(); // Refresh to update document list
        } else {
          alert('Failed to delete document');
        }
      } catch (err) {
        alert('Error deleting document');
        console.error('Delete error:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-slate-800 border border-blue-400/50 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-slate-700 border-b border-blue-400/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Document Preview: {documentName || documentContent?.metadata?.filename || 'Untitled'}
            </CardTitle>
            <div className="flex gap-2">
              {documentContent && (
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button onClick={onClose} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-white">Loading document content...</div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                <h3 className="text-red-400 font-medium mb-2">Error Loading Document</h3>
                <p className="text-red-300 text-sm">{error}</p>
                <Button 
                  onClick={fetchDocumentContent} 
                  className="mt-3 bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : documentContent ? (
            <div className="flex flex-col h-full">
              {/* Document Metadata */}
              <div className="bg-slate-700/50 border-b border-slate-600 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <span className="text-white ml-2">{documentContent.metadata.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Size:</span>
                    <span className="text-white ml-2">{(documentContent.metadata.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Terms:</span>
                    <span className="text-white ml-2">{documentContent.metadata.keyTerms?.length || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 text-slate-400 mr-1" />
                    <span className="text-white text-xs">
                      {documentContent.metadata.uploadTime ? 
                        new Date(documentContent.metadata.uploadTime).toLocaleDateString() : 
                        'Unknown'
                      }
                    </span>
                  </div>
                </div>
                
                {/* Key Terms Tags */}
                {documentContent.metadata.keyTerms && documentContent.metadata.keyTerms.length > 0 && (
                  <div className="mt-3">
                    <span className="text-slate-400 text-xs">Key Terms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {documentContent.metadata.keyTerms.slice(0, 8).map((term, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Document Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-600/50">
                  <pre className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                    {documentContent.content || 'No content available'}
                  </pre>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}