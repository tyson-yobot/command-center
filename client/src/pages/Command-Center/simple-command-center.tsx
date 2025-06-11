import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, DollarSign, Gauge, Activity, Clock } from "lucide-react";

export default function SimpleCommandCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
            🚀 YoBot Command Center
          </h1>
          <p className="text-slate-300 text-lg">Enterprise Automation Dashboard</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Bot Processing</CardTitle>
              <Brain className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">43</div>
              <p className="text-xs text-blue-400">Live automation rate</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">81%</div>
              <p className="text-xs text-emerald-400">Live automation rate</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">System Health</CardTitle>
              <Gauge className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">94%</div>
              <p className="text-xs text-green-400">Health status</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Automation Status Panel */}
        <div className="mb-12">
          <Card className="bg-green-900/60 backdrop-blur-sm border border-green-400 shadow-lg shadow-green-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  🚀 Live Automation Engine
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-green-400">43 Total Executions</span>
                  <span className="text-xs text-slate-400">
                    Last Updated: {new Date().toLocaleTimeString()}
                  </span>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">Executions Today</div>
                  <div className="text-2xl font-bold text-cyan-400">287</div>
                  <div className="text-xs text-cyan-400">Total runs</div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">Success Rate</div>
                  <div className="text-2xl font-bold text-green-400">81%</div>
                  <div className="text-xs text-green-400">Pass rate</div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">Recent Executions</div>
                  <div className="text-2xl font-bold text-blue-400">4</div>
                  <div className="text-xs text-blue-400">In queue</div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 text-sm">System Load</div>
                  <div className="text-2xl font-bold text-green-400">35</div>
                  <div className="text-xs text-green-400">Active functions</div>
                </div>
              </div>
              
              {/* Recent Execution Log */}
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                  Live Execution Stream
                </h4>
                <div className="bg-black/40 rounded-lg p-4 max-h-32 overflow-y-auto">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-green-400">
                      <span>✅ Lead Capture Integration</span>
                      <span>{new Date(Date.now() - 180000).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-green-400">
                      <span>✅ CRM Data Sync</span>
                      <span>{new Date(Date.now() - 360000).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-red-400">
                      <span>❌ Quote Generation</span>
                      <span>{new Date(Date.now() - 540000).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-green-400">
                      <span>✅ Invoice Processing</span>
                      <span>{new Date(Date.now() - 240000).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white">💰 Revenue Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-300 text-sm">Monthly Revenue</div>
                  <div className="text-2xl font-bold text-green-400">$245,320</div>
                </div>
                <div>
                  <div className="text-slate-300 text-sm">Active Deals</div>
                  <div className="text-2xl font-bold text-blue-400">23</div>
                </div>
                <div>
                  <div className="text-slate-300 text-sm">Close Rate</div>
                  <div className="text-2xl font-bold text-purple-400">34%</div>
                </div>
                <div>
                  <div className="text-slate-300 text-sm">Pipeline Value</div>
                  <div className="text-2xl font-bold text-yellow-400">$890K</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/60 backdrop-blur-sm border border-purple-400">
            <CardHeader>
              <CardTitle className="text-white">📊 Lead Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-300 text-sm">Total Leads</div>
                  <div className="text-2xl font-bold text-cyan-400">2,847</div>
                </div>
                <div>
                  <div className="text-slate-300 text-sm">Qualified Leads</div>
                  <div className="text-2xl font-bold text-green-400">1,923</div>
                </div>
                <div>
                  <div className="text-slate-300 text-sm">Conversion Rate</div>
                  <div className="text-2xl font-bold text-purple-400">67.5%</div>
                </div>
                <div>
                  <div className="text-slate-300 text-sm">Avg Lead Score</div>
                  <div className="text-2xl font-bold text-yellow-400">8.3</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}