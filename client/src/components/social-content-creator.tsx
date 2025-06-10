import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Image, Video, Calendar, TrendingUp, Eye, Heart, Share2, Wand2 } from 'lucide-react';

interface GeneratedContent {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  content: string;
  hashtags: string[];
  createdAt: string;
  status: 'generated' | 'posted' | 'scheduled';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

function SocialContentCreator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([
    {
      id: '1',
      platform: 'linkedin',
      content: 'Transform your business with AI automation. Our latest solution helps companies reduce manual tasks by 75% while improving accuracy. #AI #Automation #BusinessEfficiency',
      hashtags: ['#AI', '#Automation', '#BusinessEfficiency'],
      createdAt: '2 hours ago',
      status: 'posted',
      engagement: { likes: 23, shares: 8, comments: 5 }
    },
    {
      id: '2',
      platform: 'twitter',
      content: 'Just launched our new AI-powered workflow automation! Early results show 3x faster processing times. Excited to see what our clients achieve! 🚀',
      hashtags: ['#AI', '#WorkflowAutomation', '#Innovation'],
      createdAt: '4 hours ago',
      status: 'posted',
      engagement: { likes: 45, shares: 12, comments: 8 }
    }
  ]);

  const platforms = [
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-600' },
    { id: 'twitter', name: 'Twitter', color: 'bg-sky-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-800' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || selectedPlatforms.length === 0) return;
    
    setIsGenerating(true);
    
    // Simulate AI content generation
    setTimeout(() => {
      const newContent = selectedPlatforms.map((platform, index) => ({
        id: `gen-${Date.now()}-${index}`,
        platform: platform as any,
        content: `AI-generated content based on: "${prompt}". This engaging post is optimized for ${platform} audience with relevant hashtags and compelling copy.`,
        hashtags: ['#AI', '#Content', '#Marketing'],
        createdAt: 'Just now',
        status: 'generated' as const
      }));
      
      setGeneratedContent(prev => [...newContent, ...prev]);
      setPrompt('');
      setIsGenerating(false);
    }, 2000);
  };

  const handlePost = (contentId: string) => {
    setGeneratedContent(prev => prev.map(item => 
      item.id === contentId 
        ? { ...item, status: 'posted' as const, engagement: { likes: 0, shares: 0, comments: 0 } }
        : item
    ));
  };

  const handleSchedule = (contentId: string) => {
    setGeneratedContent(prev => prev.map(item => 
      item.id === contentId 
        ? { ...item, status: 'scheduled' as const }
        : item
    ));
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'text-green-600 border-green-200';
      case 'scheduled': return 'text-blue-600 border-blue-200';
      case 'generated': return 'text-yellow-600 border-yellow-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const getPlatformColor = (platform: string) => {
    const platformObj = platforms.find(p => p.id === platform);
    return platformObj?.color || 'bg-gray-500';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5" />
          AI Social Content Creator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Generation */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Prompt</label>
            <Textarea
              placeholder="Describe the content you want to create (e.g., 'Promote our new AI automation features')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Platforms</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Button
                  key={platform.id}
                  size="sm"
                  variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                  onClick={() => togglePlatform(platform.id)}
                  className="text-xs"
                >
                  <div className={`w-2 h-2 rounded-full ${platform.color} mr-1`} />
                  {platform.name}
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim() || selectedPlatforms.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Content
              </>
            )}
          </Button>
        </div>

        {/* Generated Content */}
        <div className="space-y-3">
          {generatedContent.map((content) => (
            <div key={content.id} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getPlatformColor(content.platform)}`} />
                  <span className="text-sm font-medium capitalize">{content.platform}</span>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(content.status)}`}>
                    {content.status}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">{content.createdAt}</span>
              </div>
              
              <div className="text-sm text-gray-800">
                {content.content}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {content.hashtags.map((tag, index) => (
                  <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              {content.engagement && (
                <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {content.engagement.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {content.engagement.shares}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {content.engagement.comments}
                  </div>
                </div>
              )}
              
              {content.status === 'generated' && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => handlePost(content.id)}>
                    <Send className="w-3 h-3 mr-1" />
                    Post Now
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSchedule(content.id)}>
                    <Calendar className="w-3 h-3 mr-1" />
                    Schedule
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export { SocialContentCreator };
export default SocialContentCreator;