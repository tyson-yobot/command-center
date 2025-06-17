import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface SyncStatus {
  service: string;
  lastSync: string;
  status: 'connected' | 'error' | 'syncing' | 'disconnected';
  errorMessage?: string;
  recordCount?: number;
}

interface SyncData {
  services: SyncStatus[];
  summary: {
    total: number;
    connected: number;
    errors: number;
    disconnected: number;
  };
}

export default function MasterDataSyncMonitor() {
  const [refreshingService, setRefreshingService] = useState<string | null>(null);

  const { data: syncData, isLoading, refetch } = useQuery<SyncData>({
    queryKey: ['/api/master-data-sync/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const refreshService = async (service: string) => {
    setRefreshingService(service);
    try {
      const response = await fetch(`/api/master-data-sync/refresh/${service}`, {
        method: 'POST',
      });
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to refresh service:', error);
    } finally {
      setRefreshingService(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'syncing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'disconnected':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'bg-green-500/20 text-green-400 border-green-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      syncing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      disconnected: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border text-xs`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Master Data Sync Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-400">Loading sync status...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            Master Data Sync Monitor
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {syncData && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{syncData.summary.total}</div>
                <div className="text-xs text-slate-400">Total Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{syncData.summary.connected}</div>
                <div className="text-xs text-slate-400">Connected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{syncData.summary.errors}</div>
                <div className="text-xs text-slate-400">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{syncData.summary.disconnected}</div>
                <div className="text-xs text-slate-400">Disconnected</div>
              </div>
            </div>

            {/* Service Status List */}
            <div className="space-y-3">
              {syncData.services.map((service) => (
                <div
                  key={service.service}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <div className="font-medium text-white">{service.service}</div>
                      <div className="text-xs text-slate-400">
                        {service.lastSync === 'Never' ? (
                          'Never synced'
                        ) : (
                          `Last sync: ${new Date(service.lastSync).toLocaleTimeString()}`
                        )}
                        {service.recordCount !== undefined && (
                          <span className="ml-2">• {service.recordCount} records</span>
                        )}
                      </div>
                      {service.errorMessage && (
                        <div className="text-xs text-red-400 mt-1">{service.errorMessage}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(service.status)}
                    {service.status !== 'connected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshService(service.service.toLowerCase())}
                        disabled={refreshingService === service.service.toLowerCase()}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        {refreshingService === service.service.toLowerCase() ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}