        {/* Analytics Dashboard - Clean 2x3 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Row 1 - Voice Analytics */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mic className="w-5 h-5 mr-2 text-red-400" />
                Voice Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Calls Today:</span>
                  <span className="text-white font-bold">{currentSystemMode === 'test' ? '23' : (metrics?.activeCalls || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Avg Duration:</span>
                  <span className="text-cyan-400 font-bold">{currentSystemMode === 'test' ? '7:42' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Conversion Rate:</span>
                  <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '15.2%' : '--'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 1 - System Audit Log */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-400" />
                System Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentSystemMode === 'test' ? (
                  <>
                    <div className="text-xs text-green-400">14:32 - Admin login successful</div>
                    <div className="text-xs text-blue-400">14:28 - Automation rule updated</div>
                    <div className="text-xs text-cyan-400">14:15 - Bot training completed</div>
                    <div className="text-xs text-purple-400">14:02 - CRM sync executed</div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400">No recent audit events</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Row 1 - Quick Stats */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-cyan-400" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">New Leads:</span>
                  <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '17' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Conversions:</span>
                  <span className="text-blue-400 font-bold">{currentSystemMode === 'test' ? '4' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Escalations:</span>
                  <span className="text-yellow-400 font-bold">{currentSystemMode === 'test' ? '2' : '--'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 2 - AI Automation Engine */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                AI Automation Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Tasks Automated:</span>
                  <span className="text-cyan-400 font-bold">{currentSystemMode === 'test' ? '127' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Hours Saved:</span>
                  <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '34.2' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Efficiency:</span>
                  <span className="text-purple-400 font-bold">{currentSystemMode === 'test' ? '89.7%' : '--'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 2 - Escalation Alerts */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Escalation Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentSystemMode === 'test' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-yellow-900/40 p-3 rounded-lg border border-yellow-400">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300 text-sm">High-value lead requires attention</span>
                    </div>
                    <span className="text-yellow-400 text-xs">3 min ago</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  No escalation alerts at this time
                </div>
              )}
            </CardContent>
          </Card>

          {/* Row 2 - Live Integration Test Results */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Live Integration Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Total Tests:</span>
                  <span className="text-white font-bold">{testStats.totalTests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Passed:</span>
                  <span className="text-green-400 font-bold">{testStats.passedTests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Success Rate:</span>
                  <span className="text-cyan-400 font-bold">{testStats.successRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>