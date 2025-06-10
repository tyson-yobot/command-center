import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';

// Helper function to explain tags
const getTagExplanation = (tag: string): string => {
  const explanations: { [key: string]: string } = {
    'automation': 'Content related to automated processes and workflows',
    'AI': 'Artificial intelligence and machine learning content',
    'integration': 'System integrations and API connections',
    'testing': 'Testing procedures and quality assurance',
    'YoBot': 'YoBot platform-specific information',
    'platform': 'Platform architecture and infrastructure',
    'business': 'Business processes and operations',
    'voice-system': 'Voice synthesis and audio processing',
    'system-config': 'System configuration and settings'
  };
  return explanations[tag] || `Information tagged as: ${tag}`;
};

// Helper function to create better memory summaries
const getMemorySummary = (content: string, category: string): string => {
  if (category === 'system-config') {
    return 'System configuration and operational settings';
  }
  if (category === 'voice-system') {
    return 'Voice synthesis performance and testing data';
  }
  if (content.length > 80) {
    return content.substring(0, 80) + '...';
  }
  return content;
};

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
          <div>
            <h3 className="text-xl font-bold text-white">Knowledge Base Contents</h3>
            <p className="text-sm text-slate-400 mt-1">
              Documents and system memories used by the AI for intelligent responses.
            </p>
          </div>
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-3 mb-4">
          <h4 className="text-blue-400 font-medium text-sm mb-2">🏷️ About Search Tags</h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            Tags are clickable keywords that help you find related content quickly. They show the main topics in each document or memory. 
            Hover over any tag to see what it means - for example, "automation" shows content about automated processes, 
            "AI" indicates artificial intelligence topics, and "integration" marks system connection information.
          </p>
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
                    <h4 className="text-white font-medium">
                      {item.filename || item.name || item.title || 
                       (item.type === 'memory' ? 
                         (item.category === 'voice' ? 'Voice Entry' : 'Text Entry') : 
                         'Untitled')}
                    </h4>
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
                <div className="text-slate-300 text-sm mt-2 max-h-20 overflow-y-auto">
                  {item.type === 'memory' 
                    ? getMemorySummary(item.content || '', item.category || '')
                    : (item.extractedText?.substring(0, 200) + '...' || item.content?.substring(0, 200) + '...' || 'No content available')
                  }
                </div>
                
                {item.keyTerms && item.keyTerms.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-slate-400 mb-1">
                      🏷️ Search Tags (click to search for similar content):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.keyTerms.slice(0, 8).map((term, i) => (
                        <span 
                          key={i} 
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors cursor-pointer"
                          title={getTagExplanation(term)}
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 flex gap-2">
          {selectedItems.length > 0 && (
            <Button
              onClick={onDeleteSelected}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedItems.length})
            </Button>
          )}
          <Button
            onClick={async () => {
              try {
                const response = await fetch('/api/knowledge/clear', { method: 'POST' });
                if (response.ok) {
                  window.location.reload();
                }
              } catch (error) {
                console.error('Failed to clear knowledge:', error);
              }
            }}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Clear All Knowledge
          </Button>
        </div>
      </div>
    </div>
  );
}