import { useState } from "react";
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
import { Plus, Search, Eye, Edit, Trash2, Tag, Settings, User, Calendar, Target } from "lucide-react";
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
  triggerConditions: z.object({
    textContains: z.array(z.string()).optional(),
    eventType: z.array(z.string()).optional(),
    intent: z.array(z.string()).optional()
  }).optional(),
  tags: z.array(z.string()).default([]),
  source: z.string().default("manual"),
  sourceUrl: z.string().optional(),
  createdBy: z.string().min(1, "Creator is required"),
  confidence: z.number().min(0).max(100).default(85),
  status: z.enum(["enabled", "disabled", "review_needed"]).default("enabled"),
  roleVisibility: z.array(z.string()).default(["support", "admin"]),
  overrideBehavior: z.enum(["append", "replace", "conditional"]).default("append"),
  priority: z.number().min(1).max(100).default(50),
  userId: z.number().default(1)
});

type KnowledgeFormData = z.infer<typeof knowledgeFormSchema>;

export function Knowledge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeBase | null>(null);
  const [previewKnowledge, setPreviewKnowledge] = useState<KnowledgeBase | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: knowledge = [], isLoading } = useQuery<KnowledgeBase[]>({
    queryKey: ['/api/knowledge'],
  });

  const createMutation = useMutation({
    mutationFn: (data: KnowledgeFormData) => apiRequest('/api/knowledge', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
      setIsAddDialogOpen(false);
      toast({ title: "Context Intelligence entry created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create entry", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<KnowledgeBase> }) => 
      apiRequest(`/api/knowledge/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
      setEditingKnowledge(null);
      toast({ title: "Entry updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update entry", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/knowledge/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
      toast({ title: "Entry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    }
  });

  const form = useForm<KnowledgeFormData>({
    resolver: zodResolver(knowledgeFormSchema),
    defaultValues: {
      name: "",
      content: "",
      triggerConditions: {
        textContains: [],
        eventType: [],
        intent: []
      },
      tags: [],
      source: "manual",
      createdBy: "admin",
      confidence: 85,
      status: "enabled",
      roleVisibility: ["support", "admin"],
      overrideBehavior: "append",
      priority: 50,
      userId: 1
    }
  });

  const filteredKnowledge = knowledge.filter(kb => {
    const matchesSearch = !searchQuery || 
      kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => kb.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const allTags = [...new Set(knowledge.flatMap(kb => kb.tags || []))];

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

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Context Intelligence</h1>
          <p className="text-gray-400 mt-1">
            Advanced knowledge management for YoBot AI responses
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add knowledge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingKnowledge ? "Edit Knowledge Entry" : "Add Knowledge Entry"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Create structured knowledge that YoBot will use to enhance responses
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Name *</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="e.g., Refund Policy Guidelines"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-400 text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="createdBy" className="text-white">Created By *</Label>
                  <Input
                    {...form.register("createdBy")}
                    placeholder="admin"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-white">Content *</Label>
                <Textarea
                  {...form.register("content")}
                  placeholder="Enter the knowledge content that YoBot will use..."
                  rows={6}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                {form.formState.errors.content && (
                  <p className="text-red-400 text-sm">{form.formState.errors.content.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Confidence Level</Label>
                  <Controller
                    name="confidence"
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-400">{field.value}%</div>
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Priority Level</Label>
                  <Controller
                    name="priority"
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-400">{field.value}/100</div>
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Status</Label>
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                          <SelectItem value="review_needed">Review Needed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Override Behavior</Label>
                  <Controller
                    name="overrideBehavior"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="append">Append to response</SelectItem>
                          <SelectItem value="replace">Replace response</SelectItem>
                          <SelectItem value="conditional">Conditional use</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Source</Label>
                  <Controller
                    name="source"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="manual">Manual Entry</SelectItem>
                          <SelectItem value="scraped">Web Scraped</SelectItem>
                          <SelectItem value="generated">AI Generated</SelectItem>
                          <SelectItem value="transcript">Call Transcript</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseDialog}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingKnowledge ? "Update Entry" : "Create Entry"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search knowledge entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                selectedTags.includes(tag) 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => {
                setSelectedTags(prev => 
                  prev.includes(tag) 
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Knowledge Entries */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading knowledge entries...</div>
        ) : filteredKnowledge.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            No knowledge yet
          </div>
        ) : (
          filteredKnowledge.map((kb) => (
            <Card key={kb.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-white text-lg">{kb.name}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(kb.status)}`} />
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {kb.source}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {kb.createdBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(kb.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className={`w-3 h-3 ${getPriorityColor(kb.priority)}`} />
                        Priority: {kb.priority}
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        Confidence: {kb.confidence}%
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewKnowledge(kb)}
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(kb)}
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(kb.id)}
                      className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-300 mb-3 line-clamp-2">{kb.content}</p>
                
                {kb.tags && kb.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {kb.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewKnowledge} onOpenChange={() => setPreviewKnowledge(null)}>
        <DialogContent className="max-w-3xl bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">{previewKnowledge?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Knowledge entry details and usage information
            </DialogDescription>
          </DialogHeader>
          
          {previewKnowledge && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Source:</span>
                  <span className="ml-2 text-white">{previewKnowledge.source}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className="ml-2 text-white capitalize">{previewKnowledge.status}</span>
                </div>
                <div>
                  <span className="text-gray-400">Confidence:</span>
                  <span className="ml-2 text-white">{previewKnowledge.confidence}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Priority:</span>
                  <span className="ml-2 text-white">{previewKnowledge.priority}/100</span>
                </div>
                <div>
                  <span className="text-gray-400">Usage Count:</span>
                  <span className="ml-2 text-white">{previewKnowledge.usageCount}</span>
                </div>
                <div>
                  <span className="text-gray-400">Override:</span>
                  <span className="ml-2 text-white capitalize">{previewKnowledge.overrideBehavior}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Content</h4>
                <div className="bg-gray-700 p-3 rounded text-gray-300 whitespace-pre-wrap">
                  {previewKnowledge.content}
                </div>
              </div>
              
              {previewKnowledge.tags && previewKnowledge.tags.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Tags</h4>
                  <div className="flex gap-1 flex-wrap">
                    {previewKnowledge.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}