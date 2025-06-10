import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';

interface KnowledgeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeItems: any[];
  selectedItems: string[];
  onItemSelect: (id: string) => void;
  onDeleteSelected: () => void;
}

export function KnowledgeViewerModal({
  isOpen,
  onClose,
  knowledgeItems,
  selectedItems,
  onItemSelect,
  onDeleteSelected
}: KnowledgeViewerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-blue-400 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Knowledge Base Contents</h3>
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {knowledgeItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No knowledge items found in the database
            </div>
          ) : (
            knowledgeItems.map((item, index) => (
              <div key={item.id || index} className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-medium">{item.name || item.title || 'Untitled'}</h4>
                    <div className="text-sm text-slate-400">
                      Type: {item.type || 'document'} • 
                      Category: {item.category || 'general'} • 
                      Size: {item.size || item.wordCount || 0} {item.type === 'document' ? 'bytes' : 'words'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => onItemSelect(item.id)}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
                {item.content && (
                  <div className="text-slate-300 text-sm mt-2 max-h-20 overflow-y-auto">
                    {item.content.substring(0, 200)}...
                  </div>
                )}
                {item.extractedText && (
                  <div className="text-slate-300 text-sm mt-2 max-h-20 overflow-y-auto">
                    {item.extractedText.substring(0, 200)}...
                  </div>
                )}
                {item.keyTerms && item.keyTerms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.keyTerms.slice(0, 5).map((term, i) => (
                      <span key={i} className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {term}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {selectedItems.length > 0 && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={onDeleteSelected}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedItems.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}