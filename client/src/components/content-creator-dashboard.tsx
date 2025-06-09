import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { apiRequest } from '../../lib/queryClient';
import { ArrowLeft, Wand2, Copy, Download, Share, Eye } from 'lucide-react';

interface ContentCreatorProps {
  onBack: () => void;
}

function ContentCreatorDashboard({ onBack }: ContentCreatorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('social');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  
  // Form states
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('');
  const [tone, setTone] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keywords, setKeywords] = useState('');
  const [contentLength, setContentLength] = useState('medium');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);

  const generateContent = async () => {
    if (!topic || !platform || !tone) {
      toast({
        title: "Missing Information",
        description: "Please fill in topic, platform, and tone fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await apiRequest('POST', '/api/content/generate', {
        type: activeTab,
        topic,
        platform,
        tone,
        targetAudience,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        contentLength,
        includeHashtags,
        includeEmojis
      });

      setGeneratedContent(response.content);
      
      toast({
        title: "Content Generated",
        description: `${platform} content created successfully`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate content. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent);
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      });
    }
  };

  const saveContent = async () => {
    if (!generatedContent) return;
    
    try {
      await apiRequest('POST', '/api/content/save', {
        content: generatedContent,
        platform,
        topic,
        createdAt: new Date().toISOString()
      });
      
      toast({
        title: "Content Saved",
        description: "Content has been saved to your library",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save content. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onBack} 
              variant="outline" 
              size="sm"
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Command Center
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              📢 Social Media Content Creator
            </h1>
          </div>
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 border-purple-400">
            AI-Powered Generation
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Generation Form */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wand2 className="w-5 h-5 mr-2" />
                Content Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                  <TabsTrigger value="blog">Blog Posts</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>

                <TabsContent value="social" className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="topic" className="text-white">Topic/Subject *</Label>
                    <Input
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="What do you want to create content about?"
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="platform" className="text-white">Platform *</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tone" className="text-white">Tone *</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="exciting">Exciting</SelectItem>
                        <SelectItem value="informative">Informative</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="blog" className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="blog-topic" className="text-white">Blog Topic *</Label>
                    <Input
                      id="blog-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter your blog post topic"
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="blog-length" className="text-white">Content Length</Label>
                    <Select value={contentLength} onValueChange={setContentLength}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (300-500 words)</SelectItem>
                        <SelectItem value="medium">Medium (500-1000 words)</SelectItem>
                        <SelectItem value="long">Long (1000+ words)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="email-topic" className="text-white">Email Subject *</Label>
                    <Input
                      id="email-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter email subject line"
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-tone" className="text-white">Email Type</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                        <SelectValue placeholder="Select email type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <div>
                <Label htmlFor="audience" className="text-white">Target Audience</Label>
                <Input
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Who is your target audience?"
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="keywords" className="text-white">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="marketing, business, growth"
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hashtags"
                    checked={includeHashtags}
                    onCheckedChange={setIncludeHashtags}
                  />
                  <Label htmlFor="hashtags" className="text-white">Include Hashtags</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="emojis"
                    checked={includeEmojis}
                    onCheckedChange={setIncludeEmojis}
                  />
                  <Label htmlFor="emojis" className="text-white">Include Emojis</Label>
                </div>
              </div>

              <Button
                onClick={generateContent}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content Display */}
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-4">
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="min-h-[300px] bg-gray-800/50 border-gray-600 text-white resize-none"
                    placeholder="Generated content will appear here..."
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    
                    <Button
                      onClick={saveContent}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[300px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Fill out the form and click "Generate Content" to create your content</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Content */}
        <Card className="mt-8 bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">Recent Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                        Instagram
                      </Badge>
                      <span className="text-xs text-gray-400">2 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      Sample generated content preview would appear here...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { ContentCreatorDashboard };