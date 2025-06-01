import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Eye, Edit, Trash2, Tag, Settings, User, Calendar, Target, Upload, FileText, File, Clock, Mic, MessageCircle, Users, Activity, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface KnowledgeBase {
  id: number;
  userId: number;
  name: string;
  content: string;
  triggerConditions: any;
  tags: string[];
  source: string;
  sourceUrl?: string;
  createdBy: string;
  lastReviewedBy?: string;
  lastReviewedAt?: string;
  confidence: number;
  status: string;
  roleVisibility: string[];
  overrideBehavior: string;
  priority: number;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const knowledgeFormSchema = z.object({
  userId: z.number().default(1),
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  source: z.string().min(1, "Source is required"),
  sourceUrl: z.string().optional(),
  createdBy: z.string().default("user"),
  confidence: z.number().min(0).max(100).default(80),
  status: z.enum(["enabled", "disabled", "review_needed"]).default("enabled"),
  roleVisibility: z.array(z.string()).default(["support"]),
  overrideBehavior: z.enum(["append", "replace", "conditional"]).default("append"),
  priority: z.number().min(0).max(100).default(50),
  triggerConditions: z.object({
    textContains: z.array(z.string()).default([]),
    eventType: z.array(z.string()).default([]),
    intent: z.array(z.string()).default([])
  }).default({
    textContains: [],
    eventType: [],
    intent: []
  })
});

type KnowledgeFormData = z.infer<typeof knowledgeFormSchema>;

export function Knowledge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeBase | null>(null);
  const [previewKnowledge, setPreviewKnowledge] = useState<KnowledgeBase | null>(null);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: knowledge = [], isLoading } = useQuery<KnowledgeBase[]>({
    queryKey: ['/api/knowledge'],
  });

  const createMutation = useMutation({
    mutationFn: (data: KnowledgeFormData) => apiRequest('/api/knowledge', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
      setIsAddDialogOpen(false);
      toast({ title: "Knowledge entry created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create knowledge entry", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<KnowledgeBase> }) => 
      apiRequest(`/api/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
      setIsAddDialogOpen(false);
      toast({ title: "Knowledge entry updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update knowledge entry", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/knowledge/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
      toast({ title: "Knowledge entry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete knowledge entry", variant: "destructive" });
    }
  });

  const form = useForm<KnowledgeFormData>({
    resolver: zodResolver(knowledgeFormSchema),
    defaultValues: {
      userId: 1,
      name: "",
      content: "",
      tags: [],
      source: "",
      sourceUrl: "",
      createdBy: "user",
      confidence: 80,
      status: "enabled",
      roleVisibility: ["support"],
      overrideBehavior: "append",
      priority: 50,
      triggerConditions: {
        textContains: [],
        eventType: [],
        intent: []
      }
    }
  });

  const filteredKnowledge = knowledge.filter(kb => {
    const matchesSearch = !searchQuery || 
      kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => kb.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(knowledge.flatMap(kb => kb.tags)));

  const handleSubmit = (data: KnowledgeFormData) => {
    if (editingKnowledge) {
      updateMutation.mutate({ id: editingKnowledge.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (kb: KnowledgeBase) => {
    setEditingKnowledge(kb);
    form.reset({
      name: kb.name,
      content: kb.content,
      triggerConditions: kb.triggerConditions || { textContains: [], eventType: [], intent: [] },
      tags: kb.tags || [],
      source: kb.source,
      sourceUrl: kb.sourceUrl || "",
      createdBy: kb.createdBy,
      confidence: kb.confidence,
      status: kb.status as "enabled" | "disabled" | "review_needed",
      roleVisibility: kb.roleVisibility || [],
      overrideBehavior: kb.overrideBehavior as "append" | "replace" | "conditional",
      priority: kb.priority,
      userId: kb.userId
    });
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingKnowledge(null);
    form.reset();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-500';
      case 'disabled': return 'bg-red-500';
      case 'review_needed': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'text-red-600';
    if (priority >= 60) return 'text-orange-600';
    if (priority >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleFileUpload = async (files: FileList) => {
    setUploadingFile(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await readFileAsText(file);
        const knowledgeEntry = {
          userId: 1,
          name: file.name.replace(/\.[^/.]+$/, ""),
          content: text,
          tags: ["uploaded", "file"],
          source: "file_upload",
          createdBy: "user",
          confidence: 85,
          status: "enabled" as const,
          roleVisibility: ["support", "admin"],
          overrideBehavior: "append" as const,
          priority: 70,
          triggerConditions: {
            textContains: extractKeywords(text),
            eventType: ["chat", "support_ticket"],
            intent: ["information_request"]
          }
        };
        
        await createMutation.mutateAsync(knowledgeEntry);
        toast({ title: `Successfully uploaded ${file.name}` });
      } catch (error) {
        toast({ 
          title: `Failed to upload ${file.name}`, 
          description: "Please try again",
          variant: "destructive"
        });
      }
    }
    
    setUploadingFile(false);
    setIsFileUploadOpen(false);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'she', 'use', 'her', 'they', 'each', 'which', 'their', 'said', 'will', 'from', 'have', 'this', 'that', 'with', 'what', 'were', 'been', 'have', 'there', 'would', 'could', 'other', 'after', 'first', 'well', 'water', 'long', 'little', 'very', 'after', 'words', 'without', 'think'].includes(word));
    
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([word]) => word);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
          <p className="text-gray-400 mt-1">
            Train your bot with documents and information
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-400" />
                  Upload Training Files
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  Upload text files or documents to train your bot. The system will automatically extract keywords and create knowledge entries.
                </DialogDescription>
              </DialogHeader>
              
              <div 
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white">Drop files here to upload</p>
                    <p className="text-sm text-slate-400">or click to browse files</p>
                  </div>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {uploadingFile ? 'Uploading...' : 'Choose Files'}
                  </Button>
                  <input 
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.md"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div className="text-sm text-slate-400">
                <p className="font-medium mb-2">Supported file types:</p>
                <ul className="space-y-1">
                  <li>• Text files (.txt)</li>
                  <li>• Markdown files (.md)</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Knowledge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingKnowledge ? "Edit Knowledge Entry" : "Add Knowledge Entry"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create training content for your bot
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Knowledge Title</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="e.g., Refund Policy"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="source" className="text-white">Source</Label>
                    <Input
                      id="source"
                      {...form.register('source')}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="e.g., Company Documentation"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content" className="text-white">Content</Label>
                  <Textarea
                    id="content"
                    {...form.register('content')}
                    rows={8}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter the knowledge content that will train the AI..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Status</Label>
                    <Controller
                      name="status"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="enabled">Enabled</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                            <SelectItem value="review_needed">Review Needed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label className="text-white">Confidence ({form.watch('confidence')}%)</Label>
                    <Controller
                      name="confidence"
                      control={form.control}
                      render={({ field }) => (
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      )}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingKnowledge ? "Update" : "Create"} Knowledge
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <Card className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-blue-500/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            🧠 This Week's Knowledge Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">87</div>
              <div className="text-sm text-gray-300">Entries Used</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">94.2%</div>
              <div className="text-sm text-gray-300">Avg. Confidence</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">2.3%</div>
              <div className="text-sm text-gray-300">Escalation Rate Post-Injection</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">12</div>
              <div className="text-sm text-gray-300">Active Sources</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Most Used:</span>
              <span className="text-sm font-medium text-blue-400">"HIPAA Compliance Response"</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search knowledge entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      {/* Knowledge Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading knowledge entries...</p>
        </div>
      ) : filteredKnowledge.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No knowledge entries found</h3>
          <p className="text-gray-500 mb-4">Start by uploading files or adding knowledge entries manually.</p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Entry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKnowledge.map((kb) => (
            <Card key={kb.id} className="bg-gray-800 border-gray-700 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white truncate">{kb.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(kb.status)}`} />
                    <span className={`text-sm font-medium ${getPriorityColor(kb.priority)}`}>
                      {kb.priority}
                    </span>
                  </div>
                </div>
                <CardDescription className="text-gray-400">
                  {kb.source} • {kb.confidence}% confidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                  {kb.content.substring(0, 150)}...
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {kb.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
                      {tag}
                    </Badge>
                  ))}
                  {kb.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
                      +{kb.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(kb)}
                      className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(kb.id)}
                      className="bg-red-900 border-red-700 text-red-300 hover:bg-red-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {/* Real-time Usage Indicators */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Last used:</span>
                      <span className="text-blue-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {kb.lastUsedAt ? "2 hours ago via VoiceBot" : "Never used"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Usage (7d):</span>
                      <span className="text-blue-400 font-medium">{kb.usageCount || 0} times</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Trigger sources:</span>
                      <div className="flex gap-1">
                        <Brain className="w-3 h-3 text-blue-400" title="Voice" />
                        <MessageCircle className="w-3 h-3 text-gray-500" title="Chat" />
                        <FileText className="w-3 h-3 text-blue-400" title="Forms" />
                        <Activity className="w-3 h-3 text-gray-500" title="Intent Match" />
                      </div>
                    </div>

                    {/* Confidence Threshold Override */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-700">
                      <span className="text-gray-400">Min confidence:</span>
                      <span className="text-blue-400">{kb.confidence}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}