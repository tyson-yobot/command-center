import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TestTube, 
  TrendingUp, 
  Users, 
  Target, 
  Play, 
  Pause,
  BarChart3,
  Plus
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  variantA: {
    name: string;
    script: string;
    conversions: number;
    visitors: number;
  };
  variantB: {
    name: string;
    script: string;
    conversions: number;
    visitors: number;
  };
  status: 'draft' | 'running' | 'completed' | 'paused';
  trafficSplit: number;
  createdAt: string;
  significance: number;
  winner?: 'A' | 'B' | 'inconclusive';
}

export default function ABTestingModule() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    variantA: { name: 'Control', script: '' },
    variantB: { name: 'Variant', script: '' },
    trafficSplit: 50
  });
  const { toast } = useToast();

  useEffect(() => {
    loadABTests();
  }, []);

  const loadABTests = async () => {
    try {
      const response = await fetch('/api/ab-testing/tests');
      const data = await response.json();
      
      if (data.success) {
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error('Failed to load A/B tests:', error);
    }
  };

  const createTest = async () => {
    if (!newTest.name || !newTest.variantA.script || !newTest.variantB.script) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/ab-testing/create-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: newTest.name,
          variantA: newTest.variantA,
          variantB: newTest.variantB,
          trafficSplit: newTest.trafficSplit
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await loadABTests();
        setShowCreateForm(false);
        setNewTest({
          name: '',
          variantA: { name: 'Control', script: '' },
          variantB: { name: 'Variant', script: '' },
          trafficSplit: 50
        });
        
        toast({
          title: "Test Created",
          description: "A/B test has been created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Could not create A/B test",
        variant: "destructive",
      });
    }
  };

  const toggleTestStatus = async (testId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      const response = await fetch(`/api/ab-testing/${testId}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        await loadABTests();
        toast({
          title: "Test Updated",
          description: `Test has been ${action}ed successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update test status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateConversionRate = (conversions: number, visitors: number) => {
    return visitors > 0 ? ((conversions / visitors) * 100).toFixed(2) : '0.00';
  };

  const getWinnerBadge = (test: ABTest) => {
    if (test.winner) {
      const variant = test.winner === 'A' ? test.variantA : test.variantB;
      return (
        <Badge variant="default" className="bg-green-600">
          Winner: {variant.name}
        </Badge>
      );
    }
    if (test.status === 'completed' && test.winner === 'inconclusive') {
      return <Badge variant="secondary">Inconclusive</Badge>;
    }
    return null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube className="w-8 h-8" />
            A/B Script Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Optimize messaging with data-backed split tests</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Test
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New A/B Test</CardTitle>
            <CardDescription>Set up a split test to optimize your messaging</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testName">Test Name</Label>
              <Input
                id="testName"
                placeholder="e.g., Welcome Message Optimization"
                value={newTest.name}
                onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Variant A (Control)</Label>
                <Input
                  placeholder="Control Name"
                  value={newTest.variantA.name}
                  onChange={(e) => setNewTest(prev => ({ 
                    ...prev, 
                    variantA: { ...prev.variantA, name: e.target.value }
                  }))}
                />
                <Textarea
                  placeholder="Control script/message..."
                  value={newTest.variantA.script}
                  onChange={(e) => setNewTest(prev => ({ 
                    ...prev, 
                    variantA: { ...prev.variantA, script: e.target.value }
                  }))}
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label>Variant B (Test)</Label>
                <Input
                  placeholder="Variant Name"
                  value={newTest.variantB.name}
                  onChange={(e) => setNewTest(prev => ({ 
                    ...prev, 
                    variantB: { ...prev.variantB, name: e.target.value }
                  }))}
                />
                <Textarea
                  placeholder="Test script/message..."
                  value={newTest.variantB.script}
                  onChange={(e) => setNewTest(prev => ({ 
                    ...prev, 
                    variantB: { ...prev.variantB, script: e.target.value }
                  }))}
                  className="min-h-24"
                />
              </div>
            </div>

            <div>
              <Label>Traffic Split</Label>
              <Select 
                value={newTest.trafficSplit.toString()} 
                onValueChange={(value) => setNewTest(prev => ({ ...prev, trafficSplit: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50/50 Split</SelectItem>
                  <SelectItem value="30">70/30 Split</SelectItem>
                  <SelectItem value="20">80/20 Split</SelectItem>
                  <SelectItem value="10">90/10 Split</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={createTest}>Create Test</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Tests Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <TestTube className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests.filter(t => t.status === 'running').length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests.filter(t => t.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">With results</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.reduce((sum, test) => sum + test.variantA.visitors + test.variantB.visitors, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12.3%</div>
            <p className="text-xs text-muted-foreground">Conversion lift</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </Badge>
                  {getWinnerBadge(test)}
                </div>
                <div className="flex gap-2">
                  {test.status === 'running' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleTestStatus(test.id, 'pause')}
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {test.status === 'paused' && (
                    <Button 
                      size="sm" 
                      onClick={() => toggleTestStatus(test.id, 'start')}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Variant A */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{test.variantA.name}</h4>
                    <Badge variant="outline">
                      {calculateConversionRate(test.variantA.conversions, test.variantA.visitors)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {test.variantA.script}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {test.variantA.conversions} conversions / {test.variantA.visitors} visitors
                  </div>
                </div>

                {/* Variant B */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{test.variantB.name}</h4>
                    <Badge variant="outline">
                      {calculateConversionRate(test.variantB.conversions, test.variantB.visitors)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {test.variantB.script}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {test.variantB.conversions} conversions / {test.variantB.visitors} visitors
                  </div>
                </div>
              </div>

              {test.status === 'completed' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Statistical Significance:</span>
                    <Badge variant={test.significance >= 95 ? "default" : "secondary"}>
                      {test.significance.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tests.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-12">
            <TestTube className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No A/B Tests Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first A/B test to start optimizing your messaging
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}