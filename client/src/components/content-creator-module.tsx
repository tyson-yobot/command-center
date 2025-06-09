import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Image, Send, FileText, Users, Palette, Eye, MessageSquare, Mail, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ContentCreatorModuleProps {
  onContentCreated?: (content: any) => void;
}

export default function ContentCreatorModule({ onContentCreated }: ContentCreatorModuleProps) {
  const { toast } = useToast();
  const [isTestMode, setIsTestMode] = useState(false);
  
  const [content, setContent] = useState({
    headline: "",
    body: "",
    cta: "",
    platform: "",
    targetAudience: "",
    scheduledDate: "",
    scheduledTime: "",
    tags: [] as string[],
    assetUrl: "",
    assetFile: null as File | null
  });

  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState("");

  const addTag = () => {
    if (newTag.trim() && !content.tags.includes(newTag.trim())) {
      setContent(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setContent(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setContent(prev => ({
        ...prev,
        assetFile: file,
        assetUrl: URL.createObjectURL(file)
      }));
    }
  };

  const publishContent = async () => {
    if (!content.headline || !content.body || !content.platform) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in headline, body, and platform",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify(content));
      if (content.assetFile) {
        formData.append('asset', content.assetFile);
      }
      formData.append('testMode', isTestMode.toString());

      if (isTestMode) {
        // Test mode - send to Slack
        await apiRequest("POST", "/api/test-content-publish", {
          content,
          testMode: true
        });
        
        toast({
          title: "Test Mode: Content Published",
          description: "Content sent to Slack channel for review",
        });
      } else {
        // Live mode - publish to selected platform
        const response = await apiRequest("POST", "/api/publish-content", formData);
        
        if (response.ok) {
          toast({
            title: "Content Published Successfully",
            description: `Published to ${content.platform} and logged to campaign tracker`,
          });
          
          // Reset form
          setContent({
            headline: "",
            body: "",
            cta: "",
            platform: "",
            targetAudience: "",
            scheduledDate: "",
            scheduledTime: "",
            tags: [],
            assetUrl: "",
            assetFile: null
          });
        }
      }

      onContentCreated?.(content);
    } catch (error) {
      toast({
        title: "Publishing Failed",
        description: "Failed to publish content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleContent = async () => {
    if (!content.scheduledDate || !content.scheduledTime) {
      toast({
        title: "Missing Schedule Info",
        description: "Please select date and time for scheduling",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/schedule-content", {
        ...content,
        testMode: isTestMode
      });
      
      toast({
        title: "Content Scheduled",
        description: `Scheduled for ${content.scheduledDate} at ${content.scheduledTime}`,
      });
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewContent = () => {
    switch (previewMode) {
      case "facebook":
        return (
          <div className="p-4 bg-slate-700 rounded border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs">YB</div>
              <div>
                <div className="font-semibold text-sm">YoBot</div>
                <div className="text-xs text-slate-400">Just now</div>
              </div>
            </div>
            <h3 className="font-bold mb-2">{content.headline || "Your headline here..."}</h3>
            <p className="text-sm mb-3">{content.body || "Your content body here..."}</p>
            {content.assetUrl && (
              <div className="mb-3">
                <img src={content.assetUrl} alt="Preview" className="max-w-full h-32 object-cover rounded" />
              </div>
            )}
            {content.cta && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                {content.cta}
              </Button>
            )}
          </div>
        );
      case "instagram":
        return (
          <div className="p-4 bg-slate-700 rounded border-l-4 border-pink-500">
            {content.assetUrl && (
              <div className="mb-3">
                <img src={content.assetUrl} alt="Preview" className="w-full h-48 object-cover rounded" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center text-xs">YB</div>
              <span className="font-semibold text-sm">yobot_official</span>
            </div>
            <p className="text-sm mb-2">
              <strong>{content.headline}</strong> {content.body}
            </p>
            <div className="flex flex-wrap gap-1">
              {content.tags.map((tag, index) => (
                <span key={index} className="text-blue-400 text-xs">#{tag}</span>
              ))}
            </div>
          </div>
        );
      case "email":
        return (
          <div className="p-4 bg-slate-700 rounded border-l-4 border-green-500">
            <div className="border-b border-slate-600 pb-2 mb-3">
              <div className="text-xs text-slate-400">Subject:</div>
              <div className="font-semibold">{content.headline || "Your email subject..."}</div>
            </div>
            <div className="text-sm space-y-2">
              <p>{content.body || "Your email content here..."}</p>
              {content.assetUrl && (
                <div className="my-3">
                  <img src={content.assetUrl} alt="Email asset" className="max-w-full h-32 object-cover rounded" />
                </div>
              )}
              {content.cta && (
                <div className="mt-4">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    {content.cta}
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-slate-700 rounded text-center text-slate-400">
            Select a platform to see preview
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/80 via-indigo-900/60 to-purple-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl">
      
      {/* Header with Test Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Content Creator
          </h2>
          <p className="text-slate-400">Create and schedule marketing content across platforms</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Label htmlFor="test-mode" className="text-slate-300">Test Mode</Label>
          <Switch
            id="test-mode"
            checked={isTestMode}
            onCheckedChange={setIsTestMode}
            className="data-[state=checked]:bg-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Content Creation Form */}
        <Card className="bg-slate-800/50 border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-indigo-300 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Content Drafting
            </CardTitle>
            <CardDescription className="text-slate-400">
              Create engaging content with rich text and media
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Headline */}
            <div className="space-y-2">
              <Label className="text-slate-200">Headline / Subject</Label>
              <Input
                placeholder="Enter compelling headline..."
                value={content.headline}
                onChange={(e) => setContent(prev => ({ ...prev, headline: e.target.value }))}
                className="bg-slate-700/50 border-slate-600 text-slate-200"
                maxLength={100}
              />
              <div className="text-xs text-slate-400">{content.headline.length}/100 characters</div>
            </div>

            {/* Body Content */}
            <div className="space-y-2">
              <Label className="text-slate-200">Content Body</Label>
              <Textarea
                placeholder="Write your engaging content here..."
                value={content.body}
                onChange={(e) => setContent(prev => ({ ...prev, body: e.target.value }))}
                className="bg-slate-700/50 border-slate-600 text-slate-200 min-h-[120px]"
                maxLength={2000}
              />
              <div className="text-xs text-slate-400">{content.body.length}/2000 characters</div>
            </div>

            {/* Call to Action */}
            <div className="space-y-2">
              <Label className="text-slate-200">Call to Action (Optional)</Label>
              <Input
                placeholder="e.g., Learn More, Sign Up, Shop Now"
                value={content.cta}
                onChange={(e) => setContent(prev => ({ ...prev, cta: e.target.value }))}
                className="bg-slate-700/50 border-slate-600 text-slate-200"
                maxLength={30}
              />
            </div>

            {/* Asset Upload */}
            <div className="space-y-2">
              <Label className="text-slate-200 flex items-center gap-2">
                <Image className="h-4 w-4" />
                Upload Image/Video
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="bg-slate-700/50 border-slate-600 text-slate-200"
                />
                {content.assetUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setContent(prev => ({ ...prev, assetUrl: "", assetFile: null }))}
                    className="border-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {content.assetUrl && (
                <div className="mt-2">
                  <img src={content.assetUrl} alt="Preview" className="max-w-full h-24 object-cover rounded" />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-slate-200">Tags / Hashtags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="bg-slate-700/50 border-slate-600 text-slate-200"
                />
                <Button size="sm" onClick={addTag} className="bg-indigo-600 hover:bg-indigo-700">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {content.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-indigo-600/20 text-indigo-200">
                    #{tag}
                    <button className="ml-1 text-xs" onClick={() => removeTag(index)}>×</button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Publishing Options & Preview */}
        <div className="space-y-6">
          
          {/* Publishing Settings */}
          <Card className="bg-slate-800/50 border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-indigo-300 flex items-center gap-2">
                <Send className="h-5 w-5" />
                Publishing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Platform Selection */}
              <div className="space-y-2">
                <Label className="text-slate-200">Platform</Label>
                <Select value={content.platform} onValueChange={(value) => {
                  setContent(prev => ({ ...prev, platform: value }));
                  setPreviewMode(value);
                }}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="x-twitter">X (formerly Twitter)</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="email">Email (Mailchimp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label className="text-slate-200">Target Audience</Label>
                <Select value={content.targetAudience} onValueChange={(value) => setContent(prev => ({ ...prev, targetAudience: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Followers</SelectItem>
                    <SelectItem value="leads">Leads & Prospects</SelectItem>
                    <SelectItem value="customers">Existing Customers</SelectItem>
                    <SelectItem value="partners">Business Partners</SelectItem>
                    <SelectItem value="custom">Custom Segment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule Options */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-slate-200">Schedule Date</Label>
                  <Input
                    type="date"
                    value={content.scheduledDate}
                    onChange={(e) => setContent(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Schedule Time</Label>
                  <Input
                    type="time"
                    value={content.scheduledTime}
                    onChange={(e) => setContent(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={publishContent}
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? "Publishing..." : isTestMode ? "Test Send" : "Publish Now"}
                </Button>
                
                <Button
                  onClick={scheduleContent}
                  disabled={isLoading || !content.scheduledDate}
                  variant="outline"
                  className="border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>

              {isTestMode && (
                <div className="mt-3 p-3 bg-yellow-600/20 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                  Test Mode: Content will be sent to Slack channel for review instead of publishing live
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-slate-800/50 border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-indigo-300 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
              <CardDescription className="text-slate-400">
                See how your content will appear on the selected platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getPreviewContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}