import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Database, Zap, TestTube, Play, List } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  testName: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  table?: string;
  error?: string;
}

interface AirtableIntegration {
  baseId: string;
  tables: string[];
}

interface IntegrationSummary {
  commandCenter: AirtableIntegration;
  opsAlerts: AirtableIntegration;
  clientCRM: AirtableIntegration;
  salesAutomation: AirtableIntegration;
  roiCalculator: AirtableIntegration;
  smartSpendTracker: AirtableIntegration;
}

export default function AirtableTestPage() {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [integrationsList, setIntegrationsList] = useState<IntegrationSummary | null>(null);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const { toast } = useToast();

  const runComprehensiveTest = async () => {
    setIsRunningTest(true);
    setTestResults(null);
    
    try {
      const response = await fetch('/api/airtable/run-system-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setTestResults(result);
      
      toast({
        title: "System Test Complete",
        description: result.results?.summary || "Airtable integration test completed",
      });
    } catch (error: any) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Failed to run comprehensive system test",
        variant: "destructive",
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const loadIntegrationsList = async () => {
    setLoadingIntegrations(true);
    
    try {
      const response = await fetch('/api/airtable/list-integrations');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setIntegrationsList(result.integrations);
      
      toast({
        title: "Integrations Loaded",
        description: `Found ${result.totalTables} tables across ${result.totalBases} Airtable bases`,
      });
    } catch (error: any) {
      console.error('Failed to load integrations:', error);
      toast({
        title: "Load Failed",
        description: error.message || "Failed to load integrations list",
        variant: "destructive",
      });
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch('/api/airtable/test-connection');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: `Tested ${result.basesTested} Airtable bases successfully`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message || "Airtable connection test failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to test Airtable connection",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'bg-green-500';
      case 'FAILED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <TestTube className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Airtable Integration Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test all 64 Airtable table integrations across 6 bases
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={testConnection}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Test Connection
          </Button>
          <Button 
            onClick={loadIntegrationsList}
            variant="outline"
            disabled={loadingIntegrations}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            {loadingIntegrations ? 'Loading...' : 'List Integrations'}
          </Button>
          <Button 
            onClick={runComprehensiveTest}
            disabled={isRunningTest}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunningTest ? 'Running Test...' : 'Run System Test'}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test connectivity to all Airtable bases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Live Integration Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test all logging functions with sample data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <List className="h-5 w-5 text-green-600" />
              Integration Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View all 64 tables and endpoints
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              System Test Results
            </CardTitle>
            <CardDescription>
              {testResults.results?.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.results?.totalTests || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Tests
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.results?.passedTests || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Passed
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.results?.failedTests || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Failed
                </div>
              </div>
            </div>

            <Separator />

            {/* Integration Results */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Integration Results</h3>
              <div className="grid gap-3">
                {testResults.results?.integrations && Object.entries(testResults.results.integrations).map(([key, result]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        {result.table && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {result.table}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={result.status === 'PASSED' ? 'default' : 'destructive'}
                        className={`${getStatusColor(result.status)} text-white`}
                      >
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {testResults.results?.failedTests > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {testResults.nextSteps}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Integrations List */}
      {integrationsList && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Available Integrations
            </CardTitle>
            <CardDescription>
              All 64 Airtable tables across 6 bases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(integrationsList).map(([baseKey, base]: [string, any]) => (
              <div key={baseKey} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold capitalize">
                    {baseKey.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <Badge variant="outline">
                    {base.tables.length} tables
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {base.baseId}
                  </Badge>
                </div>
                <div className="grid gap-2 ml-4">
                  {base.tables.map((table: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {table}
                    </div>
                  ))}
                </div>
                {Object.keys(integrationsList).indexOf(baseKey) < Object.keys(integrationsList).length - 1 && (
                  <Separator />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* API Endpoints Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Available API Endpoints</CardTitle>
          <CardDescription>
            Direct endpoints for testing individual integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 font-mono text-sm">
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span>GET /api/airtable/test-connection</span>
              <Badge variant="outline">Connection Test</Badge>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span>POST /api/airtable/run-system-test</span>
              <Badge variant="outline">Full System Test</Badge>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span>GET /api/airtable/list-integrations</span>
              <Badge variant="outline">List All Tables</Badge>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span>POST /api/airtable/log-metrics</span>
              <Badge variant="outline">Command Center Metrics</Badge>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span>POST /api/airtable/log-lead-intake</span>
              <Badge variant="outline">Lead Intake</Badge>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span>POST /api/airtable/log-call-sentiment</span>
              <Badge variant="outline">Call Sentiment</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}