import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, FileText, Download, Search, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface KnowledgeBaseManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Document {
  id: string;
  filename: string;
  size: number;
  mimetype: string;
  uploadTime: string;
  category: string;
  status: string;
  extractedText?: string;
  keyTerms?: string[];
  wordCount?: number;
}

export function KnowledgeBaseManager({ isOpen, onClose }: KnowledgeBaseManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/knowledge/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocuments = async (documentIds: string[]) => {
    if (!documentIds.length) return;
    
    if (!confirm(`Are you sure you want to delete ${documentIds.length} document(s)? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch('/api/knowledge/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Delete result:', result);
        
        // Remove deleted documents from state
        setDocuments(prev => prev.filter(doc => !documentIds.includes(doc.id)));
        setSelectedDocuments([]);
        
        alert(`Successfully deleted ${result.deleted || documentIds.length} document(s)`);
      } else {
        const error = await response.json();
        alert(`Failed to delete documents: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete documents. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.extractedText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.keyTerms?.some(term => term.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(documents.map(doc => doc.category))].filter(Boolean);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-blue-400">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            Knowledge Base Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-blue-900/60 border border-blue-400">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{documents.length}</div>
                <div className="text-slate-300 text-sm">Total Documents</div>
              </CardContent>
            </Card>
            <Card className="bg-green-900/60 border border-green-400">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {documents.filter(d => d.status === 'processed').length}
                </div>
                <div className="text-slate-300 text-sm">Processed</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-900/60 border border-purple-400">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{categories.length}</div>
                <div className="text-slate-300 text-sm">Categories</div>
              </CardContent>
            </Card>
            <Card className="bg-cyan-900/60 border border-cyan-400">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {formatFileSize(documents.reduce((sum, doc) => sum + (doc.size || 0), 0))}
                </div>
                <div className="text-slate-300 text-sm">Total Size</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search documents, content, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-2"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDocuments.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {selectedDocuments.length} document(s) selected
                </span>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleDeleteDocuments(selectedDocuments)}
                    disabled={deleteLoading}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteLoading ? 'Deleting...' : 'Delete Selected'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Documents List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">
                Documents ({filteredDocuments.length})
              </h3>
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
                className="text-blue-400 border-blue-400"
              >
                {selectedDocuments.length === filteredDocuments.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {loading ? (
              <div className="text-center text-slate-400 py-8">
                Loading documents...
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                {searchTerm || selectedCategory !== 'all' ? 'No documents match your filters' : 'No documents uploaded yet'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`bg-slate-800/60 rounded-lg p-4 border ${
                      selectedDocuments.includes(doc.id) 
                        ? 'border-blue-400 bg-blue-900/20' 
                        : 'border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => handleSelectDocument(doc.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <div>
                            <div className="text-white font-medium">{doc.filename}</div>
                            <div className="text-slate-400 text-sm">
                              {formatFileSize(doc.size)} • {formatDate(doc.uploadTime)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right text-sm">
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {doc.category}
                          </Badge>
                          <div className="flex items-center mt-1">
                            {doc.status === 'processed' ? (
                              <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-400 mr-1" />
                            )}
                            <span className="text-slate-400">{doc.status}</span>
                          </div>
                        </div>
                        
                        <div className="text-right text-sm">
                          <div className="text-slate-300">{doc.wordCount || 0} words</div>
                          <div className="text-slate-400">{doc.keyTerms?.length || 0} key terms</div>
                        </div>
                        
                        <Button
                          onClick={() => handleDeleteDocuments([doc.id])}
                          disabled={deleteLoading}
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {doc.keyTerms && doc.keyTerms.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <div className="text-slate-400 text-sm mb-2">Key Terms:</div>
                        <div className="flex flex-wrap gap-1">
                          {doc.keyTerms.slice(0, 8).map((term, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {term}
                            </Badge>
                          ))}
                          {doc.keyTerms.length > 8 && (
                            <Badge variant="secondary" className="text-xs">
                              +{doc.keyTerms.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}