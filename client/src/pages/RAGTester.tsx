import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Search, Clock, Target, User, Zap } from "lucide-react";

interface RAGResponse {
  success: boolean;
  enhancedReply: string;
  sourcesUsed: any[];
  confidence: number;
  processingTime: number;
  timestamp: string;
}

export function RAGTester() {
  const [query, setQuery] = useState("");
  const [userRole, setUserRole] = useState("support");
  const [eventType, setEventType] = useState("chat");
  const [response, setResponse] = useState<RAGResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          userRole,
          eventType
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to process query');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "What is your refund policy?",
    "I want to speak to a human",
    "Is my health data protected?",
    "How do I return a product?",
    "Can I get my money back?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-[#0D82DA] to-[#1E40AF] rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Context Intelligence</h1>
            <p className="text-blue-200/80">Test your knowledge retrieval and AI enhancement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Query Input */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                Query Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">Test Query</label>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your query here..."
                  rows={3}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-blue-200/80 mb-2 block">User Role</label>
                  <Select value={userRole} onValueChange={setUserRole}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-blue-200/80 mb-2 block">Event Type</label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="voice_call">Voice Call</SelectItem>
                      <SelectItem value="support_ticket">Support Ticket</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleQuery}
                disabled={loading || !query.trim()}
                className="w-full bg-gradient-to-r from-[#0D82DA] to-[#1E40AF] hover:from-[#0B6BB8] hover:to-[#1C3A9E] text-white"
              >
                {loading ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Process Query
                  </>
                )}
              </Button>

              {/* Sample Queries */}
              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">Quick Test Queries</label>
                <div className="space-y-2">
                  {sampleQueries.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(sample)}
                      className="text-left w-full p-2 text-sm bg-slate-700/30 hover:bg-slate-600/50 rounded border border-slate-600/30 text-slate-300 transition-all duration-200"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Display */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                RAG Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {response && (
                <div className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-700/50 rounded p-3 text-center border border-slate-600/30">
                      <div className="text-lg font-bold text-green-400">{response.confidence}%</div>
                      <div className="text-xs text-slate-400">Confidence</div>
                    </div>
                    <div className="bg-slate-700/50 rounded p-3 text-center border border-slate-600/30">
                      <div className="text-lg font-bold text-blue-400">{response.processingTime}ms</div>
                      <div className="text-xs text-slate-400">Processing</div>
                    </div>
                    <div className="bg-slate-700/50 rounded p-3 text-center border border-slate-600/30">
                      <div className="text-lg font-bold text-purple-400">{response.sourcesUsed.length}</div>
                      <div className="text-xs text-slate-400">Sources</div>
                    </div>
                  </div>

                  {/* Enhanced Response */}
                  <div>
                    <label className="text-sm text-blue-200/80 mb-2 block">Enhanced Response</label>
                    <div className="bg-slate-700/50 border border-slate-600/50 rounded p-3 text-slate-200">
                      {response.enhancedReply}
                    </div>
                  </div>

                  {/* Sources Used */}
                  {response.sourcesUsed.length > 0 && (
                    <div>
                      <label className="text-sm text-blue-200/80 mb-2 block">Knowledge Sources Used</label>
                      <div className="space-y-2">
                        {response.sourcesUsed.map((source, index) => (
                          <div key={index} className="bg-slate-700/50 border border-slate-600/50 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white">{source.name}</h4>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-500/10">
                                  {source.confidence}% confidence
                                </Badge>
                                <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10">
                                  Priority: {source.priority}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-slate-300 mb-2">{source.content.substring(0, 150)}...</p>
                            <div className="flex gap-1 flex-wrap">
                              {source.tags?.map((tag: string, tagIndex: number) => (
                                <Badge key={tagIndex} variant="outline" className="border-slate-600/50 text-slate-400 text-xs bg-slate-600/20">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!response && !error && !loading && (
                <div className="text-center py-8 text-slate-400">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a query above to test the RAG system</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}