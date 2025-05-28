import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Settings, AlertTriangle, Users, Calendar, DollarSign, Clock, Moon, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  escalations: boolean;
  newLeads: boolean;
  meetings: boolean;
  highValueDeals: boolean;
  systemAlerts: boolean;
  pushEnabled: boolean;
  // Enhanced settings
  highValueThreshold: number;
  escalationConfidenceThreshold: number;
  urgencyDelay: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  batchMode: boolean;
  businessHours: {
    timezone: string;
    workingDays: string[];
  };
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
    // Enhanced defaults
    highValueThreshold: 10000,
    escalationConfidenceThreshold: 70,
    urgencyDelay: 5,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00"
    },
    batchMode: false,
    businessHours: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
    }
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
      title: 'Urgent Call Escalations',
      description: `When calls require immediate human intervention (bot confidence < ${settings.escalationConfidenceThreshold}%)`,
      businessImpact: 'Speed-to-response critical for customer satisfaction',
      suggestedAction: 'Contact within 2 minutes for optimal resolution',
      icon: AlertTriangle,
      color: 'text-red-600',
      priority: 'IMMEDIATE',
      priorityColor: 'bg-red-500 text-white',
    },
    {
      key: 'newLeads' as const,
      title: 'New Lead Captured',
      description: 'Fresh prospects ready for immediate follow-up',
      businessImpact: 'Speed-to-lead critical for conversion',
      suggestedAction: 'Contact within 5 minutes for 9x higher conversion',
      icon: Users,
      color: 'text-blue-600',
      priority: 'HIGH',
      priorityColor: 'bg-blue-100 text-blue-800',
    },
    {
      key: 'meetings' as const,
      title: 'Meeting Confirmed',
      description: 'Appointments successfully scheduled with prospects',
      businessImpact: 'Meeting confirmation reduces no-show rates',
      suggestedAction: 'Send calendar invite and prep materials',
      icon: Calendar,
      color: 'text-green-600',
      priority: 'MEDIUM',
      priorityColor: 'bg-green-100 text-green-800',
    },
    {
      key: 'highValueDeals' as const,
      title: 'High-Value Opportunities',
      description: `Deals over $${settings.highValueThreshold.toLocaleString()} - Priority prospects`,
      businessImpact: 'High-value leads require executive attention',
      suggestedAction: 'Assign to senior sales rep immediately',
      icon: DollarSign,
      color: 'text-yellow-600',
      priority: 'HIGH',
      priorityColor: 'bg-purple-100 text-purple-800',
    },
    {
      key: 'systemAlerts' as const,
      title: 'Bot Performance Alerts',
      description: 'Know when your automation needs attention',
      businessImpact: 'Proactive monitoring prevents revenue loss',
      suggestedAction: 'Review bot performance and adjust settings',
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

        {/* Advanced Settings Section */}
        <Separator className="my-6" />
        
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium">Advanced Settings</h3>
          </div>

          {/* Configurable Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="highValueThreshold" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>High-Value Deal Threshold</span>
              </Label>
              <Input
                id="highValueThreshold"
                type="number"
                value={settings.highValueThreshold}
                onChange={(e) => {
                  const newSettings = { ...settings, highValueThreshold: parseInt(e.target.value) || 10000 };
                  setSettings(newSettings);
                  localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Deals above this amount trigger high-priority alerts</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escalationThreshold" className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Escalation Confidence Threshold (%)</span>
              </Label>
              <Input
                id="escalationThreshold"
                type="number"
                min="0"
                max="100"
                value={settings.escalationConfidenceThreshold}
                onChange={(e) => {
                  const newSettings = { ...settings, escalationConfidenceThreshold: parseInt(e.target.value) || 70 };
                  setSettings(newSettings);
                  localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Calls escalate when bot confidence drops below this level</p>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4" />
                <Label htmlFor="quietHours">Quiet Hours (Do Not Disturb)</Label>
              </div>
              <Switch
                id="quietHours"
                checked={settings.quietHours.enabled}
                onCheckedChange={(checked) => {
                  const newSettings = { 
                    ...settings, 
                    quietHours: { ...settings.quietHours, enabled: checked }
                  };
                  setSettings(newSettings);
                  localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
                }}
              />
            </div>
            
            {settings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="quietStart">Start Time</Label>
                  <Input
                    id="quietStart"
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => {
                      const newSettings = { 
                        ...settings, 
                        quietHours: { ...settings.quietHours, start: e.target.value }
                      };
                      setSettings(newSettings);
                      localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quietEnd">End Time</Label>
                  <Input
                    id="quietEnd"
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => {
                      const newSettings = { 
                        ...settings, 
                        quietHours: { ...settings.quietHours, end: e.target.value }
                      };
                      setSettings(newSettings);
                      localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Smart Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <div>
                  <Label htmlFor="batchMode">Batch Non-Urgent Notifications</Label>
                  <p className="text-xs text-gray-500">Group non-urgent alerts into summary emails</p>
                </div>
              </div>
              <Switch
                id="batchMode"
                checked={settings.batchMode}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, batchMode: checked };
                  setSettings(newSettings);
                  localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgencyDelay" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Non-Urgent Notification Delay (minutes)</span>
              </Label>
              <Input
                id="urgencyDelay"
                type="number"
                min="0"
                max="60"
                value={settings.urgencyDelay}
                onChange={(e) => {
                  const newSettings = { ...settings, urgencyDelay: parseInt(e.target.value) || 5 };
                  setSettings(newSettings);
                  localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
                }}
                className="w-full"
                disabled={!settings.batchMode}
              />
              <p className="text-xs text-gray-500">Wait time before sending non-urgent notifications</p>
            </div>
          </div>

          {/* Business Context Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Smart Settings Active</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• High-value deals: ${settings.highValueThreshold.toLocaleString()}+ get priority routing</p>
              <p>• Bot escalations: Confidence below {settings.escalationConfidenceThreshold}% triggers immediate alerts</p>
              {settings.quietHours.enabled && (
                <p>• Quiet hours: {settings.quietHours.start} - {settings.quietHours.end} (urgent only)</p>
              )}
              {settings.batchMode && (
                <p>• Smart batching: Non-urgent alerts delayed {settings.urgencyDelay} minutes</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}