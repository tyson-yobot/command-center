import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  FileText, 
  Image, 
  Video, 
  Calendar, 
  Share2, 
  Target,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  Zap,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Publy() {
  const { toast } = useToast();
  const [contentType, setContentType] = useState('blog');
  const [contentText, setContentText] = useState('');
  const [targetPlatforms, setTargetPlatforms] = useState(['facebook', 'instagram']);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const contentTypes = [
    { id: 'blog', label: 'Blog Post', icon: FileText },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'image', label: 'Visual Content', icon: Image },
    { id: 'video', label: 'Video Script', icon: Video }
  ];

  const platforms = [
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-600' },
    { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-red-600' }
  ];

  const handleGenerateContent = async () => {
    if (!contentText.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content description or topic",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/content-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          prompt: contentText,
          platforms: targetPlatforms,
          scheduledDate
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Content Generated",
          description: `${contentType} content created successfully for ${targetPlatforms.length} platform(s)`,
        });
      } else {
        throw new Error('Content generation failed');
      }
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/command-center">
              <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Command Center
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">Publy Content Creator</h1>
              <p className="text-white/70 mt-2">AI-powered social media content creation platform</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            Live Mode
          </Badge>
        </div>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Content Creation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your content description or topic..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                className="min-h-32 bg-white/5 border-white/20 text-white placeholder-white/50"
                rows={6}
              />
              
              <Button 
                onClick={handleGenerateContent}
                disabled={isGenerating || !contentText.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 h-12"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}