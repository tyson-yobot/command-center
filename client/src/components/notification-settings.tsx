import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, AlertTriangle, Users, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  escalations: boolean;
  newLeads: boolean;
  meetings: boolean;
  highValueDeals: boolean;
  systemAlerts: boolean;
  pushEnabled: boolean;
}

export default function NotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    escalations: true,
    newLeads: true,
    meetings: true,
    highValueDeals: true,
    systemAlerts: false,
    pushEnabled: false,
  });

  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse notification settings from localStorage');
      }
    }

    // Check if notifications are already enabled
    if ('Notification' in window && Notification.permission === 'granted') {
      setSettings(prev => ({ ...prev, pushEnabled: true }));
    }
  }, []);

  const requestNotificationPermission = async () => {
    setIsRequestingPermission(true);
    
    try {
      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const newSettings = { ...settings, pushEnabled: true };
        setSettings(newSettings);
        localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
        
        toast({
          title: "Push Notifications Enabled!",
          description: "You'll now receive real-time alerts for important events.",
        });

        // Send a test notification
        new Notification('YoBot Command Center', {
          body: 'Push notifications are now active! You\'ll be alerted for escalations and important events.',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
        });
        
      } else {
        throw new Error('Notification permission denied');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Notification Setup Failed",
        description: error instanceof Error ? error.message : "Could not enable push notifications",
      });
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    
    toast({
      title: "Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const notificationTypes = [
    {
      key: 'escalations' as const,
      title: 'Call Escalations',
      description: 'Immediate alerts when calls need human intervention',
      icon: AlertTriangle,
      color: 'text-red-600',
      priority: 'HIGH',
      priorityColor: 'bg-red-100 text-red-800',
    },
    {
      key: 'newLeads' as const,
      title: 'New Leads',
      description: 'Notifications for new prospect inquiries',
      icon: Users,
      color: 'text-blue-600',
      priority: 'MEDIUM',
      priorityColor: 'bg-blue-100 text-blue-800',
    },
    {
      key: 'meetings' as const,
      title: 'Meeting Bookings',
      description: 'Alerts when clients schedule appointments',
      icon: Calendar,
      color: 'text-green-600',
      priority: 'MEDIUM',
      priorityColor: 'bg-green-100 text-green-800',
    },
    {
      key: 'highValueDeals' as const,
      title: 'High-Value Deals',
      description: 'Notifications for deals over $10,000',
      icon: DollarSign,
      color: 'text-yellow-600',
      priority: 'HIGH',
      priorityColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      key: 'systemAlerts' as const,
      title: 'System Alerts',
      description: 'Bot status changes and technical notifications',
      icon: Settings,
      color: 'text-gray-600',
      priority: 'LOW',
      priorityColor: 'bg-gray-100 text-gray-800',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>🔔 Push Notification Settings</span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Configure which events trigger real-time push notifications on your device.
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Push Toggle */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Enable Push Notifications</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {settings.pushEnabled 
                  ? "Push notifications are active and ready!" 
                  : "Allow browser notifications to receive real-time alerts"
                }
              </p>
            </div>
            {!settings.pushEnabled ? (
              <Button 
                onClick={requestNotificationPermission}
                disabled={isRequestingPermission}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRequestingPermission ? "Requesting..." : "🔔 Enable"}
              </Button>
            ) : (
              <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-200">
                ✅ Active
              </Badge>
            )}
          </div>
        </div>

        {/* Individual Notification Types */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Notification Types</h3>
          {notificationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.key}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-foreground">{type.title}</span>
                      <Badge className={`text-xs ${type.priorityColor}`}>
                        {type.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[type.key]}
                  onCheckedChange={(checked) => updateSetting(type.key, checked)}
                  disabled={!settings.pushEnabled}
                />
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const allEnabled = { ...settings };
              Object.keys(allEnabled).forEach(key => {
                if (key !== 'pushEnabled') {
                  allEnabled[key as keyof NotificationSettings] = true;
                }
              });
              setSettings(allEnabled);
              localStorage.setItem('notificationSettings', JSON.stringify(allEnabled));
              toast({ title: "All notifications enabled" });
            }}
            disabled={!settings.pushEnabled}
          >
            Enable All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const allDisabled = { ...settings };
              Object.keys(allDisabled).forEach(key => {
                if (key !== 'pushEnabled') {
                  allDisabled[key as keyof NotificationSettings] = false;
                }
              });
              setSettings(allDisabled);
              localStorage.setItem('notificationSettings', JSON.stringify(allDisabled));
              toast({ title: "All notifications disabled" });
            }}
            disabled={!settings.pushEnabled}
          >
            Disable All
          </Button>
          {settings.pushEnabled && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                new Notification('YoBot Test Notification', {
                  body: 'This is a test notification to verify your settings are working correctly.',
                  icon: '/icon-192.png',
                });
                toast({ title: "Test notification sent!" });
              }}
            >
              🧪 Test Notification
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}