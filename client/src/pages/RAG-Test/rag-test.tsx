import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Upload, Search, FileText, Database, Brain, Zap } from 'lucide-react';

export default function RAGTest() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch knowledge stats
  const { data: knowledgeStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/knowledge/stats'],
    refetchInterval: 5000
  });

  // Fetch documents list
  const { data: documentsData, isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/knowledge/documents'],
    refetchInterval: 10000
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('documents', file);
      });

      setUploadProgress(10);
      const response = await apiRequest('POST', '/api/knowledge/upload', formData);
      setUploadProgress(100);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `Processed ${data.processed} documents successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/documents'] });
      setSelectedFiles(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || 'Failed to upload documents',
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      return apiRequest('POST', '/api/knowledge/search', { 
        query, 
        type: 'general' 
      });
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = () => {
    if (selectedFiles && selectedFiles.length > 0) {
      uploadMutation.mutate(selectedFiles);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-purple-400" />
            RAG System Test Interface
          </h1>
          <p className="text-slate-300">Upload documents and test knowledge search functionality</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {statsLoading ? '...' : knowledgeStats?.totalDocuments || 0}
              </div>
              <div className="text-slate-300 text-sm">Total Documents</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {statsLoading ? '...' : knowledgeStats?.recentUploads || 0}
              </div>
              <div className="text-slate-300 text-sm">Recent Uploads</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-green-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {statsLoading ? '...' : knowledgeStats?.processedDocuments || 0}
              </div>
              <div className="text-slate-300 text-sm">AI Processed</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {statsLoading ? '...' : Math.round((knowledgeStats?.totalSize || 0) / 1024)} KB
              </div>
              <div className="text-slate-300 text-sm">Storage Used</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-400" />
                Document Upload
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upload documents to the knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.pdf,.csv,.doc,.docx"
                  onChange={handleFileSelect}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">
                    Selected {selectedFiles.length} file(s):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedFiles).map((file, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-900/50 text-purple-200">
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {uploadMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              <Button 
                onClick={handleUpload}
                disabled={!selectedFiles || selectedFiles.length === 0 || uploadMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Documents'}
              </Button>
            </CardContent>
          </Card>

          {/* Search Section */}
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-400" />
                Knowledge Search
              </CardTitle>
              <CardDescription className="text-slate-400">
                Search through uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter search query..."
                  className="bg-slate-700/50 border-slate-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || searchMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {searchMutation.isPending && (
                <div className="text-center text-slate-400">
                  <Zap className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Searching knowledge base...
                </div>
              )}
              
              {searchMutation.data && (
                <div className="space-y-3">
                  <div className="text-sm text-slate-300">
                    Found {searchMutation.data.totalResults} results for "{searchMutation.data.query}"
                  </div>
                  
                  {searchMutation.data.results.map((result: any, index: number) => (
                    <Card key={index} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">{result.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(result.relevanceScore * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{result.excerpt}</p>
                        <div className="flex gap-2 text-xs text-slate-400">
                          <span>Source: {result.source}</span>
                          {result.wordCount && <span>• {result.wordCount} words</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {searchMutation.data && searchMutation.data.results.length === 0 && (
                <div className="text-center text-slate-400 py-4">
                  No results found for your query.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-green-400" />
              Uploaded Documents ({documentsData?.total || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentsLoading ? (
              <div className="text-center text-slate-400 py-8">Loading documents...</div>
            ) : documentsData?.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentsData.documents.map((doc: any, index: number) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-white truncate">{doc.name}</h4>
                          <div className="text-xs text-slate-400 space-y-1 mt-2">
                            <div>Size: {Math.round(doc.size / 1024)} KB</div>
                            {doc.wordCount && <div>Words: {doc.wordCount}</div>}
                            <div>Status: <Badge variant="secondary" className="text-xs">{doc.status}</Badge></div>
                          </div>
                          {doc.keyTerms && doc.keyTerms.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs text-slate-400 mb-1">Key Terms:</div>
                              <div className="flex flex-wrap gap-1">
                                {doc.keyTerms.slice(0, 3).map((term: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {term}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                No documents uploaded yet. Upload some documents to test the RAG system.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}