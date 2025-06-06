import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BarChart3, 
  Phone, 
  PhoneCall, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Bot,
  MessageSquare,
  Headphones,
  Activity,
  Clock,
  Shield
} from 'lucide-react';

interface NavigationSidebarProps {
  className?: string;
}

export function NavigationSidebar({ className }: NavigationSidebarProps) {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['agents']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path: string) => location === path;
  const isSectionExpanded = (section: string) => expandedSections.includes(section);

  const navigationItems = [
    {
      id: 'agents',
      title: 'Agents',
      icon: Users,
      badge: '5 Active',
      subitems: [
        { path: '/agents/voicebot', title: 'VoiceBot Agents', icon: Bot, badge: '3' },
        { path: '/agents/chatbot', title: 'ChatBot Agents', icon: MessageSquare, badge: '2' },
        { path: '/agents/ai-assistants', title: 'AI Assistants', icon: Headphones, badge: '2' }
      ]
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
      badge: 'Live'
    },
    {
      id: 'call-history',
      title: 'Call History',
      icon: PhoneCall,
      badge: '94 Today',
      subitems: [
        { path: '/call-history/recent', title: 'Recent Calls', icon: Clock, badge: '12' },
        { path: '/call-history/analytics', title: 'Call Analytics', icon: Activity },
        { path: '/call-history/recordings', title: 'Recordings', icon: Phone, badge: '47' }
      ]
    },
    {
      id: 'phone-numbers',
      title: 'Phone Numbers',
      icon: Phone,
      badge: '3 Lines',
      subitems: [
        { path: '/phone-numbers/active', title: 'Active Numbers', icon: Phone, badge: '3' },
        { path: '/phone-numbers/routing', title: 'Call Routing', icon: Activity },
        { path: '/phone-numbers/forwarding', title: 'Call Forwarding', icon: PhoneCall }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      subitems: [
        { path: '/settings/voice', title: 'Voice Settings', icon: Bot },
        { path: '/settings/calls', title: 'Call Settings', icon: Phone },
        { path: '/settings/ai', title: 'AI Settings', icon: Activity },
        { path: '/settings/integrations', title: 'Integrations', icon: Settings },
        { path: '/settings/security', title: 'Security', icon: Shield }
      ]
    }
  ];

  return (
    <Card className={`w-80 h-full bg-slate-900 border-slate-700 ${className}`}>
      <CardContent className="p-0">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">YoBot® Command Center</h2>
          <p className="text-sm text-slate-400">Enterprise AI Management</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <div key={item.id} className="space-y-1">
              {item.path ? (
                <Link href={item.path}>
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className={`w-full justify-start text-left p-3 h-auto ${
                      isActive(item.path) 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="outline" className="ml-2 text-xs bg-slate-700 text-white border-slate-600">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => toggleSection(item.id)}
                  className="w-full justify-start text-left p-3 h-auto text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-2 text-xs bg-slate-700 text-white border-slate-600">
                      {item.badge}
                    </Badge>
                  )}
                  {isSectionExpanded(item.id) ? (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              )}
              
              {item.subitems && isSectionExpanded(item.id) && (
                <div className="ml-4 space-y-1">
                  {item.subitems.map((subitem) => (
                    <Link key={subitem.path} href={subitem.path}>
                      <Button
                        variant={isActive(subitem.path) ? "secondary" : "ghost"}
                        size="sm"
                        className={`w-full justify-start text-left p-2 h-auto ${
                          isActive(subitem.path)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <subitem.icon className="mr-2 h-4 w-4" />
                        <span className="flex-1">{subitem.title}</span>
                        {subitem.badge && (
                          <Badge variant="outline" className="ml-2 text-xs bg-slate-600 text-white border-slate-500">
                            {subitem.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}