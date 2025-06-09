import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Image, Video, Share2, Download, Send } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ContentCreatorProps {
  onClose: () => void;
}

export function ContentCreatorDashboard({ onClose }: ContentCreatorProps) {
  const [contentType, setContentType] = useState('post');
  const [platform, setPlatform] = useState('linkedin');
  const [voiceTone, setVoiceTone] = useState('professional');
  const [contentText, setContentText] = useState('');
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleGenerateContent = async () => {
    if (!topic) return;
    
    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/content/generate', {
        contentType,
        platform,
        voiceTone,
        topic,
        customText: contentText
      });
      
      setGeneratedContent(response.content);
      
      // Log to Airtable
      await apiRequest('POST', '/api/airtable/log', {
        table: 'Social Scripts Log',
        data: {
          contentType,
          platform,
          voiceTone,
          topic,
          generatedContent: response.content,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Content generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!generatedContent) return;
    
    setIsScheduling(true);
    try {
      await apiRequest('POST', '/api/content/schedule', {
        content: generatedContent,
        platform,
        scheduleTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      });
      
      // Send to Slack
      await apiRequest('POST', '/api/slack/notify', {
        message: `📅 New ${platform} ${contentType} scheduled: ${topic}`,
        channel: 'content-updates'
      });
    } catch (error) {
      console.error('Scheduling failed:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSaveToAirtable = async () => {
    try {
      await apiRequest('POST', '/api/airtable/content-save', {
        content: generatedContent,
        platform,
        contentType,
        voiceTone,
        topic,
        status: 'draft'
      });
    } catch (error) {
      console.error('Save to Airtable failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-purple-400/50">
        <div className="sticky top-0 bg-slate-900 border-b border-purple-400/30 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Share2 className="w-6 h-6 mr-2 text-purple-400" />
            📢 Content Creator & Social Media Manager
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            ✕
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Content Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="bg-slate-800 border-purple-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-400/30">
                  <SelectItem value="post">Social Post</SelectItem>
                  <SelectItem value="reel">Reel/Video</SelectItem>
                  <SelectItem value="ad">Advertisement</SelectItem>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="blog">Blog Article</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-white">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-slate-800 border-purple-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-400/30">
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">X (formerly Twitter)</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-white">Voice & Tone</Label>
              <Select value={voiceTone} onValueChange={setVoiceTone}>
                <SelectTrigger className="bg-slate-800 border-purple-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-400/30">
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="funny">Funny</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                  <SelectItem value="value-driven">Value-Driven</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-4">
            <div>
              <Label className="text-white">Topic/Subject</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the main topic or subject..."
                className="bg-slate-800 border-purple-400/30 text-white"
              />
            </div>
            
            <div>
              <Label className="text-white">Additional Context (Optional)</Label>
              <Textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Add any specific details, requirements, or key points..."
                className="bg-slate-800 border-purple-400/30 text-white h-24"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerateContent}
              disabled={!topic || isGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSchedulePost}
              disabled={!generatedContent || isScheduling}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isScheduling ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Post
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSaveToAirtable}
              disabled={!generatedContent}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Save to Airtable
            </Button>
          </div>

          {/* Generated Content Preview */}
          {generatedContent && (
            <Card className="bg-slate-800 border-purple-400/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Generated Content Preview
                  <Badge variant="outline" className="text-purple-400 border-purple-400">
                    {platform} • {contentType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <pre className="text-white whitespace-pre-wrap font-sans">
                    {generatedContent}
                  </pre>
                </div>
                
                <div className="mt-4 flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    className="bg-slate-600 hover:bg-slate-500 text-white"
                  >
                    Copy Text
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([generatedContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${topic}-${platform}-${contentType}.txt`;
                      a.click();
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly Calendar Preview */}
          <Card className="bg-slate-800 border-purple-400/30">
            <CardHeader>
              <CardTitle className="text-white">Monthly Content Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-purple-400 font-medium p-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="bg-slate-700 p-2 rounded text-white text-sm hover:bg-slate-600 cursor-pointer">
                    {i + 1}
                    {i === 5 && <div className="w-2 h-2 bg-purple-400 rounded-full mx-auto mt-1"></div>}
                    {i === 12 && <div className="w-2 h-2 bg-blue-400 rounded-full mx-auto mt-1"></div>}
                    {i === 18 && <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1"></div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}