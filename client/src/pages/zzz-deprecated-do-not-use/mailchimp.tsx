import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Mail, 
  Users, 
  Send, 
  BarChart3,
  CheckCircle,
  Clock,
  Target,
  FileText,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Mailchimp() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      const response = await fetch('/api/mailchimp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      });

      if (response.ok) {
        toast({
          title: "Sync Complete",
          description: "Mailchimp data synchronized successfully",
        });
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync with Mailchimp. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-8">
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
              <h1 className="text-4xl font-bold text-white">Mailchimp Integration</h1>
              <p className="text-white/70 mt-2">Email marketing automation and campaign management</p>
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
              <Mail className="w-5 h-5 mr-2" />
              Email Marketing Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Total Subscribers</span>
                    <Users className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">0</div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Campaigns Sent</span>
                    <Send className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">0</div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Open Rate</span>
                    <BarChart3 className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">0%</div>
                </div>
              </div>
              
              <Button 
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full bg-orange-600 hover:bg-orange-700 h-12"
              >
                {isSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Sync with Mailchimp
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