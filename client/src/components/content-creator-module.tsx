import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Send, Image, Mail, MessageSquare, Users, Eye } from 'lucide-react';

interface ContentCreatorProps {
  onClose?: () => void;
}

export default function ContentCreatorModule({ onClose }: ContentCreatorProps) {
  const [contentData, setContentData] = useState({
    headline: '',
    body: '',
    cta: '',
    platform: '',
    targetAudience: '',
    scheduleType: 'now',
    scheduleDate: '',
    testMode: true
  });
  const [uploadedAsset, setUploadedAsset] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'facebook' | 'instagram' | 'email' | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setContentData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedAsset(file);
      toast({
        title: "Asset Uploaded",
        description: `${file.name} ready for preview`,
      });
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('contentData', JSON.stringify(contentData));
      if (uploadedAsset) {
        formData.append('asset', uploadedAsset);
      }

      const response = await fetch('/api/content-creator/publish', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: contentData.testMode ? "Test Content Sent" : "Content Published",
          description: contentData.testMode 
            ? "Preview sent to Slack for review"
            : `Published to ${contentData.platform} successfully`,
        });
        
        // Reset form
        setContentData({
          headline: '',
          body: '',
          cta: '',
          platform: '',
          targetAudience: '',
          scheduleType: 'now',
          scheduleDate: '',
          testMode: true
        });
        setUploadedAsset(null);
      } else {
        toast({
          title: "Publication Failed",
          description: result.error || "Failed to publish content",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = () => {
    if (!previewMode) return null;

    const previewContent = (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <div className="font-bold text-lg mb-2">{contentData.headline}</div>
        <div className="text-sm mb-3">{contentData.body}</div>
        {uploadedAsset && (
          <div className="mb-3 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            📎 {uploadedAsset.name}
          </div>
        )}
        {contentData.cta && (
          <Button size="sm" className="text-xs">{contentData.cta}</Button>
        )}
      </div>
    );

    switch (previewMode) {
      case 'facebook':
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                  YB
                </div>
                <div>
                  <div className="font-semibold text-sm">YoBot</div>
                  <div className="text-xs text-gray-500">Sponsored</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {previewContent}
            </CardContent>
          </Card>
        );
      case 'instagram':
        return (
          <Card className="w-full max-w-sm">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {uploadedAsset ? uploadedAsset.name : 'Image/Video Preview'}
              </div>
              <div className="p-4">
                <div className="font-semibold mb-1">yobot_official</div>
                <div className="text-sm">{contentData.headline} {contentData.body}</div>
              </div>
            </CardContent>
          </Card>
        );
      case 'email':
        return (
          <Card className="w-full">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="text-lg">{contentData.headline}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="whitespace-pre-wrap mb-4">{contentData.body}</div>
              {contentData.cta && (
                <Button className="w-full">{contentData.cta}</Button>
              )}
            </CardContent>
          </Card>
        );
      default:
        return previewContent;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Creator & Marketing Hub</h2>
          <p className="text-gray-600 dark:text-gray-400">Create flyers, social posts, and schedule campaigns</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>Close</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Creation Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Content Drafting
            </CardTitle>
            <CardDescription>Create your marketing content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="Enter compelling headline..."
                value={contentData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="body">Body Content</Label>
              <Textarea
                id="body"
                placeholder="Write your message..."
                value={contentData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="cta">Call to Action</Label>
              <Input
                id="cta"
                placeholder="Learn More, Shop Now, Contact Us..."
                value={contentData.cta}
                onChange={(e) => handleInputChange('cta', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="Small business owners, contractors..."
                value={contentData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="asset">Upload Asset</Label>
              <Input
                id="asset"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform & Publishing Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Publish Settings
            </CardTitle>
            <CardDescription>Choose platform and schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={contentData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">X (Twitter)</SelectItem>
                  <SelectItem value="mailchimp">Mailchimp Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <Select value={contentData.scheduleType} onValueChange={(value) => handleInputChange('scheduleType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="When to publish" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Publish Now</SelectItem>
                  <SelectItem value="later">Schedule Later</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contentData.scheduleType === 'later' && (
              <div>
                <Label htmlFor="scheduleDate">Schedule Date</Label>
                <Input
                  id="scheduleDate"
                  type="datetime-local"
                  value={contentData.scheduleDate}
                  onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="testMode"
                checked={contentData.testMode}
                onCheckedChange={(checked) => handleInputChange('testMode', checked)}
              />
              <Label htmlFor="testMode">Test Mode (Send to Slack for review)</Label>
            </div>

            <div className="space-y-2">
              <Label>Preview Format</Label>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === 'facebook' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('facebook')}
                >
                  Facebook
                </Button>
                <Button
                  variant={previewMode === 'instagram' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('instagram')}
                >
                  Instagram
                </Button>
                <Button
                  variant={previewMode === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('email')}
                >
                  Email
                </Button>
              </div>
            </div>

            <Button
              onClick={handlePublish}
              disabled={isLoading || !contentData.headline || !contentData.platform}
              className="w-full"
            >
              {isLoading ? 'Publishing...' : contentData.testMode ? 'Send Test' : 'Publish Content'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)} Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderPreview()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}