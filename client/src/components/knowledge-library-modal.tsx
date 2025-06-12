import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Eye, Edit3, FileText, Calendar, Database, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeItem {
  id: number;
  name: string;
  content: string;
  source: string;
  sourceType: 'manual' | 'document';
  createdAt: string;
  size: string;
  tags?: string[];
}

interface KnowledgeLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSystemMode: string;
}

interface PreviewModalProps {
  item: KnowledgeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
}

function PreviewModal({ item, isOpen, onClose, onDelete }: PreviewModalProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-900 border-blue-400/50">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            {item.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Database className="w-4 h-4 mr-1" />
              {item.sourceType === 'manual' ? 'Manual Entry' : 'Document'}
            </span>
            <span>{item.size}</span>
          </div>

          <div className="max-h-96 overflow-y-auto bg-slate-800 rounded-lg p-4 border border-slate-600">
            <div className="text-white whitespace-pre-wrap break-words">
              {item.content}
            </div>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              onClick={() => onDelete(item.id)}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Memory
            </Button>
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function KnowledgeLibraryModal({ isOpen, onClose, currentSystemMode }: KnowledgeLibraryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch knowledge items
  const { data: knowledgeItems = [], isLoading } = useQuery({
    queryKey: ['/api/knowledge/library', currentSystemMode],
    queryFn: () => fetch('/api/knowledge/library', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json()),
    enabled: isOpen
  });

  // Delete knowledge item mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
        headers: { 'x-system-mode': currentSystemMode }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/library'] });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/stats'] });
      setShowPreview(false);
      setSelectedItem(null);
      toast({
        id: Date.now().toString(),
        description: "Knowledge item deleted successfully",
      });
    }
  });

  const handlePreview = (item: KnowledgeItem) => {
    setSelectedItem(item);
    setShowPreview(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const filteredItems = knowledgeItems.filter((item: KnowledgeItem) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[80vh] bg-slate-900 border-blue-400/50">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-400" />
              Knowledge Library
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search knowledge items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Items list */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-slate-400">Loading knowledge items...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-300 font-medium">
                    {searchTerm ? 'No items match your search' : 'No knowledge items found'}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    {currentSystemMode === 'live' ? 
                      'Upload documents or add manual entries to build your knowledge base' :
                      'Switch to test mode to see sample knowledge entries'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item: KnowledgeItem) => (
                    <div key={item.id} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {item.sourceType === 'manual' ? (
                                <Edit3 className="w-4 h-4 text-green-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-blue-400" />
                              )}
                              <h3 className="text-white font-medium truncate">{item.name}</h3>
                            </div>
                            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                              {item.sourceType === 'manual' ? 'Manual' : 'Document'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <span>{item.size}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            onClick={() => handlePreview(item)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} 
                {searchTerm && ` (filtered from ${knowledgeItems.length})`}
              </div>
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <PreviewModal
        item={selectedItem}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onDelete={handleDelete}
      />
    </>
  );
}