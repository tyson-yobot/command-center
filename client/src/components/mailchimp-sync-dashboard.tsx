import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mail, Users, TrendingUp, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface MailchimpCampaign {
  id: string;
  name: string;
  status: 'draft' | 'sent' | 'sending' | 'scheduled';
  recipients: number;
  openRate: number;
  clickRate: number;
  lastSynced: string;
  audience: string;
}

interface SyncStatus {
  isActive: boolean;
  lastSync: string;
  totalContacts: number;
  newContacts: number;
  errors: number;
}

function MailchimpSyncDashboard() {
  const [campaigns, setCampaigns] = useState<MailchimpCampaign[]>([
    {
      id: 'MC-001',
      name: 'Weekly Newsletter',
      status: 'sent',
      recipients: 2450,
      openRate: 24.5,
      clickRate: 3.8,
      lastSynced: '2 hours ago',
      audience: 'All Subscribers'
    },
    {
      id: 'MC-002',
      name: 'Product Launch',
      status: 'scheduled',
      recipients: 1850,
      openRate: 0,
      clickRate: 0,
      lastSynced: '1 hour ago',
      audience: 'VIP Customers'
    }
  ]);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isActive: true,
    lastSync: '15 minutes ago',
    totalContacts: 4300,
    newContacts: 23,
    errors: 0
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 border-green-200';
      case 'sending': return 'text-blue-600 border-blue-200';
      case 'scheduled': return 'text-yellow-600 border-yellow-200';
      case 'draft': return 'text-gray-600 border-gray-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4" />;
      case 'sending': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'draft': return <Mail className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const handleSyncNow = () => {
    setSyncStatus(prev => ({ ...prev, isActive: true, lastSync: 'Syncing now...' }));
    // Simulate sync
    setTimeout(() => {
      setSyncStatus(prev => ({ 
        ...prev, 
        isActive: false, 
        lastSync: 'Just now',
        newContacts: prev.newContacts + 5 
      }));
    }, 3000);
  };

  const totalOpenRate = campaigns.filter(c => c.status === 'sent')
    .reduce((sum, c) => sum + c.openRate, 0) / campaigns.filter(c => c.status === 'sent').length || 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="w-5 h-5" />
          MailChimp Integration
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{syncStatus.totalContacts.toLocaleString()} contacts</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{totalOpenRate.toFixed(1)}% avg open rate</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {syncStatus.isActive ? (
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="font-medium text-sm">Sync Status</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleSyncNow} disabled={syncStatus.isActive}>
              Sync Now
            </Button>
          </div>
          <div className="text-xs text-gray-600">
            Last sync: {syncStatus.lastSync} • {syncStatus.newContacts} new contacts
          </div>
          {syncStatus.errors > 0 && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              {syncStatus.errors} sync errors
            </div>
          )}
        </div>

        {/* Campaigns */}
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(campaign.status)}
                  <div>
                    <div className="font-medium text-sm">{campaign.name}</div>
                    <div className="text-xs text-gray-600">{campaign.audience}</div>
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-gray-500">Recipients</div>
                  <div className="font-medium">{campaign.recipients.toLocaleString()}</div>
                </div>
                {campaign.status === 'sent' && (
                  <>
                    <div>
                      <div className="text-gray-500">Open Rate</div>
                      <div className="font-medium">{campaign.openRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Click Rate</div>
                      <div className="font-medium">{campaign.clickRate}%</div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Synced: {campaign.lastSynced}
                </div>
                <Button size="sm" variant="ghost">
                  View in MailChimp
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-2 border-t">
          <Button variant="outline" size="sm" className="w-full">
            Manage MailChimp Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { MailchimpSyncDashboard };
export default MailchimpSyncDashboard;