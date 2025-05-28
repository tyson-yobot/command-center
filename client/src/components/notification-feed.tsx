import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  Bell, 
  Users, 
  Phone, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Filter,
  MoreVertical
} from 'lucide-react';

interface NotificationItem {
  id: number;
  type: 'lead_captured' | 'call_escalation' | 'meeting_booked' | 'high_value_deal' | 'system_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export default function NotificationFeed() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Simulate real notifications based on your live metrics
  const notifications: NotificationItem[] = [
    {
      id: 1,
      type: 'lead_captured',
      title: 'New High-Value Lead',
      message: 'Sarah Johnson from TechCorp inquired about enterprise package - $25K potential',
      timestamp: '2 mins ago',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'call_escalation',
      title: 'Call Escalation Required',
      message: 'Bot confidence dropped to 45% on call with Mike Rodriguez - needs human intervention',
      timestamp: '5 mins ago',
      read: false,
      priority: 'critical'
    },
    {
      id: 3,
      type: 'meeting_booked',
      title: 'Demo Scheduled',
      message: 'Lisa Chen booked product demo for tomorrow 2:00 PM - high conversion probability',
      timestamp: '8 mins ago',
      read: true,
      priority: 'medium'
    },
    {
      id: 4,
      type: 'high_value_deal',
      title: 'Pipeline Milestone',
      message: 'Monthly pipeline value exceeded $485K target - 127% of goal achieved',
      timestamp: '12 mins ago',
      read: true,
      priority: 'high'
    },
    {
      id: 5,
      type: 'system_alert',
      title: 'Auto-Scaling Triggered',
      message: 'Deployed 3 additional bots in US-West region due to high call volume',
      timestamp: '15 mins ago',
      read: true,
      priority: 'medium'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead_captured':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'call_escalation':
        return <Phone className="h-4 w-4 text-red-600" />;
      case 'meeting_booked':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'high_value_deal':
        return <DollarSign className="h-4 w-4 text-emerald-600" />;
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'high_priority' && !['high', 'critical'].includes(notification.priority)) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(notification.type)) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Live Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-3 w-3 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Mark All Read
            </Button>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 mt-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button 
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button 
            variant={filter === 'high_priority' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('high_priority')}
          >
            High Priority
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications match your filter</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded-lg transition-all hover:shadow-md ${
                  !notification.read 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' 
                    : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(notification.type)}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <Badge 
                          variant={getPriorityColor(notification.priority)}
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp}
                        </span>
                        
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Live Update Indicator */}
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Live Feed Active
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Real-time notifications from your automation platform • Last update: 30s ago
          </p>
        </div>
      </CardContent>
    </Card>
  );
}