import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Mail, Users, Send, Eye, TrendingUp, Download, Target } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';

interface MailchimpSyncProps {
  onBack: () => void;
}

export function MailchimpSyncDashboard({ onBack }: MailchimpSyncProps) {
  const { toast } = useToast();
  const [selectedAudience, setSelectedAudience] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [campaignType, setCampaignType] = useState('regular');
  const [isSending, setIsSending] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: audiences } = useQuery({ 
    queryKey: ['/api/mailchimp/audiences'],
    refetchInterval: 30000
  });
  
  const { data: campaigns } = useQuery({ 
    queryKey: ['/api/mailchimp/campaigns'],
    refetchInterval: 15000
  });
  
  const { data: crmSegments } = useQuery({ 
    queryKey: ['/api/crm/segments']
  });

  const handleSendCampaign = async () => {
    if (!selectedAudience) return;
    
    setIsSending(true);
    try {
      const response = await apiRequest('POST', '/api/mailchimp/send-campaign', {
        audienceId: selectedAudience,
        campaignType,
        segmentId: selectedSegment
      });
      
      const result = await response.json();
      
      toast({
        title: "Campaign Sent",
        description: `${campaignType} campaign sent to audience successfully`,
      });
      
      // Log to Airtable Campaign Metrics
      await apiRequest('POST', '/api/airtable/log', {
        table: 'Campaign Metrics Log',
        data: {
          campaignId: result.campaignId,
          audienceId: selectedAudience,
          campaignType,
          sentAt: new Date().toISOString(),
          status: 'sent'
        }
      });
    } catch (error) {
      console.error('Campaign send failed:', error);
      toast({
        title: "Campaign Failed",
        description: "Unable to send campaign. Please check your settings.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDraftCampaign = async () => {
    try {
      await apiRequest('POST', '/api/mailchimp/draft-campaign', {
        audienceId: selectedAudience,
        campaignType,
        segmentId: selectedSegment
      });
      
      toast({
        title: "Draft Created",
        description: "Campaign draft saved to Mailchimp",
      });
    } catch (error) {
      console.error('Draft creation failed:', error);
      toast({
        title: "Draft Failed",
        description: "Unable to create campaign draft",
        variant: "destructive"
      });
    }
  };

  const handleExportSegment = async () => {
    if (!selectedSegment) return;
    
    setIsExporting(true);
    try {
      const response = await apiRequest('POST', '/api/crm/export-segment', {
        segmentId: selectedSegment,
        audienceId: selectedAudience
      });
      
      const result = await response.json();
      
      // Download the exported file
      const blob = new Blob([result.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `segment-${selectedSegment}-export.csv`;
      a.click();
      
      toast({
        title: "Export Complete",
        description: `Segment exported with ${result.count} records`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export segment data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-lg border border-orange-400/50">
        <div className="sticky top-0 bg-slate-900 border-b border-orange-400/30 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Mail className="w-6 h-6 mr-2 text-orange-400" />
            📧 Mailchimp Integration Manager
          </h2>
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            ✕
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Audience Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Audience List</label>
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger className="bg-slate-800 border-orange-400/30 text-white">
                  <SelectValue placeholder="Select audience..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-orange-400/30">
                  {audiences?.map((audience: any) => (
                    <SelectItem key={audience.id} value={audience.id}>
                      {audience.name} ({audience.member_count} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-white text-sm font-medium mb-2 block">CRM Segment</label>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="bg-slate-800 border-orange-400/30 text-white">
                  <SelectValue placeholder="Select segment..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-orange-400/30">
                  {crmSegments?.map((segment: any) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.name} ({segment.count} leads)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Campaign Type</label>
              <Select value={campaignType} onValueChange={setCampaignType}>
                <SelectTrigger className="bg-slate-800 border-orange-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-orange-400/30">
                  <SelectItem value="regular">Regular Campaign</SelectItem>
                  <SelectItem value="automation">Automation Series</SelectItem>
                  <SelectItem value="ab_test">A/B Test</SelectItem>
                  <SelectItem value="rss">RSS Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSendCampaign}
              disabled={!selectedAudience || isSending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Campaign
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDraftCampaign}
              disabled={!selectedAudience}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Draft Campaign
            </Button>
            
            <Button
              onClick={handleExportSegment}
              disabled={!selectedSegment || isExporting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Segment
                </>
              )}
            </Button>
          </div>

          {/* Campaign Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-orange-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-400">Total Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {campaigns?.length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-orange-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-400">Avg Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">24.8%</div>
                <Progress value={24.8} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-orange-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-400">Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">3.2%</div>
                <Progress value={3.2} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-orange-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-400">Total Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {audiences?.reduce((sum: number, aud: any) => sum + aud.member_count, 0) || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card className="bg-slate-800 border-orange-400/30">
            <CardHeader>
              <CardTitle className="text-white">Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns?.slice(0, 5).map((campaign: any) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{campaign.subject_line}</div>
                      <div className="text-slate-400 text-sm">
                        Sent: {new Date(campaign.send_time).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-orange-400 border-orange-400">
                        {campaign.status}
                      </Badge>
                      <div className="text-right">
                        <div className="text-white text-sm">
                          {campaign.emails_sent || 0} sent
                        </div>
                        <div className="text-orange-400 text-xs">
                          {((campaign.opens?.unique_opens || 0) / (campaign.emails_sent || 1) * 100).toFixed(1)}% opened
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audience Overview */}
          <Card className="bg-slate-800 border-orange-400/30">
            <CardHeader>
              <CardTitle className="text-white">Audience Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {audiences?.map((audience: any) => (
                  <div key={audience.id} className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{audience.name}</h3>
                      <Badge variant="outline" className="text-orange-400 border-orange-400">
                        {audience.member_count} members
                      </Badge>
                    </div>
                    <div className="text-slate-400 text-sm">
                      Growth: +{audience.stats?.member_count_since_send || 0} this month
                    </div>
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