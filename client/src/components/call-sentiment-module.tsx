import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Phone, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Smile,
  Frown,
  Meh,
  Heart,
  Zap,
  Clock
} from 'lucide-react';

interface CallSentiment {
  id: string;
  callId: string;
  customerName: string;
  duration: number;
  timestamp: string;
  overallSentiment: 'positive' | 'negative' | 'neutral';
  emotions: string[];
  sentimentScore: number;
  confidence: number;
  keyInsights: string[];
  actionRequired: boolean;
  escalationFlag: boolean;
}

interface SentimentMetrics {
  totalCalls: number;
  positiveRate: number;
  negativeRate: number;
  neutralRate: number;
  avgSentimentScore: number;
  escalationRate: number;
  topEmotions: { emotion: string; count: number }[];
}

export default function CallSentimentModule() {
  const [sentiments, setSentiments] = useState<CallSentiment[]>([]);
  const [metrics, setMetrics] = useState<SentimentMetrics>({
    totalCalls: 0,
    positiveRate: 0,
    negativeRate: 0,
    neutralRate: 0,
    avgSentimentScore: 0,
    escalationRate: 0,
    topEmotions: []
  });
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedSentiment, setSelectedSentiment] = useState<CallSentiment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSentimentData();
  }, [timeframe]);

  const loadSentimentData = async () => {
    try {
      const response = await fetch(`/api/call-sentiment/analytics?timeframe=${timeframe}`);
      const data = await response.json();
      
      if (data.success) {
        setSentiments(data.sentiments || []);
        setMetrics(data.metrics || metrics);
      }
    } catch (error) {
      console.error('Failed to load sentiment data:', error);
    }
  };

  const analyzeCall = async (callId: string) => {
    try {
      const response = await fetch('/api/call-sentiment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId })
      });

      const result = await response.json();
      
      if (result.success) {
        await loadSentimentData();
        toast({
          title: "Analysis Complete",
          description: "Call sentiment has been analyzed successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze call sentiment",
        variant: "destructive",
      });
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-green-600" />;
      case 'negative': return <Frown className="w-4 h-4 text-red-600" />;
      case 'neutral': return <Meh className="w-4 h-4 text-gray-600" />;
      default: return <Brain className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy': return <Smile className="w-4 h-4" />;
      case 'frustrated': return <Frown className="w-4 h-4" />;
      case 'excited': return <Zap className="w-4 h-4" />;
      case 'satisfied': return <Heart className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const SENTIMENT_COLORS = {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#6b7280'
  };

  const pieData = [
    { name: 'Positive', value: metrics.positiveRate, color: SENTIMENT_COLORS.positive },
    { name: 'Negative', value: metrics.negativeRate, color: SENTIMENT_COLORS.negative },
    { name: 'Neutral', value: metrics.neutralRate, color: SENTIMENT_COLORS.neutral }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8" />
            Call Sentiment Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">AI-powered emotion and sentiment detection for call optimization</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Analyzed calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(metrics.avgSentimentScore * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Satisfaction score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Rate</CardTitle>
            <Smile className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.positiveRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Happy customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalation Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.escalationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Overall call sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Emotions Detected</CardTitle>
            <CardDescription>Most common emotional patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topEmotions.slice(0, 5).map((emotion, index) => (
                <div key={emotion.emotion} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEmotionIcon(emotion.emotion)}
                    <span className="font-medium capitalize">{emotion.emotion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(emotion.count / metrics.totalCalls) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                      {emotion.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Call Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Call Analysis</CardTitle>
          <CardDescription>Latest sentiment analysis results with insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentiments.slice(0, 10).map((sentiment) => (
              <div 
                key={sentiment.id} 
                className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getSentimentColor(sentiment.overallSentiment)}`}
                onClick={() => setSelectedSentiment(sentiment)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(sentiment.overallSentiment)}
                    <span className="font-semibold">{sentiment.customerName}</span>
                    <Badge variant="outline">
                      {sentiment.overallSentiment.charAt(0).toUpperCase() + sentiment.overallSentiment.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(sentiment.duration)}
                    </div>
                    <span>{new Date(sentiment.timestamp).toLocaleDateString()}</span>
                    {sentiment.escalationFlag && (
                      <Badge variant="destructive" className="text-xs">
                        Escalation Required
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      Score: <span className="font-semibold">{(sentiment.sentimentScore * 100).toFixed(1)}%</span>
                    </span>
                    <span className="text-sm">
                      Confidence: <span className="font-semibold">{(sentiment.confidence * 100).toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {sentiment.emotions.slice(0, 3).map((emotion) => (
                      <Badge key={emotion} variant="secondary" className="text-xs">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>

                {sentiment.keyInsights.length > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Key Insight: </span>
                    {sentiment.keyInsights[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Modal */}
      {selectedSentiment && (
        <Card className="fixed inset-4 z-50 bg-white dark:bg-gray-900 shadow-xl overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getSentimentIcon(selectedSentiment.overallSentiment)}
                Call Analysis: {selectedSentiment.customerName}
              </CardTitle>
              <Button variant="outline" onClick={() => setSelectedSentiment(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{(selectedSentiment.sentimentScore * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sentiment Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(selectedSentiment.confidence * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatDuration(selectedSentiment.duration)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Detected Emotions</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSentiment.emotions.map((emotion) => (
                  <Badge key={emotion} variant="outline" className="flex items-center gap-1">
                    {getEmotionIcon(emotion)}
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Key Insights</h3>
              <ul className="space-y-2">
                {selectedSentiment.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedSentiment.actionRequired && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800 dark:text-yellow-200">Action Required</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This call requires follow-up action based on sentiment analysis results.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {sentiments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Call Analysis Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start analyzing calls to detect emotions and improve customer experience
            </p>
            <Button onClick={() => analyzeCall('demo-call-1')}>
              <Phone className="w-4 h-4 mr-2" />
              Analyze Demo Call
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}