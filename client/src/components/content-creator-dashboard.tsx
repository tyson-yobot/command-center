import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PenTool, Image, Video, Calendar, TrendingUp, Eye, Heart, Share2, Clock } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'post' | 'image' | 'video' | 'story';
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    views: number;
    likes: number;
    shares: number;
  };
  scheduledFor?: string;
  createdAt: string;
}

function ContentCreatorDashboard() {
  const [content, setContent] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'AI Automation Benefits',
      type: 'post',
      platform: 'linkedin',
      status: 'published',
      engagement: { views: 1250, likes: 89, shares: 23 },
      createdAt: '2 hours ago'
    },
    {
      id: '2',
      title: 'Product Demo Video',
      type: 'video',
      platform: 'facebook',
      status: 'scheduled',
      engagement: { views: 0, likes: 0, shares: 0 },
      scheduledFor: 'Today 3:00 PM',
      createdAt: '1 hour ago'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 border-green-200';
      case 'scheduled': return 'text-blue-600 border-blue-200';
      case 'draft': return 'text-yellow-600 border-yellow-200';
      case 'failed': return 'text-red-600 border-red-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-500';
      case 'instagram': return 'bg-purple-500';
      case 'twitter': return 'bg-sky-500';
      case 'linkedin': return 'bg-blue-700';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <PenTool className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'story': return <Calendar className="w-4 h-4" />;
      default: return <PenTool className="w-4 h-4" />;
    }
  };

  const totalEngagement = content.reduce((sum, item) => 
    sum + item.engagement.views + item.engagement.likes + item.engagement.shares, 0
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PenTool className="w-5 h-5" />
          AI Content Creator
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{totalEngagement} total engagement</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{content.filter(c => c.status === 'scheduled').length} scheduled</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {content.map((item) => (
          <div key={item.id} className="border rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getPlatformColor(item.platform)}`} />
                <div>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  <div className="text-xs text-gray-600 capitalize">{item.platform} • {item.type}</div>
                </div>
              </div>
              <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                {item.status}
              </Badge>
            </div>
            
            {item.status === 'published' && (
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {item.engagement.views}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {item.engagement.likes}
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  {item.engagement.shares}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {item.scheduledFor ? `Scheduled: ${item.scheduledFor}` : `Created: ${item.createdAt}`}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Edit
                </Button>
                <Button size="sm" variant="ghost">
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            Create New Content
          </Button>
          <div className="text-xs text-gray-500 text-center">
            AI-powered content generation active
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { ContentCreatorDashboard };
export default ContentCreatorDashboard;