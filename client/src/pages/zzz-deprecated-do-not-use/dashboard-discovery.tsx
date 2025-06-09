import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Monitor, AlertCircle, CheckCircle, Router, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Dashboard {
  id: string;
  name: string;
  path: string;
  type: string;
  status: string;
  components: string[];
  webhookTarget: boolean;
  description: string;
}

interface DashboardDiscoveryData {
  success: boolean;
  totalDashboards: number;
  dashboards: Dashboard[];
  centralizedRouting: {
    status: string;
    targetDashboard: string;
    message: string;
  };
  webhookRouting: {
    centralized: boolean;
    router: string;
    targetPath: string;
  };
}

export default function DashboardDiscovery() {
  const [discoveryData, setDiscoveryData] = useState<DashboardDiscoveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardDiscovery();
  }, []);

  const fetchDashboardDiscovery = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/discovery');
      const data = await response.json();
      
      if (data.success) {
        setDiscoveryData(data);
        setError(null);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError('Network error loading dashboards');
    } finally {
      setLoading(false);
    }
  };

  const filteredDashboards = discoveryData?.dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboard.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboard.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-blue-500';
      case 'secondary': return 'bg-purple-500';
      case 'component': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
              <Button 
                onClick={fetchDashboardDiscovery} 
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Discovery</h1>
          <p className="text-gray-600">Complete visibility into all dashboards and routing in the system</p>
        </div>

        {/* Centralized Routing Status */}
        {discoveryData && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Router size={20} />
                Centralized Webhook Routing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-700 mb-2">
                    <strong>Status:</strong> {discoveryData.centralizedRouting.status}
                  </p>
                  <p className="text-sm text-green-700 mb-2">
                    <strong>Target Dashboard:</strong> {discoveryData.centralizedRouting.targetDashboard}
                  </p>
                  <p className="text-sm text-green-700">
                    {discoveryData.centralizedRouting.message}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700 mb-2">
                    <strong>Router File:</strong> {discoveryData.webhookRouting.router}
                  </p>
                  <p className="text-sm text-green-700 mb-2">
                    <strong>Target Path:</strong> {discoveryData.webhookRouting.targetPath}
                  </p>
                  <Badge className="bg-green-600">
                    {discoveryData.webhookRouting.centralized ? 'Centralized' : 'Distributed'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search dashboards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        {discoveryData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Dashboards</p>
                    <p className="text-2xl font-bold">{discoveryData.totalDashboards}</p>
                  </div>
                  <Monitor className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {discoveryData.dashboards.filter(d => d.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Webhook Targets</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {discoveryData.dashboards.filter(d => d.webhookTarget).length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Primary</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {discoveryData.dashboards.filter(d => d.type === 'primary').length}
                    </p>
                  </div>
                  <Monitor className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDashboards.map((dashboard) => (
            <Card key={dashboard.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                    <CardDescription className="mt-1">{dashboard.description}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(dashboard.status)}>
                      {dashboard.status}
                    </Badge>
                    <Badge className={getTypeColor(dashboard.type)} variant="outline">
                      {dashboard.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Path</p>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{dashboard.path}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Components</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dashboard.components.map((component, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Webhook Target:</span>
                      {dashboard.webhookTarget ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                      )}
                    </div>
                    
                    {dashboard.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(dashboard.path, '_blank')}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDashboards.length === 0 && searchTerm && (
          <Card className="text-center py-8">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No dashboards found matching "{searchTerm}"</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}