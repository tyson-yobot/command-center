import { useState, useEffect } from 'react';
import '@/styles/PipelineDashboard.css';

interface PipelineDashboardProps {
  activeTab: string;
}

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  value: number;
  leads: Lead[];
}

interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  status: string;
  lastContact: string;
  nextAction: string;
  probability: number;
}

interface CallMetrics {
  total: number;
  completed: number;
  scheduled: number;
  avgDuration: number;
  successRate: number;
  recentCalls: any[];
}

export const PipelineDashboard = ({ activeTab }: PipelineDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([]);
  const [callMetrics, setCallMetrics] = useState<CallMetrics>({
    total: 0,
    completed: 0,
    scheduled: 0,
    avgDuration: 0,
    successRate: 0,
    recentCalls: []
  });
  const [analyticsData, setAnalyticsData] = useState({
    conversionRates: {},
    valueDistribution: {},
    metrics: {}
  });

  useEffect(() => {
    const fetchPipelineData = async () => {
      setIsLoading(true);
      try {
        // Fetch real data from your API endpoints
        if (activeTab === 'pipeline' || activeTab === 'leads') {
          const response = await fetch('/api/pipeline/stages');
          const data = await response.json();
          setPipelineData(data);
        }
        
        if (activeTab === 'calls') {
          const response = await fetch('/api/calls/metrics');
          const data = await response.json();
          setCallMetrics(data);
        }
        
        if (activeTab === 'analytics') {
          const response = await fetch('/api/pipeline/analytics');
          const data = await response.json();
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error('Error fetching pipeline data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPipelineData();
  }, [activeTab]);

  const renderPipelineView = () => {
    return (
      <div className="pipeline-view">
        <div className="pipeline-header">
          <h3>Sales Pipeline Overview</h3>
          <div className="pipeline-summary">
            <div className="summary-item">
              <span className="summary-label">Total Leads:</span>
              <span className="summary-value">{pipelineData.reduce((sum, stage) => sum + stage.count, 0)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Pipeline Value:</span>
              <span className="summary-value">${pipelineData.reduce((sum, stage) => sum + stage.value, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="pipeline-stages">
          {pipelineData.map((stage) => (
            <div key={stage.id} className="pipeline-stage">
              <div className="stage-header">
                <h4>{stage.name}</h4>
                <div className="stage-metrics">
                  <span className="stage-count">{stage.count}</span>
                  <span className="stage-value">${stage.value.toLocaleString()}</span>
                </div>
              </div>
              <div className="stage-leads">
                {stage.leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="lead-card">
                    <div className="lead-header">
                      <span className="lead-name">{lead.name}</span>
                      <span className="lead-value">${lead.value.toLocaleString()}</span>
                    </div>
                    <div className="lead-company">{lead.company}</div>
                    <div className="lead-probability">
                      <div className="probability-bar">
                        <div 
                          className="probability-fill" 
                          style={{ width: `${lead.probability}%` }}
                        ></div>
                      </div>
                      <span>{lead.probability}%</span>
                    </div>
                  </div>
                ))}
                {stage.leads.length > 5 && (
                  <div className="more-leads">
                    +{stage.leads.length - 5} more leads
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLeadsView = () => {
    // Flatten all leads from all stages
    const allLeads = pipelineData.flatMap(stage => stage.leads);
    
    return (
      <div className="leads-view">
        <h3>Lead Status Overview</h3>
        
        <div className="leads-table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Status</th>
                <th>Value</th>
                <th>Probability</th>
                <th>Last Contact</th>
                <th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              {allLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.company}</td>
                  <td>
                    <span className={`status-badge status-${lead.status.toLowerCase().replace(' ', '-')}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>${lead.value.toLocaleString()}</td>
                  <td>
                    <div className="table-probability">
                      <div className="table-probability-bar">
                        <div 
                          className="table-probability-fill" 
                          style={{ width: `${lead.probability}%` }}
                        ></div>
                      </div>
                      <span>{lead.probability}%</span>
                    </div>
                  </td>
                  <td>{lead.lastContact}</td>
                  <td>{lead.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCallMetricsView = () => {
    return (
      <div className="call-metrics-view">
        <h3>Call Performance Metrics</h3>
        
        <div className="metrics-cards">
          <div className="metric-card">
            <div className="metric-icon">📞</div>
            <div className="metric-value">{callMetrics.total}</div>
            <div className="metric-label">Total Calls</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-value">{callMetrics.completed}</div>
            <div className="metric-label">Completed</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">🗓️</div>
            <div className="metric-value">{callMetrics.scheduled}</div>
            <div className="metric-label">Scheduled</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">⏱️</div>
            <div className="metric-value">{callMetrics.avgDuration}m</div>
            <div className="metric-label">Avg Duration</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-value">{callMetrics.successRate}%</div>
            <div className="metric-label">Success Rate</div>
          </div>
        </div>
        
        <div className="call-history">
          <h4>Recent Call Activity</h4>
          <div className="call-timeline">
            {callMetrics.recentCalls && callMetrics.recentCalls.map((call, index) => (
              <div key={index} className="call-entry">
                <div className="call-time">{call.time}</div>
                <div className="call-details">
                  <div className="call-title">{call.title}</div>
                  <div className="call-duration">Duration: {call.duration}</div>
                  <div className={`call-outcome ${call.outcome.toLowerCase()}`}>
                    Outcome: {call.outcome}
                  </div>
                </div>
              </div>
            ))}
            {(!callMetrics.recentCalls || callMetrics.recentCalls.length === 0) && (
              <div className="no-data">No recent call data available</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => {
    const { conversionRates, valueDistribution, metrics } = analyticsData;
    
    return (
      <div className="analytics-view">
        <h3>Pipeline Analytics</h3>
        
        <div className="analytics-cards">
          {conversionRates && Object.keys(conversionRates).length > 0 ? (
            <div className="analytics-card">
              <h4>Conversion Rates</h4>
              <div className="analytics-chart conversion-chart">
                <div className="chart-placeholder">
                  {Object.entries(conversionRates).map(([key, value]: [string, any]) => (
                    <div key={key} className="chart-bar" style={{ height: `${value.percentage}%` }}>
                      <span className="chart-label">{value.label}</span>
                      <span className="chart-value">{value.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="analytics-card">
              <h4>Conversion Rates</h4>
              <div className="no-data">No conversion rate data available</div>
            </div>
          )}
          
          {valueDistribution && Object.keys(valueDistribution).length > 0 ? (
            <div className="analytics-card">
              <h4>Pipeline Value Distribution</h4>
              <div className="analytics-chart pie-chart">
                <div className="chart-placeholder">
                  {Object.entries(valueDistribution.segments || {}).map(([key, segment]: [string, any]) => (
                    <div key={key} className="pie-segment" style={{ 
                      transform: `rotate(${segment.rotation}deg)`,
                      backgroundColor: segment.color,
                      clipPath: segment.clipPath
                    }}></div>
                  ))}
                  <div className="pie-center">${valueDistribution.totalValue}</div>
                </div>
                <div className="pie-legend">
                  {Object.entries(valueDistribution.segments || {}).map(([key, segment]: [string, any]) => (
                    <div key={key} className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: segment.color }}></span>
                      <span className="legend-label">{segment.label} ({segment.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="analytics-card">
              <h4>Pipeline Value Distribution</h4>
              <div className="no-data">No value distribution data available</div>
            </div>
          )}
        </div>
        
        <div className="analytics-metrics">
          {metrics && Object.entries(metrics).map(([key, metric]: [string, any]) => (
            <div key={key} className="metric-box">
              <div className="metric-title">{metric.title}</div>
              <div className="metric-number">{metric.value}</div>
              <div className={`metric-trend ${metric.trend.direction}`}>
                {metric.trend.arrow} {metric.trend.text}
              </div>
            </div>
          ))}
          {(!metrics || Object.keys(metrics).length === 0) && (
            <div className="no-data">No metrics data available</div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading pipeline data...</div>
      </div>
    );
  }

  return (
    <div className="pipeline-dashboard">
      {activeTab === 'pipeline' && renderPipelineView()}
      {activeTab === 'leads' && renderLeadsView()}
      {activeTab === 'calls' && renderCallMetricsView()}
      {activeTab === 'analytics' && renderAnalyticsView()}
    </div>
  );
};