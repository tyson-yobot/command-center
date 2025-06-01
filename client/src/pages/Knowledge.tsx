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
import { Plus, Search, Eye, Edit, Trash2, Tag, Settings, User, Calendar, Target, Upload, FileText, File, Clock, Mic, MessageCircle, Users, Activity, Brain, AlertTriangle, TrendingUp, Filter, Download, Mail, FileCheck, Printer } from "lucide-react";
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
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  source: z.string().default("manual"),
  sourceUrl: z.string().optional(),
  confidence: z.number().min(0).max(100).default(80),
  status: z.enum(["active", "inactive", "review"]).default("active"),
  roleVisibility: z.array(z.string()).default(["all"]),
  overrideBehavior: z.string().default("append"),
  priority: z.number().min(1).max(10).default(5),
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
  
  // Business documents that are always available
  const businessDocuments = [
    {
      id: 'nda',
      name: 'YoBot NDA - Non-Disclosure Form',
      description: 'Mutual Non-Disclosure Agreement for confidential business discussions',
      downloadUrl: '/api/documents/download/nda'
    },
    {
      id: 'contract',
      name: 'YoBot Sales Contract',
      description: 'Standard AI Services Agreement with pricing and terms',
      downloadUrl: '/api/documents/download/contract'
    }
  ];

  const handleDownloadDocument = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  const handlePrintDocument = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
    setTimeout(() => {
      window.print();
    }, 1000);
  };

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
    mutationFn: (data: KnowledgeFormData) => 
      fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
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
      fetch(`/api/knowledge/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
      setEditingKnowledge(null);
      toast({ title: "Knowledge entry updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update knowledge entry", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/knowledge/${id}`, { method: 'DELETE' }),
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
      name: "",
      content: "",
      tags: [],
      source: "manual",
      confidence: 80,
      status: "active",
      roleVisibility: ["all"],
      overrideBehavior: "append",
      priority: 5,
      triggerConditions: {
        textContains: [],
        eventType: [],
        intent: []
      }
    }
  });

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
      tags: kb.tags,
      source: kb.source,
      sourceUrl: kb.sourceUrl,
      confidence: kb.confidence,
      status: kb.status as "active" | "inactive" | "review",
      roleVisibility: kb.roleVisibility,
      overrideBehavior: kb.overrideBehavior,
      priority: kb.priority,
      triggerConditions: kb.triggerConditions
    });
    setIsAddDialogOpen(true);
  };

  const handleFileUpload = async (files: FileList) => {
    setUploadingFile(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await readFileAsText(file);
      createMutation.mutate({
        name: file.name,
        content: text,
        tags: [file.type],
        source: "upload",
        confidence: 70,
        status: "active",
        roleVisibility: ["all"],
        overrideBehavior: "append",
        priority: 5,
        triggerConditions: {
          textContains: [],
          eventType: [],
          intent: []
        }
      });
    }
    setUploadingFile(false);
    setIsFileUploadOpen(false);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const filteredKnowledge = knowledge.filter(kb => {
    const matchesSearch = !searchQuery || 
      kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => kb.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(knowledge.flatMap(kb => kb.tags)));

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-400";
    if (confidence >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return "Critical";
    if (priority >= 6) return "High";
    if (priority >= 4) return "Medium";
    return "Low";
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-500/20 text-red-300 border-red-500/30";
    if (priority >= 6) return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    if (priority >= 4) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
            <p className="text-gray-400 mt-1">
              Train your bot with documents and information
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Upload Knowledge Files</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Upload text files, PDFs, or documents to add to your knowledge base
                </DialogDescription>
              </DialogHeader>
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-300 mb-2">Drag and drop files here, or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.pdf,.doc,.docx,.md"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploadingFile ? "Uploading..." : "Select Files"}
                </Button>
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

          {/* Business Documents - Quick Access */}
          {businessDocuments.map((doc) => (
            <div key={doc.id} className="flex gap-1">
              <Button 
                size="sm"
                onClick={() => handleDownloadDocument(doc.downloadUrl)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                {doc.name}
              </Button>
              <Button 
                size="sm"
                onClick={() => handlePrintDocument(doc.downloadUrl)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-2"
                title={`Print ${doc.name}`}
              >
                <Printer className="w-3 h-3" />
              </Button>
            </div>
          ))}
            <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingKnowledge ? "Edit" : "Add"} Knowledge Entry
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Name</Label>
                    <Input 
                      {...form.register("name")}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Knowledge entry name"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Source</Label>
                    <Input 
                      {...form.register("source")}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Source of information"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Content</Label>
                  <Textarea 
                    {...form.register("content")}
                    className="bg-slate-700 border-slate-600 text-white min-h-[200px]"
                    placeholder="Enter the knowledge content..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-300">Confidence Level</Label>
                    <Controller
                      name="confidence"
                      control={form.control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <div className="text-center text-gray-400">{field.value}%</div>
                        </div>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Priority</Label>
                    <Controller
                      name="priority"
                      control={form.control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={1}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="text-center text-gray-400">{field.value}/10</div>
                        </div>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Status</Label>
                    <Controller
                      name="status"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white pl-10"
            />
          </div>
          <Select value={selectedTags.join(",")} onValueChange={(value) => setSelectedTags(value ? value.split(",") : [])}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Filter by tags" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Knowledge Cards */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading knowledge base...</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredKnowledge.map((kb) => (
              <Card key={kb.id} className="bg-slate-800/50 border-slate-600 hover:border-blue-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{kb.name}</h3>
                        <Badge className={getPriorityColor(kb.priority)}>
                          {getPriorityLabel(kb.priority)}
                        </Badge>
                      </div>
                      <p className="text-gray-300 mb-3 line-clamp-2">{kb.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span className={getConfidenceColor(kb.confidence)}>{kb.confidence}%</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          {kb.usageCount || 0} uses
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(kb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {kb.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {kb.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-slate-700 text-gray-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setPreviewKnowledge(kb)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEdit(kb)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteMutation.mutate(kb.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}