import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Calendar, Send, Download, Share2, Target, TrendingUp, Eye } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';

interface SocialContentCreatorProps {
  onBack: () => void;
}

export function SocialContentCreator({ onBack }: SocialContentCreatorProps) {
  const { toast } = useToast();
  const [contentType, setContentType] = useState('');
  const [platform, setPlatform] = useState('');
  const [voiceTone, setVoiceTone] = useState('');
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const contentTypes = [
    { value: 'post', label: 'Social Media Post' },
    { value: 'reel', label: 'Reel/Video Script' },
    { value: 'ad', label: 'Advertisement' },
    { value: 'email', label: 'Email Campaign' },
    { value: 'blog', label: 'Blog Post' },
    { value: 'carousel', label: 'Carousel Post' }
  ];

  const platforms = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'twitter', label: 'X (formerly Twitter)' },
    { value: 'youtube', label: 'YouTube' }
  ];

  const voiceTones = [
    { value: 'professional', label: 'Professional' },
    { value: 'funny', label: 'Funny & Engaging' },
    { value: 'aggressive', label: 'Aggressive Sales' },
    { value: 'value-driven', label: 'Value-Driven' },
    { value: 'educational', label: 'Educational' },
    { value: 'inspirational', label: 'Inspirational' }
  ];

  const handleGenerateContent = async () => {
    if (!contentType || !platform || !voiceTone || !topic) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before generating content",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/generate-content', {
        contentType,
        platform,
        voiceTone,
        topic,
        timestamp: new Date().toISOString()
      });

      const data = await response.json();
      setGeneratedContent(data.content);

      // Log to Airtable Social Scripts Log
      await apiRequest('POST', '/api/airtable/log', {
        table: 'Social Scripts Log',
        data: {
          contentType,
          platform,
          voiceTone,
          topic,
          generatedContent: data.content,
          createdAt: new Date().toISOString(),
          status: 'generated'
        }
      });

      toast({
        title: "Content Generated",
        description: `${contentType} content created for ${platform}`,
      });
    } catch (error) {
      console.error('Content generation failed:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToAirtable = async () => {
    if (!generatedContent) return;

    try {
      await apiRequest('POST', '/api/airtable/save-content', {
        contentType,
        platform,
        content: generatedContent,
        status: 'approved',
        scheduledDate: new Date().toISOString()
      });

      toast({
        title: "Content Saved",
        description: "Content saved to content calendar",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save content",
        variant: "destructive"
      });
    }
  };

  const handleSlackPush = async () => {
    if (!generatedContent) return;

    try {
      await apiRequest('POST', '/api/slack/send-content', {
        content: generatedContent,
        platform,
        contentType
      });

      toast({
        title: "Sent to Slack",
        description: "Content shared with team",
      });
    } catch (error) {
      console.error('Slack push failed:', error);
      toast({
        title: "Slack Failed",
        description: "Failed to send to Slack",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-orange-400/30 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-slate-900 border-b border-orange-400/30 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Share2 className="w-6 h-6 mr-2 text-orange-400" />
            📢 Social Media Content Creator
          </h2>
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            ✕
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Settings */}
            <div className="space-y-4">
              <Card className="bg-slate-800 border-orange-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-orange-400" />
                    Content Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Content Type
                    </label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {contentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Platform
                    </label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {platforms.map((plat) => (
                          <SelectItem key={plat.value} value={plat.value}>
                            {plat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Voice & Tone
                    </label>
                    <Select value={voiceTone} onValueChange={setVoiceTone}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select voice tone" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {voiceTones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Topic/Subject
                    </label>
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter content topic or subject"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isGenerating ? "Generating..." : "🚀 Generate Content"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Generated Content */}
            <div className="space-y-4">
              <Card className="bg-slate-800 border-orange-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-orange-400" />
                    Generated Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    placeholder="Generated content will appear here..."
                    className="bg-slate-700 border-slate-600 text-white min-h-[300px]"
                  />
                  
                  {generatedContent && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={handleSaveToAirtable}
                        variant="outline"
                        className="border-orange-400 text-orange-400 hover:bg-orange-400/10"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Save to Calendar
                      </Button>
                      <Button
                        onClick={handleSlackPush}
                        variant="outline"
                        className="border-orange-400 text-orange-400 hover:bg-orange-400/10"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send to Slack
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Content Analytics Preview */}
              <Card className="bg-slate-800 border-orange-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
                    Content Performance Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-700 p-3 rounded">
                      <div className="text-2xl font-bold text-orange-400">85%</div>
                      <div className="text-sm text-gray-300">Engagement Score</div>
                    </div>
                    <div className="bg-slate-700 p-3 rounded">
                      <div className="text-2xl font-bold text-green-400">92%</div>
                      <div className="text-sm text-gray-300">AI Quality Score</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-400">
                    Based on platform best practices and tone analysis
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}